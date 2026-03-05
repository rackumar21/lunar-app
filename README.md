# Lunar — Personal Health Companion

A cycle tracking and AI health companion app built from scratch by a PM learning to build AI-native products.

**Live:** [lunar-app-beta.vercel.app](https://lunar-app-beta.vercel.app)

---

## What it does

Lunar lets users track their menstrual cycle, log daily symptoms and mood, upload hormone reports, and ask an AI assistant questions about their own health data.

- Log period days, symptoms, mood, pain, flow, and weight
- Cycle predictions based on real period history
- Ask Lunar (Claude-powered AI) questions about your cycle and logs
- Hormone report viewer
- Persistent chat history
- Secure login — each user sees only their own data

---

## Why I built it

I'm a PM who wanted to understand what it actually takes to build and ship an AI-native product — not just spec it out, but implement it end to end. Lunar is that project.

The goal wasn't to build a perfect app. It was to make every decision deliberately, understand the tradeoffs, and be able to talk about them like an engineer.

---

## Tech stack

| Layer | Tool | Why |
|---|---|---|
| UI | React 19 + Vite | Fast dev, industry standard |
| Database | Supabase (Postgres) | Real SQL, built-in auth, generous free tier |
| Auth | Supabase Auth | Row-level security — users can only access their own data |
| AI | Anthropic Claude API (claude-sonnet-4-6) | Real responses grounded in the user's actual health data |
| Hosting | Vercel | Auto-deploy from GitHub, zero config |

---

## Architecture

```
src/
  screens/       ← One file per screen (Home, Calendar, Ask Lunar, Records)
  components/    ← Shared UI components (modals, selectors)
  hooks/         ← Data logic (useAuth, useLogs, usePeriodDays)
  lib/           ← Constants, helpers, Supabase client
api/
  ask.js         ← Vercel serverless function — keeps API key server-side
```

The app started as a 1,000-line monolith (intentionally — prototypes should move fast). It was refactored into this structure once the product direction was validated.

---

## Key decisions

**Why Supabase over Firebase?**
Lunar's data is relational — logs belong to users, period days belong to cycles. Postgres is the right model for that. Firebase's NoSQL document structure would have made time-series queries awkward.

**Why not Next.js?**
A health app where users must log in doesn't need SEO. React + Vite is simpler, faster to develop, and sufficient for the use case. Next.js would add server-side complexity that isn't justified here.

**Why Claude API in a serverless function, not the browser?**
API keys must never ship to the browser — any user could extract them and use them at your expense. The serverless function runs server-side, keeps the key hidden, and proxies the request.

**Why optimistic UI updates?**
Waiting for Supabase to confirm before updating the UI adds 200–500ms of perceived lag. The app updates immediately and saves in the background — acceptable for health logs where data loss is unlikely.

**Why inline styles?**
The prototype used inline styles. Changing styling systems mid-project creates risk without proportional benefit. The tradeoff: no media queries or pseudo-classes without workarounds.

---

## What I learned

- How to think about data modelling (what tables, what columns, what belongs where)
- How auth and row-level security work end to end
- How to use an LLM API safely — context design, server-side execution, prompt engineering
- The difference between a prototype and a product, and when to cross that line
- How environment variables, serverless functions, and CI/CD pipelines work in practice
- How to debug a blank page (check the browser console first)

---

## Running locally

```bash
git clone https://github.com/rackumar21/lunar-app
cd lunar-app
npm install
```

Create a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
```

```bash
npm run dev
```

---

## What's next

- Error handling and graceful failures
- GitHub Actions for automated build checks
- Weight trend tracking across logs
- Mobile-responsive layout (currently renders as a phone mockup)
