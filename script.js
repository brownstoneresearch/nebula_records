const SONGWHIP_URL = 'https://songwhip.com/blocboykiddie';
const HOME_SHELF_COUNT = 6;
const DEFAULT_SHELF_PAGE_SIZE = 12;
const MAX_EXPLICIT_PREVIEW_SLOT = 12;
const shelfPages = {};
let tracks = [];
let currentTrack = 0;
let audio = createAudioForTrack(null);

function esc(value){return String(value ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function attr(value){return esc(value).replace(/`/g,'&#096;');}
function normalizeTrackTitle(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function formatTime(seconds){ if(!Number.isFinite(seconds)) return '0:00'; const m=Math.floor(seconds/60); const s=String(Math.floor(seconds%60)).padStart(2,'0'); return `${m}:${s}`; }
function cleanAudioUrl(value){ const url=String(value||'').trim(); if(!url || url==='null' || url==='undefined') return ''; if(url.includes('File stream access denied')) return ''; return url; }
function publicTrack(row){
  return {
    id: row.id || '',
    title: row.title || 'Untitled Preview',
    artist: row.artist || 'Nebula Artist',
    src: cleanAudioUrl(row.audio_url || row.src),
    cover: row.cover_url || row.cover || 'assets/cover-midnight-signal.svg',
    type: row.is_full_song === true || row.is_full_song === 'true' ? 'Full song preview' : (row.type ? `${row.type} preview` : 'Catalogue preview'),
    link: row.link || SONGWHIP_URL,
    slot: Number(row.preview_slot || row.slot || 0),
    created_at: row.created_at || ''
  };
}
function createAudioForTrack(track){
  const nextAudio = new Audio(track?.src || '');
  nextAudio.preload = 'metadata';
  nextAudio.loop = false;
  return nextAudio;
}
function setPlayerStatus(message){ const s=document.getElementById('playerStatus'); if(s) s.textContent=message || ''; }
function clearPlayerStatus(){ setPlayerStatus(''); }
function getPlayer(){return document.querySelector('.player')}
function isPlayerClosed(){const p=getPlayer();return !p||p.classList.contains('is-closed')}
function openPlayer(){const p=getPlayer();if(p){p.classList.remove('is-closed');document.body.classList.add('has-player')}}
function closePlayer(){try{audio.pause();}catch(e){} syncPlayer();const p=getPlayer();if(p)p.classList.add('is-closed');document.body.classList.remove('has-player')}
function emptyPlayerTrack(){return {title:'No preview selected',artist:'Nebula Records',type:'Catalogue Preview Shelf',cover:'assets/logo-nebula-transparent.png',link:'catalogue.html',src:''};}
function activeTrack(){return tracks[currentTrack] || emptyPlayerTrack();}
function renderPlayer(){
  const mount=document.getElementById('nebulaPlayer'); if(!mount) return;
  const t=activeTrack();
  mount.innerHTML=`<div class="player is-closed" role="region" aria-label="Nebula popup music player"><button class="player-close" id="closePlayer" type="button" aria-label="Close music player">×</button><img id="playerCover" src="${attr(t.cover)}" alt="Current release cover"><div class="player-meta"><span class="player-label">Catalogue Preview Shelf</span><h4 id="playerTitle">${esc(t.title)}</h4><p id="playerArtist">${esc(t.artist)} · ${esc(t.type)}</p><p id="playerStatus" class="player-status" aria-live="polite"></p></div><div class="player-controls"><button id="prevTrack" type="button" aria-label="Previous track">‹</button><button id="playPause" type="button" aria-label="Play or pause">▶</button><button id="nextTrack" type="button" aria-label="Next track">›</button></div><a class="player-link" id="playerLink" href="${attr(t.link)}" target="_blank" rel="noopener">Full hub ↗</a><div class="progress-wrap"><span id="currentTime">0:00</span><input class="progress" id="progress" type="range" value="0" min="0" max="100" aria-label="Track progress"><span id="duration">0:00</span></div></div>`;
  document.getElementById('playPause')?.addEventListener('click',togglePlay);
  document.getElementById('nextTrack')?.addEventListener('click',nextTrack);
  document.getElementById('prevTrack')?.addEventListener('click',prevTrack);
  document.getElementById('closePlayer')?.addEventListener('click',closePlayer);
  document.getElementById('progress')?.addEventListener('input',e=>{ if(audio.duration) audio.currentTime=e.target.value/100*audio.duration; });
}
function syncPlayer(){
  const t=activeTrack(); const q=id=>document.getElementById(id);
  if(q('playerCover')) q('playerCover').src=t.cover;
  if(q('playerTitle')) q('playerTitle').textContent=t.title;
  if(q('playerArtist')) q('playerArtist').textContent=`${t.artist} · ${t.type}`;
  if(q('playerLink')) q('playerLink').href=t.link || 'catalogue.html';
  if(q('playPause')) q('playPause').textContent=audio.paused?'▶':'Ⅱ';
  if(q('duration')) q('duration').textContent=formatTime(audio.duration);
}
function bindAudioEvents(){
  audio.addEventListener('timeupdate',()=>{
    const progress=document.getElementById('progress'), current=document.getElementById('currentTime'), duration=document.getElementById('duration');
    if(progress&&audio.duration) progress.value=audio.currentTime/audio.duration*100;
    if(current) current.textContent=formatTime(audio.currentTime);
    if(duration) duration.textContent=formatTime(audio.duration);
  });
  audio.addEventListener('play',()=>{ clearPlayerStatus(); syncPlayer(); recordAnalytics('play') });
  audio.addEventListener('pause',syncPlayer);
  audio.addEventListener('ended',nextTrack);
  audio.addEventListener('loadedmetadata',()=>{ clearPlayerStatus(); syncPlayer(); });
  audio.addEventListener('error',()=>setPlayerStatus(`${activeTrack().title || 'Preview'} file unavailable. Re-upload the MP3 from the portal or open the full hub.`));
}
function loadTrack(index, autoplay=false){
  if(!tracks.length){ renderPlayer(); openPlayer(); setPlayerStatus('No song has been selected for the Catalogue Preview Shelf yet. Select one from the admin or artist portal.'); return; }
  currentTrack=(Number(index)+tracks.length)%tracks.length;
  const wasPlaying=!audio.paused;
  try{ audio.pause(); }catch(e){}
  audio = createAudioForTrack(tracks[currentTrack]);
  bindAudioEvents(); syncPlayer(); openPlayer();
  if(autoplay||wasPlaying) audio.play().catch(()=>setPlayerStatus('Tap play to start preview.'));
}
function togglePlay(){
  if(!tracks.length){ openPlayer(); setPlayerStatus('No public preview is selected yet.'); return; }
  openPlayer(); if(audio.paused) audio.play().catch(()=>setPlayerStatus('Tap play to start preview.')); else audio.pause(); syncPlayer();
}
function nextTrack(){ if(tracks.length) loadTrack(currentTrack+1,true); else setPlayerStatus('No preview selected yet.'); }
function prevTrack(){ if(tracks.length) loadTrack(currentTrack-1,true); else setPlayerStatus('No preview selected yet.'); }
function recordAnalytics(type){ try{ if(!tracks.length) return; const key='nebulaAnalyticsEvents'; const arr=JSON.parse(localStorage.getItem(key)||'[]'); arr.push({type,track:activeTrack().title,artist:activeTrack().artist,date:new Date().toISOString()}); localStorage.setItem(key,JSON.stringify(arr.slice(-500))); }catch(e){} }
function slotPlaceholder(slot){
  return `<article class="snippet-card release-card preview-slot-card is-empty" data-preview-slot="${slot}"><div class="preview-empty-orb" aria-hidden="true"><span>${String(slot).padStart(2,'0')}</span></div><div class="snippet-copy"><span class="snippet-tag">Catalogue Slot ${String(slot).padStart(2,'0')}</span><h3>Awaiting selection</h3><p>This spot fills only when an admin or signed artist selects an uploaded song for public preview.</p><div class="snippet-actions"><span class="preview-empty-note">Empty slot</span></div></div></article>`;
}
function slotCard(track,index,slot){
  return `<article class="snippet-card release-card preview-slot-card is-filled" data-preview-slot="${slot}"><img src="${attr(track.cover)}" alt="${attr(track.title)} cover artwork"><div class="snippet-copy"><span class="snippet-tag">Catalogue Slot ${String(slot).padStart(2,'0')}</span><h3>${esc(track.title)}</h3><p>${esc(track.artist)} · ${esc(track.type)}</p><div class="snippet-bars"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="snippet-actions"><button class="mini-play play-shelf-track" data-track-index="${index}" type="button">Play Preview</button><a href="${attr(track.link)}" target="_blank" rel="noopener">Full hub ↗</a></div></div></article>`;
}
function shelfKey(shelf, fallbackIndex=0){
  if(!shelf.dataset.previewShelf) shelf.dataset.previewShelf = `shelf-${fallbackIndex}`;
  return shelf.dataset.previewShelf;
}
function shelfPageSize(shelf){
  const explicit=Number(shelf.dataset.previewLimit||0);
  if(explicit>0) return explicit;
  return document.body.dataset.page === 'home' ? HOME_SHELF_COUNT : DEFAULT_SHELF_PAGE_SIZE;
}
function shelfUsesPagination(shelf){ return shelf.dataset.previewPagination === 'true'; }
function buildShelfSlots(pageSize){
  const explicit = new Map();
  const flexible = [];
  tracks.forEach((track,index)=>{
    const slot=Number(track.slot||0);
    if(slot>=1 && slot<=MAX_EXPLICIT_PREVIEW_SLOT && !explicit.has(slot)) explicit.set(slot,{track,index,slot});
    else flexible.push({track,index,slot:0});
  });
  const highestExplicit = explicit.size ? Math.max(...explicit.keys()) : 0;
  const needed = Math.max(pageSize, highestExplicit, tracks.length);
  const totalSlots = Math.max(pageSize, Math.ceil(needed/pageSize)*pageSize);
  const slots = Array.from({length: totalSlots}, (_,i)=>({slot:i+1,item:null}));
  explicit.forEach((item,slot)=>{ if(slots[slot-1]) slots[slot-1].item=item; });
  flexible.forEach(item=>{
    const empty = slots.find(cell=>!cell.item);
    if(empty) { item.slot=empty.slot; empty.item=item; }
    else { slots.push({slot:slots.length+1,item:{...item,slot:slots.length+1}}); }
  });
  return slots;
}
function renderShelfPagination(shelf,key,currentPage,totalPages,totalTracks){
  if(!shelfUsesPagination(shelf)) return;
  let nav = shelf.nextElementSibling;
  if(!nav || !nav.classList?.contains('shelf-pagination')){
    nav=document.createElement('div'); nav.className='shelf-pagination'; shelf.insertAdjacentElement('afterend',nav);
  }
  if(totalPages<=1){
    nav.innerHTML = `<span class="shelf-count">${totalTracks || 0} public preview${totalTracks===1?'':'s'} selected</span>`;
    return;
  }
  const buttons = Array.from({length:totalPages},(_,i)=>`<button type="button" class="${i+1===currentPage?'active':''}" data-shelf-page="${i+1}" data-shelf-key="${attr(key)}">${i+1}</button>`).join('');
  nav.innerHTML = `<span class="shelf-count">${totalTracks} selected previews · Page ${currentPage} of ${totalPages}</span><div class="shelf-pages">${buttons}</div>`;
  nav.querySelectorAll('[data-shelf-page]').forEach(btn=>btn.addEventListener('click',()=>{ shelfPages[key]=Number(btn.dataset.shelfPage||1); renderPreviewShelf(); }));
}
function renderPreviewShelf(){
  const shelves=document.querySelectorAll('[data-preview-shelf]');
  if(!shelves.length) return;
  shelves.forEach((shelf,idx)=>{
    const key=shelfKey(shelf,idx);
    const pageSize=shelfPageSize(shelf);
    const slots=buildShelfSlots(pageSize);
    const totalPages=Math.max(1,Math.ceil(slots.length/pageSize));
    const currentPage=Math.min(Math.max(1,Number(shelfPages[key]||Number(shelf.dataset.previewPage||1)||1)),totalPages);
    shelfPages[key]=currentPage;
    const start=(currentPage-1)*pageSize;
    const pageSlots=slots.slice(start,start+pageSize);
    shelf.innerHTML=pageSlots.map(cell=> cell.item ? slotCard(cell.item.track,cell.item.index,cell.slot) : slotPlaceholder(cell.slot)).join('');
    renderShelfPagination(shelf,key,currentPage,totalPages,tracks.length);
  });
  setupShelfButtons();
}

function setupShelfButtons(){ document.querySelectorAll('.play-shelf-track').forEach(btn=>{ if(btn.dataset.bound) return; btn.dataset.bound='1'; btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();loadTrack(Number(btn.dataset.trackIndex||0),true)}); }); }
function setupTrackButtons(){
  document.querySelectorAll('.play-track').forEach(btn=>{ if(btn.dataset.bound) return; btn.dataset.bound='1'; btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const i=Number(btn.dataset.track||btn.dataset.trackIndex||0);loadTrack(Number.isFinite(i)?i:0,true)}); });
  document.querySelectorAll('.play-first-preview').forEach(btn=>{ if(btn.dataset.bound) return; btn.dataset.bound='1'; btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();loadTrack(0,true)}); });
}
function setupNavigation(){ const page=document.body.dataset.page; document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===page)a.classList.add('active')}); const toggle=document.getElementById('navToggle'), nav=document.getElementById('mainNav'); if(toggle&&nav){toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(nav.classList.contains('open')))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}))} }
function setupScrollEffects(){ const header=document.getElementById('siteHeader'); const cursor=document.getElementById('cursorGlow'); window.addEventListener('mousemove',e=>{if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'}}); const onScroll=()=>{ if(header) header.classList.toggle('scrolled',window.scrollY>30); document.querySelectorAll('[data-parallax]').forEach(el=>{const speed=Number(el.dataset.parallax||.12); el.style.transform=`translate3d(0,${window.scrollY*speed}px,0)`});}; window.addEventListener('scroll',onScroll,{passive:true}); onScroll(); const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('in-view')})},{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>observer.observe(el)); }
function setupIntro(){ const intro=document.getElementById('introScreen'); if(!intro) return; const hide=()=>{intro.classList.add('hide'); sessionStorage.setItem('nebulaIntroSeen','1')}; document.getElementById('skipIntro')?.addEventListener('click',hide); if(sessionStorage.getItem('nebulaIntroSeen')){intro.classList.add('hide');return;} setTimeout(hide,3800); }
async function hydrateTracksFromSupabase(){
  renderPreviewShelf();
  try{
    const cfg = window.NEBULA_SUPABASE_CONFIG;
    if(!cfg || !cfg.url || !cfg.anonKey || String(cfg.url).includes('YOUR_') || !window.supabase) { registerPlayerApi(); return; }
    const sb = window.supabase.createClient(cfg.url, cfg.anonKey);
    let {data, error} = await sb.from('tracks')
      .select('id,title,artist,type,status,link,audio_url,track_key,cover_url,preview_enabled,preview_slot,is_full_song,created_at')
      .eq('preview_enabled', true)
      .ilike('status','published')
      .not('audio_url','is',null)
      .order('preview_slot',{ascending:true, nullsFirst:false})
      .order('created_at',{ascending:false})
      .limit(72);
    if(error && /preview_enabled|preview_slot|is_full_song|column/i.test(error.message || '')){
      console.warn('Run the latest Supabase shelf schema to enable dynamic public preview cards:', error.message);
      registerPlayerApi(); return;
    }
    if(error) throw error;
    const selected=[];
    const usedSlots=new Set();
    (data || []).forEach(row=>{
      const t=publicTrack(row);
      if(!t.src) return;
      const explicit=Number(t.slot||0);
      if(explicit>=1 && explicit<=MAX_EXPLICIT_PREVIEW_SLOT && !usedSlots.has(explicit)) { t.slot=explicit; usedSlots.add(explicit); }
      else t.slot=0;
      selected.push(t);
    });
    tracks = selected.sort((a,b)=>{
      const sa=a.slot||9999, sb=b.slot||9999;
      if(sa!==sb) return sa-sb;
      return String(b.created_at||'').localeCompare(String(a.created_at||''));
    });
    currentTrack = 0;
    audio = createAudioForTrack(tracks[0]); bindAudioEvents(); syncPlayer(); renderPreviewShelf(); registerPlayerApi();
  }catch(err){ console.warn('Supabase preview shelf hydration skipped:', err?.message || err); registerPlayerApi(); }
}
function registerPlayerApi(){ window.NEBULA_PLAYER = { tracks, loadTrack, closePlayer, openPlayer, refresh: hydrateTracksFromSupabase, renderPreviewShelf }; }
function setupMagneticButtons(){ document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(); const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.08}px,${y*.12}px)`});el.addEventListener('mouseleave',()=>{el.style.transform=''})}); }
function setupContactForm(){ const form=document.getElementById('demoForm'), note=document.getElementById('formNote'); if(!form)return; form.addEventListener('submit',async e=>{e.preventDefault(); const payload=Object.fromEntries(new FormData(form).entries()); try{const leads=JSON.parse(localStorage.getItem('nebulaDemoLeads')||'[]'); leads.push({...payload,created_at:new Date().toISOString()}); localStorage.setItem('nebulaDemoLeads',JSON.stringify(leads));}catch(err){} let saved=false; try{ if(window.createNebulaSupabaseClient&&window.isNebulaSupabaseConfigured&&window.isNebulaSupabaseConfigured()){ const client=window.createNebulaSupabaseClient(); const res=await client.from('demo_leads').insert({name:payload.name||'',email:payload.email||'',link:payload.link||'',message:payload.message||'',status:'new'}); if(res.error) throw res.error; saved=true; }}catch(err){ console.warn('Supabase demo save failed:',err.message); } if(note){note.textContent=saved?'Demo submitted to Nebula Records. Thank you.':'Demo saved in site preview mode. Connect Supabase before public launch.';note.style.fontWeight='900'} form.reset();}); }
function renderSignedArtistCardV7(a){
  const image = a.image_url || 'assets/artist-blocboykiddie.svg'; const name = a.stage_name || a.artist_name || 'Nebula Artist'; const genre = a.genre || 'Next-generation artist'; const bio = a.bio || a.headline || 'Signed to Nebula Records with a catalogue profile, release shelf and artist workspace.'; const hub = a.songwhip_url || a.catalogue_url || 'contact.html';
  return `<article class="signed-artist-card first-signed-card"><img src="${attr(image)}" alt="${attr(name)} artist artwork" /><div class="signed-artist-copy"><span class="snippet-tag">${a.featured ? 'Featured Signed Artist' : 'Signed Artist'}</span><h3>${esc(name)}</h3><p>${esc(genre)}</p><small>${esc(bio)}</small><div class="signed-artist-actions"><a href="${attr(hub)}" target="_blank" rel="noopener">Open artist hub ↗</a><button class="mini-play play-first-preview" type="button">Latest preview</button></div></div></article>`;
}
async function hydrateSignedArtistCatalogueV7(){
  const grids = document.querySelectorAll('[data-signed-artist-grid]'); if(!grids.length) return;
  try{ const cfg=window.NEBULA_SUPABASE_CONFIG; if(!cfg || !cfg.url || !cfg.anonKey || String(cfg.url).includes('YOUR_') || !window.supabase) return; const sb=window.supabase.createClient(cfg.url,cfg.anonKey); const {data,error}=await sb.from('signed_artists').select('*').eq('status','signed').order('signed_order',{ascending:true}); if(error || !data || !data.length) return; const future=`<article class="signed-artist-card future-signed-card"><span>Future Slot</span><h3>Next Nebula Star</h3><p>Reserved for the next official signing.</p><a href="contact.html">Submit demo →</a></article>`; grids.forEach(grid=>{ grid.innerHTML=data.map(renderSignedArtistCardV7).join('')+future; }); setupTrackButtons(); }catch(err){ console.warn('Signed artist catalogue hydration skipped:', err?.message || err); }
}
document.addEventListener('DOMContentLoaded',()=>{ renderPlayer(); bindAudioEvents(); registerPlayerApi(); setupNavigation(); setupScrollEffects(); setupIntro(); setupTrackButtons(); setupMagneticButtons(); setupContactForm(); renderPreviewShelf(); hydrateTracksFromSupabase(); hydrateSignedArtistCatalogueV7(); const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear(); });
document.addEventListener('keydown',e=>{ const tag=document.activeElement?.tagName||''; const typing=['INPUT','TEXTAREA','SELECT','BUTTON'].includes(tag); if(e.key==='Escape'&&!isPlayerClosed()) closePlayer(); if(e.code==='Space'&&!typing&&!isPlayerClosed()){e.preventDefault();togglePlay()} });
