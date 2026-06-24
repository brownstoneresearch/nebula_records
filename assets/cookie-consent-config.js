/*
  Nebula Records consent configuration.
  If Cloudflare Zaraz Consent Management is enabled, the script will call zaraz.consent APIs.
  Add your Cloudflare Zaraz purpose IDs below when you create purposes in Cloudflare dashboard.
*/
window.NEBULA_COOKIE_CONSENT = {
  storageKey: "nebula_cookie_consent_v1",
  cookieName: "nebula_cookie_consent",
  policyUrl: "cookies.html",
  contactEmail: "support@nebularecordholdings.art",
  // Optional: map these to the actual Zaraz purpose IDs from Cloudflare → Zaraz → Consent.
  cloudflareZaraz: {
    enabled: true,
    purposeIds: {
      analytics: "",   // example: "analytics"
      marketing: "",   // example: "marketing"
      preferences: ""   // example: "preferences"
    }
  }
};
