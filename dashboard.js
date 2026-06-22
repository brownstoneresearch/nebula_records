(() => {
  const SONGWHIP = 'https://songwhip.com/blocboykiddie';
  const previewSlots = [
    { key:'money', title:'Money', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav', fallback_audio_url:'assets/nebula-demo-loop.wav', cover:'assets/cover-money.svg' },
    { key:'wacko-jacko', title:'Wacko Jacko', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav', fallback_audio_url:'assets/nebula-demo-loop.wav', cover:'assets/cover-wacko-jacko.svg' },
    { key:'jmapelle-hushpuppi', title:'Jmapelle_Hushpuppi', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/jmapelle-hushpuppi.mp3', fallback_audio_url:'assets/jmapelle-hushpuppi.mp3', cover:'assets/cover-jmapelle-hushpuppi.svg' },
    { key:'no-seke', title:'No Seke', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav', fallback_audio_url:'assets/nebula-demo-loop.wav', cover:'assets/cover-no-seke.svg' },
    { key:'rich-and-sad', title:'Rich and Sad', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav', fallback_audio_url:'assets/nebula-demo-loop.wav', cover:'assets/cover-rich-and-sad.svg' },
    { key:'mi-casa-su-casa', title:'Mi Casa Su Casa', artist:'Blocboykiddie', type:'Single', status:'Published', link:SONGWHIP, audio_url:'assets/nebula-demo-loop.wav', fallback_audio_url:'assets/nebula-demo-loop.wav', cover:'assets/cover-mi-casa-su-casa.svg' }
  ];

  let client = null;
  let user = null;
  let profile = null;
  let savedTracks = [];
  let tracks = [];
  let events = [];
  let demos = [];
  let artists = [];
  let formsBound = false;

  const q = (id) => document.getElementById(id);
  const all = (sel) => [...document.querySelectorAll(sel)];
  const bucket = () => window.NEBULA_SUPABASE_CONFIG?.storageBucket || 'nebula-audio';
  const isAdmin = () => profile?.role === 'admin';
  const setStatus = (text, tone='info') => {
    const el = q('dashboardStatus');
    if (el) { el.textContent = text; el.dataset.tone = tone; }
  };

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function slugify(value) {
    return String(value || 'track').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'track';
  }

  function slotForTitle(title) {
    const key = normalize(title);
    return previewSlots.find(slot => normalize(slot.title) === key || normalize(slot.key) === key);
  }

  function slotForKey(key) {
    return previewSlots.find(slot => slot.key === key || normalize(slot.title) === normalize(key));
  }

  function dbRowForSlot(slot) {
    return savedTracks.find(row => {
      const rowKey = row.track_key || row.key || '';
      return rowKey === slot.key || normalize(row.title) === normalize(slot.title);
    });
  }

  function mergeTrackRows() {
    const matchedIds = new Set();
    const merged = previewSlots.map((slot, index) => {
      const row = dbRowForSlot(slot);
      if (row?.id) matchedIds.add(row.id);
      return {
        ...slot,
        ...(row || {}),
        key: slot.key,
        track_key: row?.track_key || slot.key,
        title: row?.title || slot.title,
        artist: row?.artist || slot.artist,
        type: row?.type || slot.type,
        status: row?.status || slot.status,
        link: row?.link || slot.link,
        audio_url: row?.audio_url || slot.audio_url,
        fallback_audio_url: slot.fallback_audio_url || slot.audio_url,
        cover: row?.cover_url || slot.cover,
        cover_url: row?.cover_url || slot.cover,
        _slotIndex: index,
        _preset: true,
        _saved: Boolean(row?.id)
      };
    });

    const extras = savedTracks
      .filter(row => !matchedIds.has(row.id) && !slotForTitle(row.title))
      .map(row => ({
        ...row,
        key: row.track_key || slugify(row.title),
        cover: row.cover_url || 'assets/cover-midnight-signal.svg',
        _slotIndex: -1,
        _preset: false,
        _saved: Boolean(row.id)
      }));

    tracks = [...merged, ...extras];
    return tracks;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function paintChart(id, numbers) {
    const canvas = q(id);
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    const rectWidth = canvas.offsetWidth || 420;
    const logicalHeight = Number(canvas.getAttribute('height') || 160);
    const w = canvas.width = rectWidth * dpr;
    const h = canvas.height = logicalHeight * dpr;
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(1, ...numbers);
    const pad = 18 * dpr;
    const gap = (w - pad * 2) / Math.max(1, numbers.length);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#60e7ff');
    grad.addColorStop(.55, '#3a77ff');
    grad.addColorStop(1, '#62d66b');
    ctx.lineWidth = 3 * dpr;
    ctx.strokeStyle = grad;
    ctx.beginPath();
    numbers.forEach((n, i) => {
      const x = pad + i * gap + gap / 2;
      const y = h - pad - (n / max) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = 'rgba(58,119,255,.08)';
    numbers.forEach((n, i) => {
      const x = pad + i * gap + gap / 2;
      const barH = (n / max) * (h - pad * 2);
      ctx.fillRect(x - 7 * dpr, h - pad - barH, 14 * dpr, barH);
    });
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
    q('dashboardSubtitle').textContent = role === 'admin' ? 'Manage roster slots, uploads, demo leads, analytics and release data from one clean panel.' : 'Upload snippets, replace previews and view your performance without seeing private label-only tools.';
    q('overviewTitle').textContent = role === 'admin' ? 'Label Overview' : 'Artist Overview';
    all('[data-admin-only]').forEach(el => { el.hidden = !isAdmin(); });
    if (!isAdmin()) {
      const artist = q('uploadArtist');
      if (artist) { artist.value = profile?.artist_name || 'Blocboykiddie'; artist.readOnly = true; }
      const pipelineTab = document.querySelector('[data-tab="pipeline"]');
      if (pipelineTab?.classList.contains('active')) document.querySelector('[data-tab="overview"]')?.click();
    }
  }

  function renderTables() {
    const merged = mergeTrackRows();
    const trackTable = q('trackTable');
    if (trackTable) {
      trackTable.innerHTML = merged.map((t, index) => {
        const hasSupabase = Boolean(t._saved && t.audio_url);
        const audioLabel = hasSupabase ? 'Uploaded preview' : (t.audio_url ? 'Local fallback' : 'No audio yet');
        const statusClass = hasSupabase ? 'good' : 'pending';
        return `
          <tr data-track-row="${index}">
            <td><img class="track-library-cover" src="${escapeAttr(t.cover || t.cover_url || 'assets/cover-midnight-signal.svg')}" alt="${escapeAttr(t.title)} cover"></td>
            <td><strong>${escapeHtml(t.title || 'Untitled')}</strong><small class="library-key">${escapeHtml(t.key || t.track_key || 'custom')}</small></td>
            <td>${escapeHtml(t.artist || '')}</td>
            <td><span class="library-badge">${escapeHtml(t.status || 'Draft')}</span></td>
            <td><span class="audio-state ${statusClass}">${audioLabel}</span></td>
            <td class="library-actions">
              <button class="mini-play library-preview-btn" type="button" data-preview-track="${index}">Preview</button>
              <button class="mini-play library-edit-btn" type="button" data-edit-track="${index}">${t._saved ? 'Edit / Re-upload' : 'Create / Upload'}</button>
            </td>
          </tr>`;
      }).join('');
    }

    const demoTable = q('demoTable');
    if (demoTable) {
      demoTable.innerHTML = demos.map(d => `<tr><td>${escapeHtml(d.name||'')}</td><td>${escapeHtml(d.email||'')}</td><td>${d.link ? `<a href="${escapeAttr(d.link)}" target="_blank" rel="noopener">Music ↗</a>` : '—'}</td><td>${escapeHtml(d.status||'new')}</td></tr>`).join('') || '<tr><td colspan="4">No demo leads yet.</td></tr>';
    }

    const artistPipeline = q('artistPipeline');
    if (artistPipeline) {
      const rows = artists.length ? artists : [{name:'Future Artist', genre:'Open', status:'reserved'}, {name:'Future Artist', genre:'Afrobeats / Hip-Hop', status:'reserved'}];
      artistPipeline.innerHTML = rows.map((a, i) => `<article class="pipeline-card"><span>Slot ${String(i+2).padStart(2,'0')}</span><h3>${escapeHtml(a.name||'Future Artist')}</h3><p>${escapeHtml(a.genre||'Open')}</p><small>${escapeHtml(a.status||'pipeline')}</small></article>`).join('');
    }

    if (q('dashUploads')) q('dashUploads').textContent = String(merged.length);
    if (q('dashPlays')) q('dashPlays').textContent = String(events.length || JSON.parse(localStorage.getItem('nebulaAnalyticsEvents') || '[]').length || 0);
    if (q('dashLeads')) q('dashLeads').textContent = String(demos.length);
    const values = [6, 10, 8, 13, 12, 18, Math.max(5, events.length || 9)];
    paintChart('overviewChart', values);
    paintChart('analyticsChart', values.slice().reverse());
  }

  async function fetchData() {
    if (!client || !user || !profile) return;
    setStatus('Syncing Supabase records…');
    try {
      let trackQuery = client.from('tracks').select('*').order('created_at', { ascending:false }).limit(100);
      if (!isAdmin()) trackQuery = trackQuery.eq('owner_id', user.id);
      const trackRes = await trackQuery;
      if (!trackRes.error) savedTracks = trackRes.data || [];
      else throw trackRes.error;

      let eventQuery = client.from('events').select('*').order('created_at', { ascending:false }).limit(250);
      if (!isAdmin()) eventQuery = eventQuery.eq('owner_id', user.id);
      const eventRes = await eventQuery;
      if (!eventRes.error) events = eventRes.data || [];

      if (isAdmin()) {
        const demoRes = await client.from('demo_leads').select('*').order('created_at', { ascending:false }).limit(100);
        if (!demoRes.error) demos = demoRes.data || [];
        const artistRes = await client.from('artists_pipeline').select('*').order('created_at', { ascending:false }).limit(100);
        if (!artistRes.error) artists = artistRes.data || [];
      }
      renderTables();
      setStatus('Dashboard synced with Supabase. The six preview slots are editable from the Track Library.', 'success');
    } catch (err) {
      setStatus(err.message || 'Could not sync Supabase data.', 'error');
      renderTables();
    }
  }

  function bindTabs() {
    all('.dash-tabs button').forEach(btn => btn.addEventListener('click', () => {
      if (btn.hasAttribute('data-admin-only') && !isAdmin()) return;
      all('.dash-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      all('.dash-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === btn.dataset.tab));
    }));
    all('[data-jump]').forEach(btn => btn.addEventListener('click', () => document.querySelector(`[data-tab="${btn.dataset.jump}"]`)?.click()));
  }

  function setUploadPreset(slot) {
    const form = q('uploadForm');
    if (!form || !slot) return;
    if (form.elements.title) form.elements.title.value = slot.title;
    if (form.elements.artist) form.elements.artist.value = slot.artist;
    if (form.elements.type) form.elements.type.value = slot.type || 'Single';
    if (form.elements.status) form.elements.status.value = slot.status || 'Published';
    if (form.elements.link) form.elements.link.value = slot.link || SONGWHIP;
    q('uploadAudio')?.focus();
  }

  async function uploadAudioFile(file, artistName) {
    if (!file || !file.size) return '';
    const safe = file.name.replace(/[^a-z0-9_.-]/gi, '-').toLowerCase();
    const artistFolder = slugify(artistName || profile?.artist_name || 'artist');
    const path = `${user.id}/previews/${artistFolder}/${Date.now()}-${safe}`;
    const up = await client.storage.from(bucket()).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'audio/mpeg'
    });
    if (up.error) throw up.error;
    const publicData = client.storage.from(bucket()).getPublicUrl(path);
    return publicData.data?.publicUrl || '';
  }

  async function insertTrack(payload) {
    const res = await client.from('tracks').insert(payload).select('*').single();
    if (res.error && /track_key|cover_url|column/i.test(res.error.message)) {
      const fallback = { ...payload };
      delete fallback.track_key;
      delete fallback.cover_url;
      return client.from('tracks').insert(fallback).select('*').single();
    }
    return res;
  }

  async function updateTrack(id, payload) {
    const res = await client.from('tracks').update(payload).eq('id', id).select('*').single();
    if (res.error && /track_key|cover_url|column/i.test(res.error.message)) {
      const fallback = { ...payload };
      delete fallback.track_key;
      delete fallback.cover_url;
      return client.from('tracks').update(fallback).eq('id', id).select('*').single();
    }
    return res;
  }

  async function saveTrackFromForm(form, existingTrack=null) {
    const fd = new FormData(form);
    const rawTitle = String(fd.get('title') || '').trim();
    const slot = slotForTitle(rawTitle) || slotForKey(String(fd.get('key') || ''));
    const key = slot?.key || String(fd.get('key') || slugify(rawTitle));
    const artistName = String(fd.get('artist') || slot?.artist || 'Blocboykiddie').trim();
    let audio_url = existingTrack?.audio_url || slot?.audio_url || '';
    const file = fd.get('audio');
    if (file && file.size) audio_url = await uploadAudioFile(file, artistName);

    const payload = {
      title: slot ? slot.title : rawTitle,
      artist: artistName,
      type: String(fd.get('type') || slot?.type || 'Snippet'),
      status: String(fd.get('status') || slot?.status || 'Draft'),
      link: String(fd.get('link') || slot?.link || SONGWHIP),
      audio_url,
      track_key: key,
      cover_url: slot?.cover || existingTrack?.cover_url || ''
    };

    if (existingTrack?.id) {
      return updateTrack(existingTrack.id, payload);
    }
    return insertTrack({ ...payload, owner_id: user.id });
  }

  function upsertSavedTrack(row) {
    if (!row?.id) return;
    const idx = savedTracks.findIndex(t => t.id === row.id);
    if (idx > -1) savedTracks[idx] = row;
    else savedTracks.unshift(row);
  }

  function openTrackEditor(index) {
    mergeTrackRows();
    const t = tracks[Number(index)];
    if (!t) return;
    const modal = q('trackEditModal');
    const form = q('trackEditForm');
    if (!modal || !form) return;
    q('editTrackTitleLabel').textContent = t._saved ? 'Edit preview song' : 'Create preview upload';
    q('editTrackCover').src = t.cover || t.cover_url || 'assets/cover-midnight-signal.svg';
    q('editTrackId').value = t.id || '';
    q('editTrackKey').value = t.key || t.track_key || slugify(t.title);
    q('editTrackIndex').value = String(index);
    q('editTitle').value = t.title || '';
    q('editArtist').value = t.artist || 'Blocboykiddie';
    q('editType').value = t.type || 'Single';
    q('editStatus').value = t.status || 'Published';
    q('editLink').value = t.link || SONGWHIP;
    q('editCurrentAudio').textContent = t.audio_url ? (t._saved ? 'Current Supabase preview is connected.' : 'Using local fallback until you upload MP3.') : 'No audio connected yet.';
    q('trackEditStatus').textContent = 'Choose a new MP3 only if you want to replace the current preview.';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    q('editAudio')?.focus();
  }

  function closeTrackEditor() {
    const modal = q('trackEditModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    q('trackEditForm')?.reset();
  }

  function friendlyErrorMessage(err) {
    const rawMessage = err?.message || 'Upload failed.';
    if (/row-level security|policy/i.test(rawMessage)) return 'Upload blocked by Supabase Row Level Security. Run the latest supabase-schema.sql or SUPABASE_RLS_UPLOAD_HOTFIX.sql in Supabase SQL Editor, then sign in again.';
    if (/bucket/i.test(rawMessage)) return 'Audio bucket not found. Create the public Supabase Storage bucket named nebula-audio, then try again.';
    return rawMessage;
  }

  function bindForms() {
    if (formsBound) return;
    formsBound = true;

    q('loadJmapellePreset')?.addEventListener('click', () => {
      setUploadPreset(previewSlots[2]);
      const status = q('uploadStatus');
      if (status) status.textContent = 'Jmapelle_Hushpuppi layout loaded. Choose jmapelle-hushpuppi.mp3, then save to Supabase.';
      setStatus('Jmapelle_Hushpuppi upload layout loaded.', 'success');
    });

    q('uploadForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.currentTarget;
      if (!form || typeof form.reset !== 'function') {
        setStatus('Upload form was not available. Please refresh and try again.', 'error');
        return;
      }
      const submitBtn = form.querySelector('[type="submit"]');
      const status = q('uploadStatus');
      if (status) status.textContent = 'Saving to Supabase…';
      if (submitBtn) submitBtn.disabled = true;
      try {
        const fd = new FormData(form);
        const slot = slotForTitle(fd.get('title'));
        const existing = slot ? dbRowForSlot(slot) : null;
        const res = await saveTrackFromForm(form, existing || null);
        if (res.error) throw res.error;
        upsertSavedTrack(res.data);
        form.reset();
        if (q('uploadArtist')) q('uploadArtist').value = profile?.artist_name || 'Blocboykiddie';
        renderTables();
        if (status) status.textContent = slot ? `${slot.title} preview saved. You can re-upload it again from the Track Library.` : 'Track saved successfully.';
        setStatus('Track saved to Supabase.', 'success');
      } catch (err) {
        const msg = friendlyErrorMessage(err);
        if (status) status.textContent = msg;
        setStatus(msg, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    q('trackTable')?.addEventListener('click', e => {
      const editBtn = e.target.closest('[data-edit-track]');
      const previewBtn = e.target.closest('[data-preview-track]');
      if (editBtn) {
        openTrackEditor(editBtn.dataset.editTrack);
        return;
      }
      if (previewBtn) {
        const index = Number(previewBtn.dataset.previewTrack || 0);
        if (window.NEBULA_PLAYER?.tracks && tracks[index]) {
          const playerTrack = window.NEBULA_PLAYER.tracks.findIndex(pt => normalize(pt.title) === normalize(tracks[index].title));
          window.NEBULA_PLAYER.loadTrack(playerTrack > -1 ? playerTrack : index, true);
        } else if (tracks[index]?.audio_url || tracks[index]?.fallback_audio_url) {
          const t = tracks[index];
          let previewAudio = new Audio(t.audio_url || t.fallback_audio_url);
          previewAudio.addEventListener('error', () => {
            if (t.fallback_audio_url && previewAudio.src !== new URL(t.fallback_audio_url, window.location.href).href) {
              previewAudio = new Audio(t.fallback_audio_url);
              previewAudio.play().catch(() => setStatus('Preview unavailable. Re-upload the MP3 or use the public player.', 'error'));
            } else {
              setStatus('Preview unavailable. Re-upload the MP3 or open the Songwhip hub.', 'error');
            }
          });
          previewAudio.play().catch(() => setStatus('Tap again or use the public player to preview.', 'error'));
        }
      }
    });

    q('closeTrackEditor')?.addEventListener('click', closeTrackEditor);
    q('trackEditModal')?.addEventListener('click', e => { if (e.target === q('trackEditModal')) closeTrackEditor(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && q('trackEditModal') && !q('trackEditModal').hidden) closeTrackEditor(); });

    q('trackEditForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.currentTarget;
      const submitBtn = form.querySelector('[type="submit"]');
      const status = q('trackEditStatus');
      if (submitBtn) submitBtn.disabled = true;
      if (status) status.textContent = 'Updating preview slot…';
      try {
        mergeTrackRows();
        const index = Number(q('editTrackIndex').value || 0);
        const existing = tracks[index]?._saved ? tracks[index] : null;
        const res = await saveTrackFromForm(form, existing || null);
        if (res.error) throw res.error;
        upsertSavedTrack(res.data);
        renderTables();
        if (status) status.textContent = 'Preview slot updated successfully.';
        setStatus('Track Library preview slot updated.', 'success');
        setTimeout(closeTrackEditor, 650);
      } catch (err) {
        const msg = friendlyErrorMessage(err);
        if (status) status.textContent = msg;
        setStatus(msg, 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    q('artistForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      if (!isAdmin()) return;
      const form = e.currentTarget;
      if (!form || typeof form.reset !== 'function') { setStatus('Artist form was not available. Please refresh and try again.', 'error'); return; }
      const fd = new FormData(form);
      const payload = { owner_id:user.id, name:String(fd.get('name')||'Future Artist'), genre:String(fd.get('genre')||'Open'), status:'pipeline' };
      const res = await client.from('artists_pipeline').insert(payload).select('*').single();
      if (!res.error) { artists.unshift(res.data); form.reset(); renderTables(); setStatus('Future artist slot added.', 'success'); }
      else setStatus(res.error.message, 'error');
    });

    q('simulateEvent')?.addEventListener('click', async () => {
      const payload = { owner_id:user.id, event_type:'play', track:'Jmapelle_Hushpuppi', artist:profile?.artist_name || 'Blocboykiddie' };
      const res = await client.from('events').insert(payload).select('*').single();
      if (!res.error) { events.unshift(res.data); renderTables(); setStatus('Play event saved.', 'success'); }
      else setStatus(res.error.message, 'error');
    });

    q('refreshDashboard')?.addEventListener('click', fetchData);
    q('exportDashboard')?.addEventListener('click', () => {
      const report = { exported_at:new Date().toISOString(), role:profile?.role, user:user?.email, tracks, events, demos, artists };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type:'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'nebula-records-supabase-dashboard-report.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    q('logoutBtn')?.addEventListener('click', async () => { await client.auth.signOut(); localStorage.removeItem('nebulaProfile'); window.location.href = 'login.html'; });
  }

  async function init() {
    client = window.createNebulaSupabaseClient ? window.createNebulaSupabaseClient() : null;
    if (!client) { setStatus('Supabase is not configured. Add your Project URL and anon key in supabase-config.js.', 'error'); renderTables(); return; }
    const { data:{ session }, error } = await client.auth.getSession();
    if (error) { setStatus(error.message, 'error'); return; }
    if (!session?.user) { window.location.href = 'login.html'; return; }
    user = session.user;
    try {
      profile = await ensureProfile();
      localStorage.setItem('nebulaProfile', JSON.stringify(profile));
      renderAccess();
      bindTabs();
      bindForms();
      await fetchData();
    } catch (err) {
      setStatus(err.message || 'Could not load profile.', 'error');
      renderTables();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
