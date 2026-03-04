# Lunar — CLAUDE.md

This file is read automatically by Claude Code at the start of every session.
It contains everything needed to work on this project without re-exploration.

---

## Who Rachita is

Non-technical PM learning to build AI-native products by doing.
Learns by doing. Needs plain English explanations before technical steps.
Goal: build Lunar into a solid product to demonstrate engineering thinking for career advancement.

## How we work together

- **Always explain WHY before WHAT.** Never just execute.
- **Workflow: Exploration → Plan → Build → Review.** Never skip phases.
- **After every file change: test locally** (usually localhost:5173 or 5174 — Vite picks the next free port) before moving on.
- **Give two options at every decision:** the enterprise way AND the solo builder shortcut.
- **Push understanding, not just task completion.** Don't let Rachita stay comfortable.
- **Plain English first.** Technical terms need explaining when first introduced.

---

## What Lunar is

A personal health companion app (not just a period tracker). Users track their cycle,
log symptoms and moods, upload hormone reports, and ask an AI assistant questions
about their health data.

**Live at:** lunar-app-beta.vercel.app
**Deployed via:** Vercel — auto-deploys on every push to `main` branch on GitHub

---

## Tech stack

| Layer | Tool | Why |
|---|---|---|
| Framework | React 19 | Component-based UI |
| Build tool | Vite 7 | Fast local dev, simple config |
| Database | Supabase (installed, not yet connected) | Postgres + Auth + realtime, generous free tier |
| Hosting | Vercel | Auto-deploy from GitHub, free tier |
| Package manager | npm | Default, no reason to change yet |

---

## Current file structure

```
lunar-app/
  src/
    App.jsx         ← Entire app in one file (~1027 lines). This is intentional for now.
    App.css         ← Minimal global styles
    main.jsx        ← Entry point (renders App into index.html)
    index.css       ← Reset/base styles
    assets/         ← Static assets
  public/           ← Files served as-is
  index.html        ← HTML shell
  vite.config.js    ← Build config
  package.json      ← Dependencies
  .env              ← Supabase credentials (gitignored, never commit)
  docs/             ← Project documentation (see below)
```

## Current state of App.jsx

Everything lives in one file. Structure from top to bottom:
1. **Design system** (lines ~1-17) — color palette `C`, font config `F`
2. **Phase config** (lines ~19-35) — 28-day cycle definition
3. **Seed data** (lines ~37-133) — hardcoded period history, logs, hormone reports, fake AI
4. **Helper functions** (lines ~156-165) — date formatting, status colors
5. **Styles** (lines ~167-182) — CSS injected via React component
6. **Shared UI components** (lines ~184-228) — Label, Handle, CloseBtn, StatusPill, RangeBar, PainSelector
7. **Tab bar** (lines ~230-247)
8. **Feature components** (lines ~249-462) — CycleWheel, LogModal, RecordDetailModal, SettingsModal
9. **Screens** (lines ~464-960) — HomeScreen, CalendarScreen, AskLunarScreen, RecordsScreen
10. **Root component** (lines ~962-end) — LunarApp (main state, wires everything together)

---

## Key facts about current app behaviour

- `todayKey()` is **hardcoded to "2025-02-26"** — the app is frozen at this date for demo purposes
- `genResponse()` is **fake AI** — keyword matching, no real API calls
- All seed data (logs, period history, hormone reports) is **hardcoded constants**
- "Save log" saves to **React state only** — data disappears on page refresh
- App renders as a **phone mockup** (390×844px) centred on a grey background
- **No auth, no database, no real users**

---

## The agreed plan (chapters)

See `docs/PLAN.md` for full detail.

```
FOUNDATION     ✅ Complete — understood the codebase, set up workflow
CHAPTER 1      File architecture — break App.jsx into proper structure + first GitHub Actions
CHAPTER 2      Supabase — real data persistence
CHAPTER 3      Auth — real users, real data ownership
CHAPTER 4      Real AI — replace keyword matching with Claude API
CHAPTER 5      Polish — error handling, monitoring, README, CI/CD depth
CHAPTER 6      Portfolio — case study, interview prep
```

**Current position:** About to start Chapter 1.

---

## Custom slash commands (skills)

These are available in every session. Use them to enforce the workflow.

| Command | When to use it |
|---|---|
| `/status` | Start of every session — orient before doing anything |
| `/explore` | Start of every task — read before touching |
| `/plan` | After exploring — write the plan before building |
| `/build` | After plan is approved — execute step by step |
| `/review` | After building — check the work honestly |
| `/explain [concept]` | Whenever Rachita is confused — teach, don't just do |
| `/decision [description]` | When a meaningful choice is made — log it to DECISIONS.md |

The workflow is always: `/explore` → `/plan` → `/build` → `/review`
Log decisions as they happen with `/decision`.

---

## Conventions (to be followed in all code)

- No TypeScript yet — plain JavaScript is fine at this stage
- Inline styles are fine — consistent with existing codebase
- No new dependencies without discussing first
- Comments in plain English, not jargon
- Never add features beyond what's discussed in the session

---

## What NOT to do

- Do not commit `.env` — it contains Supabase secrets
- Do not push directly to `main` without testing locally first
- Do not refactor beyond what's planned for the current chapter
- Do not introduce TypeScript, testing frameworks, or new styling systems without discussion
- Do not skip the "explain before doing" step even for small changes
