# Nebula Records + EKOUNLOCKED Website

Full production-ready static website package with a Supabase-backed label and artist dashboard.

## Included

- Cinematic Nebula Records homepage
- Blocboykiddie current artist integration
- Future artist roster slots
- Popup player with close button
- Concise premium footer with POWERED BY EKOUNLOCKED branding
- `login.html` secure label/artist portal
- `dashboard.html` role-based dashboard for admin and signed artists
- Supabase Auth login
- Supabase Postgres tables + Row Level Security policies
- Supabase Storage upload support for song/snippet audio
- Demo lead capture support
- Netlify/Vercel deployment files

## Important setup

1. Edit `supabase-config.js` with your Supabase Project URL and anon public key.
2. Run `supabase-schema.sql` in Supabase SQL Editor.
3. Create a Storage bucket named `nebula-audio`.
4. Create the admin user `nebulamusic_rh@outlook.com` in Supabase Auth using your private admin password.
5. Create Auth users for signed artists when they join the label.

Do not place private passwords or service-role keys in any frontend file.


## Jmapelle_hushpuppi preview update

- `Lean Gone Cold` has been replaced with `Jmapelle_hushpuppi` across the website and dashboard.
- The preview player for this track points to `assets/jmapelle_hushpuppi.mp3`.
- The Jmapelle_hushpuppi preview is wired to assets/jmapelle_hushpuppi.mp3. Replace that file with the original uploaded MP3 before public deployment if needed.
