# Nebula Records + EKOUNLOCKED Website — Upgraded Build

This package is the cleaned and upgraded Supabase version of the Nebula Records website.

## Included

- Cinematic Nebula Records homepage
- Next-generation label concept with Blocboykiddie mirrored as the first signed artist
- Jmapelle_hushpuppi preview card wired to `assets/jmapelle_hushpuppi.mp3`
- Future artist roster slots
- Popup player with close button and Esc-to-close behavior
- Clean premium footer with POWERED BY EKOUNLOCKED branding
- `login.html` secure label / artist portal
- `dashboard.html` role-based dashboard for label admin and signed artists
- Supabase Auth login
- Supabase Postgres schema with hardened Row Level Security policies
- Supabase Storage upload support for song/snippet previews
- Demo lead capture support
- Netlify/Vercel deployment files
- Validation report: `BUGFIX_REPORT.md`

## Setup

1. Edit `supabase-config.js` with your Supabase Project URL and anon public key.
2. Run `supabase-schema.sql` in the Supabase SQL Editor.
3. Create the admin user in Supabase Auth using your private admin password.
4. Create artist Auth users when they are signed to Nebula Records.
5. Upload/deploy the folder to your host.

Do not place private passwords or service-role keys in frontend files. Supabase Auth should hold the admin password securely.

## Official Website

Production domain: `https://nebularecordholdings.art/`

Use this as the canonical public URL for Nebula Records. Public pages include canonical and Open Graph tags pointing to this domain.
