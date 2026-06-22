(() => {
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMessage');
  const button = document.getElementById('loginButton');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const setMessage = (text, tone='info') => { if(msg){ msg.textContent = text; msg.dataset.tone = tone; } };

  const client = window.createNebulaSupabaseClient ? window.createNebulaSupabaseClient() : null;
  if (!client) {
    setMessage('Supabase is not configured yet. Add your Project URL and anon key in supabase-config.js, then reload.', 'warn');
    if (button) button.disabled = true;
    if (emailInput) emailInput.disabled = true;
    if (passwordInput) passwordInput.disabled = true;
    return;
  }

  async function getOrCreateProfile(user) {
    const adminEmail = (window.NEBULA_SUPABASE_CONFIG.adminEmail || '').toLowerCase();
    let { data: profile, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!profile) {
      const payload = {
        id: user.id,
        email: user.email,
        role: user.email && user.email.toLowerCase() === adminEmail ? 'admin' : 'artist',
        artist_name: user.user_metadata?.artist_name || user.email?.split('@')[0] || 'Nebula Artist',
        status: 'active'
      };
      const inserted = await client.from('profiles').upsert(payload).select('*').single();
      if (inserted.error) throw inserted.error;
      profile = inserted.data;
    }
    localStorage.setItem('nebulaProfile', JSON.stringify(profile));
    return profile;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    setMessage('Opening secure portal…', 'info');
    button.disabled = true;
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await getOrCreateProfile(data.user);
      setMessage('Access granted. Redirecting…', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 550);
    } catch (err) {
      setMessage(err.message || 'Login failed. Confirm the account exists in Supabase Auth.', 'error');
      button.disabled = false;
    }
  });
})();
