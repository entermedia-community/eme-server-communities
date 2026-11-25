---
name: remote-user-provisioning
description: Use when the user asks to create a login user on a remote EME server over SSH — "add user X to server Y", "provision eroot/eadmin on mNN", give someone key-based SSH access with full or limited sudo. Covers local keypair generation, remote user creation, authorized_keys install, sshd AllowUsers updates without breaking existing access, sudoers via visudo, and BatchMode verification.
---

# Provision a remote SSH user with key login and sudo

All remote work is **non-interactive**: every SSH call uses `-o BatchMode=yes` and every sudo call uses `sudo -n` or passwordless sudo. Never prompt for passwords on the remote host.

## Prerequisites

- An SSH alias for the target server in `~/.ssh/keys/<something>.conf` (e.g. `Host m47` → `mediadb47.entermediadb.net`, admin user with passwordless sudo). Test it: `ssh -o BatchMode=yes m47 whoami`.
- Local key directory `~/.ssh/keys/`.

## Key naming convention

One ed25519 keypair per user per server, named `<user>_<server>.pk` / `.pub` in `~/.ssh/keys/` (e.g. `eroot_m47.pk`). Generate locally, never on the server:

```bash
ssh-keygen -t ed25519 -N '' -f ~/.ssh/keys/eroot_m47.pk -C 'eroot@m47'
```

## Steps

Run each remote step through the admin alias: `ssh -o BatchMode=yes m47 '<command>'`.

### 1. Create the user with a bash shell

```bash
sudo useradd -m -s /bin/bash eroot
```

If the user already exists, fix the shell instead: `sudo chsh -s /bin/bash eroot`.
A locked password (`passwd -S` shows `L`) is fine — key login works with `UsePAM yes`. Do not set or unlock passwords.

### 2. Install the public key

Copy the local `.pub` content and write it on the server (root-owned paths need `sudo sh -c`):

```bash
PUB=$(cat ~/.ssh/keys/eroot_m47.pub)
ssh -o BatchMode=yes m47 "sudo sh -c 'mkdir -p /home/eroot/.ssh && echo \"$PUB\" > /home/eroot/.ssh/authorized_keys && chown -R eroot:eroot /home/eroot/.ssh && chmod 700 /home/eroot/.ssh && chmod 600 /home/eroot/.ssh/authorized_keys'"
```

### 3. Add the user to sshd AllowUsers — preserve everything existing

1. Back up first: `sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%Y%m%d)`.
2. Read the current config. Keep **all** existing `AllowUsers` lines (including IP-restricted ones like `ansible@154.1****.125`), `Port`, and every `Match` block exactly as they are.
3. Append one line per new user: `AllowUsers eroot@0.0**.0/0` (any source IP).
4. Write the full file back with `sudo sh -c 'cat > /etc/ssh/sshd_config'` fed from a payload (see pitfall below).
5. Validate and restart: `sudo sshd -t && sudo systemctl restart sshd`, then confirm `systemctl is-active sshd` and that it still listens on the original port only.

### 4. Write the sudoers file with visudo

Use `sudo EDITOR='tee' visudo -f /etc/sudoers.d/<name>` fed by a quoted heredoc — visudo syntax-checks before saving.

Full sudo (reference `eroot`):

```
eroot   ALL=NOPASSWD:    ALL
```

Limited sudo (reference `eadmin-limited`; an omitted arg spec means *exact args only*, a bare `""` as the entire arg spec means *no args*, and `*` means any args. Never put a trailing `""` after real arguments — sudo matches it literally. Backslash continuations are valid):

```
eadmin ALL=(ALL) NOPASSWD: \
    /usr/bin/systemctl reload nginx, \
    /usr/bin/systemctl restart nginx, \
    /usr/bin/systemctl status nginx, \
    /usr/sbin/nginx -t, \
    /usr/sbin/nginx -s reload, \
    /usr/bin/docker *, \
    /usr/bin/journalctl --disk-usage, \
    /usr/bin/journalctl --vacuum-size=500M, \
    /usr/bin/snap list --all, \
    /usr/bin/snap remove --revision=*, \
    /usr/bin/apt-get clean, \
    /usr/bin/apt-get -s clean
```

The last six rules let eadmin run the `monitor-un` skill's disk cleanup when the OS
partition is 98%+ full (journal vacuum, disabled-snap-revision removal, apt cache
clean) without switching users. Notes:

- `snap remove --revision=*`: sudoers `*` matches spaces too, so it covers the snap
  name argument after `--revision=<rev>`. snapd itself refuses to remove an active
  revision, so only old/disabled revisions can actually be removed.
- `apt-get -s clean` is a no-change simulation, useful to verify the rule without
  cleaning anything.
- Verify each new rule with a real read-only/simulate invocation (`journalctl
  --disk-usage`, `snap list --all`, `apt-get -s clean`), not just `sudo -n -l`.

Check the real binary paths on the host first (`command -v nginx`) — on m47 nginx exists only at `/usr/sbin/nginx`. Adjust paths to the host and tell the user about any deviation from what they asked for.

### 5. Verify key login and sudo

```bash
ssh -o BatchMode=yes -o IdentitiesOnly=yes -i ~/.ssh/keys/eroot_m47.pk \
  eroot@mediadb47.entermediadb.net 'whoami; echo SHELL=$SHELL; sudo -n -l; sudo -n whoami'
```

- Full-sudo user: `sudo -n whoami` prints `root`.
- Limited-sudo user: `sudo -n -l` lists only the allowed commands, and `sudo -n whoami` must **fail** with "a password is required".
- Re-check that pre-existing users (`entermedia`, `ansible`, `backup`, …) can still log in.

### 6. Clean up

Remove any temp/debug files created on the server during provisioning.

## Pitfalls (hard-won)

- **Invalid CIDR in AllowUsers silently rejects logins.** `sshd -t` and `sshd -T` do *not* validate address patterns. A typo like `0.0**.0` passes validation but blocks every login for that user. Always verify the exact bytes.
- **Command transport can mangle `0.0**.0` into `0.0**.0`.** Don't trust text display. Build the file content locally with octal escapes for dots, base64 it, decode remotely, and verify with hex:

  ```bash
  PAYLOAD=$(printf 'AllowUsers eroot@0\0560\0560\0560/0\n' | base64 -w0)
  ssh -o BatchMode=yes m47 "echo $PAYLOAD | base64 -d | sudo sh -c 'cat >> /etc/ssh/sshd_config'"
  ssh -o BatchMode=yes m47 "sudo grep eroot /etc/ssh/sshd_config | od -An -tx1"
  ```

  In the hex dump, `2e` = `.` and `2a` = `*`. Confirm the pattern reads `0.0**.0/0` byte-for-byte.
- **Root-owned file writes** (`/etc/ssh/sshd_config`, other users' `authorized_keys`) need `sudo sh -c '...'`; plain redirection with sudo does not work.
- **`sed -i` exits 0 even when nothing matched.** After any sed edit, grep the file to prove the change landed.
- **Never remove or reorder existing AllowUsers lines or Match blocks** — that locks out existing admins and automation.
- **Trailing `""` after real arguments breaks the rule** (verified on m47/m49, sudo 1.8.31): `cmd args ""` requires the *literal* argument `""`, so every legitimate invocation is denied. Only a bare `""` as the entire arg spec means "no args"; omit the spec entirely for exact-arg matching. When auditing a limited-sudo file, test each rule with a real invocation (`sudo -n /usr/sbin/nginx -t`), not just `sudo -n -l`.