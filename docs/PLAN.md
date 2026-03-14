# Lunar — Project Plan

This document tracks our agreed learning and building roadmap.
Updated as chapters are completed or plans change.

---

## Goal

Build Lunar from a hardcoded prototype into a real product with a database, auth, and AI.
Along the way, learn to think like an engineer — not just follow instructions.

Career goal: use this project to demonstrate engineering thinking and product depth
for a better PM role at an AI-native company.

---

## The workflow we follow on every task

```
EXPLORATION  →  Read and understand before touching anything
PLAN         →  Write out what we'll do and why before doing it
BUILD        →  Execute the plan step by step
REVIEW       →  Check work, test locally, catch issues
```

---

## Status key

- ⬜ Not started
- 🔄 In progress
- ✅ Complete

---

## FOUNDATION ✅

**Goal:** Understand what exists. Set up the working environment and workflow.

- ✅ Read and understood App.jsx architecture
- ✅ Created CLAUDE.md, PLAN.md, ARCHITECTURE.md, DECISIONS.md
- ✅ Defined the full learning roadmap
- ✅ Installed Supabase (package.json), added .env to .gitignore

---

## CHAPTER 1 — File Architecture ✅

**Goal:** Break App.jsx (~1027 lines) into a proper, navigable file structure.
The app should look and work identically after. This is pure restructuring, no new features.

**Why this comes first:** Adding a database to a monolith makes debugging harder.
Understanding the structure first makes every future chapter easier and cleaner.

**What we'll learn:**
- What `export` and `import` mean — how files talk to each other
- What "components" are and how they receive information (props)
- What belongs where and why
- How to refactor safely without breaking things

**Target structure:**
```
src/
  lib/
    constants.js        ← Colors (C), fonts (F), phase config, seed data
    helpers.js          ← Date formatting, status color functions
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
  App.jsx               ← Now ~50 lines. Just imports and wires everything together.
```

**Milestone:** ✅ App runs identically at localhost:5173 with new file structure.

**Bonus:** Add a basic GitHub Actions workflow — checks that the build passes before Vercel deploys. ⬜ (deferred to Chapter 5)

---

## CHAPTER 2 — Supabase (Real Data) ✅

**Goal:** Data survives a page refresh. Logs, period history saved to a real database.

**Why this comes second:** File structure is clean, so Supabase integration has a clear home.

**What we'll learn:**
- What a database actually is (tables, rows, columns)
- How to model Lunar's data (what tables do we need?)
- Environment variables — what they are, why secrets don't go in code
- Async data fetching — what happens between "ask for data" and "receive data"
- How to replace hardcoded seed data with real database queries

**Key decisions to make:**
- What tables does Lunar need? (users, logs, cycles, reports?)
- What does each row look like?

**Milestone:** ✅ Log a symptom, refresh the page, it's still there.

---

## CHAPTER 3 — Authentication ✅

**Goal:** Real login. Real user. Each person sees only their own data.

**What we'll learn:**
- How auth works conceptually (sessions, tokens — no memorising, just understanding)
- Supabase Auth — email/password to start
- Row Level Security — how the database enforces "only you see yours"
- What "going from 1 user to N users" actually requires architecturally

**Milestone:** ✅ Sign up, log in, log out. Data is private per user.

---

## CHAPTER 4 — Real AI ✅

**Goal:** Replace the keyword-matching fake AI with a real Claude API call.

**What we'll learn:**
- How LLM APIs work — request/response, not magic
- Prompt engineering basics — how to give a model the right context
- How to safely pass a user's real health data to an AI
- What makes an AI feature genuinely useful vs. gimmicky
- Anthropic API setup and costs

**Milestone:** ✅ Ask Lunar a question about your actual logged data, get a real answer.

---

## CHAPTER 5 — Polish ✅

**Goal:** Make it look and behave like something a real engineer built.

**What we learned:**
- Error handling — what happens when Supabase is down or the AI times out?
- Error monitoring — Sentry, knowing when something breaks in production
- GitHub Actions — more sophisticated CI (lint checks, build checks)
- Analytics basics — what to track and why

**Completed:**
- ✅ README rewritten (professional, product-focused)
- ✅ PWA setup — installable on iPhone, custom moon icon, manifest.json
- ✅ Full-screen mobile layout (removed phone mockup)
- ✅ iOS keyboard behaviour fixed (blank screen, send button, header hiding)
- ✅ Persistent AI memory — Lunar learns health facts from conversations
- ✅ Toast error handling — non-blocking error UI with auto-dismiss
- ✅ Structured logger (logger.js) — all errors flow through one file, Sentry-ready
- ✅ Global catch-all — unhandled JS errors show a generic toast
- ✅ GitHub Actions CI — build check on every push to main
- ✅ Posthog analytics — AARRR-aligned event tracking, identified by user UUID
- ✅ PDF/image upload — Claude Vision extracts lab markers, saves to Supabase
- ✅ Multi-file upload — select multiple PDFs at once, parallel processing
- ✅ Auto-detect report category from extracted markers
- ✅ Trend notes — RecordDetailModal shows change vs previous report
- ✅ Delete report — inline confirmation (no browser popup)
- ✅ Inline delete confirmation — replaced window.confirm() with in-modal UI
- ✅ Drag-to-reorder reports — @dnd-kit, custom order saved to localStorage
- ✅ Report sort order fixed — newest date always first
- ✅ AI memories moved to Supabase — persist across devices, not just localStorage
- ✅ Supabase email redirect fixed — Site URL updated to production URL
- ✅ Cycle history edit — inline date pickers to correct period start/end dates
- ✅ Removed all v2 placeholder UI — Cycle Insights, Share link, Coming in V2 blocks
- ✅ Flow bug fixed — was silently saving "Medium" on every log, now defaults to null
- ✅ Calendar pill alignment fixed — consistent padding, border, lineHeight on buttons

**Milestone:** ✅ App handles failures gracefully. GitHub shows green checks. Events flow to Posthog. Lab reports upload, extract, and save end-to-end. App is clean — no placeholder UI, no silent data bugs.

---

## CHAPTER 6 — Portfolio 🔄

**Goal:** Turn this project into a career asset.

**What we'll produce:**
- Written case study: decisions made, tradeoffs, what I'd do differently at scale
- Interview talking points: how to explain each architectural decision
- GitHub profile: clean repo, good README, commit history that tells a story
- Personal narrative: "I'm a PM who can build" — backed by evidence

**Progress:**
- ✅ Portfolio repo created (rachita-portfolio, private) at ~/Work/rachita-portfolio
- ✅ TruthSeek repos cloned locally at ~/Work/truthseek for case study work
- ✅ CLAUDE.md written for portfolio repo — career context, JD research, target roles baked in
- ✅ docs/ seeded: MASTER-NARRATIVE.md, LUNAR-CASESTUDY.md, RESUME-BULLETS.md, INTERVIEW-PREP.md
- ✅ Custom slash commands made global (copied to ~/.claude/commands/) — now work in all sessions
- ⬜ Lunar case study written (templates exist, need content)
- ⬜ TruthSeek case study written (do in truthseek Claude session)
- ⬜ Cross-project interview narrative
- ⬜ Personal website built and deployed

---

## Open questions / decisions to revisit

- ~~Should we add a mobile-responsive layout or keep it as a phone mockup?~~ → Done. Full-screen mobile.
- When do we add a custom domain for lunar-app?
- Do we want Apple Health integration in scope for this project?
- When does Lunar go from "Rachita's project" to "a product with other users"?
- Should memories migrate from localStorage to Supabase (so they sync across devices)?
- Should users be able to view and edit their saved memories?
