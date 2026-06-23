# Nebula Records Official Domain Update

Official production website:

```txt
https://nebularecordholdings.art/
```

This update adds:

- Canonical URLs and Open Graph metadata for public pages.
- `robots.txt` and `sitemap.xml` for search indexing.
- Official website link in the footer and footer icon row.
- `siteUrl` in `supabase-config.js` for production settings.
- Deployment notes for connecting the domain and testing public pages.

Private pages `login.html` and `dashboard.html` include `noindex, nofollow` metadata and are blocked in `robots.txt`.
