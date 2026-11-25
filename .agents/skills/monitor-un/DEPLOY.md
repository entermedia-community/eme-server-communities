# Monitor UN — scheduled deployment (m49)

`monitor.sh` is the cron-side detector. Every 5 minutes it reads the Uptime Kuma
"UN Services" group and, **only on a down/recovery transition**, launches an OpenCode
session that executes this skill (`SKILL.md`). Steady state (all up, or the same
monitors still down) is silent: no agent, no email.

## Layout
- **Code (this folder, in git):** `monitor.sh`, the two `*.env.example` templates,
  this runbook, and `SKILL.md`.
- **Runtime + secrets (NOT in git):** `/home/eadmin/monitor-un/`
  - `opencode.env` (600) — OpenCode API port + password
  - `mail.env` (600) — `monitor_email_*` SMTP relay values
  - `state.json` — last-handled down set (transition dedupe)
  - `lock`, `monitor_un.log`

`monitor.sh` reads/writes that runtime dir; the script itself lives in the repo.
Paths are m49-specific (`/media/emsites/opencode`, `/home/eadmin/...`).

## One-time setup on m49
1. eadmin keys to the UN servers in `/home/eadmin/.ssh/keys/` (dir 700, files 600).
2. eadmin sudoers: nginx + docker + journal/snap/apt cleanup rules (see the
   `remote-user-provisioning` skill).
3. `mkdir -p /home/eadmin/monitor-un` (700, eadmin). Install `opencode.env` and
   `mail.env` from the templates (600, eadmin). Never commit real secrets.
4. **Model context:** `qwen4-max` needs a large `limit.context` (e.g. 131072) in
   `opencodeadmin.json`, otherwise the agent compaction-loops at the email step.
   Apply without a restart via `POST /api/location/reload`.

## Permissions
The repo path is already traversable/readable by eadmin (dirs are `775`).
`monitor.sh` is committed executable (`755`), so eadmin can run it straight from the
repo — no extra ACL needed. If a checkout ever drops the exec bit:
`chmod 755 .agents/skills/monitor-un/monitor.sh`.

## Crontab (eadmin)
```
*/5 * * * * flock -n /home/eadmin/monitor-un/lock /media/emsites/opencode/.agents/skills/monitor-un/monitor.sh >> /home/eadmin/monitor-un/monitor_un.log 2>&1
```
`flock -n` prevents overlap; a run holds the lock through the agent wait. State
advances only on a successful run, so a failed run retries on the next tick.

## How a run decides
- new down monitor(s) → incident agent (full pipeline + one down email)
- previously-down monitor now up → recovery agent (verify + closure email)
- unchanged down set, or all up → log one line and exit (no agent, no email)