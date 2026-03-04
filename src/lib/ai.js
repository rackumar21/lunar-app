// ─── AI ───────────────────────────────────────────────────────────────
// Currently: keyword-matching simulation. Replaced with real Claude API in Chapter 4.

export const AI_SUGGESTIONS = [
  "What were my last 5 period start dates?",
  "What's my average cycle length?",
  "Which symptoms do I get most before my period?",
  "How has my Oestrogen changed?",
  "Am I regular?",
  "What was flagged in my last blood test?",
  "How long was my last period?",
  "Summarise my last hormone panel",
];

export const genResponse = (q) => {
  const ql = q.toLowerCase();
  if (ql.includes("last 5 period") || (ql.includes("period") && ql.includes("start")))
    return "Your last 5 period start dates:\n\n• 26 Feb 2025 (current)\n• 29 Jan 2025\n• 1 Jan 2025\n• 4 Dec 2024\n• 6 Nov 2024\n\nArriving every 27–29 days — very consistent ☀️";
  if (ql.includes("average cycle"))
    return "Based on your last 5 cycles:\n\n📊 Average: 28 days\nShortest: 27 days\nLongest: 29 days\n\nYou're remarkably regular.";
  if (ql.includes("symptom") && (ql.includes("before") || ql.includes("most")))
    return "Most common pre-period symptoms:\n\n1. 🌙 Fatigue — 5 of 5 cycles\n2. 🤕 Headache — 3 of 5 cycles\n3. 🫨 Bloating — 3 of 5 cycles\n\nFatigue is your most reliable signal.";
  if (ql.includes("oestrogen") || ql.includes("estrogen"))
    return "Oestrogen (E2) trend:\n\n• Nov 2024: 82 pmol/L — Low ⬇️\n• Jan 2025: 98 pmol/L — Improving ↗️\n• Feb 2025: 210 pmol/L — Normal ✅\n\nA 2.5x increase in 3 months. Strongly positive.";
  if (ql.includes("regular") || ql.includes("irregular"))
    return "Your cycle variation is just 2 days across 5 cycles (27–29 days). Clinically, anything under 7 days variation is regular. You're very consistent. ✅";
  if (ql.includes("flagged") || ql.includes("blood test") || ql.includes("markers"))
    return "Flagged markers across all panels:\n\n🔴 Oestrogen — Low in Nov + Jan, now Normal ✅\n🔴 Progesterone — Low in Nov + Jan, now Normal ✅\n🔴 FSH — Was normal, now Low ⚠️\n\nFSH declining is the one to watch.";
  if (ql.includes("how long") || ql.includes("last period"))
    return "Your last completed period (29 Jan – 3 Feb) lasted 6 days. Your average is 5.4 days — slightly longer than usual but within normal range.";
  if (ql.includes("summarise") || ql.includes("summarize") || ql.includes("panel"))
    return "Feb 2025 hormone panel:\n\n✅ Oestrogen: 210 pmol/L — Normal\n✅ Progesterone: 1.2 nmol/L — Normal\n✅ LH: 3.1 IU/L — Normal\n🔴 FSH: 2.1 IU/L — Low\n\nDiscuss FSH with your GP.";
  return "Based on your data: cycle is very regular at ~28 days, periods lasting 6 days. Most recent hormone panel showed improving Oestrogen and Progesterone, with FSH worth monitoring. What would you like to know more about?";
};
