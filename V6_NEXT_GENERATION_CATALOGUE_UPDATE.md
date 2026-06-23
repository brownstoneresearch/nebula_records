# Nebula Records v6 — Next Generation Catalogue Update

This package applies the requested creative and structural changes:

- Removed the visible hero line: `Official website: nebularecordholdings.art · X @nebulamusic_rh`.
- Removed the visible footer text: `X · @nebulamusic_rh`.
- Kept the X.com icon/link for Nebula Records without bulky handle text.
- Added `catalogue.html` as a public artist catalogue for every artist signed under Nebula Records.
- Added a Supabase `artist_catalogue` table and `SUPABASE_ARTIST_CATALOGUE_HOTFIX.sql` for existing projects.
- Repositioned the website concept around Nebula Records as a home for next-generation stars.
- Mirrored Blocboykiddie as the first official artist instead of making the whole brand depend only on him.
- Rebuilt the login container into a sharper label/artist portal experience.
- Rebuilt the demo submission container into a more premium artist-intake experience.
- Updated the main navigation and sitemap to include Catalogue.

For existing Supabase projects, run:

```sql
SUPABASE_ARTIST_CATALOGUE_HOTFIX.sql
```

Then upload the site files to the hosting connected to `https://nebularecordholdings.art/`.
