---
name: reload-nginx
description: Use when the user asks to restart, reload, or apply nginx configuration on this server — "restart nginx", "reload nginx", "apply the nginx site change". Always test the config first with `sudo nginx -t`; only if the test passes, reload with `sudo nginx -s reload`. Never reload with a failing config, and never use `systemctl restart nginx` (a reload keeps existing connections alive).
---

# Skill: reload-nginx

Safely apply nginx configuration changes on this machine. Two steps, in order, no shortcuts:

## 1. Test the configuration

```bash
sudo nginx -t
```

Expected output on success:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

- If the test **fails**, stop. Do **not** reload. Report the exact error output to the
  user (it names the file and line number), fix the config if that was part of the task,
  and run `sudo nginx -t` again until it passes.
- A running nginx keeps serving with its old config while the test fails, so a failed
  test is never an emergency — do not "force" a reload.

## 2. Reload (only after the test passes)

```bash
sudo nginx -s reload
```

This is a graceful reload: nginx re-reads the config, starts new workers, and lets old
workers finish their in-flight requests. No downtime, no dropped connections. It prints
nothing on success (exit code 0).

Do **not** use `sudo systemctl restart nginx` or `sudo nginx -s stop` — a full restart
drops connections and is unnecessary for config changes.

## One-liner (test-gated reload)

```bash
sudo nginx -t && sudo nginx -s reload
```

The `&&` guarantees the reload only runs when the test passes.

## 3. Verify

Confirm the master process is still alive and the change took effect:

```bash
pgrep -a nginx | head -5          # master + worker processes present
```

If the reload was for a specific site (e.g. a new `<client>.eme.world` server block from
the `deploy-eme-server` skill), also probe it:

```bash
curl -sI https://<domain>/ | head -3   # expect an HTTP response, not a connection error
```

## Notes

- Both commands need `sudo`. If sudo prompts for a password and none is available
  non-interactively, report that to the user rather than working around it.
- `nginx: [error] ... "nginx.pid" failed` on reload means nginx is not currently running;
  in that case (and only that case) start it with `sudo nginx` or
  `sudo systemctl start nginx`, then verify.
- Site files live in `/etc/nginx/sites-available/` with symlinks in `sites-enabled/`;
  after adding a new site, make sure the symlink exists before testing.