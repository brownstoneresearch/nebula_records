# Nebula Records V8 Error Fix + Mobile Readability Pass

Generated: 2026-06-23T04:06:12.545737Z

## Completed
- Replaced footer contact email with `support@nebularecordholdings.art` across all public footers.
- Replaced public JSON-LD organization email with `support@nebularecordholdings.art` while preserving the Supabase admin email in `supabase-config.js`.
- Rebuilt the footer into a compact, less ambiguous music-label footer.
- Removed obsolete nested website/backend/Firebase files from the distributable package to prevent stale pages and confusing deployment errors.
- Replaced the old `admin.html` with a secure redirect/gateway to `login.html`.
- Added final CSS overrides that lock text contrast on bright and dark sections.
- Hardened mobile layouts for header navigation, hero, artist catalogue, demo form, login portal, dashboard, track tables, player and footer.

## Deployment note
Upload the contents of `nebula_records-main/` to your live host for `https://nebularecordholdings.art/`.
