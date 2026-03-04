# Lunar — Architecture

This document describes how the app is built and why.
Updated as the architecture evolves.

---

## Current state: Prototype (as of Chapter 0)

Everything lives in a single file: `src/App.jsx` (~1027 lines).
This is intentional for a prototype — move fast, validate the idea, worry about structure later.
"Later" is now. Chapter 1 restructures this.

---

## How the app works right now

```
index.html
  └─ loads main.jsx
       └─ renders <LunarApp /> from App.jsx
            └─ one giant file with everything inside it
```

There is no server. There is no database. When you open the app:
1. Your browser downloads the JavaScript files from Vercel's CDN
2. React runs in your browser and draws the UI
3. All data comes from hardcoded constants at the top of App.jsx
4. "Saving" a log writes to React's in-memory state — lost on refresh

---

## What's inside App.jsx (current layer breakdown)

| Layer | What it is | Lines (approx) |
|---|---|---|
| Design system | Colour palette (`C`), font config (`F`) | 1–17 |
| Phase config | 28-day cycle phases, colours, degree ranges | 19–35 |
| Seed data | Hardcoded period history, mood logs, hormone reports | 37–133 |
| Fake AI | `genResponse()` — keyword matching, no real API | 135–154 |
| Helper functions | Date formatting, status colour logic | 156–165 |
| Global styles | CSS injected via a React component | 167–182 |
| Shared UI components | Label, Handle, CloseBtn, StatusPill, RangeBar, PainSelector | 184–228 |
| Tab bar | Navigation component | 230–247 |
| Feature components | CycleWheel, LogModal, RecordDetailModal, SettingsModal | 249–462 |
| Screens | HomeScreen, CalendarScreen, AskLunarScreen, RecordsScreen | 464–960 |
| Root component | `LunarApp` — all app state, wires everything together | 962–end |

---

## Target architecture after Chapter 1

```
src/
  lib/
    constants.js        ← C, F, PHASES, MOODS, SYMPTOMS, all seed data
    helpers.js          ← toKey(), fmt(), fmtShort(), statusColor(), etc.
  components/
    shared/
      Label.jsx
      Handle.jsx
      CloseBtn.jsx
      StatusPill.jsx
      RangeBar.jsx
      PainSelector.jsx
    CycleWheel.jsx
    LogModal.jsx
    RecordDetailModal.jsx
    SettingsModal.jsx
    TabBar.jsx
  screens/
    HomeScreen.jsx
    CalendarScreen.jsx
    AskLunarScreen.jsx
    RecordsScreen.jsx
  App.jsx               ← ~50 lines. Imports everything, holds top-level state.
```

---

## Target architecture after Chapter 2 (Supabase)

```
src/
  lib/
    supabase.js         ← Supabase client (reads from .env)
    constants.js        ← Only design system constants remain (seed data removed)
    helpers.js          ← Same as before
  hooks/
    useLogs.js          ← Custom hook: fetch/save daily logs from Supabase
    useCycle.js         ← Custom hook: fetch cycle history from Supabase
    useReports.js       ← Custom hook: fetch hormone reports from Supabase
  components/           ← Same as Chapter 1
  screens/              ← Same as Chapter 1, but data comes from hooks not constants
  App.jsx               ← Same shape, but no hardcoded data
```

**What a "hook" is:** A reusable function that handles fetching data.
Instead of data being baked in, it goes and asks Supabase: "what's saved for this user?"

---

## Target architecture after Chapter 3 (Auth)

```
src/
  lib/
    supabase.js
    constants.js
    helpers.js
  hooks/
    useAuth.js          ← Is someone logged in? Who are they?
    useLogs.js
    useCycle.js
    useReports.js
  components/
    Auth/
      LoginScreen.jsx   ← Email + password form
      SignupScreen.jsx
  screens/              ← Same, but protected (only shown when logged in)
  App.jsx               ← Now checks auth state first; shows login if not authenticated
```

---

## Deployment

| What | How |
|---|---|
| Hosting | Vercel |
| Deploy trigger | Push to `main` branch on GitHub |
| Build command | `npm run build` (runs Vite) |
| Output | Static files in `dist/` folder |
| Environment variables | Set in Vercel dashboard (not in code) |

**How Vercel deploy works:**
1. You push code to GitHub
2. GitHub notifies Vercel: "new code arrived"
3. Vercel pulls the code, runs `npm run build`
4. If build succeeds, new version goes live
5. If build fails, old version stays live

After Chapter 1, GitHub Actions will add a check before step 2:
"Does the code build?" — if not, it blocks the push from reaching Vercel.

---

## Data model (planned for Chapter 2)

These are the Supabase tables we'll create:

### `users`
Managed by Supabase Auth automatically. Contains email, id, created_at.

### `daily_logs`
| Column | Type | Description |
|---|---|---|
| id | uuid | Unique ID |
| user_id | uuid | Links to the user |
| date | date | Which day this log is for |
| mood | text | e.g. "Tired", "Happy" |
| pain | integer | 0–4 pain scale |
| flow | text | "Light", "Medium", "Heavy", "Spotting", or null |
| symptoms | text[] | Array of symptom strings |
| note | text | Free text note |
| created_at | timestamp | When this was logged |

### `period_days`
| Column | Type | Description |
|---|---|---|
| id | uuid | Unique ID |
| user_id | uuid | Links to the user |
| date | date | A day that was a period day |
| created_at | timestamp | |

### `hormone_reports`
| Column | Type | Description |
|---|---|---|
| id | uuid | Unique ID |
| user_id | uuid | Links to the user |
| date | date | When the blood test was taken |
| title | text | e.g. "Hormone Panel — Feb 2025" |
| markers | jsonb | Array of marker objects (name, value, unit, range, status) |
| created_at | timestamp | |

---

## Key constraints and decisions

- **Phone mockup only** — the app renders as a 390×844px phone frame. Not responsive to desktop yet.
- **No TypeScript** — plain JavaScript for now. TypeScript is Chapter 6+ if at all.
- **Inline styles** — consistent with existing codebase. Not changing styling approach mid-project.
- **Single Supabase project** — one project for dev and prod. When users grow, we separate.
