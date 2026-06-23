# Nebula Records v12 Font Styling Upgrade

This update analyses the uploaded CSS reference and uses only its font styling ideas:

- Plus Jakarta Sans for the core interface and readable body copy.
- Playfair Display for premium editorial hero and major headings.
- Geist Mono for metadata, studio labels, buttons, badges and dashboard technical details.
- Matching fallback metrics were added so layout stays stable if the web fonts are still loading.

No non-font visual palette, spacing system, Tailwind utility dump, or unrelated design rules from the uploaded CSS were imported.

Files changed:

- Added `assets/nebula-font-system.css`.
- Linked `assets/nebula-font-system.css` after `style.css` on every HTML page.
- Kept existing Nebula Records v11 visual design, SEO, Supabase dashboard, catalogue preview shelf and mobile layout intact.
