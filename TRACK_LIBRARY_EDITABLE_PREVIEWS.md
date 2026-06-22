# Editable Preview Track Library

The dashboard now treats the six Blocboykiddie preview songs as official editable slots.

## Included preview slots

- Money
- Wacko Jacko
- Jmapelle_Hushpuppi
- No Seke
- Rich and Sad
- Mi Casa Su Casa

## Where to edit

Open:

```txt
dashboard.html → Library
```

Each row has:

- Preview
- Edit / Re-upload

Click **Edit / Re-upload** to replace the MP3 file and update metadata.

## Supabase requirements

Run the included:

```txt
supabase-schema.sql
```

It creates:

- `profiles` for admin and artist roles
- `tracks` for uploaded songs/snippets
- `events` for analytics
- `artists_pipeline` for future roster spots
- `demo_leads` for public demo submissions
- `ensure_profile()` secure role helper
- hardened Row Level Security policies

For old projects, run:

```txt
SUPABASE_TRACK_LIBRARY_EDIT_HOTFIX.sql
```

## Audio upload destination

Preview MP3 files are uploaded automatically by the dashboard to:

```txt
Supabase Storage → nebula-audio → USER_ID/previews/artist-name/file.mp3
```

The public URL is saved in:

```txt
tracks.audio_url
```
