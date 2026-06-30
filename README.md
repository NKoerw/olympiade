# Bierolympiade

Static HTML app published with GitHub Pages.

## Live URL

After the first successful deploy, your site URL will be:

https://nkoerw.github.io/olympiade/

## Local file

The app source is in `bierolympiade.html`.

`index.html` redirects to the app so the root URL works.

## Shared score sync (Firebase, no own server)

GitHub Pages hosts the app, Firebase Firestore stores the shared state.

### 1. Create Firebase project

1. Open https://console.firebase.google.com
2. Create project (Spark free plan is usually enough)
3. Add a Web App and copy Firebase config values

### 2. Enable Firestore Database

1. Build -> Firestore Database -> Create Database
2. Choose region near you
3. For quick setup, start in test mode while you try it

### 3. Add Firebase config to app

Edit `bierolympiade.html` in the `SYNC` object:

- `firebaseConfig.apiKey`
- `firebaseConfig.authDomain`
- `firebaseConfig.projectId`
- `firebaseConfig.appId`
- `room` (shared room name, e.g. `provence-2026`)

### 4. Push to GitHub

After push, GitHub Pages redeploys automatically. All users opening the same site and room see one shared live score.

### Optional: lock database rules later

After testing, tighten rules in Firebase so random users cannot write.
