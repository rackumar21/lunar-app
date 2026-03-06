# Lunar — Decision Log

Every meaningful technical or product decision, with the reasoning behind it.
This is the document that makes you sound like an engineer in interviews.
The question "why did you choose X over Y?" is answered here.

Format: Decision → Options considered → What we chose → Why

---

## D001 — React + Vite over other frameworks

**Date:** Project start (Feb 2025)
**Decision:** Use React 19 with Vite as the build tool.

**Options considered:**
- React + Vite
- Next.js (React with server-side rendering)
- Vue or Svelte

**What we chose:** React + Vite

**Why:**
React is the dominant UI framework in industry — the most job-relevant choice.
Vite is the fastest local development experience available.
Next.js adds server-side complexity (API routes, server components) that isn't needed at prototype stage.
Vue and Svelte are excellent but have smaller ecosystems and are less relevant for career positioning.

**What we'd reconsider:** If Lunar needed SEO (search engines finding the app), we'd switch to Next.js.
A health tracking app where users log in doesn't need SEO — so React + Vite stays.

---

## D002 — Everything in one file for the prototype

**Date:** Project start (Feb 2025)
**Decision:** Build the entire prototype in a single `App.jsx` file.

**Options considered:**
- Start with good file structure from the beginning
- Start with one file and restructure later

**What we chose:** One file first.

**Why:**
The goal of a prototype is to answer: "does this feel right?" — not "is this well-structured?"
Speed matters at prototype stage. A single file means zero mental overhead about where things live.
Restructuring is a known, mechanical task. Validating product direction is the harder, more valuable task.
This is a deliberate choice, not an accident.

**The trade-off:** One file becomes hard to navigate as it grows. At ~1000 lines, we've hit that limit.
Chapter 1 addresses this.

---

## D003 — Supabase over Firebase or PlanetScale

**Date:** March 2025 (session 1)
**Decision:** Use Supabase as the backend (database + auth + storage).

**Options considered:**
- Supabase (Postgres + Auth + Storage, open source)
- Firebase (Google's backend, NoSQL)
- PlanetScale (MySQL, serverless)
- Building our own backend (Node.js + Express)

**What we chose:** Supabase

**Why:**
- **Postgres** is the database the industry uses. Learning Supabase means learning real SQL.
- Firebase uses a NoSQL document model that's harder to query for the kind of data Lunar has (time-series health data, relationships between users and logs).
- PlanetScale is excellent but requires more setup and doesn't include auth.
- Building our own backend is a Chapter 6 problem, not a Chapter 2 problem.
- Supabase has a generous free tier and excellent documentation.
- Supabase Auth is built in — one tool handles database + login.

**The trade-off:** Supabase's free tier has limits (500MB database, 50,000 monthly active users).
More than enough for Lunar at this stage. We revisit if we scale.

---

## D004 — File architecture approach (Chapter 1)

**Date:** March 2025 (session 1)
**Decision:** Break App.jsx into components, screens, lib folders.

**Options considered:**
- Feature-based folders (group by feature: `/cycle`, `/logs`, `/records`)
- Type-based folders (group by what it is: `/components`, `/screens`, `/lib`)
- Flat structure (everything in `/src`, no sub-folders)

**What we chose:** Type-based folders to start.

**Why:**
At Lunar's current size, type-based is easier to navigate — you know exactly where to look.
Feature-based makes more sense when there are 20+ features that each have their own complex logic.
Flat structure stops scaling quickly.

**What we'd reconsider:** If Lunar grows significantly, we'd move to feature-based
(e.g., `src/features/cycle/`, `src/features/logs/`). That's a future decision.

---

## D005 — Inline styles over CSS modules or Tailwind

**Date:** Project start (Feb 2025)
**Decision:** Use inline styles (JavaScript style objects) throughout.

**Options considered:**
- Inline styles (`style={{ color: 'red' }}`)
- CSS Modules (`.module.css` files)
- Tailwind CSS (utility classes)

**What we chose:** Inline styles (already in place, maintaining consistency)

**Why:**
The prototype was built with inline styles. Changing styling systems mid-project creates risk
and effort that isn't justified by the benefit at this stage.
Inline styles are self-contained per component — you can read one component file and understand
exactly what it looks like without hunting through CSS files.

**The trade-off:** Inline styles don't support media queries, pseudo-classes (:hover, :focus)
without workarounds, and can get verbose. For a phone-mockup app, this is manageable.

**What we'd reconsider:** If we build a responsive web version, we'd migrate to Tailwind or CSS Modules.

---

## D006 — Vercel for hosting

**Date:** Project start (Feb 2025)
**Decision:** Host on Vercel with GitHub auto-deploy.

**Why:**
Zero configuration. Push to GitHub → live in 60 seconds.
Free tier is generous. Custom domains supported.
Industry standard for React/Next.js deployments.
Auto-deploy from `main` is the right default for a solo builder.

**Enterprise equivalent:** A company would use GitHub Actions to run tests and checks
before Vercel deploys. We'll add this in Chapter 1.

---

## D008 — user_id added as nullable in Chapter 2, not Chapter 3

**Date:** March 2026
**Decision:** Include `user_id uuid` column in `daily_logs` and `period_days` tables from the start, even though auth doesn't exist yet.

**Options considered:**
- Leave user_id out entirely, add it via ALTER TABLE in Chapter 3
- Add it now as nullable (can be empty until auth is wired up)

**What we chose:** Add it now as nullable.

**Why:**
Adding a column to a table that already has data requires a migration — more complex than getting it right the first time. Since the tables were empty when we made this decision, dropping and recreating was clean and free. In Chapter 3, we'll make user_id required and tie it to real Supabase Auth user IDs.

**The trade-off:** user_id will be null for all rows until Chapter 3. That's fine — no real users yet.

**What we'd reconsider:** If we had real user data already in the table, we'd use ALTER TABLE instead of drop and recreate.

---

## D009 — Optimistic updates for log saving

**Date:** March 2026
**Decision:** Update the UI immediately when saving a log, without waiting for Supabase to confirm.

**Options considered:**
- Wait for Supabase response before updating UI (safe but feels slow)
- Update UI immediately, save to Supabase in the background (optimistic)

**What we chose:** Optimistic updates.

**Why:**
Waiting for a server response adds 200–500ms of lag that makes the app feel unresponsive. Optimistic updates make the app feel instant. If the save fails, we log the error — acceptable for now since data loss is unlikely on a stable connection.

**What we'd add later:** Proper error handling that rolls back the UI if Supabase returns an error.

---

## D010 — PWA over native app

**Date:** March 2026
**Decision:** Make Lunar installable as a Progressive Web App (PWA) rather than building a native iOS/Android app.

**Options considered:**
- Native iOS app (Swift/Xcode)
- React Native (cross-platform native)
- PWA (installable web app)

**What we chose:** PWA

**Why:** No app store submission, no review process, no separate codebase. The same React code that runs in the browser installs to the home screen. For a solo builder proving a concept, this is the right call. A PWA has all the same limitations as a mobile website (no push notifications on iOS, no background sync) but for Lunar's current use case it's sufficient.

**Trade-off:** iOS PWAs have limitations Safari doesn't: no push notifications, limited background behaviour. If Lunar ever needs to remind users about period predictions, we'd need native or a service like OneSignal.

---

## D011 — iOS keyboard handling approach

**Date:** March 2026
**Decision:** Three-part fix for iOS keyboard resize in the Ask Lunar chat screen.

**What we tried and rejected:**
1. `interactive-widget=overlays-content` in viewport meta — only works on Android Chrome, ignored on iOS
2. `onFocus`/`onBlur` to detect keyboard — caused layout shift when tapping the send button (blur fires before the tap registers)
3. `window.innerHeight - visualViewport.height > 150` comparison — unreliable because on some iOS Chrome versions both values change together

**What we chose (and why it works):**
- `textarea font-size: 16px` — iOS auto-zooms the entire page when any input is smaller than 16px. This was the root cause of the initial zoom issue.
- `window.scrollTo(0, 0)` in the visualViewport resize handler — iOS Chrome secretly scrolls the page up when keyboard opens, even with `position: fixed` layout. Resetting to 0 immediately undoes that.
- `onPointerDown={(e) => e.preventDefault()}` on the send button — prevents the textarea from losing focus when tapping send, so the keyboard stays open.
- `INITIAL_HEIGHT` (captured at mount) vs `visualViewport.height` for keyboard detection — more reliable than comparing two live values.

---

## D012 — localStorage for AI memory (not Supabase)

**Date:** March 2026
**Decision:** Store Lunar's learned memories about the user in `localStorage`, not in Supabase.

**Options considered:**
- Supabase `user_memories` table (persistent across devices, requires migration)
- localStorage keyed by user ID (device-local, no migration needed)

**What we chose:** localStorage

**Why:** Faster to ship, no database migration required, no new API endpoints. The data is per-user (keyed by `lunar_memory_{userId}`) so it doesn't leak between accounts. The main downside — memories lost if you clear your browser or switch devices — is acceptable for an MVP. Migration to Supabase is straightforward if needed later.

---

## D013 — Parallel API calls for memory extraction

**Date:** March 2026
**Decision:** Run memory extraction and answer generation as two parallel API calls, not sequential.

**Options considered:**
- Sequential: generate answer → then extract facts (adds 300–500ms latency)
- Single call with structured JSON output (brittle — model sometimes ignores format)
- Parallel: `Promise.all([answerCall, memoryCall])` — both run at once

**What we chose:** Parallel calls using `Promise.all`.

**Why:** Zero added latency for the user — both calls complete in the same time as a single call. The memory extraction uses `claude-haiku-4-5-20251001` (cheap, fast, focused) while the main answer uses `claude-sonnet-4-6`. Total cost increase per message is negligible.

---

## D014 — PDF extraction: Sonnet over Haiku, 16K token limit

**Date:** March 2026
**Decision:** Use `claude-sonnet-4-6` with `max_tokens: 16384` for lab report extraction.

**Options considered:**
- `claude-haiku-4-5-20251001` with 4096 tokens (original — fast, cheap)
- `claude-sonnet-4-6` with 8192 tokens (interim attempt)
- `claude-sonnet-4-6` with 16384 tokens (final)

**What we chose:** Sonnet + 16384 tokens

**Why:**
A real full-body checkup (Dr Lal PathLabs, 17 pages) has ~107 markers. The extracted JSON is ~9800 characters. At roughly 4 chars per token, that's ~2450 tokens just for data — but with marker names, units, and JSON structure overhead, 8192 tokens wasn't enough. The JSON was being cut off mid-object, causing a parse failure and "0 markers found".

Haiku was also less reliable at following the complex extraction prompt (skipping urine microscopy, correctly identifying null status vs normal). Sonnet follows the instructions more precisely.

**Trade-off:** Sonnet costs ~3–5x more per call than Haiku. For a personal health app processing occasional lab reports, this is negligible. If Lunar scaled to thousands of uploads per day, we'd revisit with prompt optimisation to reduce output size.

**Lesson:** Always size `max_tokens` to the maximum realistic output, not a round number. "0 markers found" with no obvious error is a classic sign of silent truncation.

---

## D015 — Auto-detect report category from extracted markers

**Date:** March 2026
**Decision:** Remove the manual category selector from UploadModal. Infer category automatically from which markers Claude extracted.

**Options considered:**
- Keep manual selector (user picks Hormone Panel / Thyroid / etc.)
- Auto-detect from marker names using keyword matching

**What we chose:** Auto-detect

**Why:**
The user uploads a PDF and has already told us what's in it by choosing the file. Asking them to also categorise it is friction with no benefit — Claude just read the whole thing and knows exactly what's in it. Keyword matching on marker names (LH, FSH → Hormone Panel; TSH, T3 → Thyroid; Vitamin B12 → Vitamins & Minerals) is reliable enough for the current category set.

**Trade-off:** If a report has both hormones and thyroid markers (common in full panels), it gets labelled "Hormone Panel" due to priority order. Acceptable for now.

---

## D007 — No TypeScript (for now)

**Date:** March 2025 (session 1)
**Decision:** Stay with plain JavaScript, no TypeScript.

**Why:**
TypeScript adds safety for large teams and codebases. For a solo builder learning fundamentals,
it adds cognitive overhead without proportional benefit at this stage.
The goal is to understand what we're building, not to get blocked by type errors.

**When we'd reconsider:** Chapter 6 / portfolio phase, or if bringing in a collaborator.
TypeScript in the codebase signals maturity. Worth adding before the portfolio is final.
