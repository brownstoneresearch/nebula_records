(() => {
  "use strict";
  const cfg = Object.assign({
    storageKey: "nebula_cookie_consent_v1",
    cookieName: "nebula_cookie_consent",
    policyUrl: "cookies.html",
    contactEmail: "support@nebularecordholdings.art",
    cloudflareZaraz: { enabled: true, purposeIds: {} }
  }, window.NEBULA_COOKIE_CONSENT || {});

  const categories = {
    essential: {
      label: "Essential",
      description: "Required for security, page delivery, login sessions, dashboard access and remembering your consent choice.",
      locked: true
    },
    analytics: {
      label: "Analytics",
      description: "Helps Nebula Records understand site performance and catalogue engagement when analytics tools are enabled."
    },
    marketing: {
      label: "Marketing",
      description: "Allows optional campaign, conversion and social advertising tools when they are connected through Cloudflare Zaraz."
    },
    preferences: {
      label: "Preferences",
      description: "Stores optional interface choices such as media and display preferences for a smoother visit."
    }
  };

  const defaults = { essential: true, analytics: false, marketing: false, preferences: false };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getStored() {
    try {
      const raw = localStorage.getItem(cfg.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.version ? parsed : null;
    } catch (_) { return null; }
  }

  function setConsentCookie(payload) {
    try {
      const maxAge = 60 * 60 * 24 * 180;
      const value = encodeURIComponent(JSON.stringify({ version: payload.version, updatedAt: payload.updatedAt, choices: payload.choices }));
      document.cookie = `${cfg.cookieName}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure`;
    } catch (_) {}
  }

  function store(choices, source = "banner") {
    const payload = {
      version: "2026-06-nebula-v1",
      source,
      updatedAt: new Date().toISOString(),
      choices: Object.assign({}, defaults, choices, { essential: true })
    };
    localStorage.setItem(cfg.storageKey, JSON.stringify(payload));
    setConsentCookie(payload);
    applyToDocument(payload.choices);
    syncCloudflareZaraz(payload.choices);
    window.dispatchEvent(new CustomEvent("nebulaConsentUpdated", { detail: payload }));
    return payload;
  }

  function applyToDocument(choices) {
    document.documentElement.dataset.cookieConsent = "set";
    Object.keys(categories).forEach((key) => {
      document.documentElement.dataset[`consent${key[0].toUpperCase()}${key.slice(1)}`] = String(!!choices[key]);
    });
  }

  function mapByKnownPurposeIds(choices) {
    const ids = (cfg.cloudflareZaraz && cfg.cloudflareZaraz.purposeIds) || {};
    const mapped = {};
    ["analytics", "marketing", "preferences"].forEach((key) => {
      if (ids[key]) mapped[ids[key]] = !!choices[key];
    });
    return mapped;
  }

  function mapByZarazPurposeNames(choices) {
    const mapped = {};
    const purposes = window.zaraz?.consent?.purposes || {};
    Object.entries(purposes).forEach(([id, info]) => {
      const text = `${info?.name || ""} ${info?.description || ""}`.toLowerCase();
      if (text.includes("marketing") || text.includes("advert") || text.includes("ads")) mapped[id] = !!choices.marketing;
      else if (text.includes("preference") || text.includes("functional")) mapped[id] = !!choices.preferences;
      else if (text.includes("analytic") || text.includes("measurement") || text.includes("statistics")) mapped[id] = !!choices.analytics;
    });
    return mapped;
  }

  function syncCloudflareZaraz(choices) {
    if (!cfg.cloudflareZaraz?.enabled) return;
    const run = () => {
      const consent = window.zaraz?.consent;
      if (!consent) return;
      try {
        const explicitMap = mapByKnownPurposeIds(choices);
        const inferredMap = Object.keys(explicitMap).length ? explicitMap : mapByZarazPurposeNames(choices);
        if (Object.keys(inferredMap).length && typeof consent.set === "function") {
          consent.set(inferredMap);
        } else if (typeof consent.setAll === "function") {
          const allNonEssential = !!(choices.analytics && choices.marketing && choices.preferences);
          const noNonEssential = !(choices.analytics || choices.marketing || choices.preferences);
          if (allNonEssential) consent.setAll(true);
          if (noNonEssential) consent.setAll(false);
        }
        if ((choices.analytics || choices.marketing || choices.preferences) && typeof consent.sendQueuedEvents === "function") {
          consent.sendQueuedEvents();
        }
      } catch (error) {
        console.warn("Nebula cookie consent: Cloudflare Zaraz sync skipped.", error);
      }
    };

    if (window.zaraz?.consent?.APIReady) run();
    else document.addEventListener("zarazConsentAPIReady", run, { once: true });
  }

  function buildBanner() {
    if ($("#nebulaCookieConsent")) return;
    const root = document.createElement("div");
    root.className = "nebula-cookie-root";
    root.id = "nebulaCookieConsent";
    root.innerHTML = `
      <section class="nebula-cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
        <button class="nebula-cookie-close" type="button" data-cookie-close aria-label="Close cookie notice">×</button>
        <div class="nebula-cookie-inner">
          <div class="nebula-cookie-copy">
            <span class="nebula-cookie-kicker">Privacy controls</span>
            <h2>Choose how Nebula Records uses cookies.</h2>
            <p>We use essential cookies for security and portal access. Optional analytics or marketing tools only run after you allow them. You can update this anytime from <a href="${cfg.policyUrl}">Cookie Policy</a>.</p>
            <p class="nebula-cookie-status" data-cookie-status>Cloudflare-ready consent controls</p>
          </div>
          <div class="nebula-cookie-actions">
            <button class="nebula-cookie-btn ghost" type="button" data-cookie-reject>Essential only</button>
            <button class="nebula-cookie-btn" type="button" data-cookie-manage>Customize</button>
            <button class="nebula-cookie-btn primary" type="button" data-cookie-accept>Accept all</button>
          </div>
        </div>
      </section>`;
    document.body.appendChild(root);
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-cookie-accept]")) { store({ analytics: true, marketing: true, preferences: true }, "accept_all"); hideBanner(); }
      if (e.target.closest("[data-cookie-reject]")) { store({ analytics: false, marketing: false, preferences: false }, "essential_only"); hideBanner(); }
      if (e.target.closest("[data-cookie-manage]")) openModal();
      if (e.target.closest("[data-cookie-close]")) hideBanner(false);
    });
    requestAnimationFrame(() => $(".nebula-cookie-banner", root)?.classList.add("is-visible"));
  }

  function hideBanner(persistDismissal = true) {
    const banner = $(".nebula-cookie-banner");
    if (banner) banner.classList.remove("is-visible");
    setTimeout(() => $("#nebulaCookieConsent")?.remove(), 260);
    if (persistDismissal && !getStored()) store(defaults, "dismissed_essential");
  }

  function buildModal() {
    if ($("#nebulaConsentModal")) return;
    const saved = getStored()?.choices || defaults;
    const rows = Object.entries(categories).map(([key, item]) => `
      <article class="consent-row">
        <div>
          <h3>${item.label}</h3>
          <p>${item.description}</p>
        </div>
        <label class="nebula-switch" aria-label="${item.label} cookies">
          <input type="checkbox" data-consent-toggle="${key}" ${saved[key] ? "checked" : ""} ${item.locked ? "disabled" : ""}>
          <span class="nebula-slider"></span>
        </label>
      </article>`).join("");

    const modal = document.createElement("div");
    modal.className = "nebula-consent-modal";
    modal.id = "nebulaConsentModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "nebulaConsentTitle");
    modal.innerHTML = `
      <section class="nebula-consent-panel">
        <header class="nebula-consent-head">
          <div>
            <h2 id="nebulaConsentTitle">Cookie preferences</h2>
            <p>Manage optional cookies and Cloudflare Zaraz tool consent. Essential cookies remain active to keep the site secure and usable.</p>
          </div>
          <button class="nebula-consent-x" type="button" data-consent-close aria-label="Close preferences">×</button>
        </header>
        <div class="nebula-consent-body">${rows}</div>
        <footer class="nebula-consent-foot">
          <button class="nebula-cookie-btn ghost" type="button" data-consent-essential>Essential only</button>
          <button class="nebula-cookie-btn" type="button" data-consent-save>Save choices</button>
          <button class="nebula-cookie-btn primary" type="button" data-consent-all>Accept all</button>
        </footer>
      </section>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-consent-close]")) closeModal();
      if (e.target.closest("[data-consent-essential]")) { store(defaults, "modal_essential"); closeModal(); hideBanner(false); }
      if (e.target.closest("[data-consent-all]")) { store({ analytics: true, marketing: true, preferences: true }, "modal_accept_all"); closeModal(); hideBanner(false); }
      if (e.target.closest("[data-consent-save]")) { saveModalChoices(); closeModal(); hideBanner(false); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  function openModal() {
    buildModal();
    const saved = getStored()?.choices || defaults;
    $$('[data-consent-toggle]').forEach((input) => { input.checked = !!saved[input.dataset.consentToggle]; });
    $("#nebulaConsentModal")?.classList.add("is-visible");
  }

  function closeModal() { $("#nebulaConsentModal")?.classList.remove("is-visible"); }

  function saveModalChoices() {
    const choices = Object.assign({}, defaults);
    $$('[data-consent-toggle]').forEach((input) => { choices[input.dataset.consentToggle] = input.checked; });
    store(choices, "modal_custom");
  }

  function bindSettingsButtons() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-cookie-settings]")) {
        e.preventDefault();
        openModal();
      }
    });
  }

  function init() {
    bindSettingsButtons();
    const saved = getStored();
    if (saved?.choices) {
      applyToDocument(saved.choices);
      syncCloudflareZaraz(saved.choices);
    } else {
      applyToDocument(defaults);
      buildBanner();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
