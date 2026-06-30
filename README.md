# Bierolympiade

Static HTML app published with GitHub Pages.

## Live URL

After the first successful deploy, your site URL will be:

https://nkoerw.github.io/olympiade/

## Local file

The app source is in `bierolympiade.html`.

`index.html` redirects to the app so the root URL works.

## Shared sync backend (one shared password)

GitHub Pages serves the frontend. Shared persistence is handled by the minimal JSON backend in `backend/`.

### Backend environment

Copy `backend/.env.example` to `backend/.env` and set:

- `APP_PASSWORD`: one shared password for all users
- `ALLOWED_ORIGIN`: frontend origin (for this repo: `https://nkoerw.github.io`)
- `PORT`: backend port (default `8787`)

### Run backend locally

```bash
cd backend
npm install
# PowerShell example
$env:APP_PASSWORD="your-shared-password"
$env:ALLOWED_ORIGIN="https://nkoerw.github.io"
npm start
```

### Deploy backend

Deploy `backend/` to any Node host (Render, Railway, Fly.io, VPS, etc.) with the same env vars.

### Configure frontend

In `bierolympiade.html`, set in `SYNC`:

- `backendUrl`: your backend URL (for example `https://bier-backend.example.com`)
- `room`: shared room name

Users then open Setup -> `Passwort setzen` once and enter the same password.
After that, all users in the same room see shared persistent data.
