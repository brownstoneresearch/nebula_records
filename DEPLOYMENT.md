# Deployment Notes

## Local preview
Open `index.html` directly in a browser, or run a local static server:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Supabase
1. Paste your Project URL and anon public key into `supabase-config.js`.
2. Run `supabase-schema.sql` in Supabase SQL Editor.
3. Create the admin account and artist accounts in Supabase Auth.
4. Verify login at `login.html`.

## Netlify
Drag the whole project folder into Netlify Drop, or connect a Git repository. `netlify.toml` is already included.

## Vercel
Import the folder as a static project. `vercel.json` is already included.

## Audio previews
`assets/jmapelle_hushpuppi.mp3` is wired to the Jmapelle_hushpuppi card. Replace any placeholder demo-loop audio with licensed snippets before a public launch.
