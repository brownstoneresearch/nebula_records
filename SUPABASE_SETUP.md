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


## Fixing `new row violates row-level security policy` during uploads

If you already ran an older schema and see this error while uploading snippets:

1. Open Supabase Dashboard → SQL Editor.
2. Open `SUPABASE_RLS_UPLOAD_HOTFIX.sql` from this package.
3. Paste and run the whole file.
4. Refresh `dashboard.html`, sign out/in again, then upload the snippet.

The hotfix updates Storage policies and makes dashboard uploads save under your authenticated user ID folder.

## v4.2 Editable Six-Song Preview Library

This package includes a complete `supabase-schema.sql` that creates:

- `profiles` for admin and signed artist roles
- `tracks` for uploaded songs/snippets
- `events` for analytics
- `artists_pipeline` for future roster spots
- `demo_leads` for public demo submissions
- `ensure_profile()` secure role helper
- hardened Row Level Security policies
- the public `nebula-audio` Storage bucket for preview MP3 files

The `tracks` table also includes `track_key` and `cover_url`. These fields allow the six public Blocboykiddie preview songs in the dashboard Track Library to remain fixed as official preview slots while still being editable.

To update an existing Supabase project, run either the full `supabase-schema.sql` again or run `SUPABASE_TRACK_LIBRARY_EDIT_HOTFIX.sql` once in Supabase SQL Editor.

The six editable preview slots are:

1. Money
2. Wacko Jacko
3. Jmapelle_Hushpuppi
4. No Seke
5. Rich and Sad
6. Mi Casa Su Casa

Dashboard flow:

1. Sign in through `login.html`.
2. Open `dashboard.html`.
3. Go to **Library**.
4. Click **Edit / Re-upload** beside any of the six preview songs.
5. Choose a replacement MP3 preview.
6. Save the update.

The new MP3 is uploaded to Supabase Storage and its public URL is saved to `tracks.audio_url`. The public website player then reads published Supabase tracks and uses the latest preview URL.


## Official site URL

Set the Supabase config `siteUrl` to:

```js
siteUrl: "https://nebularecordholdings.art/"
```

In Supabase Auth settings, add this domain to the approved redirect/site URL settings when you activate production login.
