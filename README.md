# Attache

A personal **progress tracker** for attachees and interns. Set your organisation and dates, then keep a weekday record of work, technical and interpersonal skills, weekly goals, and wins.

Anyone on a fixed-term attachment or internship can use it. It is not locked to a school form or a generic habit app.

## Stack

- **Client:** React 19, Vite 8, Tailwind CSS 4, React Router
- **Server:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT (14 days), bcrypt, optional Google sign-in

## Design

- **Display:** [Fraunces](https://fonts.google.com/specimen/Fraunces) — wordmark and in-app titles
- **Body:** [Manrope](https://fonts.google.com/specimen/Manrope) — forms, nav, body
- **Numbers:** [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) — stats and form indices (open oval zero)
- **Ink** `#1A1625` · **Paper** `#F5F4F8` · **Iris** `#6E4C9A` · **Forest** `#3D6B5A` · **Clay** `#9A5B3C`

Dates and streaks use **Africa/Nairobi**. Streaks count **weekdays only**. Weekends do not break a streak.

## Project layout

```
client/     Vite React app (:5174, proxies /api → :5050)
server/     Express API (:5050)
```

## Prerequisites

- Node.js 20+
- MongoDB locally, or an Atlas connection string

## Environment

Copy `server/.env.example` to `server/.env`:

| Variable | Purpose |
|---|---|
| `PORT` | API port (`5050` — `5000` is often taken) |
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET` | Long random string — never commit a real one |
| `CLIENT_URL` | Frontend origin (`http://localhost:5174`) |
| `GOOGLE_CLIENT_ID` | Optional. Google OAuth web client ID |
| `GOOGLE_CLIENT_SECRET` | Optional. Google OAuth client secret |

If you enable Google, add this authorized redirect URI in Google Cloud:

`http://localhost:5174/api/auth/google/callback`

Do not commit `server/.env`.

## Run locally

```bash
npm install
npm run install:all
```

Start MongoDB, then from the repo root:

```bash
npm run dev
```

- App: http://localhost:5174
- API health: http://localhost:5050/api/health

Or run the two processes yourself:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

Create an account at `/register` with start and end dates, or sign in with Google if those keys are set.

## Features

1. **Sign in** — email and password, Remember me, password reset (email + new password), optional Google. Cookie notice on first visit.
2. **Overview** — photo masthead, Today / This week / Tape columns. The tape is a weekday log index (starts at 100; logged +1, missed −1).
3. **Daily check-in** — tasks, technical and interpersonal skills, one win, a challenge, supervisor follow-up, mood, notes. One log per day.
4. **Streak** — current and longest weekday logging streak.
5. **Weekly planning** — 3–5 goals, progress, end-of-week reflection.
6. **Skills** — derived from check-ins (no separate collection).
7. **Wins** — searchable feed, export `.txt` or Markdown.
8. **Settings** — name, organisation, placement dates.

## API

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
GET    /api/auth/google
GET    /api/auth/google/callback
GET    /api/auth/me
PUT    /api/auth/profile

GET    /api/logs              ?date=&page=&limit=&winsOnly=true
POST   /api/logs
PUT    /api/logs/:id
GET    /api/logs/streak

GET    /api/goals             ?current=true  or  ?weekStart=YYYY-MM-DD
POST   /api/goals
PUT    /api/goals/:id

GET    /api/skills/summary
GET    /api/dashboard
GET    /api/health
```

Protected routes expect `Authorization: Bearer <token>`.
