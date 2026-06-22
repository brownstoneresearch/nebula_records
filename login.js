(function(){
  const ADMIN_EMAIL = (window.NEBULA_ADMIN_EMAIL || 'nebulamusic_rh@outlook.com').toLowerCase();
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMessage');
  const resetBtn = document.getElementById('resetPassword');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  function setMessage(text, tone='info'){
    if(!msg) return;
    msg.textContent = text;
    msg.dataset.tone = tone;
  }
  function firebaseReady(){
    return typeof firebase !== 'undefined' && typeof window.isNebulaFirebaseConfigured === 'function' && window.isNebulaFirebaseConfigured();
  }
  if(!firebaseReady()){
    setMessage('Firebase is not configured yet. Paste your Firebase web config into firebase-config.js, then reload this page.', 'warn');
    if(form) form.querySelectorAll('button,input').forEach(el => { if(el.id !== 'loginEmail') el.disabled = true; });
    return;
  }
  if(!firebase.apps.length) firebase.initializeApp(window.NEBULA_FIREBASE_CONFIG.firebaseConfig);
  const auth = firebase.auth();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
  auth.onAuthStateChanged(async user => {
    if(user && String(user.email || '').toLowerCase() === ADMIN_EMAIL){
      window.location.href = 'dashboard.html';
    } else if(user){
      await auth.signOut();
      setMessage('This account is not authorized for the Nebula dashboard. Use nebulamusic_rh@outlook.com.', 'error');
    }
  });
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    if(email !== ADMIN_EMAIL){
      setMessage('Access denied. Dashboard admin email must be nebulamusic_rh@outlook.com.', 'error');
      return;
    }
    setMessage('Checking Firebase account…', 'info');
    try{
      await auth.signInWithEmailAndPassword(email, password);
      setMessage('Login successful. Opening dashboard…', 'success');
      window.location.href = 'dashboard.html';
    }catch(err){
      setMessage(err.message || 'Login failed. Check Firebase Auth and password.', 'error');
    }
  });
  resetBtn?.addEventListener('click', async () => {
    const email = (emailInput.value || ADMIN_EMAIL).trim().toLowerCase();
    if(email !== ADMIN_EMAIL){ setMessage('Password reset can only be sent to nebulamusic_rh@outlook.com.', 'error'); return; }
    try{
      await auth.sendPasswordResetEmail(email);
      setMessage('Password reset email sent to nebulamusic_rh@outlook.com.', 'success');
    }catch(err){
      setMessage(err.message || 'Could not send password reset.', 'error');
    }
  });
})();
