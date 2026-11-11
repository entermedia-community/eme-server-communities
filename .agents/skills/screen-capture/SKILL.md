---
name: screen-capture
description: Record the desktop or a clicked browser window with audio to an MP4 using ffmpeg (x11grab plus the default speaker monitor). Use when the user wants to record a screen, browser demo or walkthrough on this Linux machine. Pairs with transcribe-media for transcripts.
---

# Screen capture

`scripts/capture.sh` records to `browser_recording_YYYYMMDD_HHMMSS.mp4` in the current directory.

## Run

It is interactive (menu prompt, then press `q` to stop), so the user runs it in their own terminal:

```bash
cd <folder for the recording>
capture.sh
```

`~/.local/bin/capture.sh` is a symlink to the script in this skill, so the command still works from anywhere.

## What it does

1. Finds the default audio sink and records its `.monitor` (what the speakers play) with `pactl`.
2. Choice 1 records the full desktop (resolution from `xrandr`). Choice 2 asks the user to click a window (`xwininfo`) and records just that area, rounded to even dimensions for H.264.
3. Records with ffmpeg: x11grab at 30 fps, H.264 ultrafast CRF 20, AAC 192k.

Needs: ffmpeg, pactl, xrandr, xwininfo, an X11 session (not Wayland).

## After recording

- Do not commit the MP4. Recordings are large (a 9 minute clip was 45 MB); keep them out of git.
- Shrink for the web: `ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart out-web.mp4`
- Transcript: use the `transcribe-media` skill (asks before uploading audio).
