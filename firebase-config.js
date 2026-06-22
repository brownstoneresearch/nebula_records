/*
  Nebula Records Firebase configuration
  1. Create a Firebase project.
  2. Add a Web app in Firebase console.
  3. Paste the generated config below.
  4. Enable Authentication > Sign-in method > Email/Password.
  5. Create admin user: nebulamusic_rh@outlook.com
*/
window.NEBULA_ADMIN_EMAIL = "nebulamusic_rh@outlook.com";
window.NEBULA_FIREBASE_CONFIG = {
  firebaseConfig: {
    apiKey: "PASTE_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "PASTE_MESSAGING_SENDER_ID",
    appId: "PASTE_FIREBASE_APP_ID"
  },
  collections: {
    tracks: "nebulaTracks",
    artists: "nebulaArtists",
    events: "nebulaAnalyticsEvents",
    leads: "nebulaDemoLeads"
  }
};
window.isNebulaFirebaseConfigured = function(){
  const cfg = window.NEBULA_FIREBASE_CONFIG?.firebaseConfig || {};
  return Boolean(cfg.apiKey && cfg.projectId && cfg.appId && !String(cfg.apiKey).includes('PASTE_') && !String(cfg.projectId).includes('YOUR_PROJECT_ID'));
};
