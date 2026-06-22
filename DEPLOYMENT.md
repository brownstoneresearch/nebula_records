# Nebula Records + EKOUNLOCKED Deployment Guide

## Frontend
Upload this folder to Netlify, Vercel or any static host. The site is static-first and all pages work by opening `index.html`.

## Domain
1. Buy or open your domain in your registrar dashboard.
2. Add the domain to Netlify/Vercel.
3. Copy the DNS records from your host.
4. Paste them into the registrar DNS settings.
5. Wait for SSL to issue automatically.

## Backend for real uploads and analytics
The `backend/` folder contains a Node/Express starter API for real song uploads and analytics event logging. Deploy it to Render, Railway, Fly.io, a VPS or any Node-capable host. Then replace `YOUR_BACKEND_DOMAIN` in `netlify.toml` and `vercel.json`.

## Required launch replacements
- Replace `assets/nebula-demo-loop.wav` with licensed 15–30 second snippets for Blocboykiddie.
- Connect `contact.html` and `dashboard.html` to the deployed backend.
- Replace placeholder email/social/domain values with final production details.

## EKOUNLOCKED handles
- TikTok: @ekounlocked
- Instagram: @ekounlocked_

## Nebula handles
- @nebulamusic_rh
