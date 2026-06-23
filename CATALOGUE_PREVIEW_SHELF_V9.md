# Nebula Records v9 - Catalogue Preview Shelf

This upgrade keeps public preview cards empty until an uploaded song is explicitly selected for preview from the admin portal or a signed artist portal.

## How it works

1. Upload a full song or snippet from `dashboard.html`.
2. Tick **Add this upload to the public Catalogue Preview Shelf**.
3. Choose Slot 01-06, or leave Auto.
4. Set Status to **Published**.
5. Save to Supabase.

Only tracks with these values appear on the public shelf:

- `status = Published`
- `preview_enabled = true`
- `audio_url` is not empty
- `preview_slot` is 1-6 when a specific slot is selected

Run `SUPABASE_CATALOGUE_PREVIEW_SHELF_HOTFIX.sql` on existing Supabase projects before using this feature.
