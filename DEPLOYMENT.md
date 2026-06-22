# Deployment Guide

## Supabase setup

1. Create your Supabase project.
2. Copy the Project URL and anon public key into `supabase-config.js`.
3. Run `supabase-schema.sql` in SQL Editor.
4. Create the `nebula-audio` Storage bucket.
5. Create the admin and artist Auth users.

## Static hosting

This website is frontend-only and can be deployed to Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any standard static host.

### Netlify
Upload the folder or connect a GitHub repository. `netlify.toml` is included.

### Vercel
Import the folder/repo. `vercel.json` is included.

## Live domain

Add the domain in your hosting provider, then update DNS at your registrar. The exact DNS records depend on the host.

## Launch checklist

- Supabase URL and anon key configured
- SQL schema applied
- `nebula-audio` bucket created
- Admin Auth user created
- Artist Auth users created for signed artists
- Licensed 15–30 second snippets uploaded
- Songwhip link verified
- Footer social links verified
