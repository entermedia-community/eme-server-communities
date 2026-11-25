#!/bin/bash
# Monitor UN — downtime detector + OpenCode agent trigger.
# Runs as eadmin on m49 (cron, every 5 min, under flock).
# Detects down/recovery transitions on the Uptime Kuma "UN Services" group and,
# only on a transition, launches an OpenCode session that executes the monitor-un
# skill (reload -> diagnose -> gated cleanup -> down-only email).
# Steady state (all up, or same monitors still down) is silent: no agent, no email.
set -uo pipefail

DIR=/home/eadmin/monitor-un
BASE=http://monitor.entermediadb.net:3001
STATE="$DIR/state.json"
REPO=/media/emsites/opencode

ts() { date -u '+%Y-%m-%d %H:%M:%S UTC'; }
log() { echo "[$(ts)] $*"; }

# --- config ------------------------------------------------------------------
# OpenCode API port + password come from the project .env (OPENCODE_PORT,
# OPENCODE_PASSWORD). eadmin reads the repo .env directly (it is other-readable).
ENVFILE="$REPO/.env"
if [ ! -r "$ENVFILE" ]; then log "FATAL: cannot read $ENVFILE"; exit 1; fi
eval "$(grep -E '^OPENCODE_(PORT|PASSWORD)=' "$ENVFILE")"
: "${OPENCODE_PORT:?}" "${OPENCODE_PASSWORD:?}"
AUTH=$(printf 'opencode:%s' "$OPENCODE_PASSWORD" | base64 -w0)
API="http://127.0.0.1:$OPENCODE_PORT"
ah() { curl -fsS -H "Authorization: Basic $AUTH" "$@"; }

# --- read the monitor --------------------------------------------------------
PAGE=$(curl -fsS --max-time 25 "$BASE/api/status-page/un") || { log "monitor API unreachable; skip"; exit 0; }
HB=$(curl -fsS --max-time 25 "$BASE/api/status-page/heartbeat/un") || { log "heartbeat API unreachable; skip"; exit 0; }

DOWN=$(jq -n --argjson page "$PAGE" --argjson hb "$HB" '
  [ $page.publicGroupList[]? | select((.name|gsub("^\\s+|\\s+$";""))=="UN Services") | .monitorList[]? ] as $ms
  | [ $ms[] | . as $m
      | ( ($hb.heartbeatList[($m.id|tostring)]) // [] ) as $beats
      | ( $beats|last ) as $last
      | select($last != null and $last.status==0)
      | { id:($m.id|tostring), name:$m.name, time:$last.time,
          servers:[ ($m.tags//[])[] | .name | select(test("^m[0-9]{2}$")) ] } ]')
[ -n "$DOWN" ] || { log "jq parse failed; skip"; exit 0; }

# --- state / transitions -----------------------------------------------------
[ -f "$STATE" ] || echo '{"down":{}}' > "$STATE"
PREV=$(jq -c '.down // {}' "$STATE")
NEW=$(jq -n --argjson down "$DOWN" --argjson prev "$PREV" '[ $down[] | select($prev[.id] == null) ]')
REC=$(jq -n --argjson down "$DOWN" --argjson prev "$PREV" '
  ($down | map(.id)) as $ids
  | [ $prev | to_entries[] | select(.key as $k | $ids | index($k) | not)
      | {id:.key, name:.value.name, servers:.value.servers} ]')
NNEW=$(jq 'length' <<<"$NEW"); NREC=$(jq 'length' <<<"$REC")
NDOWN=$(jq 'length' <<<"$DOWN")

if [ "$NNEW" -eq 0 ] && [ "$NREC" -eq 0 ]; then
  if [ "$NDOWN" -eq 0 ]; then log "all UN services up; nothing to do"; else log "same $NDOWN monitor(s) still down; no re-trigger"; fi
  exit 0
fi
log "transition: new_down=$NNEW recovered=$NREC (currently down=$NDOWN)"

# --- build the agent prompt --------------------------------------------------
ENV_BLOCK=$(cat <<'EOF'
ENVIRONMENT (this differs from the skill's local-machine assumptions — read carefully):
- You are running as user "entermedia" on server m49, NOT as eadmin. entermedia has
  full NOPASSWD sudo on m49. The repo / working directory is /media/emsites/opencode.
- To reach any UN server mNN as eadmin, wrap ssh with sudo -u eadmin and use the stored
  key and the FULL hostname (m49 has no ssh aliases). Replace NN with the server number:
    sudo -u eadmin ssh -o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes \
      -o StrictHostKeyChecking=accept-new \
      -i /home/eadmin/.ssh/keys/eadmin_mNN.pk eadmin@mediadbNN.entermediadb.net '<command>'
  The remote command runs as eadmin with its limited sudo (use sudo -n ...). Access the
  remote server EXCLUSIVELY as eadmin; never fall back to entermedia/eroot there.
- SMTP mail config is NOT in the repo .env on m49. Read it with:
    sudo -u eadmin cat /home/eadmin/monitor-un/mail.env
  then eval those monitor_email_* lines and use the skill's swaks recipe (Step 6).
- swaks, curl, jq, df, sleep are installed on m49.
- Work autonomously: do NOT ask questions or wait for input. If something blocks you,
  finish with a clear report of exactly what failed.
- Work efficiently: read the skill once and follow it in order; do not repeatedly
  re-read it. Once the diagnostics are done, send the email promptly and finish.
- Diagnostics are read-only. Do NOT edit nginx/site config or restart containers. The
  only write actions allowed are the test-gated nginx reload and the Stage-6 cleanup
  (journal vacuum 500M, disabled snap revisions, apt-get clean) when OS / is >=98% used.
EOF
)

TASK=""
if [ "$NNEW" -gt 0 ]; then
  TASK=$(cat <<EOF
Load and follow the skill "monitor-un" (.agents/skills/monitor-un/SKILL.md) exactly.
The cron detector has confirmed these UN monitors are DOWN on Uptime Kuma /status/un:
$NEW

Run the FULL pipeline for each down monitor: config/key gate, test-gated nginx reload,
5s check, Stage 1 (60s re-test), Stage 2 URL probe, Stage 3 config/upstream/docker,
Stage 4 logs (ALWAYS print the last 10 lines), Stage 5 disk, Stage 6 cleanup only if
OS / >=98% used. Then send the down-incident summary email per Step 6 (clean HTML table,
monitor status page link, last 10 log lines). One email per incident. Report the swaks
queue id. If a monitor recovers during the run, say so.
EOF
)
fi
if [ "$NREC" -gt 0 ]; then
  RTEXT=$(cat <<EOF
The cron detector sees these previously-down UN monitors have RECOVERED (now up):
$REC
Load the skill "monitor-un". Verify each is up via the Uptime Kuma heartbeat API and a
quick URL probe, then send the short recovery/closure email per Step 6 (clean HTML,
monitor status page link). Do not reload or run full diagnostics for a monitor that is up.
EOF
)
  if [ -n "$TASK" ]; then TASK="$TASK

$RTEXT"; else TASK="$RTEXT"; fi
fi
PROMPT="$TASK

$ENV_BLOCK"

# --- launch the OpenCode session --------------------------------------------
SESS_BODY=$(jq -n --arg title "Monitor UN incident $(date -u '+%Y-%m-%d %H:%M')" '{
  title:$title, agent:"build",
  model:{providerID:"qwen-cloud", id:"qwen4-max"},
  location:{directory:"/media/emsites/opencode"},
  permissions:[{action:"*",resource:"*",effect:"allow"},{action:"edit",resource:"*",effect:"deny"}]
}')
SID=$(ah -X POST -H 'Content-Type: application/json' -d "$SESS_BODY" "$API/api/session" \
      | jq -r '.data.id') || SID=""
if [ -z "$SID" ] || [ "$SID" = "null" ]; then log "ERROR: failed to create OpenCode session; will retry next cycle"; exit 1; fi
log "session $SID created; sending prompt"

PROMPT_BODY=$(jq -n --arg text "$PROMPT" '{text:$text}')
if ! ah -X POST -H 'Content-Type: application/json' -d "$PROMPT_BODY" "$API/api/session/$SID/prompt" >/dev/null; then
  log "ERROR: prompt rejected for $SID; will retry next cycle"; exit 1
fi
log "prompt accepted; waiting for completion (up to 15 min)"
WAIT_CODE=$(curl -sS -X POST --max-time 900 -H "Authorization: Basic $AUTH" \
            "$API/api/experimental/session/$SID/wait" -o /dev/null -w '%{http_code}')
log "wait returned HTTP $WAIT_CODE"

MESSAGES=$(ah "$API/api/session/$SID/message")
OUTCOME=$(jq -r '[.data[] | select(.type=="idle")][0].outcome // "unknown"' <<<"$MESSAGES")
ANSWER=$(jq -r '[.data[] | select(.type=="assistant")][0].content[]? | select(.type=="text") | .text' <<<"$MESSAGES" | head -c 4000)
log "outcome=$OUTCOME"
log "agent report >>>"
echo "$ANSWER"
log "<<< end agent report"

if [ "$OUTCOME" = "succeeded" ] && [ "$WAIT_CODE" = "204" ]; then
  NEWSTATE=$(jq -n --argjson down "$DOWN" '{down: ($down | map({key:.id, value:{name:.name, servers:.servers, time:.time}}) | from_entries)}')
  printf '%s\n' "$NEWSTATE" > "$STATE.tmp" && mv "$STATE.tmp" "$STATE"
  log "state advanced; incident handled. session=$SID"
else
  log "ERROR: run did not succeed (outcome=$OUTCOME wait=$WAIT_CODE); state NOT advanced, will retry next cycle. session=$SID"
  exit 1
fi
exit 0