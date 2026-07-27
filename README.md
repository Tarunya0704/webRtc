# Zoom Clone

A functional video conferencing web app inspired by Zoom — landing dashboard, instant meetings, join by ID/link, scheduling, real peer-to-peer video via WebRTC, host controls, and login/signup.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS. Native `fetch` for REST, native `WebSocket` + `RTCPeerConnection` for signaling/media.
- **Backend**: FastAPI + SQLAlchemy + SQLite. JWT auth (`pyjwt` + `passlib[bcrypt]`). A single in-process WebSocket endpoint handles WebRTC signaling for all meeting rooms.
- **Database**: SQLite, 3 tables (`users`, `meetings`, `participants`) — schema details below.

## Project Structure

```
/backend    FastAPI app (see backend/app for models/schemas/services/routers)
/frontend   Next.js app (see frontend/app, components, hooks, lib)
```
<img width="1470" height="882" alt="image" src="https://github.com/user-attachments/assets/fc7303c1-9171-410b-be6c-0193dc2733e3" />





## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m app.seed              # creates zoom_clone.db, seeds a default user + demo meetings
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`.

Run both at once for the app to work end-to-end (frontend calls the backend at `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8000`).

### Default login

The dashboard auto-logs-in as a seeded demo user (`default@zoomclone.dev` / `DefaultPass123!`) on first load — no manual login required, matching the "assume a default logged-in user" brief. Real `/login` and `/signup` pages are also available (Navbar → profile menu → Log Out, or visit `/login` directly) for testing the bonus auth flow; logging out falls back to the demo user again automatically.

## Database Schema

- **`users`**: `id, email, name, hashed_password, created_at`
- **`meetings`**: `id, code (11-digit unique), title, description, meeting_type (instant|scheduled), status (scheduled|active|ended), host_id → users, scheduled_at, duration_minutes, started_at, ended_at, created_at`
  - Instant and scheduled meetings share one table via `meeting_type` — they use identical downstream logic (join, signaling, ending), so splitting them into separate tables would only add branching without benefit.
  - Meeting code: 11 random digits, retried on collision, displayed grouped as `123 4567 8901`. The invite link (`{FRONTEND_URL}/meeting/{code}`) is derived at read time, not stored.
  - Status lifecycle: `scheduled` → `active` (instant meetings start active; scheduled meetings flip on first successful join) → `ended` (room empties, or host explicitly ends it).
- **`participants`**: `id, meeting_id → meetings, user_id → users (nullable, null for guests), display_name, role (host|participant), is_muted, joined_at, left_at, left_reason`

No migration tool (Alembic) — `Base.metadata.create_all()` on startup is sufficient for this scope.

## Real-time / WebRTC design

- **Mesh topology** over a FastAPI WebSocket (`/ws/meetings/{code}`): a newly-joined client creates an `RTCPeerConnection` + offer to each existing participant; the server relays offer/answer/ICE messages 1:1 and broadcasts roster/media-status changes. Fine for small meeting sizes (a handful of participants); a large-scale deployment would want an SFU instead.
- **STUN only** (`stun.l.google.com`), no TURN server — works on the same network / most direct connections; a restrictive-NAT production deployment would need a TURN server. Out of scope here.
- **In-memory signaling state**, single process — a multi-worker/multi-instance deployment would need a shared store (e.g. Redis) for the room registry instead.
- **Host controls** (mute-all, remove-participant) are relayed the same way: the host's `host-mute-all` / `host-remove` WebSocket messages are validated server-side (role check) before taking effect.

## Assumptions

- No login is required to use the dashboard (per the brief) — a seeded default user is auto-logged-in client-side. Real signup/login exists as a bonus layer on top, not a requirement to use the app.
- Joining a meeting via Meeting ID/invite link is always a guest action independent of whatever account is logged into the dashboard on that browser — this matters so that testing with the same browser profile doesn't cause every "guest" to be misidentified as the host.
- A host leaving early does **not** end the meeting if other participants remain (no host-transfer logic); the meeting ends when the room becomes empty, or via an explicit "End meeting" action.
- Editing a scheduled meeting (title/description/time/duration) is only allowed before it starts.

## Known Limitations

- STUN-only WebRTC (see above) — no TURN fallback.
- Signaling state is in-memory and single-process (fine for one backend instance; wouldn't survive a restart mid-call or scale horizontally without extra work).
- No automated test suite — verification was done manually end-to-end (multi-tab/multi-browser-context real WebRTC calls, REST endpoints via curl, host controls, schedule lifecycle) during development.

## Bonus Features Implemented

- Responsive layout (dashboard, meeting room, all forms) across mobile/tablet/desktop.
- Host controls: mute all participants, remove a participant.
- Login/Signup with JWT auth, layered on top of the default-user flow.

## Deployment

**Backend** — `backend/Dockerfile` + `backend/render.yaml` are set up for Render (or any Docker host: Railway, Fly.io, etc.). Set the env vars from `backend/.env.example` on whatever platform you use; update `CORS_ORIGINS` and `FRONTEND_URL` to your deployed frontend's URL once you have it. Note: SQLite on most PaaS free tiers is ephemeral storage — attach a persistent disk (or move to a hosted Postgres) if you need data to survive redeploys.

**Frontend** — Vercel is the natural fit for Next.js (no Dockerfile needed there; it builds directly from the repo). Set these env vars in the Vercel project settings, pointing at your deployed backend:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com
NEXT_PUBLIC_DEFAULT_USER_EMAIL=default@zoomclone.dev
NEXT_PUBLIC_DEFAULT_USER_PASSWORD=DefaultPass123!
```
A `frontend/Dockerfile` is also included for Docker-based hosts (Render/Railway) as an alternative to Vercel.

Neither service has been deployed as part of building this out — the configs above are prepared and ready to use, but actually standing up hosted instances requires your own cloud accounts.
