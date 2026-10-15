# Armada Invoice Tracker

A small full-stack app to manage clients and invoices: sign in with Google, add clients, create invoices, track their status and filter them.

**Live demo**

| | URL | Host |
|---|---|---|
| Frontend | https://armada-invoices-r1m7.vercel.app | Vercel |
| Backend API | https://armada-invoices.netlify.app (health: [`/health`](https://armada-invoices.netlify.app/health)) | Netlify Functions |

Both run on free tiers, so the first request after a period of inactivity can take a few seconds (cold start).

## Tech stack and why

- **Frontend:** React 19 + TypeScript + Vite, React Router, plain CSS with design tokens.
- **Backend:** Node.js + Express 5 + TypeScript, Zod validation, JWT auth.
- **Database:** PostgreSQL (Neon) with **Prisma** ORM, migrations and a seeder.

I chose Express with Prisma and PostgreSQL because invoices and clients are clearly relational data, and Prisma gives a type-safe client, versioned migrations and an easy seeder with very little boilerplate. Express keeps the API simple and explicit, and Neon provides a free hosted Postgres that works well with serverless deployments.

**Auth:** Option A, Google login (OAuth 2.0). The frontend gets a Google ID token, the backend verifies it, creates or updates the user and returns its own JWT. Private APIs require that JWT, and every query is scoped to the logged-in user, so users can only see and manage their own clients and invoices.

## Features

- Google sign-in, with the user's name and profile picture shown in the header
- Clients: create, edit, delete (deleting a client also deletes its invoices, after a confirmation)
- Invoices: create, edit, delete, and change status from the list
- Filter by **All / Draft / Sent / Paid / Overdue**, with pagination (10 per page)
- Loading, empty and error states on every screen; responsive layout

**Invoice status rules** (enforced by the API, mirrored in the UI):

- `draft → sent`, `sent → paid / overdue / draft`, `overdue → paid / sent`; **paid invoices are locked**
- An invoice can only be **overdue** after its due date has passed
- Sending an invoice whose due date has passed marks it **overdue** automatically
- Moving an overdue invoice's due date into the future sets it back to **sent**
- New invoices can be created as draft, sent or **paid** (to record an already-paid invoice); a paid invoice never becomes overdue

## Scheduled job (overdue invoices)

Every **hour** (`0 * * * *`, UTC), a job marks `sent` invoices whose due date has passed as `overdue` and logs a reminder for each one.

- On Netlify it runs as a **Scheduled Function** (`backend/netlify/functions/overdue-invoices.mts`, `@hourly`).
- When the API runs as a normal server (`npm run dev` / `npm start`), it runs in-process with `node-cron` and also once at startup. The schedule can be changed with `OVERDUE_CRON`, or set to `off`.

## Project structure

```
backend/
  prisma/            schema, migrations, seed
  src/
    config/          env validation
    routes/          URL → controller
    controllers/     request/response handling
    services/        business logic + data access
    domain/          invoice status rules (+ unit tests)
    validators/      Zod request schemas
    middleware/      auth (JWT), errors
    jobs/            overdue-invoice job
  netlify/functions/ Netlify deployment (API + scheduled job)
frontend/
  src/
    api/  pages/  components/  context/  hooks/  routes/  layouts/  styles/  types/  utils/
```

## Running locally

**Requirements:** Node.js 22+, a PostgreSQL database (e.g. a free Neon project), and a Google OAuth **Web** client ID with `http://localhost:5173` as an authorized JavaScript origin.

### 1. Backend

```bash
cd backend
cp .env.example .env      # then fill in the values below
npm install               # also generates the Prisma client
npm run db:migrate        # apply migrations
npm run db:seed           # optional: sample clients and invoices
npm run dev               # http://localhost:4000
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (Neon pooled URL) |
| `DIRECT_URL` | Direct (non-pooled) connection string, used by migrations |
| `JWT_SECRET` | Long random string (min 16 characters) |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client ID |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated, e.g. `http://localhost:5173` |
| `PORT` | Default `4000` |
| `OVERDUE_CRON` | Cron schedule for the overdue job, default `0 * * * *`; `off` to disable |

Other scripts: `npm run build`, `npm start`, `npm run typecheck`, `npm test` (unit tests for the status rules), `npm run db:studio`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # then fill in the values below
npm install
npm run dev               # http://localhost:5173
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL, e.g. `http://localhost:4000` |
| `VITE_GOOGLE_CLIENT_ID` | Same Google OAuth client ID as the backend |

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.

## Deployment

- **Backend (Netlify):** base directory `backend`; settings come from `backend/netlify.toml` (the build runs `prisma migrate deploy` and the TypeScript build). Env vars: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL` (the Vercel URL).
- **Frontend (Vercel):** root directory `frontend`, Vite preset; `vercel.json` handles client-side routes. Env vars: `VITE_API_URL` (the Netlify URL), `VITE_GOOGLE_CLIENT_ID`.
- `render.yaml` is also included to run the backend as a long-running server on Render, if preferred.

## API overview

All routes except `/health` and `POST /auth/google` need `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/google` | Exchange a Google ID token for an app JWT |
| GET | `/auth/me` | Current user |
| GET/POST | `/clients` | List / create clients |
| GET/PUT/DELETE | `/clients/:id` | Get / update / delete a client |
| GET | `/invoices?status=&page=&pageSize=` | List invoices (filter + pagination) |
| POST | `/invoices` | Create an invoice |
| GET/PUT/DELETE | `/invoices/:id` | Get / update / delete an invoice |
| PATCH | `/invoices/:id/status` | Change an invoice's status |

Errors return JSON: `400` validation (with per-field details), `401` auth, `404` not found or not owned, `422` invalid status change.
