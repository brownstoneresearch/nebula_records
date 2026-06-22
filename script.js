const SONGWHIP_URL = 'https://songwhip.com/blocboykiddie';
const tracks = [
  {title:'Money', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-money.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'Wacko Jacko', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-wacko-jacko.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'Jmapelle_hushpuppi', artist:'Blocboykiddie', src:'assets/jmapelle_hushpuppi.mp3', cover:'assets/cover-jmapelle-hushpuppi.svg', type:'Official preview', link: SONGWHIP_URL},
  {title:'No Seke', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-no-seke.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'Rich and Sad', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-rich-and-sad.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'Mi Casa Su Casa', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-mi-casa-su-casa.svg', type:'Preview snippet', link: SONGWHIP_URL}
];
let currentTrack = 0;
let audio = new Audio(tracks[currentTrack].src);
audio.preload = 'metadata';
audio.loop = false;

function formatTime(seconds){ if(!Number.isFinite(seconds)) return '0:00'; const m=Math.floor(seconds/60); const s=String(Math.floor(seconds%60)).padStart(2,'0'); return `${m}:${s}`; }
function getPlayer(){return document.querySelector('.player')}
function isPlayerClosed(){const p=getPlayer();return !p||p.classList.contains('is-closed')}
function openPlayer(){const p=getPlayer();if(p){p.classList.remove('is-closed');document.body.classList.add('has-player')}}
function closePlayer(){audio.pause();syncPlayer();const p=getPlayer();if(p)p.classList.add('is-closed');document.body.classList.remove('has-player')}
function renderPlayer(){ const mount=document.getElementById('nebulaPlayer'); if(!mount) return; const t=tracks[currentTrack]; mount.innerHTML=`<div class="player is-closed" role="region" aria-label="Nebula popup music player"><button class="player-close" id="closePlayer" type="button" aria-label="Close music player">×</button><img id="playerCover" src="${t.cover}" alt="Current release cover"><div class="player-meta"><span class="player-label">Blocboykiddie Snippet</span><h4 id="playerTitle">${t.title}</h4><p id="playerArtist">${t.artist} · ${t.type}</p><p id="playerStatus" class="player-status" aria-live="polite"></p></div><div class="player-controls"><button id="prevTrack" type="button" aria-label="Previous track">‹</button><button id="playPause" type="button" aria-label="Play or pause">▶</button><button id="nextTrack" type="button" aria-label="Next track">›</button></div><a class="player-link" id="playerLink" href="${t.link}" target="_blank" rel="noopener">Full song ↗</a><div class="progress-wrap"><span id="currentTime">0:00</span><input class="progress" id="progress" type="range" value="0" min="0" max="100" aria-label="Track progress"><span id="duration">0:00</span></div></div>`; document.getElementById('playPause')?.addEventListener('click',togglePlay); document.getElementById('nextTrack')?.addEventListener('click',nextTrack); document.getElementById('prevTrack')?.addEventListener('click',prevTrack); document.getElementById('closePlayer')?.addEventListener('click',closePlayer); document.getElementById('progress')?.addEventListener('input',e=>{ if(audio.duration) audio.currentTime=e.target.value/100*audio.duration; }); }
function syncPlayer(){ const t=tracks[currentTrack]; const q=id=>document.getElementById(id); if(q('playerCover')) q('playerCover').src=t.cover; if(q('playerTitle')) q('playerTitle').textContent=t.title; if(q('playerArtist')) q('playerArtist').textContent=`${t.artist} · ${t.type}`; if(q('playerLink')) q('playerLink').href=t.link; if(q('playPause')) q('playPause').textContent=audio.paused?'▶':'Ⅱ'; if(q('duration')) q('duration').textContent=formatTime(audio.duration); }
function bindAudioEvents(){ audio.addEventListener('timeupdate',()=>{ const progress=document.getElementById('progress'), current=document.getElementById('currentTime'), duration=document.getElementById('duration'); if(progress&&audio.duration) progress.value=audio.currentTime/audio.duration*100; if(current) current.textContent=formatTime(audio.currentTime); if(duration) duration.textContent=formatTime(audio.duration); }); audio.addEventListener('play',()=>{syncPlayer();recordAnalytics('play')}); audio.addEventListener('pause',syncPlayer); audio.addEventListener('ended',nextTrack); audio.addEventListener('error',()=>{const s=document.getElementById('playerStatus'); if(s) s.textContent='Preview file unavailable. Open the full Songwhip hub.';}); audio.addEventListener('loadedmetadata',syncPlayer); }
function loadTrack(index, autoplay=false){ currentTrack=(index+tracks.length)%tracks.length; const wasPlaying=!audio.paused; audio.pause(); audio = new Audio(tracks[currentTrack].src); audio.preload='metadata'; audio.loop=false; bindAudioEvents(); syncPlayer(); openPlayer(); if(autoplay||wasPlaying) audio.play().catch(()=>{const s=document.getElementById('playerStatus'); if(s) s.textContent='Tap play to start preview.';}); }
function togglePlay(){ openPlayer(); if(audio.paused) audio.play().catch(()=>{const s=document.getElementById('playerStatus'); if(s) s.textContent='Tap play to start preview.';}); else audio.pause(); syncPlayer(); }
function nextTrack(){loadTrack(currentTrack+1,true)}
function prevTrack(){loadTrack(currentTrack-1,true)}
function recordAnalytics(type){ try{ const key='nebulaAnalyticsEvents'; const arr=JSON.parse(localStorage.getItem(key)||'[]'); arr.push({type,track:tracks[currentTrack].title,artist:tracks[currentTrack].artist,date:new Date().toISOString()}); localStorage.setItem(key,JSON.stringify(arr.slice(-500))); }catch(e){} }
function setupNavigation(){ const page=document.body.dataset.page; document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===page)a.classList.add('active')}); const toggle=document.getElementById('navToggle'), nav=document.getElementById('mainNav'); if(toggle&&nav){toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(nav.classList.contains('open')))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}))} }
function setupScrollEffects(){ const header=document.getElementById('siteHeader'); const cursor=document.getElementById('cursorGlow'); window.addEventListener('mousemove',e=>{if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'}}); const onScroll=()=>{ if(header) header.classList.toggle('scrolled',window.scrollY>30); document.querySelectorAll('[data-parallax]').forEach(el=>{const speed=Number(el.dataset.parallax||.12); el.style.transform=`translate3d(0,${window.scrollY*speed}px,0)`});}; window.addEventListener('scroll',onScroll,{passive:true}); onScroll(); const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('in-view')})},{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>observer.observe(el)); }
function setupIntro(){ const intro=document.getElementById('introScreen'); if(!intro) return; const hide=()=>{intro.classList.add('hide'); sessionStorage.setItem('nebulaIntroSeen','1')}; document.getElementById('skipIntro')?.addEventListener('click',hide); if(sessionStorage.getItem('nebulaIntroSeen')){intro.classList.add('hide');return;} setTimeout(hide,3800); }

function normalizeTrackTitle(value){return String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
async function hydrateTracksFromSupabase(){
  try{
    const cfg = window.NEBULA_SUPABASE_CONFIG;
    if(!cfg || !cfg.url || !cfg.anonKey || String(cfg.url).includes('YOUR_') || !window.supabase) return;
    const sb = window.supabase.createClient(cfg.url, cfg.anonKey);
    const {data, error} = await sb.from('tracks')
      .select('title,artist,type,status,link,audio_url')
      .eq('status','Published')
      .ilike('title','Jmapelle%')
      .order('created_at',{ascending:false})
      .limit(3);
    if(error || !data || !data.length) return;
    data.forEach(row=>{
      if(!row.audio_url) return;
      const idx = tracks.findIndex(t => normalizeTrackTitle(t.title) === normalizeTrackTitle(row.title));
      if(idx > -1){
        tracks[idx].src = row.audio_url;
        tracks[idx].artist = row.artist || tracks[idx].artist;
        tracks[idx].type = row.type ? `${row.type} preview` : tracks[idx].type;
        tracks[idx].link = row.link || tracks[idx].link;
        if(idx === currentTrack){ audio.src = tracks[idx].src; syncPlayer(); }
      }
    });
  }catch(err){ console.warn('Supabase preview hydration skipped:', err?.message || err); }
}

function setupTrackButtons(){ document.querySelectorAll('.play-track').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();loadTrack(Number(btn.dataset.track||0),true)})); }
function setupMagneticButtons(){ document.querySelectorAll('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(); const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.08}px,${y*.12}px)`});el.addEventListener('mouseleave',()=>{el.style.transform=''})}); }
function setupContactForm(){ const form=document.getElementById('demoForm'), note=document.getElementById('formNote'); if(!form)return; form.addEventListener('submit',async e=>{e.preventDefault(); const payload=Object.fromEntries(new FormData(form).entries()); try{const leads=JSON.parse(localStorage.getItem('nebulaDemoLeads')||'[]'); leads.push({...payload,created_at:new Date().toISOString()}); localStorage.setItem('nebulaDemoLeads',JSON.stringify(leads));}catch(err){} let saved=false; try{ if(window.createNebulaSupabaseClient&&window.isNebulaSupabaseConfigured&&window.isNebulaSupabaseConfigured()){ const client=window.createNebulaSupabaseClient(); const res=await client.from('demo_leads').insert({name:payload.name||'',email:payload.email||'',link:payload.link||'',message:payload.message||'',status:'new'}); if(res.error) throw res.error; saved=true; }}catch(err){ console.warn('Supabase demo save failed:',err.message); } if(note){note.textContent=saved?'Demo submitted to Nebula Records. Thank you.':'Demo saved in site preview mode. Connect Supabase before public launch.';note.style.fontWeight='900'} form.reset();}); }
document.addEventListener('DOMContentLoaded',()=>{ renderPlayer(); bindAudioEvents(); setupNavigation(); setupScrollEffects(); setupIntro(); setupTrackButtons(); setupMagneticButtons(); setupContactForm(); hydrateTracksFromSupabase(); const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear(); });
document.addEventListener('keydown',e=>{ const tag=document.activeElement?.tagName||''; const typing=['INPUT','TEXTAREA','SELECT','BUTTON'].includes(tag); if(e.key==='Escape'&&!isPlayerClosed()) closePlayer(); if(e.code==='Space'&&!typing&&!isPlayerClosed()){e.preventDefault();togglePlay()} });
