# V14 Cloudflare Cookie Consent Update

This update adds a custom Nebula Records cookie consent layer that is ready for Cloudflare Zaraz Consent Management.

## Files added

- `assets/cloudflare-cookie-consent.css`
- `assets/cookie-consent-config.js`
- `assets/cloudflare-cookie-consent.js`
- `cookies.html`

## How it works

Visitors can choose:

- Essential only
- Custom preferences
- Accept all

The selected preference is stored as an essential first-party consent preference and can be changed from the footer via **Cookie settings**.

If Cloudflare Zaraz Consent Management is enabled on the domain, the script attempts to sync visitor choices with `zaraz.consent` using:

- `zaraz.consent.set(...)`
- `zaraz.consent.setAll(...)`
- `zaraz.consent.sendQueuedEvents()`

## Cloudflare setup

1. Open Cloudflare dashboard.
2. Go to Zaraz / Consent Management.
3. Enable Consent Management.
4. Create purposes such as Analytics, Marketing and Preferences.
5. Assign every Zaraz tool to the right purpose.
6. Copy the purpose IDs into `assets/cookie-consent-config.js` if you want exact purpose mapping.

If you use the custom Nebula banner, avoid showing Cloudflare's default modal at the same time to prevent duplicate consent popups.

## Support email

`support@nebularecordholdings.art`
