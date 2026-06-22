# Nebula Records Supabase Setup

This version uses Supabase instead of Firebase.

## 1. Create Supabase project
Create a Supabase project, then open **Project Settings > API** and copy your Project URL and anon public key into `supabase-config.js`.

## 2. Run database schema
Open **SQL Editor** and run `supabase-schema.sql`. It creates:

- `profiles` for admin and artist roles
- `tracks` for uploaded songs/snippets
- `events` for analytics
- `artists_pipeline` for future roster spots
- `demo_leads` for public demo submissions
- `ensure_profile()` secure role helper
- hardened Row Level Security policies

The schema file is idempotent: it drops/recreates policies so you can rerun it safely after edits.

## 3. Storage bucket
The SQL file creates/updates a public storage bucket named:

```txt
nebula-audio
```

Public storage is used so approved preview snippets can be played by the website. Uploads are still restricted to authenticated users under their own user-id folder.

## 4. Create accounts
In **Authentication > Users**, create the label admin account with the email you provided for Nebula Records. Set the password inside Supabase Auth. Do not hard-code that password into HTML, JavaScript, README files, or public repositories.

For every signed artist, create an Auth user. The SQL trigger automatically creates a `profiles` row with role `artist`. Admin can later update artist profile details from Supabase or the dashboard.

## 5. Deploy
Upload the folder to Netlify, Vercel, Supabase-compatible static hosting, or any static web host. Domain/DNS connection requires your hosting account and registrar access.
