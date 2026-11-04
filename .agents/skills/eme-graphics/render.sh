#!/usr/bin/env bash
# Usage: render.sh <file.svg> [width=3000]
# Exports <file>.png (same folder, opaque) and prints the trimmed content box so margins can be verified.
set -euo pipefail
svg="${1:?usage: render.sh file.svg [width]}"
width="${2:-3000}"
png="${svg%.svg}.png"
[ "$width" = 3000 ] || png="${svg%.svg}-$width.png"

fontdir="$HOME/.local/share/fonts/eme"
if ! fc-list | grep -qi "Archivo Black"; then
  mkdir -p "$fontdir"
  base=https://github.com/google/fonts/raw/main/ofl
  curl -sfL "$base/archivoblack/ArchivoBlack-Regular.ttf" -o "$fontdir/ArchivoBlack-Regular.ttf"
  curl -sfL "$base/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf" -o "$fontdir/SpaceGrotesk.ttf"
  curl -sfL "$base/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf" -o "$fontdir/JetBrainsMono.ttf"
  fc-cache -f >/dev/null
fi

xmllint --noout "$svg"
inkscape "$svg" -w "$width" -o "$png" >/dev/null 2>&1
file "$png"
echo "content box (WxH+left+top, expect ~5px edges at 3000w):"
convert "$png" -background white -alpha remove -trim -format "%wx%h%O\n" info:
