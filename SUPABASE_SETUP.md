# Nebula Records Supabase Setup

This version uses Supabase instead of Supabase.

## 1. Create Supabase project
Create a Supabase project, then open **Project Settings > API** and copy your Project URL and anon public key into `supabase-config.js`.

## 2. Run database schema
Open **SQL Editor** and run `supabase-schema.sql`. It creates:

- `profiles` for admin and artist roles
- `tracks` for uploaded songs/snippets
- `events` for analytics
- `artists_pipeline` for future roster spots
- `demo_leads` for public demo submissions
- Row Level Security policies for admin vs artist access

## 3. Create Storage bucket
Create a Supabase Storage bucket named:

```txt
nebula-audio
```

The SQL file includes Storage policies for authenticated upload/read/update/delete.

## 4. Create accounts
In **Authentication > Users**, create the label admin account:

```txt
nebulamusic_rh@outlook.com
```

Set the password to the secure admin password you provided in chat. Do not hard-code that password into HTML, JavaScript, README files, or public repositories.

For every signed artist, create an Auth user. The SQL trigger automatically creates a `profiles` row with role `artist`. Admin can later update artist profile details from Supabase or the dashboard.

## 5. Deploy
Upload the folder to Netlify, Vercel, Supabase hosting-compatible static hosting, or any static web host. Domain/DNS connection requires your hosting account and registrar access.
