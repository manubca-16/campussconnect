<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CampusConnect

College event management platform (React + Express + MongoDB).

View your app in AI Studio: https://ai.studio/apps/c52ee80b-10f4-4fd2-969a-524c5f09f671

## Run Locally (Dev)

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Configure backend env in `backend/.env` (see `backend/.env.example`)
3. Run: `npm run dev`

The server runs on `http://localhost:3000` and serves both the API and the frontend.

## Production (Deploy)

1. Build frontend assets: `npm run build`
2. Set environment variables (at minimum `MONGODB_URI`, `JWT_SECRET`, `BASE_URL`)
3. Start server: `npm start`

## Split Deploy: Vercel (Frontend) + Render (Backend)

### Render (backend)
- Root Directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Env vars:
  - `MONGODB_URI` (or `MONGO_URI`)
  - `JWT_SECRET`
  - `BASE_URL=https://<your-vercel-domain>` (used for certificate QR verification links)
  - `CORS_ORIGINS=https://<your-vercel-domain>` (comma-separated for multiple)
  - `STRIPE_SECRET_KEY` (if using payments)

### Vercel (frontend)
- Root dir: repo root
- Build command: `npm run build`
- Output dir: `frontend/dist`
- Env vars:
  - `VITE_API_BASE_URL=https://<your-render-backend-domain>`

`vercel.json` is included so client-side routes (React Router) work on refresh.

