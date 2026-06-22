# Nebula Records + EKOUNLOCKED Deployment Guide

## 1. Firebase setup
1. Create a Firebase project.
2. Add a Web app and copy the Firebase config object into `firebase-config.js`.
3. Enable Firebase Authentication > Email/Password sign-in.
4. Create this admin user: `nebulamusic_rh@outlook.com`.
5. Enable Cloud Firestore.
6. Enable Cloud Storage if you want to upload audio snippets/files from the dashboard.
7. Publish `firestore.rules` and `storage.rules` from this ZIP.

## 2. Frontend hosting
You can deploy the same folder to Firebase Hosting, Netlify, Vercel or any static host.

### Firebase Hosting
Install Firebase CLI, login, set `.firebaserc` from `.firebaserc.example`, then run:

```bash
firebase deploy
```

### Netlify or Vercel
Upload the folder or connect it to a Git repository. The included `netlify.toml` and `vercel.json` are static-site ready.

## 3. Domain connection
1. Add your domain in Firebase Hosting, Netlify or Vercel.
2. Copy the DNS records provided by the hosting platform.
3. Paste the DNS records into your domain registrar.
4. Wait for DNS and SSL to finish activating.

## 4. Final launch checklist
- Paste real Firebase config into `firebase-config.js`.
- Create admin account `nebulamusic_rh@outlook.com` in Firebase Authentication.
- Publish Firestore and Storage security rules.
- Replace demo audio with licensed Blocboykiddie snippets.
- Confirm Songwhip link: `https://songwhip.com/blocboykiddie`.
- Test dashboard login, song upload, future artist creation and analytics export.

## Handles
- Nebula Records: `@nebulamusic_rh`
- EKOUNLOCKED TikTok: `@ekounlocked`
- EKOUNLOCKED Instagram: `@ekounlocked_`
