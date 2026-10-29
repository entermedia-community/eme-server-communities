---
name: Deploy Remote (delegate)
description: Use when the user asks to deploy, provision, or stand up an eme-server instance for a client ("Deploy an instance for <client> with email ...", "deploy eme-server for X", "create a new client instance", "set up <client>.eme.world") AND this OpenCode instance is not the deployment host itself — decisive test: /media/eme_sites does not exist on this machine (you are running inside a container, e.g. opencode.eme.world). Delegates the whole deployment to the deployment host's OpenCode server over its v2 HTTP API (create session, send prompt, wait for completion, report the result back). On the deployment host itself (/media/eme_sites exists), use the deploy-eme-server skill directly instead of this one.
---

# Deploy via the deployment host (delegate)

This instance does not touch docker or nginx. It asks the **deployment host's** OpenCode
server to run its `deploy-eme-server` skill end to end, and reports the result back.

Quick check before starting: `ls /media/eme_sites` — if that directory exists on this
machine, you ARE the deployment host; stop using this skill and follow `deploy-eme-server`
directly instead.

## Target server

Read `target.json` next to this file first:

| Field | Meaning |
|---|---|
| `url` | Primary base URL of the deployment host's OpenCode v2 API (internal path) |
| `fallback_url` | Public alternative if the internal path is unreachable |
| `auth_header` | Complete value for the `Authorization` header on every `/api/*` call |

Every curl in this flow is a **single plain command** of the form:

```bash
curl -s -m <timeout> [-X POST] -H "Authorization: <auth_header>" [-H 'Content-Type: application/json'] [-d '<json>'] <url><path>
```

substituting `url` and `auth_header` from target.json. Do not chain commands or use shell
variable expansion — issue one curl per step.

## Flow

1. **Parse the request.** Extract from the user's message (ask via a question if missing):
   - client name (e.g. `jazz-band`) — lowercase, hyphens
   - admin email (required)
   - domain base (optional; default `eme.world`)
2. **Health-check the target** before creating anything:
   ```bash
   curl -s -m 10 -H "Authorization: <auth_header>" <url>/api/info
   ```
   Must return JSON starting with `{"version"` — if not, retry against `fallback_url`; if that
   also fails, stop and tell the user the deployment host is unreachable.
3. **Create a fresh session** (never reuse an existing one):
   ```bash
   curl -s -m 30 -X POST -H "Authorization: <auth_header>" -H 'Content-Type: application/json' -d '{"title":"deploy <client>","agent":"build","location":{"directory":"/tmp/opencode"}}' <url>/api/session
   ```
   Response is `{"data":{...}}` — take `data.id` as the session id.
4. **Send the deployment prompt** (fire-and-forget, returns in ~ms):
   ```bash
   curl -s -m 30 -X POST -H "Authorization: <auth_header>" -H 'Content-Type: application/json' -d '{"text":"Deploy an eme-server instance for client <client> with admin email <email>, domain base <base>. Follow the deploy-eme-server skill end to end (clone under the deploy root, allocate a node number, seed the admin email before first start, docker container on the entermedia network, nginx vhost, reload) and finish by reporting the verification results: container status, internal HTTP check, HTTPS check through the real domain, and the sendusercode.json response showing the seeded admin email."}' <url>/api/session/<SID>/prompt
   ```
5. **Wait for completion.** The prompt call never blocks; block on the wait endpoint instead
   (a full deployment can take 5–20 minutes — use a long timeout):
   ```bash
   curl -s -m 3600 -X POST -H "Authorization: <auth_header>" <url>/api/experimental/session/<SID>/wait
   ```
   Returns empty (HTTP 204) when the session is idle. If it times out, re-issue it — the
   session keeps working in the meantime.
6. **Fetch the result** and report it to the user:
   ```bash
   curl -s -m 30 -H "Authorization: <auth_header>" <url>/api/session/<SID>/message
   ```
   `data` is newest-first; the first item is an idle marker, then the assistant message with
   `content[]` parts — concatenate the `type:"text"` parts of the last assistant message and
   relay it (it contains the verification results). If the turn failed, say so plainly.

## Notes

- The deployment host runs the work under its own permissions; this instance only needs curl.
- One session per deployment request. If the user asks for several clients, run the flow once per client.
- Do not try to do any part of the deployment locally — if the target is unreachable, stop and report.
