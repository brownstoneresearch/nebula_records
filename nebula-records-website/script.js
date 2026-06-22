
const SONGWHIP_URL = 'https://songwhip.com/blocboykiddie';
const tracks = [
  {title:'Money', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-money.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'Wacko Jacko', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-wacko-jacko.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'Lean Gone Cold', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-lean-gone-cold.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'No Seke', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-no-seke.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'Rich and Sad', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-rich-and-sad.svg', type:'Preview snippet', link: SONGWHIP_URL},
  {title:'Mi Casa Su Casa', artist:'Blocboykiddie', src:'assets/nebula-demo-loop.wav', cover:'assets/cover-mi-casa-su-casa.svg', type:'Preview snippet', link: SONGWHIP_URL}
];

let currentTrack = 0;
let audio = new Audio(tracks[currentTrack].src);
audio.loop = true;
let playerMounted = false;

function formatTime(seconds){
  if(!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds/60);
  const s = Math.floor(seconds%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function renderPlayer(){
  const mount = document.getElementById('nebulaPlayer');
  if(!mount) return;
  const t = tracks[currentTrack];
  mount.innerHTML = `
    <div class="player is-closed" role="region" aria-label="Nebula music player">
      <button class="player-close" id="closePlayer" type="button" aria-label="Close music player">×</button>
      <img id="playerCover" src="${t.cover}" alt="Current release cover" />
      <div class="player-meta">
        <span class="player-label">Blocboykiddie Snippet</span>
        <h4 id="playerTitle">${t.title}</h4>
        <p id="playerArtist">${t.artist} · ${t.type}</p>
      </div>
      <div class="player-controls">
        <button id="prevTrack" type="button" aria-label="Previous track">‹</button>
        <button id="playPause" type="button" aria-label="Play or pause">▶</button>
        <button id="nextTrack" type="button" aria-label="Next track">›</button>
      </div>
      <a class="player-link" id="playerLink" href="${t.link}" target="_blank" rel="noopener">Full song ↗</a>
      <div class="progress-wrap">
        <span id="currentTime">0:00</span>
        <input class="progress" id="progress" type="range" value="0" min="0" max="100" aria-label="Track progress" />
        <span id="duration">0:00</span>
      </div>
    </div>`;
  document.getElementById('playPause').addEventListener('click', togglePlay);
  document.getElementById('nextTrack').addEventListener('click', nextTrack);
  document.getElementById('prevTrack').addEventListener('click', prevTrack);
  document.getElementById('closePlayer').addEventListener('click', closePlayer);
  document.getElementById('progress').addEventListener('input', e => {
    if(audio.duration) audio.currentTime = e.target.value / 100 * audio.duration;
  });
  playerMounted = true;
}

function getPlayer(){ return document.querySelector('.player'); }
function isPlayerClosed(){ const p=getPlayer(); return !p || p.classList.contains('is-closed'); }
function openPlayer(){
  const p = getPlayer();
  if(p){
    p.classList.remove('is-closed');
    document.body.classList.add('has-player');
  }
}
function closePlayer(){
  audio.pause();
  syncPlayer();
  const p = getPlayer();
  if(p) p.classList.add('is-closed');
  document.body.classList.remove('has-player');
}

function syncPlayer(){
  const t = tracks[currentTrack];
  const cover = document.getElementById('playerCover');
  const title = document.getElementById('playerTitle');
  const artist = document.getElementById('playerArtist');
  const btn = document.getElementById('playPause');
  const link = document.getElementById('playerLink');
  if(cover) cover.src = t.cover;
  if(title) title.textContent = t.title;
  if(artist) artist.textContent = `${t.artist} · ${t.type}`;
  if(link) link.href = t.link;
  if(btn) btn.textContent = audio.paused ? '▶' : 'Ⅱ';
}

function bindAudioEvents(){
  audio.addEventListener('timeupdate', () => {
    const progress = document.getElementById('progress');
    const current = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    if(progress && audio.duration) progress.value = audio.currentTime / audio.duration * 100;
    if(current) current.textContent = formatTime(audio.currentTime);
    if(duration) duration.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('play', syncPlayer);
  audio.addEventListener('pause', syncPlayer);
  audio.addEventListener('ended', nextTrack);
}

function loadTrack(index, autoplay=false){
  currentTrack = (index + tracks.length) % tracks.length;
  const wasPlaying = !audio.paused;
  audio.pause();
  audio = new Audio(tracks[currentTrack].src);
  audio.loop = true;
  bindAudioEvents();
  syncPlayer();
  openPlayer();
  if(autoplay || wasPlaying){
    audio.play().catch(() => {
      const artist = document.getElementById('playerArtist');
      if(artist) artist.textContent = `${tracks[currentTrack].artist} · Tap play to preview`;
    });
  }
}

function togglePlay(){
  openPlayer();
  if(audio.paused) audio.play().catch(()=>{});
  else audio.pause();
  syncPlayer();
}
function nextTrack(){ loadTrack(currentTrack + 1, true); }
function prevTrack(){ loadTrack(currentTrack - 1, true); }

function setupNavigation(){
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(link => {
    if(link.dataset.nav === page) link.classList.add('active');
  });
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }
}

function setupScrollEffects(){
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if(header) header.classList.toggle('scrolled', window.scrollY > 30);
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = Number(el.dataset.parallax || .12);
      el.style.transform = `translate3d(0,${window.scrollY * speed}px,0)`;
    });
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('in-view'); });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function setupTrackButtons(){
  document.querySelectorAll('.play-track').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      loadTrack(Number(btn.dataset.track || 0), true);
    });
  });
}

function setupMagneticButtons(){
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * .08}px,${y * .12}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

function setupContactForm(){
  const form = document.getElementById('demoForm');
  const note = document.getElementById('formNote');
  if(!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if(note){
      note.textContent = 'Demo received in preview mode. Connect this form to your preferred backend before launch.';
      note.style.color = '#061126';
      note.style.fontWeight = '800';
    }
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPlayer();
  bindAudioEvents();
  setupNavigation();
  setupScrollEffects();
  setupTrackButtons();
  setupMagneticButtons();
  setupContactForm();
  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();
});

document.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName || '';
  const typing = ['INPUT','TEXTAREA','SELECT','BUTTON'].includes(tag);
  if(e.key === 'Escape' && !isPlayerClosed()) closePlayer();
  if(e.code === 'Space' && !typing && !isPlayerClosed()){
    e.preventDefault();
    togglePlay();
  }
});
