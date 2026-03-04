---
name: decision
description: Log a decision to docs/DECISIONS.md. Use whenever a meaningful technical or product choice is made.
argument-hint: [brief description of the decision]
---

# Log a Decision

A decision has been made and needs to be recorded.

The decision to log: $ARGUMENTS

## Steps

1. Read docs/DECISIONS.md to find the last decision number (e.g. D007) so you can use the next one
2. Ask Rachita for any details needed to fill out the entry fully:
   - What options were considered?
   - What did we choose?
   - Why did we choose it?
   - What are the trade-offs?
   - What would make us reconsider this later?
   If $ARGUMENTS already contains enough detail, use it — don't ask unnecessarily.
3. Write the new entry to docs/DECISIONS.md in the established format (see below)
4. Confirm: "Decision D00X logged."

## Format to use

```
## D00X — [Short title of the decision]

**Date:** [Today's date]
**Decision:** One sentence — what was decided.

**Options considered:**
- Option A
- Option B
- Option C

**What we chose:** [The chosen option]

**Why:**
Plain English explanation of the reasoning. Include context specific to Lunar and where we are.

**The trade-off:** What we're giving up or accepting by making this choice.

**What we'd reconsider:** The condition under which this decision should be revisited.
```

## Remember
- Every significant choice deserves a log entry — not just technical ones. Product decisions count too.
- The goal is that future-Rachita (or anyone reading the code) understands not just WHAT was built but WHY.
- This is the document that makes her sound like an engineer in interviews.
- Keep language plain. No jargon without explanation.
