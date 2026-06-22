const ADMIN_EMAIL = (window.NEBULA_ADMIN_EMAIL || 'nebulamusic_rh@outlook.com').toLowerCase();
const COLLECTIONS = (window.NEBULA_FIREBASE_CONFIG && window.NEBULA_FIREBASE_CONFIG.collections) || {tracks:'nebulaTracks',artists:'nebulaArtists',events:'nebulaAnalyticsEvents',leads:'nebulaDemoLeads'};
const SONGWHIP = 'https://songwhip.com/blocboykiddie';
let db, storage, auth, currentUser;
let trackRows = [];
let artistRows = [];
let eventRows = [];
let leadRows = [];

const defaultTracks = [
  {title:'Money', artist:'Blocboykiddie', type:'Single', link:SONGWHIP},
  {title:'Wacko Jacko', artist:'Blocboykiddie', type:'Single', link:SONGWHIP},
  {title:'Lean Gone Cold', artist:'Blocboykiddie', type:'Single', link:SONGWHIP},
  {title:'No Seke', artist:'Blocboykiddie', type:'Single', link:SONGWHIP},
  {title:'Rich and Sad', artist:'Blocboykiddie', type:'Single', link:SONGWHIP},
  {title:'Mi Casa Su Casa', artist:'Blocboykiddie', type:'Single', link:SONGWHIP}
];
const defaultArtists = [
  {name:'Blocboykiddie', genre:'Hip-Hop / Afro-fusion / Melodic Trap', status:'Active roster'},
  {name:'Future Artist Slot 02', genre:'Open', status:'Reserved'},
  {name:'Future Artist Slot 03', genre:'Open', status:'Reserved'},
  {name:'Future Artist Slot 04', genre:'Open', status:'Reserved'}
];

function $(id){return document.getElementById(id)}
function setStatus(text, tone='info'){
  const el = $('dashboardStatus');
  if(el){el.textContent=text; el.dataset.tone=tone;}
  const side = $('adminStatus');
  if(side && tone !== 'upload') side.textContent = text;
}
function firebaseConfigured(){ return typeof firebase !== 'undefined' && typeof window.isNebulaFirebaseConfigured === 'function' && window.isNebulaFirebaseConfigured(); }
function safeText(value){return String(value ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
function collection(name){ return db.collection(COLLECTIONS[name] || name); }
function normalizeDoc(doc){ return {id:doc.id, ...doc.data()}; }

function switchTab(tab){
  document.querySelectorAll('.dash-tabs button').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  document.querySelectorAll('.dash-panel').forEach(p=>p.classList.toggle('active', p.dataset.panel===tab));
}
function renderStats(){
  const plays = eventRows.length || JSON.parse(localStorage.getItem('nebulaAnalyticsEvents')||'[]').length || 0;
  if($('dashPlays')) $('dashPlays').textContent = plays.toLocaleString();
  if($('dashUploads')) $('dashUploads').textContent = trackRows.length.toLocaleString();
  if($('dashLeads')) $('dashLeads').textContent = (leadRows.length || JSON.parse(localStorage.getItem('nebulaDemoLeads')||'[]').length || 0).toLocaleString();
}
function renderTracks(){
  const tbody = $('trackTable'); if(!tbody) return;
  const rows = trackRows.length ? trackRows : defaultTracks;
  tbody.innerHTML = rows.map(t => `<tr><td>${safeText(t.title)}</td><td>${safeText(t.artist)}</td><td>${safeText(t.type)}</td><td><a href="${safeText(t.audioUrl || t.link || SONGWHIP)}" target="_blank" rel="noopener">Open ↗</a></td></tr>`).join('');
}
function renderArtists(){
  const mount = $('artistPipeline'); if(!mount) return;
  const rows = artistRows.length ? artistRows : defaultArtists;
  mount.innerHTML = rows.map(a => `<article class="pipeline-card"><span>${safeText(a.status || 'pipeline')}</span><h3>${safeText(a.name)}</h3><p>${safeText(a.genre || 'Open genre')}</p></article>`).join('');
}
function drawBars(canvasId, values){
  const c = $(canvasId); if(!c || !c.getContext) return;
  const ctx = c.getContext('2d'); const w = c.width = c.clientWidth * devicePixelRatio; const h = c.height = Number(c.getAttribute('height')||170) * devicePixelRatio;
  ctx.clearRect(0,0,w,h);
  const max = Math.max(1, ...values);
  const gap = 14 * devicePixelRatio; const bw = (w - gap*(values.length+1)) / values.length;
  values.forEach((v,i)=>{
    const x = gap + i*(bw+gap); const bh = (v/max)*(h*.72) + 8*devicePixelRatio; const y = h-bh-12*devicePixelRatio;
    const grad = ctx.createLinearGradient(0,y,0,h); grad.addColorStop(0,'#62d66b'); grad.addColorStop(.55,'#60e7ff'); grad.addColorStop(1,'#3a77ff');
    ctx.fillStyle = grad; ctx.beginPath();
    const r = 12*devicePixelRatio; ctx.moveTo(x+r,y); ctx.lineTo(x+bw-r,y); ctx.quadraticCurveTo(x+bw,y,x+bw,y+r); ctx.lineTo(x+bw,h-10*devicePixelRatio); ctx.lineTo(x,h-10*devicePixelRatio); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.fill();
  });
}
function drawCharts(){
  const byDay = [2,4,3,6,5,8,Math.max(1,eventRows.length || 3)];
  drawBars('overviewChart', [trackRows.length || 6, artistRows.length || 4, eventRows.length || 5, leadRows.length || 2, 7]);
  drawBars('analyticsChart', byDay);
}
function subscribeFirestore(){
  collection('tracks').orderBy('createdAt','desc').onSnapshot(snap=>{trackRows=snap.docs.map(normalizeDoc); renderTracks(); renderStats(); drawCharts();}, err=>setStatus('Track database error: '+err.message, 'error'));
  collection('artists').orderBy('createdAt','desc').onSnapshot(snap=>{artistRows=snap.docs.map(normalizeDoc); renderArtists(); renderStats(); drawCharts();}, err=>setStatus('Artist database error: '+err.message, 'error'));
  collection('events').orderBy('createdAt','desc').limit(500).onSnapshot(snap=>{eventRows=snap.docs.map(normalizeDoc); renderStats(); drawCharts();}, err=>setStatus('Analytics database error: '+err.message, 'error'));
  collection('leads').orderBy('createdAt','desc').limit(250).onSnapshot(snap=>{leadRows=snap.docs.map(normalizeDoc); renderStats();}, ()=>renderStats());
}
async function addTrack(e){
  e.preventDefault();
  const form = e.currentTarget; const fd = new FormData(form); const file = form.audio?.files?.[0];
  const uploadStatus = $('uploadStatus');
  try{
    if(uploadStatus) uploadStatus.textContent = 'Saving track to Firebase…';
    let audioUrl = '', fileName = '';
    if(file){
      fileName = file.name;
      const clean = file.name.replace(/[^a-z0-9_.-]+/gi,'-').toLowerCase();
      const ref = storage.ref(`nebula-tracks/${currentUser.uid}/${Date.now()}-${clean}`);
      const snap = await ref.put(file, {contentType:file.type || 'audio/mpeg', customMetadata:{artist:String(fd.get('artist')||'Blocboykiddie')}});
      audioUrl = await snap.ref.getDownloadURL();
    }
    await collection('tracks').add({
      title:String(fd.get('title')||'Untitled'), artist:String(fd.get('artist')||'Blocboykiddie'), type:String(fd.get('type')||'Single'),
      link:String(fd.get('link')||SONGWHIP), audioUrl, fileName, ownerEmail:currentUser.email, createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    form.reset(); form.artist.value = 'Blocboykiddie'; form.link.value = SONGWHIP;
    if(uploadStatus) uploadStatus.textContent = 'Saved to Firebase successfully.';
    setStatus('Dashboard synced with Firebase.', 'success');
  }catch(err){
    if(uploadStatus) uploadStatus.textContent = err.message || 'Upload failed.';
    setStatus('Upload failed: '+(err.message || err), 'error');
  }
}
async function addArtist(e){
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  try{
    await collection('artists').add({name:String(fd.get('name')||'Future Artist'), genre:String(fd.get('genre')||'Open'), status:'pipeline', ownerEmail:currentUser.email, createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    e.currentTarget.reset(); setStatus('Future artist slot added to Firebase.', 'success');
  }catch(err){ setStatus('Could not add artist: '+err.message, 'error'); }
}
async function simulateEvent(){
  try{
    await collection('events').add({type:'play', track:'Money', artist:'Blocboykiddie', ownerEmail:currentUser.email, createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    setStatus('Analytics event saved to Firebase.', 'success');
  }catch(err){ setStatus('Analytics event failed: '+err.message, 'error'); }
}
async function resetAnalytics(){
  setStatus('Reset removes local demo events only. Delete Firestore analytics docs from Firebase Console if needed.', 'info');
  localStorage.setItem('nebulaAnalyticsEvents','[]');
  renderStats(); drawCharts();
}
function exportReport(){
  const payload = {generated:new Date().toISOString(), adminEmail:ADMIN_EMAIL, tracks:trackRows, artists:artistRows, events:eventRows, leads:leadRows};
  const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nebula-records-firebase-dashboard-report.json'; a.click(); URL.revokeObjectURL(a.href);
}
function bindUI(){
  document.querySelectorAll('.dash-tabs button').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));
  document.querySelectorAll('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.jump)));
  $('uploadForm')?.addEventListener('submit', addTrack);
  $('artistForm')?.addEventListener('submit', addArtist);
  $('simulateEvent')?.addEventListener('click', simulateEvent);
  $('resetAnalytics')?.addEventListener('click', resetAnalytics);
  $('exportDashboard')?.addEventListener('click', exportReport);
  $('logoutBtn')?.addEventListener('click', async()=>{ await auth.signOut(); window.location.href='login.html'; });
  renderTracks(); renderArtists(); renderStats(); drawCharts();
}
function boot(){
  if(!firebaseConfigured()){
    setStatus('Firebase is not configured. Paste your web config into firebase-config.js, then login again.', 'error');
    setTimeout(()=>{ window.location.href='login.html'; }, 1500);
    return;
  }
  if(!firebase.apps.length) firebase.initializeApp(window.NEBULA_FIREBASE_CONFIG.firebaseConfig);
  auth = firebase.auth(); db = firebase.firestore(); storage = firebase.storage();
  auth.onAuthStateChanged(async user => {
    if(!user){ window.location.href='login.html?next=dashboard.html'; return; }
    if(String(user.email || '').toLowerCase() !== ADMIN_EMAIL){ await auth.signOut(); window.location.href='login.html?error=unauthorized'; return; }
    currentUser = user;
    if($('adminEmail')) $('adminEmail').textContent = user.email;
    if($('adminIdentity')) $('adminIdentity').textContent = user.email;
    setStatus('Authenticated and connected to Firebase.', 'success');
    bindUI(); subscribeFirestore();
  });
}
document.addEventListener('DOMContentLoaded', boot);
