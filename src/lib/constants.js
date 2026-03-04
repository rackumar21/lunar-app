// ─── Design system ────────────────────────────────────────────────────
export const C = {
  bg: "#F7F3EE", white: "#FFFFFF",
  primary: "#B86B4E", primaryLight: "#E8C4B0", primaryMuted: "#F2DDD4",
  rose: "#C97A8A", roseMuted: "#F0DDE2",
  accent: "#7A6E5F", accentLight: "#D4C9BB",
  sage: "#7A9E7E", sageMuted: "#D4E8D4",
  luteal: "#9E8A7A", lutealMuted: "#E8DDD4",
  text: "#28211E", textSec: "#6E5F57", textMuted: "#A89990",
  border: "#EAE4DC",
  success: "#7A9E7E", successMuted: "#D4E8D4",
  warning: "#C49A3C", warningMuted: "#F5EBD0",
  error: "#B85858", errorMuted: "#F0D8D8",
  comingSoon: "#8B7BAE", comingSoonMuted: "#EAE6F5",
};

export const F = {
  heading: "'Fraunces', Georgia, serif",
  body: "'Libre Franklin', system-ui, sans-serif",
};

// ─── Phase config ─────────────────────────────────────────────────────
// 28-day cycle: menstrual 1-5, follicular 6-13, ovulation 14-16, luteal 17-28
export const PHASES = [
  { name: "Menstrual", days: [1,2,3,4,5], color: C.primary, muted: C.primaryMuted, emoji: "🩸", startDeg: 0, endDeg: 64 },
  { name: "Follicular", days: [6,7,8,9,10,11,12,13], color: C.sage, muted: C.sageMuted, emoji: "🌱", startDeg: 64, endDeg: 167 },
  { name: "Ovulation", days: [14,15,16], color: C.accent, muted: C.accentLight, emoji: "✨", startDeg: 167, endDeg: 206 },
  { name: "Luteal", days: [17,18,19,20,21,22,23,24,25,26,27,28], color: C.luteal, muted: C.lutealMuted, emoji: "🌙", startDeg: 206, endDeg: 360 },
];

export const getPhaseForDay = (day) => PHASES.find(p => p.days.includes(day)) || PHASES[3];

export const PHASE_INSIGHTS = {
  "Menstrual": "Your body is doing the most right now. Energy is low by design — rest is productive.",
  "Follicular": "Oestrogen is rising. You may notice sharper focus and more optimism today.",
  "Ovulation": "Peak energy window. Good day for anything that needs your full presence.",
  "Luteal": "Energy begins to narrow. Your body is preparing — honour the need for quiet.",
};

// ─── Logging options ──────────────────────────────────────────────────
export const MOODS = [
  { label: "Energised", emoji: "⚡️" }, { label: "Happy", emoji: "🌸" },
  { label: "Calm", emoji: "🌿" }, { label: "Tired", emoji: "🌙" },
  { label: "Anxious", emoji: "🌊" }, { label: "Irritable", emoji: "🌩" },
];

export const SYMPTOMS = ["Bloating","Headache","Fatigue","Breast tenderness","Nausea","Back pain","Acne","Cravings"];
export const FLOW_OPTIONS = ["Spotting","Light","Medium","Heavy"];

export const PAIN_STEPS = [
  { label: "None", emoji: "😌" }, { label: "Mild", emoji: "😕" },
  { label: "Moderate", emoji: "😣" }, { label: "Strong", emoji: "😖" },
  { label: "Severe", emoji: "😭" },
];

// ─── Seed data ────────────────────────────────────────────────────────
export const PERIOD_HISTORY = [
  { start: "2024-10-09", end: "2024-10-14" },
  { start: "2024-11-06", end: "2024-11-11" },
  { start: "2024-12-04", end: "2024-12-09" },
  { start: "2025-01-01", end: "2025-01-06" },
  { start: "2025-01-29", end: "2025-02-03" },
  { start: "2025-02-26", end: null },
];

export const allPeriodDays = (() => {
  const days = [];
  PERIOD_HISTORY.forEach(({ start, end }) => {
    const s = new Date(start), e = end ? new Date(end) : new Date(start);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1))
      days.push(d.toISOString().slice(0, 10));
  });
  return days;
})();

export const PREDICTED_DAYS = ["2025-03-26","2025-03-27","2025-03-28","2025-03-29","2025-03-30"];
export const OVULATION_DAYS = ["2025-02-12","2025-02-13","2025-02-14","2025-03-12","2025-03-13","2025-03-14"];

export const SEED_LOGS = {
  "2025-02-26": { mood: "Tired", pain: 3, flow: "Heavy", symptoms: ["Fatigue","Bloating"], note: "First day, rough morning." },
  "2025-02-24": { mood: "Anxious", pain: 1, flow: null, symptoms: ["Headache"], note: "Stressful week at work." },
  "2025-02-20": { mood: "Energised", pain: 0, flow: null, symptoms: [], note: "Felt amazing today." },
  "2025-02-14": { mood: "Happy", pain: 0, flow: null, symptoms: [], note: "" },
  "2025-02-08": { mood: "Tired", pain: 3, flow: "Heavy", symptoms: ["Fatigue","Bloating"], note: "First day, rough morning." },
  "2025-02-09": { mood: "Tired", pain: 2, flow: "Heavy", symptoms: ["Fatigue"], note: "" },
  "2025-02-10": { mood: "Calm", pain: 1, flow: "Medium", symptoms: ["Bloating"], note: "" },
  "2025-01-29": { mood: "Tired", pain: 4, flow: "Heavy", symptoms: ["Fatigue"], note: "Really painful today." },
};

export const SEED_NOTES = [
  { date: "2025-02-26", text: "First day, rough morning." },
  { date: "2025-02-24", text: "Stressful week at work." },
  { date: "2025-01-29", text: "Really painful today." },
];

export const HORMONE_REPORTS = [
  {
    id: 1, date: "2025-02-14", title: "Hormone Panel — Feb 2025", flagCount: 1,
    markers: [
      { name: "Oestrogen (E2)", value: 210, unit: "pmol/L", low: 130, high: 400, status: "normal", trendNote: "↑ Improving — was Low in Nov, Normal now" },
      { name: "Progesterone", value: 1.2, unit: "nmol/L", low: 0.6, high: 4.7, status: "normal", trendNote: "↑ Recovering well" },
      { name: "LH", value: 3.1, unit: "IU/L", low: 2.4, high: 12.6, status: "normal", trendNote: "→ Stable" },
      { name: "FSH", value: 2.1, unit: "IU/L", low: 3.5, high: 12.5, status: "low", trendNote: "↓ Slightly low — worth monitoring" },
    ],
  },
  {
    id: 2, date: "2025-01-20", title: "Hormone Panel — Jan 2025", flagCount: 2,
    markers: [
      { name: "Oestrogen (E2)", value: 98, unit: "pmol/L", low: 130, high: 400, status: "low", trendNote: "↑ Low but improving" },
      { name: "Progesterone", value: 0.4, unit: "nmol/L", low: 0.6, high: 4.7, status: "low", trendNote: "↑ Trending upward" },
      { name: "LH", value: 4.2, unit: "IU/L", low: 2.4, high: 12.6, status: "normal", trendNote: "→ Stable" },
      { name: "FSH", value: 5.8, unit: "IU/L", low: 3.5, high: 12.5, status: "normal", trendNote: "→ Normal" },
    ],
  },
];

export const WATCH_LIST = [
  { name: "Oestrogen (E2)", status: "low", note: "Was low in Jan, now normal — keep monitoring" },
  { name: "FSH", status: "low", note: "Slightly below range in Feb" },
];

export const SEED = {
  cycleDay: 1, predictedCycleLength: 28,
  daysUntilNextPeriod: 28, nextPeriodDate: "26 Mar",
  isOnPeriod: true, todayLog: SEED_LOGS["2025-02-26"],
  defaultPeriodLength: 5, shareToken: "lnr_a7f2k9p3",
};

// ─── Navigation ───────────────────────────────────────────────────────
export const TABS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "calendar", label: "Timeline", icon: "◈" },
  { id: "ask", label: "Ask Lunar", icon: "🌙" },
  { id: "records", label: "Records", icon: "◧" },
];

// ─── Records ──────────────────────────────────────────────────────────
export const RECORD_CATEGORIES = ["Hormone Panel", "Full Blood Count", "Thyroid", "Iron Panel", "Vitamins & Minerals", "Other"];
