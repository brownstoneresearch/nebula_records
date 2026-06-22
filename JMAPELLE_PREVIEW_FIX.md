# Jmapelle_Hushpuppi Preview Fix

This build fixes the message:

> Preview file unavailable. Open the full Songwhip hub.

## What changed

- `script.js` now keeps a local fallback audio source for every public preview track.
- `Jmapelle_Hushpuppi` now uses `assets/jmapelle-hushpuppi.mp3` as its bundled fallback preview.
- A duplicate compatibility file remains at `assets/jmapelle_hushpuppi.mp3`.
- If a Supabase `tracks.audio_url` is broken, private, expired, or blocked by CORS/RLS, the website automatically falls back to the bundled preview instead of stopping the player.

## Best production setup

Upload the real 15–30 second MP3 snippet to Supabase Storage:

```txt
Bucket: nebula-audio
Path: previews/blocboykiddie/jmapelle-hushpuppi.mp3
```

Then paste the public URL into the `tracks.audio_url` field for the `Jmapelle_Hushpuppi` row.

If the preview still fails after upload, confirm that:

1. The `nebula-audio` bucket is public for preview snippets.
2. The copied public URL opens directly in an incognito browser tab.
3. The `tracks` row is `Published`.
4. The track title or track key is `Jmapelle_Hushpuppi` / `jmapelle-hushpuppi`.
