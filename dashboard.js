(() => {
  const SONGWHIP = 'https://songwhip.com/blocboykiddie';
  const sampleTracks = [
    { title:'Money', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav' },
    { title:'Wacko Jacko', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav' },
    { title:'Jmapelle_hushpuppi', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/jmapelle_hushpuppi.mp3' },
    { title:'No Seke', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav' },
    { title:'Rich and Sad', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav' },
    { title:'Mi Casa Su Casa', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav' }
  ];
  let client = null, user = null, profile = null, tracks = [], events = [], demos = [], artists = [];
  const q = (id) => document.getElementById(id);
  const all = (sel) => [...document.querySelectorAll(sel)];
  const setStatus = (text, tone='info') => { const el=q('dashboardStatus'); if(el){ el.textContent=text; el.dataset.tone=tone; } };
  const isAdmin = () => profile?.role === 'admin';
  const bucket = () => window.NEBULA_SUPABASE_CONFIG?.storageBucket || 'nebula-audio';

  function paintChart(id, numbers) {
    const canvas = q(id); if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    const rectWidth = canvas.offsetWidth || 420;
    const logicalHeight = Number(canvas.getAttribute('height') || 160);
    const w = canvas.width = rectWidth * dpr;
    const h = canvas.height = logicalHeight * dpr;
    ctx.clearRect(0,0,w,h);
    const max = Math.max(1, ...numbers);
    const pad = 18 * dpr;
    const gap = (w - pad*2) / Math.max(1, numbers.length);
    const grad = ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,'#60e7ff'); grad.addColorStop(.55,'#3a77ff'); grad.addColorStop(1,'#62d66b');
    ctx.lineWidth = 3 * dpr; ctx.strokeStyle = grad; ctx.beginPath();
    numbers.forEach((n,i)=>{ const x = pad + i*gap + gap/2; const y = h - pad - (n/max)*(h-pad*2); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke();
    ctx.fillStyle = 'rgba(58,119,255,.08)'; numbers.forEach((n,i)=>{ const x=pad+i*gap+gap/2; const barH=(n/max)*(h-pad*2); ctx.fillRect(x-7*dpr, h-pad-barH, 14*dpr, barH); });
  }

  async function ensureProfile() {
    const rpc = await client.rpc('ensure_profile');
    if (!rpc.error && rpc.data) return rpc.data;
    const res = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (res.error && res.error.code !== 'PGRST116') throw res.error;
    if (res.data) return res.data;
    throw new Error('Profile missing. Run supabase-schema.sql, then create admin/artist users in Supabase Auth.');
  }

  function renderAccess() {
    const role = profile?.role || 'artist';
    q('roleLabel').textContent = role === 'admin' ? 'Label Admin' : 'Signed Artist';
    q('workspaceName').textContent = profile?.artist_name || (role === 'admin' ? 'Nebula Records HQ' : 'Artist Workspace');
    q('workspaceEmail').textContent = user?.email || '';
    q('dashRole').textContent = role.toUpperCase();
    q('dashboardKicker').textContent = role === 'admin' ? 'Admin Command Centre' : 'Signed Artist Portal';
    q('dashboardTitle').textContent = role === 'admin' ? 'Label operations, beautifully organized.' : 'Your artist workspace.';
    q('dashboardSubtitle').textContent = role === 'admin' ? 'Manage roster slots, uploads, demo leads, analytics and release data from one clean panel.' : 'Upload snippets, track your releases and view your performance without seeing private label-only tools.';
    q('overviewTitle').textContent = role === 'admin' ? 'Label Overview' : 'Artist Overview';
    all('[data-admin-only]').forEach(el => { el.hidden = !isAdmin(); });
    if (!isAdmin()) {
      const artist = q('uploadArtist'); if (artist) { artist.value = profile?.artist_name || 'Blocboykiddie'; artist.readOnly = true; }
      const pipelineTab = document.querySelector('[data-tab="pipeline"]'); if (pipelineTab?.classList.contains('active')) document.querySelector('[data-tab="overview"]')?.click();
    }
  }

  function renderTables() {
    const trackTable = q('trackTable');
    if (trackTable) {
      const rows = (tracks.length ? tracks : sampleTracks).map(t => `<tr><td><strong>${escapeHtml(t.title||'Untitled')}</strong></td><td>${escapeHtml(t.artist||'')}</td><td>${escapeHtml(t.type||'')}</td><td>${escapeHtml(t.status||'Draft')}</td><td>${t.link ? `<a href="${escapeAttr(t.link)}" target="_blank" rel="noopener">Open ↗</a>` : '—'}</td></tr>`).join('');
      trackTable.innerHTML = rows;
    }
    const demoTable = q('demoTable');
    if (demoTable) {
      demoTable.innerHTML = demos.map(d => `<tr><td>${escapeHtml(d.name||'')}</td><td>${escapeHtml(d.email||'')}</td><td>${d.link ? `<a href="${escapeAttr(d.link)}" target="_blank" rel="noopener">Music ↗</a>` : '—'}</td><td>${escapeHtml(d.status||'new')}</td></tr>`).join('') || '<tr><td colspan="4">No demo leads yet.</td></tr>';
    }
    const artistPipeline = q('artistPipeline');
    if (artistPipeline) {
      const rows = artists.length ? artists : [{name:'Future Artist', genre:'Open', status:'reserved'}, {name:'Future Artist', genre:'Afrobeats / Hip-Hop', status:'reserved'}];
      artistPipeline.innerHTML = rows.map((a,i) => `<article class="pipeline-card"><span>Slot ${String(i+2).padStart(2,'0')}</span><h3>${escapeHtml(a.name||'Future Artist')}</h3><p>${escapeHtml(a.genre||'Open')}</p><small>${escapeHtml(a.status||'pipeline')}</small></article>`).join('');
    }
    if (q('dashUploads')) q('dashUploads').textContent = String((tracks.length ? tracks : sampleTracks).length);
    if (q('dashPlays')) q('dashPlays').textContent = String(events.length || JSON.parse(localStorage.getItem('nebulaAnalyticsEvents')||'[]').length || 0);
    if (q('dashLeads')) q('dashLeads').textContent = String(demos.length);
    const values = [6,10,8,13,12,18,Math.max(5, events.length || 9)];
    paintChart('overviewChart', values); paintChart('analyticsChart', values.slice().reverse());
  }

  async function fetchData() {
    if (!client || !user || !profile) return;
    setStatus('Syncing Supabase records…');
    try {
      let trackQuery = client.from('tracks').select('*').order('created_at', { ascending:false }).limit(100);
      if (!isAdmin()) trackQuery = trackQuery.eq('owner_id', user.id);
      const trackRes = await trackQuery; if (!trackRes.error) tracks = trackRes.data || [];

      let eventQuery = client.from('events').select('*').order('created_at', { ascending:false }).limit(250);
      if (!isAdmin()) eventQuery = eventQuery.eq('owner_id', user.id);
      const eventRes = await eventQuery; if (!eventRes.error) events = eventRes.data || [];

      if (isAdmin()) {
        const demoRes = await client.from('demo_leads').select('*').order('created_at', { ascending:false }).limit(100); if (!demoRes.error) demos = demoRes.data || [];
        const artistRes = await client.from('artists_pipeline').select('*').order('created_at', { ascending:false }).limit(100); if (!artistRes.error) artists = artistRes.data || [];
      }
      renderTables(); setStatus('Dashboard synced with Supabase.', 'success');
    } catch (err) { setStatus(err.message || 'Could not sync Supabase data.', 'error'); renderTables(); }
  }

  function bindTabs() {
    all('.dash-tabs button').forEach(btn => btn.addEventListener('click', () => {
      if (btn.hasAttribute('data-admin-only') && !isAdmin()) return;
      all('.dash-tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      all('.dash-panel').forEach(p=>p.classList.toggle('active', p.dataset.panel === btn.dataset.tab));
    }));
    all('[data-jump]').forEach(btn => btn.addEventListener('click', () => document.querySelector(`[data-tab="${btn.dataset.jump}"]`)?.click()));
  }

  async function bindForms() {
    q('uploadForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.currentTarget;
      if (!form || typeof form.reset !== 'function') {
        setStatus('Upload form was not available. Please refresh and try again.', 'error');
        return;
      }
      const submitBtn = form.querySelector('[type="submit"]');
      const status=q('uploadStatus');
      if(status) status.textContent = 'Saving to Supabase…';
      if (submitBtn) submitBtn.disabled = true;
      try {
        const fd = new FormData(form); let audio_url = '';
        const file = fd.get('audio');
        if (file && file.size) {
          const safe = file.name.replace(/[^a-z0-9_.-]/gi,'-').toLowerCase();
          const path = `previews/${(profile?.artist_name || 'artist').replace(/[^a-z0-9_-]/gi,'-').toLowerCase()}/${Date.now()}-${safe}`;
          const up = await client.storage.from(bucket()).upload(path, file, { cacheControl:'3600', upsert:false, contentType:file.type || 'audio/mpeg' });
          if (up.error) throw up.error;
          const publicData = client.storage.from(bucket()).getPublicUrl(path);
          audio_url = publicData.data?.publicUrl || '';
        }
        const payload = { owner_id:user.id, title:String(fd.get('title')||''), artist:String(fd.get('artist')||''), type:String(fd.get('type')||'Snippet'), status:String(fd.get('status')||'Draft'), link:String(fd.get('link')||SONGWHIP), audio_url };
        const res = await client.from('tracks').insert(payload).select('*').single(); if (res.error) throw res.error;
        tracks.unshift(res.data);
        form.reset();
        if(q('uploadArtist')) q('uploadArtist').value = profile?.artist_name || 'Blocboykiddie';
        renderTables();
        if(status) status.textContent='Saved successfully.';
        setStatus('Track saved to Supabase.', 'success');
      } catch (err) {
        if(status) status.textContent = err.message || 'Upload failed.';
        setStatus(err.message || 'Upload failed.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    q('artistForm')?.addEventListener('submit', async e => {
      e.preventDefault(); if(!isAdmin()) return;
      const form = e.currentTarget;
      if (!form || typeof form.reset !== 'function') { setStatus('Artist form was not available. Please refresh and try again.', 'error'); return; }
      const fd = new FormData(form);
      const payload = { owner_id:user.id, name:String(fd.get('name')||'Future Artist'), genre:String(fd.get('genre')||'Open'), status:'pipeline' };
      const res = await client.from('artists_pipeline').insert(payload).select('*').single();
      if (!res.error) { artists.unshift(res.data); form.reset(); renderTables(); setStatus('Future artist slot added.', 'success'); }
      else setStatus(res.error.message, 'error');
    });

    q('simulateEvent')?.addEventListener('click', async () => {
      const payload = { owner_id:user.id, event_type:'play', track:'Jmapelle_hushpuppi', artist:profile?.artist_name || 'Blocboykiddie' };
      const res = await client.from('events').insert(payload).select('*').single();
      if (!res.error) { events.unshift(res.data); renderTables(); setStatus('Play event saved.', 'success'); }
      else setStatus(res.error.message, 'error');
    });
    q('refreshDashboard')?.addEventListener('click', fetchData);
    q('exportDashboard')?.addEventListener('click', () => {
      const report = { exported_at:new Date().toISOString(), role:profile?.role, user:user?.email, tracks, events, demos, artists };
      const blob = new Blob([JSON.stringify(report,null,2)], { type:'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nebula-records-supabase-dashboard-report.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    q('logoutBtn')?.addEventListener('click', async () => { await client.auth.signOut(); localStorage.removeItem('nebulaProfile'); window.location.href='login.html'; });
  }

  async function init() {
    client = window.createNebulaSupabaseClient ? window.createNebulaSupabaseClient() : null;
    if (!client) { setStatus('Supabase is not configured. Add your Project URL and anon key in supabase-config.js.', 'error'); renderTables(); return; }
    const { data:{ session }, error } = await client.auth.getSession();
    if (error) { setStatus(error.message, 'error'); return; }
    if (!session?.user) { window.location.href = 'login.html'; return; }
    user = session.user;
    try { profile = await ensureProfile(); localStorage.setItem('nebulaProfile', JSON.stringify(profile)); renderAccess(); bindTabs(); await bindForms(); await fetchData(); }
    catch (err) { setStatus(err.message || 'Could not load profile.', 'error'); renderTables(); }
  }
  function escapeHtml(value){ return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
  function escapeAttr(value){ return escapeHtml(value).replace(/`/g, '&#096;'); }
  document.addEventListener('DOMContentLoaded', init);
})();
