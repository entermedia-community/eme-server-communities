---
name: transcribe-media
description: Transcribe an audio or video file with speaker labels and timestamps using the EME hosted transcriber REST API (POST /transcribe), then write .txt, .vtt and .json transcripts. Use when asked to transcribe, caption or make a transcript of a recording.
---

# Transcribe media with the EME transcriber server

Same API that `plugins/finder/code/org/entermediadb/ai/transcriber/TranscriberManager.java` calls.

## API

- `POST https://transcribe.emediaworkspace.com/transcribe`
- Header `Authorization: Bearer <serverapikey>`. Default key is `demo`. The real URL and key come from the `aiserver` row with `aiservertype="transcribe"` (seed: `plugins/catalog/html/data/lists/aiserver/baseaiserver.xml`, id `transcriber`).
- Body: multipart, one field `file` holding an MP3 chunk.
- 200 returns JSON: `duration_seconds`, `language`, `language_probability`, `num_speakers`, `full_text`, `processing_time_seconds`, and `segments[]` with `start`, `end` (seconds, relative to the chunk), `text`, `speaker` (e.g. `SPEAKER_00`).

## Privacy

This uploads the audio to an external server. Get the user's explicit OK before sending, every time.

## Steps

1. Cut the audio into 5-minute mono MP3 chunks (the server is used this way by TranscriberManager):
   ```bash
   mkdir -p "$SCRATCH/audio" && cd "$SCRATCH/audio"
   ffmpeg -v error -y -i "$MEDIA" -vn -ac 1 -ar 48000 -b:a 128k \
     -f segment -segment_time 300 -reset_timestamps 1 chunk%02d.mp3
   ```
2. POST each chunk:
   ```bash
   for f in chunk*.mp3; do
     curl -s -m 600 -w "\nHTTP %{http_code}\n" -H "Authorization: Bearer demo" \
       -F "file=@$f" https://transcribe.emediaworkspace.com/transcribe -o "${f%.mp3}.json"
   done
   ```
   Expect HTTP 200 for each. Takes under a minute for ~9 minutes of audio.
3. Merge: add `300 * chunk_index` seconds to every segment `start`/`end`, then write next to the media file:
   - `<name>-transcript.txt`: `[HH:MM:SS] SPEAKER_00: text` per line
   - `<name>-transcript.vtt`: WebVTT, cue text as `<v SPEAKER_00>text`
   - `<name>-transcript.json`: list of `{start, end, speaker, text}`
4. Delete the scratch chunks.

## Notes

- Speaker labels are per chunk; `SPEAKER_00` in chunk 2 is not guaranteed to be the same person as in chunk 1, and `num_speakers` can differ between chunks.
- Inside the server, prefer `TranscriberManager` (autotranscribe skill) so results land in the `videotrack` table instead of files.
- Never install a local Whisper just for this; use the hosted API.
