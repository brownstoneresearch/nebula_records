# Jmapelle_Hushpuppi Preview Upload Layout

Use Dashboard → Uploads → **Load Jmapelle Layout**.

Recommended values:

- Track Title: `Jmapelle_Hushpuppi`
- Artist: `Blocboykiddie`
- Release Type: `Single`
- Status: `Published`
- Songwhip / Stream Link: `https://songwhip.com/blocboykiddie`
- Audio File: `jmapelle-hushpuppi.mp3`

Storage bucket: `nebula-audio`

The dashboard uploads inside the authenticated user's UID folder, then saves the public URL into `tracks.audio_url`. The public player checks Supabase for a published `Jmapelle_Hushpuppi` row and uses that uploaded URL as the preview source.
