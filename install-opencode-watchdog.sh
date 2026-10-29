#!/bin/bash
# Install the opencode.eme.world watchdog (one-time, needs real sudo):
#   sudo /media/emsites/eme-server-world/install-opencode-watchdog.sh
#
# Keeps the OpenCode web interface running inside eme-server-world11
# (nginx upstream 172.18.0.11:49374 -> https://opencode.eme.world).
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
UNIT="$REPO/opencode-watchdog.service"

if [[ $EUID -ne 0 ]]; then
  echo "run with sudo: sudo $0" >&2
  exit 1
fi

install -m 644 "$UNIT" /etc/systemd/system/opencode-watchdog.service
systemctl daemon-reload
systemctl enable --now opencode-watchdog.service
echo ""
systemctl status opencode-watchdog.service --no-pager | head -8
echo ""
sleep 3
curl -s -m 5 -o /dev/null http://172.18.0.11:49374/ && echo "opencode.eme.world backend: UP" || echo "opencode.eme.world backend: not up yet (watchdog will retry every 15 s)"
