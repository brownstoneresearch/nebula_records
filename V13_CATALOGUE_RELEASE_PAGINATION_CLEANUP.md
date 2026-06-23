# Nebula Records v13 — Catalogue / Release Pagination + Asset Cleanup

## Public preview behaviour
- Homepage renders exactly 6 Catalogue Preview Shelf positions.
- Catalogue page renders 12 positions per page and supports pagination when more public previews are selected.
- Release page has been upgraded into a Release Vault instead of a duplicate static list. It reads the same Supabase-selected public previews and shows 12 per page.
- Preview cards stay empty until `tracks.preview_enabled = true`, `status = Published`, and `audio_url` is present.

## Dashboard / Supabase
- Admin and signed artist portals can select public preview slots 01–12.
- Slots 01–06 are mirrored on the homepage.
- Slots 07–12 appear on Catalogue and Release Vault pages.
- Run `SUPABASE_CATALOGUE_PAGINATION_HOTFIX.sql` on existing Supabase projects to widen the `preview_slot` check constraint to 1–12.

## Cleanup
- Removed unused generated artist/covers/logos/audio files from `/assets`.
- Kept only runtime-referenced website assets.
