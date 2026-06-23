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


## Official domain

Nebula Records official website URL:

```txt
https://nebularecordholdings.art/
```

After uploading the site to Netlify, Vercel, or another static host, add this domain in the host dashboard and point DNS from your registrar to the host. Keep the site published with HTTPS enabled.

Recommended production checks:

1. Open `https://nebularecordholdings.art/` and confirm the homepage loads.
2. Open `https://nebularecordholdings.art/releases.html` and test all preview buttons.
3. Open `https://nebularecordholdings.art/login.html` and test Supabase login.
4. Submit one test demo from `https://nebularecordholdings.art/contact.html`.
5. Confirm `sitemap.xml` and `robots.txt` are accessible at the domain root.
