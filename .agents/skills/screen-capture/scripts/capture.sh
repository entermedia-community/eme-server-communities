#!/usr/bin/env bash
set -e

# Automatically detect default speaker/headphone monitor stream
DEFAULT_SINK=$(pactl get-default-sink 2>/dev/null || pactl info | awk -F': ' '/Default Sink/{print $2}')
AUDIO_SOURCE="${DEFAULT_SINK}.monitor"

echo "Select recording area:"
echo "  1) Full desktop"
echo "  2) Click on browser window"
read -rp "Choice [1/2, default 1]: " CHOICE
CHOICE="${CHOICE:-1}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT="browser_recording_${TIMESTAMP}.mp4"

if [ "$CHOICE" = "2" ]; then
    echo "Click on the browser window you want to record..."
    INFO=$(xwininfo)
    W=$(echo "$INFO" | awk '/Width:/{print $2}')
    H=$(echo "$INFO" | awk '/Height:/{print $2}')
    X=$(echo "$INFO" | awk '/Absolute upper-left X:/{print $4}')
    Y=$(echo "$INFO" | awk '/Absolute upper-left Y:/{print $4}')

    # H.264 requires dimensions to be divisible by 2
    W=$(( W - (W % 2) ))
    H=$(( H - (H % 2) ))

    VIDEO_SIZE="${W}x${H}"
    INPUT_TARGET="${DISPLAY:-:0.0}+${X},${Y}"
else
    # Auto-detect full screen resolution via xrandr
    RES=$(xrandr --current | grep '*' | head -n 1 | awk '{print $1}')
    VIDEO_SIZE="${RES:-1920x1080}"
    INPUT_TARGET="${DISPLAY:-:0.0}"
fi

echo "Recording started -> ${OUTPUT}"
echo "Press 'q' in this terminal to STOP recording."

ffmpeg -y \
  -video_size "$VIDEO_SIZE" \
  -framerate 30 \
  -f x11grab \
  -i "$INPUT_TARGET" \
  -f pulse \
  -i "$AUDIO_SOURCE" \
  -c:v libx264 -preset ultrafast -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  "$OUTPUT"

echo "Finished! Saved to $(pwd)/${OUTPUT}"
