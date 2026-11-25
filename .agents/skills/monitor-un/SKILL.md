---
name: monitor-un
description: Use when the user asks to check the UN services monitor, find a down UN service, or recover a down UN server — "Monitor UN", "check the monitor", "any UN service down?", "fix the down UN service". Reads the Uptime Kuma status page at http://monitor.entermediadb.net:3001/status/un via its JSON API, finds down monitors in the UN Services group, maps each to its mNN server tag, reloads nginx on that server over SSH exclusively as eadmin (reload-nginx skill), then re-checks the monitor after 5 seconds.
---

# Skill: Monitor UN

Detect down UN services on the Uptime Kuma monitor and recover them by reloading nginx
on the hosting server. Steps in order, no shortcuts.

Hard rules:

- Server access is **exclusively** via the `eadmin` account. Never fall back to
  `entermedia`, `eroot`, or any other user.
- If anything fails (SSH, sudo, missing key, nginx test), stop and report the exact
  failure to the user before trying alternatives.

## 1. Read the monitor (JSON API, not the HTML page)

The monitor is Uptime Kuma; `/status/un` is a JavaScript app, so read its API instead:

- `GET http://monitor.entermediadb.net:3001/api/status-page/un`
  → `publicGroupList[].monitorList[]` with `id`, `name`, `tags[]`
- `GET http://monitor.entermediadb.net:3001/api/status-page/heartbeat/un`
  → `heartbeatList["<monitor id>"]`, an array of recent beats; the **last element is
  the latest**. Heartbeat `status`: `0` = down, `1` = up, `2` = pending, `3` = maintenance.

Find down monitors in the **UN Services** group and extract the server tag: a tag
whose `name` matches `^m\d{2}$` (e.g. `m45`, `m42`). Verified parse recipe (Code Mode
`execute`; plain `fetch` + JSON works the same):

```javascript
const base = "http://monitor.entermediadb.net:3001";
const [page, hb] = await Promise.all([
  fetch(base + "/api/status-page/un").then(r => r.json()),
  fetch(base + "/api/status-page/heartbeat/un").then(r => r.json())
]);
const down = [];
for (const g of page.publicGroupList || []) {
  if (g.name.trim() !== "UN Services") continue;
  for (const m of g.monitorList || []) {
    const beats = hb.heartbeatList[String(m.id)] || [];
    const last = beats[beats.length - 1];
    if (last && last.status === 0) {
      down.push({
        id: m.id, name: m.name, msg: last.msg, time: last.time,
        servers: (m.tags || []).map(t => t.name).filter(n => /^m\d{2}$/.test(n))
      });
    }
  }
}
return down;
```

- Nothing down → report "all UN services up" and stop. Do not reload anything.
- A down monitor with **no** `mNN` tag (e.g. `global.unitednations.entermediadb.net`)
  cannot be mapped to a server — report it, do not guess.
- Deduplicate by server: one server can host several monitors (e.g. `m42` hosts
  `unitednations-us-4` and `unitednations-b`). Reload each server once.

## 2. Check the local machine has a configuration for the server

Only proceed when the server is configured locally:

```bash
grep -A5 '^Host mNN$' ~/.ssh/keys/entermedia.conf
```

- No `Host mNN` entry → report "no local SSH configuration for mNN" and stop.
- The alias pins `User entermedia` and `IdentityFile ~/.ssh/keys/mNN`; that key is NOT
  eadmin's. See the `reload-nginx` skill's "Remote servers" section for this gotcha.
- eadmin's key must exist: `~/.ssh/keys/eadmin_mNN.pk` (created by the
  `remote-user-provisioning` skill). Missing → report "eadmin not provisioned on mNN"
  and stop. Do not use another user's key.

## 3. Reload nginx on the server (reload-nginx skill, remote flow)

Run the `reload-nginx` skill's test-gated flow over SSH, exclusively as eadmin:

```bash
SSH="ssh -o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes -i ~/.ssh/keys/eadmin_mNN.pk eadmin@mNN"

$SSH 'whoami && sudo -n nginx -t'     # 1. test — must pass before reloading
$SSH 'sudo -n nginx -s reload'        # 2. graceful reload, only if the test passed
$SSH 'pgrep -a nginx | head -5'       # 3. master + workers present
```

- Test fails → do NOT reload; report the exact nginx error to the user.
- SSH or sudo fails → report; never switch users, never force a restart.

## 4. Verify recovery on the monitor

Wait 5 seconds, then re-read the heartbeat API (same call as step 1 — this is
equivalent to reloading the monitor page, which reads the same data):

```bash
sleep 5
```

Re-run the step 1 parse and check the affected monitor ids:

- Latest heartbeat `status: 1` → recovered. Report before/after with timestamps.
- Still `0` → the next beat may not have landed yet (Uptime Kuma polls ~every 60 s).
  Go to step 5 and run the secondary test stages.

## 5. Secondary test stages after a Down confirmation (all read-only)

Run these stages in order. **Every stage is read-only: report findings, never run a
fix on your own.** If any stage shows the service recovered, stop and report. If a
stage fails (SSH/sudo denied, missing key), stop and report that failure first.

### Stage 1 — re-test after 60 s

```bash
sleep 60
```

Re-read the heartbeat API (same call as step 1) and check the affected monitor ids:

- Latest heartbeat `status: 1` → recovered. Report before/after with timestamps, stop.
- Still `0` on a fresh beat (newer than the reload) → **Down confirmed**. Continue.

### Stage 2 — direct URL probe, report headers

Monitors are named after the URL they check (e.g. `un-dev2.entermediadb.net`). Probe
that URL directly from the local machine and report the **response status + full
headers** to the user:

```bash
curl -sS -D - -o /dev/null --max-time 20 https://<monitor-name>/   # then http:// if https fails
getent hosts <monitor-name>                                       # where does DNS point?
```

- Report the exact status line and every response header, plus the DNS answer.
- If DNS points to a different server than the monitor's `mNN` tag, report the
  mismatch — the tag may be wrong, and the reload may have run on the wrong server.
- Connection/DNS/TLS errors are results too — report the exact error text.
- Read the result before concluding: `404`/unexpected `301` often means the request
  lands on a default vhost (site not configured on that server); `502`/`504` means
  nginx is up but the upstream app is down; connection refused/timeout points at
  firewall, wrong IP, or nginx not listening.

### Stage 3 — find the nginx config, its upstream, and the Docker instance

Logged in as eadmin (step 3's `$SSH`), loop all nginx config files for the down
instance's hostname, then read the matching vhost:

```bash
$SSH 'grep -rl "<hostname>" /etc/nginx/ 2>/dev/null'   # search every config file
$SSH 'cat <matching config file>'                       # read the vhost + upstream
```

- Extract the `upstream` block / `proxy_pass` target: it maps to an IP(:port).
- That IP is usually a Docker container. List containers and their IPs to find the
  owner (check the real docker path first with `command -v docker`; usually
  `/usr/bin/docker`, which eadmin's limited sudo permits with any args):

```bash
$SSH 'sudo -n /usr/bin/docker ps -a --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"'
$SSH 'for c in $(sudo -n /usr/bin/docker ps -aq); do sudo -n /usr/bin/docker inspect --format "{{.Name}} {{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}" $c; done'
```

- Match the upstream IP against the container IPs. If the upstream is `127.0.0.1`
  or the host's own IP, match by **published port** instead (the `Ports` column).
- Report the container name and its **status** (Up/Exited, health, uptime).
- No matching config, upstream, or container → report exactly that; do not guess.

### Stage 4 — last 100 log lines of the Docker instance

```bash
$SSH 'sudo -n /usr/bin/docker logs --tail 100 <container> 2>&1'
```

- Search the output for **SEVERE** error reports; also flag `ERROR`, `FATAL`,
  `Exception` lines. Report matching lines verbatim; if none, say so explicitly.
- **Always print the last 10 lines verbatim in the report and the email**, whether
  or not errors were found — they show what the instance was doing at that exact
  moment.
- Read-only: never restart, stop, or reconfigure the container.

### Stage 5 — disk space report for the instance's mounts

First check the **OS default mount** (usually `/`) and report its usage:

```bash
$SSH 'df -h /'
```

- Report `/` use% and free% (100 − Use%). **`/` at 98%+ used → after finishing this
  report, run stage 6.** Below 98%, no cleanup.

Then get the container's Mounts and check the host disks backing the site's data and
Elasticsearch index:

```bash
$SSH 'sudo -n /usr/bin/docker inspect --format "{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}" <container>'
```

- Search the mount **sources** for paths of the form `/media/emsites/<site>/data`
  and `/media/emsites/<site>/elastic`.
- Map each matching source to the host filesystem with `df` — run it on the Docker
  host (the mNN server), not inside the container:

```bash
$SSH 'df -h <matching mount sources>'
```

- Report the **% of free space** per mount (`100 − Use%`), with size, available
  space, and the filesystem mount point.
- Flag low free space (under ~10 %) as a possible failure cause; a full data or
  elastic disk can take a service down while the container still shows "Up".
- No matching mounts → report that; do not guess paths.
- Stage 5 itself is read-only: never delete or clean up anything here.

### Stage 6 — only if the OS disk is 98%+ full: approved cleanups, then re-test

Trigger: `/` at **98% or more used** in stage 5. Below the threshold, do nothing.
These are the **only write actions this skill may take** (user-approved); everything
else stays report-only. Run them as eadmin — this requires the extended eadmin
sudoers from the `remote-user-provisioning` skill. If sudo denies a command, stop and
report; do not work around it or switch users.

```bash
# 1. Shrink the systemd journal to 500M
$SSH 'sudo -n /usr/bin/journalctl --vacuum-size=500M'

# 2. Remove disabled (old, unused) snap revisions — list, then remove each one
$SSH 'sudo -n /usr/bin/snap list --all'                       # rows marked "disabled"
$SSH 'sudo -n /usr/bin/snap remove --revision=<rev> <name>'   # once per disabled row

# 3. Clear the apt package cache
$SSH 'sudo -n /usr/bin/apt-get clean'
```

- Only remove revisions marked `disabled` — never an active snap (snapd refuses
  active-revision removal anyway).
- Report space freed: `$SSH 'df -h /'` before vs after.
- Then wait **10 seconds** and re-test the URL (stage 2 probe) and the monitor
  heartbeat (step 1 call):

```bash
sleep 10
```

- Report the new response status/headers and whether the monitor recovered.
- Still down → report; do not invent further fixes.

After the final stage reached, summarize the findings of all stages and let the user
decide any further fix.

## 6. Email the summary — down situations only

**Never email when all monitors are up.** Email only for down incidents:

- **Down confirmed** (stage 1 still shows down on a fresh beat) → send the summary
  email **once** for that incident.
- **Recovery** of a monitor whose down was previously reported → a short recovery
  email closing the incident.
- Same monitor still down on later runs → do **NOT** re-email every run; one email
  per incident. Report updates in the chat instead. Re-email only if the situation
  materially changes (new root cause, or a different monitor goes down).

Recipient: **cristobal@emedialibrary.com**. The summary must include: monitor
name/URL and server tag, down-since timestamp, actions taken (nginx test/reload
result), each stage's result (probe status + headers, container name/status, log
findings, disk free %), whether stage 6 ran, and the final verdict/root cause.

**Sending route (verified working 2026-11-25):**

The SMTP relay is configured in the repo root `.env` as `monitor_email_*` variables
(`monitor_email_from`, `_to`, `_smtp`, `_port`, `_user`, `_password`). Read them at
runtime — **never hardcode credentials** in this skill or in scripts:

```bash
eval "$(grep '^monitor_email_' .env)"
swaks --server "$monitor_email_smtp:$monitor_email_port" \
  --auth LOGIN --auth-user "$monitor_email_user" --auth-password "$monitor_email_password" \
  --tls --from "$monitor_email_from" --to "$monitor_email_to" \
  --header "Subject: Monitor UN: <url> <recovered|still down> (<mNN>)" \
  --header "Content-Type: text/html; charset=utf-8" \
  --body "$(cat <<'EOF'
<html><body style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#222;">
<p><b>Monitor UN:</b> &lt;url&gt; — &lt;recovered|still down&gt; (&lt;mNN&gt;) · &lt;run time UTC&gt;<br>
<a href="http://monitor.entermediadb.net:3001/status/un">Monitor status page</a></p>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
<tr style="background:#f0f0f0;"><th align="left" style="border:1px solid #ddd;">Stage</th><th align="left" style="border:1px solid #ddd;">Result</th></tr>
<tr><td style="border:1px solid #ddd;">Reload</td><td style="border:1px solid #ddd;">&lt;result&gt;</td></tr>
<!-- one row per stage: 5s check, 60s re-test, URL probe, config/upstream/docker,
     logs, disk, cleanup gate -->
</table>
<p><b>Verdict:</b> &lt;root cause or recovered&gt;</p>
<p><b>Last 10 log lines</b> (&lt;container&gt;):</p>
<pre style="background:#f7f7f7;border:1px solid #ddd;padding:8px;font-size:11px;white-space:pre-wrap;">&lt;last 10 lines, HTML-escaped&gt;</pre>
</body></html>
EOF
)"
```

Format rules: **small and clean** — one simple table with light borders, inline
styles only, no fancy CSS, no images. Always include:

- A link to the monitor status page: `http://monitor.entermediadb.net:3001/status/un`
- The **last 10 log lines** from stage 4 in the `<pre>` block (escape `&` `<` `>`
  first, e.g. `sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g'`), even when no errors
  were found.

- Verified: `smtp.entermediadb.org:587`, STARTTLS + AUTH LOGIN → `235`, sender
  `noreply@entermediadb.org` and recipient accepted.
- Success = the final `250` after DATA in the swaks transcript; report it.
- Dry-run connectivity check without sending: add `--quit-after RCPT`.
- Do NOT use direct MX delivery (Google rejects this IP: `550 5.7.1`) or the old
  Elastic Email demo account from site configs (`535` — disabled).
- If sending fails, report the exact transcript error and deliver the summary in
  the chat instead — the run's findings must never be lost because email failed.

## Notes

- The page config (`autoRefreshInterval`, group names, tags) comes from
  `/api/status-page/un`; the "AI Services" group exists too but is out of scope here
  unless the user asks.
- Monitor timestamps are server-local time strings; compare the latest beat's `time`
  against the reload time to be sure you are looking at a post-reload heartbeat.
- Never hardcode credentials; eadmin access is key-based only.