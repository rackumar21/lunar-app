# Lunar

A personal health companion for menstrual cycle tracking, symptom logging, and AI-powered health insights.

**[lunar-app-beta.vercel.app](https://lunar-app-beta.vercel.app)**

---

## Features

- **Cycle tracking** — log period days, get predictions based on your actual history
- **Daily logging** — mood, pain, flow, symptoms, weight, notes
- **Ask Lunar** — AI assistant with access to your real cycle data and logs
- **Persistent memory** — tell Lunar something once (e.g. "I have PCOD") and it remembers across all future conversations
- **Lab report upload** — upload PDFs or images of blood reports; Claude reads them and extracts every marker automatically
- **Auto-categorisation** — reports are labelled (Hormone Panel, Thyroid, Vitamins & Minerals, General Health) based on what markers were found
- **Trend tracking** — see how each marker has changed compared to your previous report
- **Multi-file upload** — attach multiple reports at once, processed in parallel
- **Per-user data** — auth with row-level security, each user's data is private
- **PWA** — installable on iPhone via Safari, works like a native app

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

**AI context** — each request to Claude includes the user's cycle history, recent logs, and hormone data, so responses are grounded in real data rather than generic advice.

**Data isolation** — Supabase Row Level Security policies ensure users can only read and write their own rows at the database level.

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

---

## What I learned

- **Shipping incrementally is harder than it sounds.** Each chapter of this build had a working product at the end — not a broken WIP. That constraint forced cleaner decisions: scope down, ship, then add.
- **Database design decisions are permanent.** Choosing Supabase with Postgres row-level security early meant I never had to retrofit auth or data isolation. Picking the right primitive matters more than moving fast.
- **LLM context is a product decision, not a technical one.** What you put in the context window determines what the AI can and can't do. Getting Claude to reason over a user's actual cycle data — not generic health advice — required deliberate choices about what to include and how to structure it.
- **The gap between "works on my machine" and "works on a phone" is enormous.** PWA, touch targets, iOS Safari quirks, keyboard pushing content — mobile UX is a different discipline. I shipped fixes I never would have filed a ticket for.
- **Evaluating AI output is a skill.** When the AI gave a wrong answer, the question was always: was it a prompt problem, a context problem, or a model limitation? Learning to distinguish those three made me a better AI PM.
