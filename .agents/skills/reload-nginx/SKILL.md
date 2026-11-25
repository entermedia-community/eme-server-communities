---
name: reload-nginx
description: Use when the user asks to restart, reload, or apply nginx configuration on this server or a remote mNN server — "restart nginx", "reload nginx", "apply the nginx site change", "reload nginx on m49 as eadmin". Always test the config first with `sudo nginx -t`; only if the test passes, reload with `sudo nginx -s reload`. Never reload with a failing config, and never use `systemctl restart nginx` (a reload keeps existing connections alive). For remote servers, SSH as the requested provisioned user with their explicit key.
---

# Skill: reload-nginx

Safely apply nginx configuration changes on this machine or a remote EME server.
Two steps, in order, no shortcuts:

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

## Remote servers (mNN)

The same test-gated flow applies on a remote EME server: run every step over SSH as the
requested user, in the same order. If the user names a specific account (e.g. `eadmin`),
use only that account. If anything fails, report the failure to the user before trying
alternatives — do not silently fall back to another user.

**Key gotcha:** the `mNN` host aliases in `~/.ssh/keys/entermedia.conf` pin
`User entermedia` and `IdentityFile ~/.ssh/keys/mNN`. Overriding the user on the command
line (`ssh eadmin@m49`) does **not** override the identity file, so SSH offers
entermedia's key and fails with `Permission denied (publickey,password)`.

For any non-default user, always pass that user's provisioned key explicitly. Keys are
created by the `remote-user-provisioning` skill as `~/.ssh/keys/<user>_<host>.pk`:

```bash
SSH="ssh -o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes -i ~/.ssh/keys/eadmin_m49.pk eadmin@m49"

$SSH 'whoami && sudo -n nginx -t'     # 1. test
$SSH 'sudo -n nginx -s reload'        # 2. reload, only if the test passed
$SSH 'pgrep -a nginx | head -5'       # 3. verify
```

- `IdentitiesOnly=yes` ensures only the named key is offered, not the alias's key.
- `BatchMode=yes` and `sudo -n` make SSH/sudo password prompts fail fast instead of
  hanging the session. Report such failures to the user rather than working around them.
- If `~/.ssh/keys/<user>_<host>.pk` does not exist, the user is not provisioned on that
  server yet — stop and report (see the `remote-user-provisioning` skill).
- Probe a site through the remote host if needed: `$SSH 'curl -sI http://localhost/ | head -3'`.

## Notes

- Both commands need `sudo`. If sudo prompts for a password and none is available
  non-interactively, report that to the user rather than working around it.
- `nginx: [error] ... "nginx.pid" failed` on reload means nginx is not currently running;
  in that case (and only that case) start it with `sudo nginx` or
  `sudo systemctl start nginx`, then verify.
- Site files live in `/etc/nginx/sites-available/` with symlinks in `sites-enabled/`;
  after adding a new site, make sure the symlink exists before testing.