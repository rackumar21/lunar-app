# Lunar

A personal health companion for menstrual cycle tracking, symptom logging, and AI-powered health insights.

**[lunar-app-beta.vercel.app](https://lunar-app-beta.vercel.app)**

---

## Features

- **Cycle tracking** — log period days, get predictions based on your actual history
- **Daily logging** — mood, pain, flow, symptoms, weight, notes
- **Ask Lunar** — AI assistant with access to your real cycle data and logs
- **Hormone reports** — upload and view lab results
- **Per-user data** — auth with row-level security, each user's data is private

---

## Stack

| | |
|---|---|
| Frontend | React 19, Vite |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Hosting | Vercel |

---

## Architecture

```
src/
  screens/     — Home, Calendar, Ask Lunar, Records
  components/  — Modals, selectors, shared UI
  hooks/       — useAuth, useLogs, usePeriodDays
  lib/         — Constants, helpers, Supabase client
api/
  ask.js       — Serverless function for Claude API calls
```

Each request passes the user's cycle data and logs as context so Claude can answer questions grounded in real data rather than generic advice.

Data is scoped per user via Supabase Row Level Security policies — the database itself enforces that users can only read and write their own rows.

---

## Local setup

```bash
git clone https://github.com/rackumar21/lunar-app
cd lunar-app
npm install
```

Add a `.env` file:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

```bash
npm run dev
```
