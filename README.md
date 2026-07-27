# Zoom Clone

A video conferencing web app I built for an SDE Fullstack assignment — the goal was to clone Zoom's core meeting workflows (instant meetings, join by ID/link, scheduling, host controls) with a UI that actually feels like Zoom, and real peer-to-peer video instead of a mocked-up call screen.

**Live app**: https://web-rtc-eight-peach.vercel.app
**Backend API**: https://webrtc-bdo6.onrender.com
**Repo**: https://github.com/Tarunya0704/webRtc

> Heads up: the backend runs on Render's free tier, which sleeps after ~15 minutes of no traffic. If the dashboard hangs for 30-50 seconds on first load, that's just the server waking up — not a bug. It's fast once it's warm.

<img width="1470" height="882" alt="image" src="https://github.com/user-attachments/assets/fc7303c1-9171-410b-be6c-0193dc2733e3" />

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS. Plain `fetch` for REST calls, and the browser's native `WebSocket` + `RTCPeerConnection` APIs for the video call itself — no external WebRTC library.
- **Backend**: FastAPI + SQLAlchemy + SQLite, with JWT auth (`pyjwt` + `passlib[bcrypt]`). One WebSocket endpoint handles signaling for every meeting room.
- **Database**: SQLite, 3 tables — `users`, `meetings`, `participants`.

## Project Structure

```
/backend    FastAPI app (models / schemas / services / routers under backend/app)
/frontend   Next.js app (app router pages, components, hooks, lib)
```
<img width="1470" height="882" alt="image" src="https://github.com/user-attachments/assets/fc7303c1-9171-410b-be6c-0193dc2733e3" />





## Running it locally

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

Runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Runs at `http://localhost:3000`. You'll want both running at once — the frontend talks to the backend at whatever `NEXT_PUBLIC_API_URL` points to (defaults to `http://localhost:8000`).

### Logging in

You don't have to. The dashboard auto-logs-in as a seeded demo user (`default@zoomclone.dev` / `DefaultPass123!`) the moment it loads, which is what the brief asks for ("assume a default logged-in user"). Real `/login` and `/signup` pages exist too, as the bonus auth feature — sign up, log out, whatever — and logging out just falls back to the demo user again automatically, so there's no dead end.

## Database Schema

- **`users`** — `id, email, name, hashed_password, created_at`
- **`meetings`** — `id, code (11-digit unique), title, description, meeting_type (instant|scheduled), status (scheduled|active|ended), host_id → users, scheduled_at, duration_minutes, started_at, ended_at, created_at`
  - I kept instant and scheduled meetings in one table, distinguished by `meeting_type`, instead of splitting them out. They share basically all downstream logic — joining, signaling, ending — so two tables would've just meant branching on type everywhere for no real benefit.
  - The meeting code is 11 random digits (regenerated on a collision), shown grouped as `123 4567 8901` to match Zoom's format. The invite link is built from the code at read time rather than stored, since it's fully derivable.
  - Status moves `scheduled → active → ended`. Instant meetings start life already `active`; scheduled ones flip to `active` the first time someone actually joins. A meeting ends when its room empties out, or when the host explicitly ends it.
- **`participants`** — `id, meeting_id → meetings, user_id → users (nullable — null means a guest), display_name, role (host|participant), is_muted, joined_at, left_at, left_reason`

No Alembic or other migration tool — `Base.metadata.create_all()` on startup is enough for a project this size.

## How the video calls actually work

- It's a **mesh topology**: every participant opens a direct `RTCPeerConnection` to every other participant, and my FastAPI WebSocket endpoint (`/ws/meetings/{code}`) only exists to relay the offer/answer/ICE-candidate handshake needed to set those connections up. Once connected, video/audio flows peer-to-peer, not through my server. This works well for small meetings; a large-scale version of this would want a proper SFU instead of full mesh.
- I'm using **STUN only** (Google's public STUN server), no TURN. That covers most networks fine, but a strict corporate NAT could still fail to connect — a real production version would add a TURN server as a relay fallback.
- The "who's connected to which room" state lives **in memory** on the backend process, not the database. Simple and fast, but it means that state disappears if the server restarts mid-call, and it wouldn't work if I ever ran multiple backend instances behind a load balancer without adding something like Redis to share that state.
- Host controls (mute everyone, remove a participant) ride the same WebSocket — the server checks the sender actually has the `host` role before acting on either of those.

## Assumptions I made

- No login required to use the app, per the brief — a seeded default user logs itself in automatically. Real signup/login is there too, as the bonus feature, but it's layered on top of that default flow rather than replacing it.
- Joining a meeting by ID or link is treated as a guest action, completely separate from whatever account happens to be logged into the dashboard in that browser. I added this on purpose after noticing that testing solo in one browser made every "guest" look like the host — the join flow doesn't send the dashboard's login token at all.
- If the host leaves early but other people are still in the call, the meeting keeps going — there's no host-transfer logic. It only ends when the room is completely empty, or the host explicitly clicks "End for All."
- You can only edit a scheduled meeting (title, time, duration, etc.) before it's started.

## Known limitations

- STUN-only WebRTC, as above — no TURN fallback.
- Signaling state is in-memory and tied to a single backend process.
- SQLite on the deployed backend sits on ephemeral storage (free tier), so it resets whenever the service redeploys.
- No automated test suite. I verified everything by hand instead — real two/three-browser WebRTC calls, host controls, the full schedule → start → end lifecycle, auth flows — rather than writing pytest/Jest tests.

## Bonus features I implemented

- Responsive layout across mobile, tablet, and desktop — dashboard, meeting room, and every form.
- Host controls: mute everyone at once, remove an individual participant, end the meeting for everyone.
- Login/Signup with real JWT auth, on top of the default-user flow.

## Deployment

Both halves are live (links at the top). Backend's on Render (Docker, using `backend/Dockerfile` + `backend/render.yaml`), frontend's on Vercel.

If you want to deploy your own copy:

**Backend (Render or similar)** — point it at `backend/Dockerfile`, and set the env vars from `backend/.env.example`. Update `CORS_ORIGINS` and `FRONTEND_URL` to wherever your frontend ends up. Worth knowing: SQLite on most PaaS free tiers is ephemeral — it resets on every redeploy. Fine for a demo; for anything long-lived you'd want a persistent disk or a hosted Postgres instead.

**Frontend (Vercel)** — no Dockerfile needed, it builds straight from the repo. Set:
```
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXT_PUBLIC_WS_URL=wss://your-backend-url
NEXT_PUBLIC_DEFAULT_USER_EMAIL=default@zoomclone.dev
NEXT_PUBLIC_DEFAULT_USER_PASSWORD=DefaultPass123!
```
(Note it's `wss://`, not `ws://` — has to match the backend's `https://`.) A `frontend/Dockerfile` is also there if you'd rather run it on a Docker host instead of Vercel.
