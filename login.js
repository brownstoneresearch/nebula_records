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

  async function ensureProfile(user) {
    const rpc = await client.rpc('ensure_profile');
    if (!rpc.error && rpc.data) {
      localStorage.setItem('nebulaProfile', JSON.stringify(rpc.data));
      return rpc.data;
    }

    const { data: profile, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (profile) {
      localStorage.setItem('nebulaProfile', JSON.stringify(profile));
      return profile;
    }

    throw new Error('Profile not found. Run supabase-schema.sql before logging into the portal.');
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
      await ensureProfile(data.user);
      setMessage('Access granted. Redirecting…', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 450);
    } catch (err) {
      setMessage(err.message || 'Login failed. Confirm the account exists in Supabase Auth.', 'error');
      button.disabled = false;
    }
  });
})();
