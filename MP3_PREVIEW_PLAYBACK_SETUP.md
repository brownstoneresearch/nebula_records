# Nebula Records MP3 Preview Playback Setup

This package is wired so uploaded MP3 files can play as public preview cards.

## Required Supabase setup

1. Open Supabase → SQL Editor.
2. Run `SUPABASE_MP3_PREVIEW_PLAYBACK_HOTFIX.sql` for an existing project, or run the full updated `supabase-schema.sql`.
3. Confirm the Storage bucket is public:
   - Bucket name: `nebula-audio`
4. Confirm the `tracks` table has these fields:
   - `audio_url`
   - `audio_path`
   - `audio_bucket`
   - `preview_enabled`
   - `preview_slot`
   - `is_full_song`

## Upload flow

1. Log in to `dashboard.html`.
2. Upload an MP3 from the Uploads tab or use Edit / Re-upload in the Library.
3. Tick **Add this upload to the public Catalogue Preview Shelf**.
4. Choose a slot from 01–12.
5. Set Status to **Published**.
6. Save.

## Public playback rules

A track appears on the website only when:

- `status = Published`
- `preview_enabled = true`
- `preview_slot` is set
- the row has either `audio_url` or `audio_path`

Homepage displays slots 01–06.
Catalogue and Release Vault pages display up to 12 per page.

## What changed in v15

- Dashboard uploads now save both a public URL and the original Supabase Storage path.
- The public audio player can rebuild the playable URL from `audio_path` if `audio_url` is missing or stale.
- The player tries alternate uploaded preview sources before showing an error.
- The hotfix makes the `nebula-audio` bucket public for preview streaming while keeping upload/update/delete restricted to authenticated owners/admin.
