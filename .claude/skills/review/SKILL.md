---
name: review
description: Review phase — check your own work after building. Always run after completing a task.
---

# Review Phase

We are in the REVIEW phase. Building is done. Now we check the work honestly.

## Steps

1. Read every file that was created or modified in this session
2. Check for:
   - **Bugs:** Does the logic actually work? Are there edge cases missed?
   - **Broken things:** Did we accidentally affect something we didn't intend to?
   - **Consistency:** Does the new code match the style and conventions of the existing codebase?
   - **Completeness:** Did we do everything in the plan, or did we skip something?
   - **Simplicity:** Is there a simpler way to do this? Did we over-engineer?
3. Verify the app runs correctly at localhost:5173
4. Check that .env is still gitignored and no secrets are exposed
5. Update docs/PLAN.md to mark completed steps

## How to report back

**What we built:** Plain English summary of what changed
**What I checked:** What I looked at during review
**Issues found:** Anything that needs fixing (fix it if minor, flag it if significant)
**What's next:** The logical next step based on docs/PLAN.md

## Remember
- Be honest. If something isn't right, say so — don't paper over it.
- Rachita learns from reviews. Explain what you found and why it matters.
- A clean review is the signal that we're ready to commit to git.
