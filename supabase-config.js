/*
  Nebula Records Supabase configuration
  --------------------------------------------------
  1. Create a Supabase project.
  2. Go to Project Settings > API.
  3. Paste your Project URL and anon public key below.
  4. Run supabase-schema.sql in the Supabase SQL editor.
  5. Create Auth users for the label admin and signed artists.

  Do NOT put private service-role keys or real passwords in frontend files.
*/
window.NEBULA_SUPABASE_CONFIG = {
  url: "https://tuvqmpemblcwebjtmibd.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dnFtcGVtYmxjd2VianRtaWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDQyMTAsImV4cCI6MjA5NzcyMDIxMH0.QF8x-WKSNEvuclJCpHXM3aXxG7seYY1opCSgubNthew",
  storageBucket: "nebula-audio",
  adminEmail: "nebulamusic_rh@outlook.com"
};

window.isNebulaSupabaseConfigured = function(){
  const cfg = window.NEBULA_SUPABASE_CONFIG || {};
  return Boolean(cfg.url && cfg.anonKey && !cfg.url.includes('YOUR_PROJECT_ID') && !cfg.anonKey.includes('YOUR_SUPABASE_ANON_KEY'));
};

window.createNebulaSupabaseClient = function(){
  if (!window.supabase || !window.isNebulaSupabaseConfigured()) return null;
  const { url, anonKey } = window.NEBULA_SUPABASE_CONFIG;
  return window.supabase.createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
};
