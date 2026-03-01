import { useState, useRef, useEffect } from "react";

const C = {
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
const F = { heading: "'Fraunces', Georgia, serif", body: "'Libre Franklin', system-ui, sans-serif" };

// ─── Phase config ─────────────────────────────────────────────────────
// 28-day cycle: menstrual 1-5, follicular 6-13, ovulation 14-16, luteal 17-28
const PHASES = [
  { name: "Menstrual", days: [1,2,3,4,5], color: C.primary, muted: C.primaryMuted, emoji: "🩸", startDeg: 0, endDeg: 64 },
  { name: "Follicular", days: [6,7,8,9,10,11,12,13], color: C.sage, muted: C.sageMuted, emoji: "🌱", startDeg: 64, endDeg: 167 },
  { name: "Ovulation", days: [14,15,16], color: C.accent, muted: C.accentLight, emoji: "✨", startDeg: 167, endDeg: 206 },
  { name: "Luteal", days: [17,18,19,20,21,22,23,24,25,26,27,28], color: C.luteal, muted: C.lutealMuted, emoji: "🌙", startDeg: 206, endDeg: 360 },
];

const getPhaseForDay = (day) => PHASES.find(p => p.days.includes(day)) || PHASES[3];

const PHASE_INSIGHTS = {
  "Menstrual": "Your body is doing the most right now. Energy is low by design — rest is productive.",
  "Follicular": "Oestrogen is rising. You may notice sharper focus and more optimism today.",
  "Ovulation": "Peak energy window. Good day for anything that needs your full presence.",
  "Luteal": "Energy begins to narrow. Your body is preparing — honour the need for quiet.",
};

// ─── Seed data ────────────────────────────────────────────────────────
const MOODS = [
  { label: "Energised", emoji: "⚡️" }, { label: "Happy", emoji: "🌸" },
  { label: "Calm", emoji: "🌿" }, { label: "Tired", emoji: "🌙" },
  { label: "Anxious", emoji: "🌊" }, { label: "Irritable", emoji: "🌩" },
];
const SYMPTOMS = ["Bloating","Headache","Fatigue","Breast tenderness","Nausea","Back pain","Acne","Cravings"];
const FLOW_OPTIONS = ["Spotting","Light","Medium","Heavy"];
const PAIN_STEPS = [
  { label: "None", emoji: "😌" }, { label: "Mild", emoji: "😕" },
  { label: "Moderate", emoji: "😣" }, { label: "Strong", emoji: "😖" },
  { label: "Severe", emoji: "😭" },
];

const PERIOD_HISTORY = [
  { start: "2024-10-09", end: "2024-10-14" },
  { start: "2024-11-06", end: "2024-11-11" },
  { start: "2024-12-04", end: "2024-12-09" },
  { start: "2025-01-01", end: "2025-01-06" },
  { start: "2025-01-29", end: "2025-02-03" },
  { start: "2025-02-26", end: null },
];

const allPeriodDays = (() => {
  const days = [];
  PERIOD_HISTORY.forEach(({ start, end }) => {
    const s = new Date(start), e = end ? new Date(end) : new Date(start);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1))
      days.push(d.toISOString().slice(0, 10));
  });
  return days;
})();

const PREDICTED_DAYS = ["2025-03-26","2025-03-27","2025-03-28","2025-03-29","2025-03-30"];
const OVULATION_DAYS = ["2025-02-12","2025-02-13","2025-02-14","2025-03-12","2025-03-13","2025-03-14"];

const SEED_LOGS = {
  "2025-02-26": { mood: "Tired", pain: 3, flow: "Heavy", symptoms: ["Fatigue","Bloating"], note: "First day, rough morning." },
  "2025-02-24": { mood: "Anxious", pain: 1, flow: null, symptoms: ["Headache"], note: "Stressful week at work." },
  "2025-02-20": { mood: "Energised", pain: 0, flow: null, symptoms: [], note: "Felt amazing today." },
  "2025-02-14": { mood: "Happy", pain: 0, flow: null, symptoms: [], note: "" },
  "2025-02-08": { mood: "Tired", pain: 3, flow: "Heavy", symptoms: ["Fatigue","Bloating"], note: "First day, rough morning." },
  "2025-02-09": { mood: "Tired", pain: 2, flow: "Heavy", symptoms: ["Fatigue"], note: "" },
  "2025-02-10": { mood: "Calm", pain: 1, flow: "Medium", symptoms: ["Bloating"], note: "" },
  "2025-01-29": { mood: "Tired", pain: 4, flow: "Heavy", symptoms: ["Fatigue"], note: "Really painful today." },
};

const SEED_NOTES = [
  { date: "2025-02-26", text: "First day, rough morning." },
  { date: "2025-02-24", text: "Stressful week at work." },
  { date: "2025-01-29", text: "Really painful today." },
];

const HORMONE_REPORTS = [
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

const WATCH_LIST = [
  { name: "Oestrogen (E2)", status: "low", note: "Was low in Jan, now normal — keep monitoring" },
  { name: "FSH", status: "low", note: "Slightly below range in Feb" },
];

const SEED = {
  cycleDay: 1, predictedCycleLength: 28,
  daysUntilNextPeriod: 28, nextPeriodDate: "26 Mar",
  isOnPeriod: true, todayLog: SEED_LOGS["2025-02-26"],
  defaultPeriodLength: 5, shareToken: "lnr_a7f2k9p3",
};

// ─── AI ───────────────────────────────────────────────────────────────
const AI_SUGGESTIONS = [
  "What were my last 5 period start dates?",
  "What's my average cycle length?",
  "Which symptoms do I get most before my period?",
  "How has my Oestrogen changed?",
  "Am I regular?",
  "What was flagged in my last blood test?",
  "How long was my last period?",
  "Summarise my last hormone panel",
];

const genResponse = (q) => {
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

// ─── Helpers ──────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const fmt = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const fmtDay = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const todayKey = () => { const d = new Date("2025-02-26"); return toKey(d.getFullYear(), d.getMonth(), d.getDate()); };
const statusColor = (s) => ({ normal: C.success, low: C.error, high: C.warning }[s] || C.textMuted);
const statusBg = (s) => ({ normal: C.successMuted, low: C.errorMuted, high: C.warningMuted }[s] || C.border);
const statusLabel = (s) => ({ normal: "Normal", low: "Low", high: "High" }[s] || s);

// ─── Styles ───────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Libre+Franklin:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    button { border: none; cursor: pointer; font-family: 'Libre Franklin', sans-serif; }
    textarea, input { font-family: 'Libre Franklin', sans-serif; }
    ::-webkit-scrollbar { width: 0; height: 0; }
    .press { transition: transform 0.12s ease, opacity 0.12s ease; }
    .press:active { transform: scale(0.96); opacity: 0.82; }
    .fade-in { animation: fadeIn 0.18s ease; }
    .slide-up { animation: slideUp 0.28s cubic-bezier(0.32,0.72,0,1); }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  `}</style>
);

// ─── Shared ───────────────────────────────────────────────────────────
const Label = ({ children, mb = 10 }) => (
  <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: mb }}>{children}</p>
);
const Handle = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
    <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
  </div>
);
const CloseBtn = ({ onClose }) => (
  <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: C.border, color: C.textSec, fontSize: 13, flexShrink: 0, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
);
const ComingSoon = () => (
  <span style={{ padding: "2px 8px", borderRadius: 20, background: C.comingSoonMuted, color: C.comingSoon, fontFamily: F.body, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Coming soon</span>
);
const StatusPill = ({ status }) => (
  <span style={{ padding: "3px 9px", borderRadius: 20, background: statusBg(status), color: statusColor(status), fontFamily: F.body, fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
    <span style={{ fontSize: 8 }}>{status === "normal" ? "✓" : "⚠"}</span>{statusLabel(status)}
  </span>
);
const RangeBar = ({ value, low, high, status }) => {
  const min = low * 0.5, max = high * 1.5;
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const lp = ((low - min) / (max - min)) * 100;
  const hp = ((high - min) / (max - min)) * 100;
  return (
    <div style={{ position: "relative", height: 6, background: C.border, borderRadius: 3, marginTop: 8 }}>
      <div style={{ position: "absolute", left: `${lp}%`, width: `${hp - lp}%`, height: "100%", background: C.successMuted, borderRadius: 2 }} />
      <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", background: statusColor(status), border: `2px solid ${C.white}`, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
    </div>
  );
};
const PainSelector = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 6 }}>
    {PAIN_STEPS.map((s, i) => {
      const active = value === i;
      return (
        <button key={s.label} className="press" onClick={() => onChange(i)} style={{ flex: 1, padding: "10px 4px 8px", borderRadius: 12, border: `1.5px solid ${active ? C.primary : C.border}`, background: active ? C.primaryMuted : C.white, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 18 }}>{s.emoji}</span>
          <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 600, color: active ? C.primary : C.textMuted }}>{s.label}</span>
        </button>
      );
    })}
  </div>
);

// ─── Tab Bar ──────────────────────────────────────────────────────────
const TABS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "calendar", label: "Timeline", icon: "◈" },
  { id: "ask", label: "Ask Lunar", icon: "🌙" },
  { id: "records", label: "Records", icon: "◧" },
];
const TabBar = ({ active, onChange }) => (
  <div style={{ height: 64, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", flexShrink: 0, zIndex: 50 }}>
    {TABS.map((t) => (
      <button key={t.id} className="press" onClick={() => onChange(t.id)} style={{ flex: 1, paddingTop: 8, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: t.id === "ask" ? 18 : 16, color: active === t.id ? C.primary : C.textMuted }}>{t.icon}</span>
        <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: active === t.id ? C.primary : C.textMuted, textAlign: "center", lineHeight: 1.2 }}>{t.label}</span>
        {active === t.id && <div style={{ width: 16, height: 2, borderRadius: 1, background: C.primary }} />}
      </button>
    ))}
  </div>
);

// ─── Cycle Wheel ──────────────────────────────────────────────────────
const CycleWheel = ({ cycleDay, totalDays = 28 }) => {
  const size = 200;
  const cx = size / 2, cy = size / 2;
  const outerR = 88, innerR = 58;
  const phase = getPhaseForDay(cycleDay);

  // Draw arc segment
  const arc = (startDeg, endDeg, r1, r2, color, opacity = 1) => {
    const toRad = (d) => ((d - 90) * Math.PI) / 180;
    const s1 = toRad(startDeg), e1 = toRad(endDeg);
    const gap = 2;
    const gs = toRad(startDeg + gap), ge = toRad(endDeg - gap);
    const x1 = cx + r2 * Math.cos(gs), y1 = cy + r2 * Math.sin(gs);
    const x2 = cx + r2 * Math.cos(ge), y2 = cy + r2 * Math.sin(ge);
    const x3 = cx + r1 * Math.cos(ge), y3 = cy + r1 * Math.sin(ge);
    const x4 = cx + r1 * Math.cos(gs), y4 = cy + r1 * Math.sin(gs);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r2} ${r2} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 ${large} 0 ${x4} ${y4} Z`;
  };

  // Dot position for today
  const todayDeg = (cycleDay / totalDays) * 360 - 90;
  const todayRad = (todayDeg * Math.PI) / 180;
  const dotR = (outerR + innerR) / 2;
  const dotX = cx + dotR * Math.cos(todayRad);
  const dotY = cy + dotR * Math.sin(todayRad);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {/* Phase arcs */}
        {PHASES.map((p) => (
          <path key={p.name} d={arc(p.startDeg, p.endDeg, innerR, outerR, p.color)} fill={p.color} opacity={0.18} />
        ))}
        {/* Active phase arc — brighter */}
        {PHASES.map((p) => (
          p.name === phase.name &&
          <path key={p.name + "-active"} d={arc(p.startDeg, p.endDeg, innerR, outerR, p.color)} fill={p.color} opacity={0.55} />
        ))}
        {/* Today dot */}
        <circle cx={dotX} cy={dotY} r={9} fill={C.white} stroke={phase.color} strokeWidth={2.5} />
        <circle cx={dotX} cy={dotY} r={5} fill={phase.color} />
      </svg>
      {/* Centre text */}
      <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
        <p style={{ fontFamily: F.heading, fontSize: 30, fontWeight: 400, color: C.text, lineHeight: 1 }}>{cycleDay}</p>
        <p style={{ fontFamily: F.body, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginTop: 2 }}>Day</p>
        <p style={{ fontFamily: F.body, fontSize: 11, color: phase.color, fontWeight: 600, marginTop: 4 }}>{phase.emoji} {phase.name}</p>
      </div>
    </div>
  );
};

// ─── Log Modal ────────────────────────────────────────────────────────
const LogModal = ({ isOpen, onClose, isOnPeriod, existingLog, onSave, dateLabel }) => {
  const [mood, setMood] = useState(existingLog?.mood || null);
  const [pain, setPain] = useState(existingLog?.pain ?? 0);
  const [flow, setFlow] = useState(existingLog?.flow || "Medium");
  const [symptoms, setSymptoms] = useState(existingLog?.symptoms || []);
  const [note, setNote] = useState(existingLog?.note || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (existingLog) { setMood(existingLog.mood || null); setPain(existingLog.pain ?? 0); setFlow(existingLog.flow || "Medium"); setSymptoms(existingLog.symptoms || []); setNote(existingLog.note || ""); }
  }, [existingLog]);

  const toggle = (s) => setSymptoms((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const handleSave = () => { setSaved(true); setTimeout(() => { onSave({ mood, pain, flow, symptoms, note }); onClose(); setSaved(false); }, 500); };
  if (!isOpen) return null;
  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.bg, borderRadius: "22px 22px 0 0", maxHeight: "92vh", overflowY: "auto", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, color: C.text }}>Log symptoms</h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginTop: 2 }}>{dateLabel}</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "20px 20px 0" }}>
          <Label>Mood</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {MOODS.map((m) => (
              <button key={m.label} className="press" onClick={() => setMood(m.label)} style={{ padding: "7px 13px", borderRadius: 20, border: `1.5px solid ${mood === m.label ? C.primary : C.border}`, background: mood === m.label ? C.primaryMuted : C.white, fontFamily: F.body, fontSize: 12, color: mood === m.label ? C.primary : C.textSec, fontWeight: mood === m.label ? 600 : 400, display: "flex", alignItems: "center", gap: 5 }}>
                <span>{m.emoji}</span>{m.label}
              </button>
            ))}
          </div>
          <Label mb={12}>Pain / cramps</Label>
          <PainSelector value={pain} onChange={setPain} />
          <div style={{ height: 22 }} />
          {isOnPeriod && <>
            <Label>Flow</Label>
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              {FLOW_OPTIONS.map((f) => (
                <button key={f} className="press" onClick={() => setFlow(f)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: `1.5px solid ${flow === f ? C.rose : C.border}`, background: flow === f ? C.roseMuted : C.white, fontFamily: F.body, fontSize: 11, color: flow === f ? C.rose : C.textSec, fontWeight: flow === f ? 600 : 400 }}>{f}</button>
              ))}
            </div>
          </>}
          <Label>Symptoms</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {SYMPTOMS.map((s) => (
              <button key={s} className="press" onClick={() => toggle(s)} style={{ padding: "7px 13px", borderRadius: 20, border: `1.5px solid ${symptoms.includes(s) ? C.accent : C.border}`, background: symptoms.includes(s) ? C.accentLight : C.white, fontFamily: F.body, fontSize: 12, color: symptoms.includes(s) ? C.accent : C.textSec, fontWeight: symptoms.includes(s) ? 600 : 400 }}>{s}</button>
            ))}
          </div>
          <Label>Note (optional)</Label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else worth remembering..." rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, resize: "none", outline: "none", lineHeight: 1.6, marginBottom: 20 }} />
          <button className="press" onClick={handleSave} style={{ width: "100%", padding: "15px", borderRadius: 14, background: saved ? C.success : `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.white, transition: "background 0.3s" }}>
            {saved ? "✓ Saved" : "Save log"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Record Detail Modal ──────────────────────────────────────────────
const RecordDetailModal = ({ report, onClose }) => {
  if (!report) return null;
  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.bg, borderRadius: "22px 22px 0 0", maxHeight: "88vh", overflowY: "auto", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontFamily: F.heading, fontSize: 18, fontWeight: 400, color: C.text }}>{report.title}</h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginTop: 3 }}>{fmt(report.date)}</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "18px 20px 0" }}>
          {report.markers.map((m) => (
            <div key={m.name} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${m.status !== "normal" ? statusColor(m.status) + "44" : C.border}`, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</p>
                <StatusPill status={m.status} />
              </div>
              <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginBottom: 4 }}>
                <span style={{ fontFamily: F.heading, fontSize: 18, color: statusColor(m.status) }}>{m.value}</span> {m.unit} · Range: {m.low}–{m.high}
              </p>
              <RangeBar value={m.value} low={m.low} high={m.high} status={m.status} />
              {m.trendNote && <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>{m.trendNote}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Settings Modal ───────────────────────────────────────────────────
const SettingsModal = ({ isOpen, onClose, data, onUpdateSettings }) => {
  const [periodLen, setPeriodLen] = useState(data.defaultPeriodLength);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.white, borderRadius: "22px 22px 0 0", maxHeight: "90vh", overflowY: "auto", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, color: C.text }}>Settings</h3>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "20px 20px 0" }}>
          <Label mb={10}>Cycle length</Label>
          <div style={{ background: C.bg, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Predicted from your history</p>
            <p style={{ fontFamily: F.heading, fontSize: 24, color: C.text }}>28 <span style={{ fontSize: 12, color: C.textSec, fontFamily: F.body }}>days</span></p>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 3 }}>Based on last 4 cycles · updates automatically</p>
          </div>
          <Label mb={10}>Period length</Label>
          <div style={{ background: C.bg, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button className="press" onClick={() => periodLen > 2 && setPeriodLen(periodLen - 1)} style={{ width: 34, height: 34, borderRadius: 10, background: C.border, fontSize: 18, color: C.textSec }}>−</button>
              <span style={{ fontFamily: F.heading, fontSize: 24, color: C.text }}>{periodLen} <span style={{ fontSize: 12, color: C.textSec, fontFamily: F.body }}>days</span></span>
              <button className="press" onClick={() => periodLen < 10 && setPeriodLen(periodLen + 1)} style={{ width: 34, height: 34, borderRadius: 10, background: C.border, fontSize: 18, color: C.textSec }}>+</button>
            </div>
          </div>
          <button className="press" onClick={() => { onUpdateSettings({ defaultPeriodLength: periodLen }); setSaved(true); setTimeout(() => setSaved(false), 1500); }} style={{ width: "100%", padding: "13px", borderRadius: 12, marginBottom: 22, background: saved ? C.success : `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontSize: 13, fontWeight: 600, color: C.white, transition: "background 0.3s" }}>
            {saved ? "✓ Saved" : "Save settings"}
          </button>
          <Label mb={10}>Share link</Label>
          <div style={{ background: C.bg, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 22 }}>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, lineHeight: 1.6, marginBottom: 10 }}>Share with someone you trust. They see your phase and days until next period — nothing else.</p>
            <div style={{ background: C.white, borderRadius: 10, padding: "9px 12px", fontFamily: F.body, fontSize: 11, color: C.accent, wordBreak: "break-all", marginBottom: 10, border: `1px solid ${C.border}` }}>lunar.app/share/{data.shareToken}</div>
            <button className="press" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ width: "100%", padding: "10px", borderRadius: 10, background: copied ? C.success : C.primaryMuted, fontSize: 12, fontWeight: 600, color: copied ? C.white : C.primary }}>
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
          <Label mb={10}>Coming in V2</Label>
          {[
            { icon: "⌚", title: "Wearable Sync", desc: "Apple Health, Garmin — sleep, HRV, steps alongside your cycle." },
            { icon: "🔔", title: "Reminders", desc: "Gentle nudges to log, and heads-up before your period arrives." },
            { icon: "📊", title: "Pattern Insights", desc: "After 3 months, Lunar automatically surfaces your symptom patterns." },
          ].map((item) => (
            <div key={item.title} style={{ background: C.comingSoonMuted, borderRadius: 12, padding: "12px 14px", border: `1px dashed ${C.comingSoon}44`, marginBottom: 8, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <p style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.comingSoon }}>{item.title}</p>
                  <ComingSoon />
                </div>
                <p style={{ fontFamily: F.body, fontSize: 11, color: C.comingSoon, opacity: 0.8, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Screen: Home ─────────────────────────────────────────────────────
const HomeScreen = ({ data, onOpenLog, onTogglePeriod, onOpenSettings }) => {
  const phase = getPhaseForDay(data.cycleDay);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 0 16px" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>
            {new Date("2025-02-26").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 style={{ fontFamily: F.heading, fontSize: 24, fontWeight: 300, fontStyle: "italic", color: C.text, lineHeight: 1.2 }}>
            Good morning, Rachita ☀️
          </h1>
        </div>
        <button className="press" onClick={onOpenSettings} style={{ marginTop: 2, width: 34, height: 34, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>⚙️</button>
      </div>

      {/* Wheel */}
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
        <CycleWheel cycleDay={data.cycleDay} totalDays={data.predictedCycleLength} />
      </div>

      {/* Phase legend pills */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16, flexWrap: "wrap", padding: "0 20px" }}>
        {PHASES.map((p) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: p.name === phase.name ? p.color + "22" : "transparent", border: `1px solid ${p.name === phase.name ? p.color : C.border}` }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }} />
            <span style={{ fontFamily: F.body, fontSize: 10, color: p.name === phase.name ? p.color : C.textMuted, fontWeight: p.name === phase.name ? 600 : 400 }}>{p.name}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Log today — single clean button */}
        <button className="press" onClick={onOpenLog} style={{ width: "100%", padding: "13px 18px", borderRadius: 14, border: `1px solid ${data.todayLog ? C.primaryLight : C.border}`, background: data.todayLog ? C.primaryMuted : C.white, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{data.todayLog ? "✏️" : "✍️"}</span>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: data.todayLog ? C.primary : C.text }}>{data.todayLog ? "Today logged ✓" : "Log today"}</p>
              <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>{data.todayLog ? "Tap to edit" : "How are you feeling?"}</p>
            </div>
          </div>
          <span style={{ fontFamily: F.body, fontSize: 18, color: C.textMuted }}>›</span>
        </button>



        {/* Period toggle */}
        <button className="press" onClick={onTogglePeriod} style={{ width: "100%", padding: 14, borderRadius: 14, border: `1.5px dashed ${data.isOnPeriod ? C.rose : C.primaryLight}`, background: data.isOnPeriod ? C.roseMuted : "transparent", fontFamily: F.body, fontSize: 13, fontWeight: 500, color: data.isOnPeriod ? C.rose : C.textSec, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
          <span>{data.isOnPeriod ? "🔴" : "🩸"}</span>
          {data.isOnPeriod ? "End period" : "Start period"}
        </button>

        {/* Next period */}
        <div style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>Next period</p>
            <p style={{ fontFamily: F.heading, fontSize: 20, color: C.text }}>{data.nextPeriodDate}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: F.heading, fontSize: 30, color: C.primary, lineHeight: 1 }}>{data.daysUntilNextPeriod}</p>
            <p style={{ fontFamily: F.body, fontSize: 10, color: C.textMuted }}>days away</p>
          </div>
        </div>

        {/* Last 3 cycles */}
        <div style={{ marginBottom: 14 }}>
          <Label mb={10}>Last 3 cycles</Label>
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {[
              { label: "29 Jan – 26 Feb", cycleLength: 29, periodLength: 6, status: "normal" },
              { label: "1 Jan – 29 Jan", cycleLength: 28, periodLength: 6, status: "normal" },
              { label: "4 Dec – 1 Jan", cycleLength: 28, periodLength: 6, status: "normal" },
            ].map((cycle, i, arr) => (
              <div key={cycle.label} style={{ padding: "13px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginBottom: 3 }}>{cycle.label}</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>Cycle <span style={{ fontFamily: F.heading, fontSize: 14, color: C.text, fontWeight: 400 }}>{cycle.cycleLength}d</span></p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>Period <span style={{ fontFamily: F.heading, fontSize: 14, color: C.text, fontWeight: 400 }}>{cycle.periodLength}d</span></p>
                  </div>
                </div>
                <StatusPill status={cycle.status} />
              </div>
            ))}
          </div>
        </div>



        {/* Coming soon */}
        <div style={{ background: C.comingSoonMuted, borderRadius: 14, padding: "13px 15px", border: `1px dashed ${C.comingSoon}44`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <p style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.comingSoon }}>Cycle Insights</p>
              <ComingSoon />
            </div>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.comingSoon, opacity: 0.8, lineHeight: 1.5 }}>AI detects patterns across your cycles — "Headaches on Day 16–18 in 4 of 5 cycles."</p>
          </div>
          <span style={{ fontSize: 20, marginLeft: 10 }}>🔍</span>
        </div>
      </div>
    </div>
  );
};

// ─── Screen: Timeline Calendar ────────────────────────────────────────
const CalendarScreen = ({ logs, periodDays }) => {
  // Build array of days centred on today
  const TODAY = new Date("2025-02-26");
  const DAYS_BACK = 42, DAYS_FORWARD = 42;
  const days = [];
  for (let i = -DAYS_BACK; i <= DAYS_FORWARD; i++) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }

  const stripRef = useRef(null);
  const [selectedKey, setSelectedKey] = useState(days[DAYS_BACK]); // today

  useEffect(() => {
    if (stripRef.current) {
      const todayEl = stripRef.current.querySelector("[data-today='true']");
      if (todayEl) todayEl.scrollIntoView({ inline: "center", behavior: "instant" });
    }
  }, []);

  const getDayType = (key) => {
    if (periodDays.includes(key)) return "period";
    if (PREDICTED_DAYS.includes(key)) return "predicted";
    if (OVULATION_DAYS.includes(key)) return "ovulation";
    if (logs[key]) return "logged";
    return "none";
  };

  const dayColor = (type) => ({
    period: { bg: C.primary, text: C.white, border: "none" },
    predicted: { bg: C.primaryMuted, text: C.primary, border: `1.5px dashed ${C.primary}` },
    ovulation: { bg: C.sageMuted, text: C.sage, border: `1px solid ${C.sage}` },
    logged: { bg: C.white, text: C.text, border: `1px solid ${C.border}` },
    none: { bg: "transparent", text: C.textMuted, border: "none" },
  }[type] || { bg: "transparent", text: C.textMuted, border: "none" });

  const selectedLog = logs[selectedKey];
  const selectedType = getDayType(selectedKey);
  const isToday = selectedKey === days[DAYS_BACK];
  const isPeriodDay = periodDays.includes(selectedKey);

  // Group days by month for labels
  const getMonthLabel = (key) => new Date(key + "T12:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 12px", flexShrink: 0 }}>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>Your history</p>
        <h2 style={{ fontFamily: F.heading, fontSize: 24, fontWeight: 400, color: C.text }}>
          {getMonthLabel(selectedKey)}
        </h2>
      </div>

      {/* Timeline strip */}
      <div ref={stripRef} style={{ display: "flex", overflowX: "auto", padding: "0 20px 14px", gap: 6, flexShrink: 0 }}>
        {days.map((key, idx) => {
          const d = new Date(key + "T12:00:00");
          const dayNum = d.getDate();
          const dayName = d.toLocaleDateString("en-GB", { weekday: "narrow" });
          const type = getDayType(key);
          const style = dayColor(type);
          const isSelected = key === selectedKey;
          const isTod = key === days[DAYS_BACK];
          // Month separator
          const prevKey = days[idx - 1];
          const showMonth = idx === 0 || (prevKey && new Date(prevKey + "T12:00:00").getMonth() !== d.getMonth());

          return (
            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
              {showMonth && (
                <p style={{ fontFamily: F.body, fontSize: 8, fontWeight: 600, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", marginBottom: 4, alignSelf: "flex-start", paddingLeft: 2 }}>
                  {d.toLocaleDateString("en-GB", { month: "short" })}
                </p>
              )}
              {!showMonth && <div style={{ height: 16 }} />}
              <button
                data-today={isTod ? "true" : "false"}
                className="press"
                onClick={() => setSelectedKey(key)}
                style={{
                  width: 38, flexShrink: 0,
                  padding: "8px 0",
                  borderRadius: 12,
                  background: isSelected ? (style.bg === "transparent" ? C.white : style.bg) : style.bg,
                  border: isSelected ? `2px solid ${C.primary}` : style.border || "none",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  boxShadow: isSelected ? "0 2px 10px rgba(184,107,78,0.2)" : "none",
                  outline: "none",
                }}
              >
                <span style={{ fontFamily: F.body, fontSize: 9, color: isSelected ? C.primary : C.textMuted, fontWeight: 600, letterSpacing: "0.06em" }}>{dayName}</span>
                <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: isTod ? 700 : 500, color: isSelected ? C.primary : style.text }}>{dayNum}</span>
                {/* Dot for logged */}
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: type === "period" ? (isSelected ? C.white : C.white) : type === "logged" ? C.primary : type === "ovulation" ? C.sage : "transparent", opacity: type !== "none" && type !== "predicted" ? 0.8 : 0 }} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, padding: "0 20px 12px", flexShrink: 0, flexWrap: "wrap" }}>
        {[
          { color: C.primary, label: "Period" },
          { color: C.primary, label: "Predicted", dashed: true },
          { color: C.sage, label: "Ovulation" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.dashed ? C.primaryMuted : l.color, border: l.dashed ? `1.5px dashed ${l.color}` : "none" }} />
            <span style={{ fontFamily: F.body, fontSize: 10, color: C.textSec }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: C.border, flexShrink: 0 }} />

      {/* Day detail panel */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p style={{ fontFamily: F.heading, fontSize: 18, fontWeight: 400, color: C.text }}>{fmtDay(selectedKey)}</p>
            {isToday && <span style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, color: C.primary, background: C.primaryMuted, padding: "2px 8px", borderRadius: 20, marginTop: 4, display: "inline-block" }}>Today</span>}
            {isPeriodDay && !isToday && <span style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, color: C.rose, background: C.roseMuted, padding: "2px 8px", borderRadius: 20, marginTop: 4, display: "inline-block" }}>🩸 Period day</span>}
          </div>
        </div>

        {selectedLog ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedLog.mood && (
              <div style={{ background: C.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, marginBottom: 4 }}>Mood</p>
                <p style={{ fontFamily: F.body, fontSize: 13, color: C.text }}>{MOODS.find(m => m.label === selectedLog.mood)?.emoji} {selectedLog.mood}</p>
              </div>
            )}
            {selectedLog.pain > 0 && (
              <div style={{ background: C.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, marginBottom: 4 }}>Pain</p>
                <p style={{ fontFamily: F.body, fontSize: 13, color: C.text }}>{PAIN_STEPS[selectedLog.pain]?.emoji} {PAIN_STEPS[selectedLog.pain]?.label}</p>
              </div>
            )}
            {selectedLog.flow && (
              <div style={{ background: C.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, marginBottom: 4 }}>Flow</p>
                <p style={{ fontFamily: F.body, fontSize: 13, color: C.text }}>🩸 {selectedLog.flow}</p>
              </div>
            )}
            {selectedLog.symptoms?.length > 0 && (
              <div style={{ background: C.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, marginBottom: 8 }}>Symptoms</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedLog.symptoms.map(s => (
                    <span key={s} style={{ padding: "4px 10px", borderRadius: 20, background: C.accentLight, fontFamily: F.body, fontSize: 11, color: C.accent }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedLog.note && (
              <div style={{ background: C.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, marginBottom: 4 }}>Note</p>
                <p style={{ fontFamily: F.body, fontSize: 13, color: C.textSec, lineHeight: 1.6, fontStyle: "italic" }}>"{selectedLog.note}"</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <p style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 300, color: C.textMuted, marginBottom: 6 }}>Nothing logged</p>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>Tap a day to view or add a log</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Screen: Ask Lunar ────────────────────────────────────────────────
const AskLunarScreen = () => {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi Rachita! I know your full cycle history, symptoms, and health records. Ask me anything — no question is too detailed." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = (q) => {
    const question = q || input.trim();
    if (!question) return;
    setMessages((p) => [...p, { role: "user", text: question }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [...p, { role: "ai", text: genResponse(question) }]);
    }, 700 + Math.random() * 700);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "18px 20px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Your AI companion</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🌙</div>
          <div>
            <h2 style={{ fontFamily: F.heading, fontSize: 22, fontWeight: 400, color: C.text }}>Ask Lunar</h2>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.textSec }}>Knows your cycle, symptoms & records</p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ padding: "10px 16px", flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {AI_SUGGESTIONS.map((s) => (
            <button key={s} className="press" onClick={() => handleSend(s)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, fontFamily: F.body, fontSize: 11, color: C.textSec, whiteSpace: "nowrap" }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px 8px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 14, alignItems: "flex-end", gap: 8 }}>
            {msg.role === "ai" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🌙</div>
            )}
            <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? `linear-gradient(135deg, ${C.primary}, ${C.rose})` : C.white, border: msg.role === "ai" ? `1px solid ${C.border}` : "none" }}>
              <p style={{ fontFamily: F.body, fontSize: 13, color: msg.role === "user" ? C.white : C.text, lineHeight: 1.65, whiteSpace: "pre-line" }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🌙</div>
            <div style={{ padding: "11px 15px", borderRadius: "18px 18px 18px 4px", background: C.white, border: `1px solid ${C.border}` }}>
              <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted }}>Thinking…</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px 12px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", gap: 10, alignItems: "flex-end", background: C.bg }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask about your cycle, symptoms, or records…" rows={1} style={{ flex: 1, padding: "11px 14px", borderRadius: 20, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, resize: "none", outline: "none", lineHeight: 1.5 }} />
        <button className="press" onClick={() => handleSend()} style={{ width: 42, height: 42, borderRadius: "50%", background: input.trim() ? `linear-gradient(135deg, ${C.primary}, ${C.rose})` : C.border, fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: input.trim() ? C.white : C.textMuted }}>→</button>
      </div>
    </div>
  );
};

// ─── Upload Modal ─────────────────────────────────────────────────────
const RECORD_CATEGORIES = ["Hormone Panel", "Full Blood Count", "Thyroid", "Iron Panel", "Vitamins & Minerals", "Other"];

const UploadModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Hormone Panel");
  const [saved, setSaved] = useState(false);
  const canSave = title.trim() && date.trim();

  const handleSave = () => {
    if (!canSave) return;
    setSaved(true);
    setTimeout(() => {
      onSave({ title: title.trim(), date, category });
      onClose();
      setSaved(false);
      setTitle(""); setDate(""); setCategory("Hormone Panel");
    }, 500);
  };

  if (!isOpen) return null;
  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.bg, borderRadius: "22px 22px 0 0", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, color: C.text }}>Add record</h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginTop: 2 }}>Upload a new health document</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "20px 20px 0" }}>
          <Label mb={8}>Report name</Label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hormone Panel — March 2025"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: "none", marginBottom: 18 }}
          />
          <Label mb={8}>Date of test</Label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: "none", marginBottom: 18 }}
          />
          <Label mb={8}>Category</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {RECORD_CATEGORIES.map((cat) => (
              <button key={cat} className="press" onClick={() => setCategory(cat)} style={{ padding: "7px 13px", borderRadius: 20, border: `1.5px solid ${category === cat ? C.primary : C.border}`, background: category === cat ? C.primaryMuted : C.white, fontFamily: F.body, fontSize: 12, color: category === cat ? C.primary : C.textSec, fontWeight: category === cat ? 600 : 400 }}>
                {cat}
              </button>
            ))}
          </div>
          {/* File upload area */}
          <div style={{ width: "100%", padding: "20px", borderRadius: 14, border: `2px dashed ${C.border}`, background: C.white, textAlign: "center", marginBottom: 20, cursor: "pointer" }}>
            <p style={{ fontSize: 24, marginBottom: 6 }}>📎</p>
            <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 3 }}>Tap to attach file</p>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>PDF, JPG, or PNG · Max 10MB</p>
          </div>
          <button className="press" onClick={handleSave} style={{ width: "100%", padding: "15px", borderRadius: 14, background: !canSave ? C.border : saved ? C.success : `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: !canSave ? C.textMuted : C.white, transition: "background 0.3s", cursor: canSave ? "pointer" : "not-allowed" }}>
            {saved ? "✓ Saved" : "Save record"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Screen: Records ──────────────────────────────────────────────────
const RecordsScreen = ({ reports, onViewReport, onAddReport }) => (
  <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 20px 0" }}>
      <div>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>Health</p>
        <h2 style={{ fontFamily: F.heading, fontSize: 26, fontWeight: 400, color: C.text, marginBottom: 3 }}>Records</h2>
        <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec }}>Your personal health paper trail</p>
      </div>
      <button className="press" onClick={onAddReport} style={{ marginTop: 6, padding: "9px 14px", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontSize: 12, fontWeight: 600, color: C.white }}>+ Add</button>
    </div>

    {/* Watch list */}
    <div style={{ margin: "14px 20px 0", background: C.errorMuted, borderRadius: 14, padding: "12px 14px", border: `1px solid ${C.error}22` }}>
      <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.error, marginBottom: 10 }}>⚠ Watch list</p>
      {WATCH_LIST.map((item) => (
        <div key={item.name} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.text }}>{item.name}</span>
            <StatusPill status={item.status} />
          </div>
          <p style={{ fontFamily: F.body, fontSize: 11, color: C.textSec }}>{item.note}</p>
        </div>
      ))}
    </div>

    <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
      {reports.map((r) => (
        <div key={r.id} className="press" onClick={() => onViewReport(r)} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 16px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ flex: 1, marginRight: 10 }}>
              <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{r.title}</p>
              <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>{fmt(r.date)}</p>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 20, background: r.flagCount === 0 ? C.successMuted : C.errorMuted, color: r.flagCount === 0 ? C.success : C.error, fontFamily: F.body, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
              {r.flagCount === 0 ? "All normal" : `${r.flagCount} flagged`}
            </span>
          </div>
          {r.markers.filter(m => m.status !== "normal").map(m => (
            <span key={m.name} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: statusBg(m.status), fontFamily: F.body, fontSize: 11, color: statusColor(m.status), fontWeight: 600, marginRight: 6, marginBottom: 6 }}>
              {m.name} · {statusLabel(m.status)}
            </span>
          ))}
          <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 4 }}>Tap to view all markers →</p>
        </div>
      ))}
    </div>

    {/* Doctor visit mode coming soon */}
    <div style={{ margin: "12px 20px 0", background: C.comingSoonMuted, borderRadius: 14, padding: "13px 15px", border: `1px dashed ${C.comingSoon}44`, display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: 20 }}>🩺</span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <p style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.comingSoon }}>Doctor Visit Mode</p>
          <ComingSoon />
        </div>
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.comingSoon, opacity: 0.8, lineHeight: 1.5 }}>One tap: generate a clean summary of your cycles and flagged markers to show your GP.</p>
      </div>
    </div>
  </div>
);

// ─── Root ─────────────────────────────────────────────────────────────
export default function LunarApp() {
  const [tab, setTab] = useState("home");
  const [appData, setAppData] = useState(SEED);
  const [logs, setLogs] = useState(SEED_LOGS);
  const [notes, setNotes] = useState(SEED_NOTES);
  const [periodDays, setPeriodDays] = useState(allPeriodDays);
  const [reports] = useState(HORMONE_REPORTS);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logDate, setLogDate] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSaveLog = (log) => {
    const key = logDate || todayKey();
    setLogs((p) => ({ ...p, [key]: log }));
    if (log.note) setNotes((p) => [{ date: key, text: log.note }, ...p.filter(n => n.date !== key)]);
    if (key === todayKey()) setAppData((p) => ({ ...p, todayLog: log }));
    setLogDate(null);
  };

  const dayLabel = logDate
    ? new Date(logDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : new Date("2025-02-26").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <Styles />
      <div style={{ minHeight: "100vh", background: "#C8C0B8", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px 0" }}>
        <div style={{ width: 390, height: 844, background: C.bg, borderRadius: 50, boxShadow: "0 40px 100px rgba(0,0,0,0.28)", display: "flex", flexDirection: "column", position: "relative" }}>
          {/* Clip mask — only clips visual chrome, not content */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 50, overflow: "hidden", pointerEvents: "none", zIndex: 100 }} />

          {/* Status bar */}
          <div style={{ background: C.bg, padding: "14px 24px 0", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.text }}>9:41</span>
            <span style={{ fontFamily: F.body, fontSize: 11, color: C.text }}>●●● WiFi 🔋</span>
          </div>

          {/* Screens */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "0 0 0 0" }}>
            {tab === "home" && <HomeScreen data={appData} onOpenLog={() => { setLogDate(todayKey()); setIsLogOpen(true); }} onTogglePeriod={() => setAppData((p) => ({ ...p, isOnPeriod: !p.isOnPeriod }))} onOpenSettings={() => setIsSettingsOpen(true)} />}
            {tab === "calendar" && <CalendarScreen logs={logs} periodDays={periodDays} />}
            {tab === "ask" && <AskLunarScreen />}
            {tab === "records" && <RecordsScreen reports={reports} onViewReport={setSelectedReport} onAddReport={() => setIsUploadOpen(true)} />}
          </div>

          {/* Tab bar — sits outside overflow:hidden container so it's never clipped */}
          <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", height: 72, flexShrink: 0, paddingBottom: 10, borderRadius: "0 0 50px 50px" }}>
            {TABS.map((t) => (
              <button key={t.id} className="press" onClick={() => setTab(t.id)} style={{ flex: 1, paddingTop: 8, background: "transparent", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
                <span style={{ fontSize: t.id === "ask" ? 18 : 16, color: tab === t.id ? C.primary : C.textMuted }}>{t.icon}</span>
                <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: tab === t.id ? C.primary : C.textMuted, textAlign: "center", lineHeight: 1.2 }}>{t.label}</span>
                {tab === t.id && <div style={{ width: 16, height: 2, borderRadius: 1, background: C.primary }} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSave={(record) => { console.log("New record:", record); setIsUploadOpen(false); }} />
      <LogModal isOpen={isLogOpen} onClose={() => { setIsLogOpen(false); setLogDate(null); }} isOnPeriod={logDate ? periodDays.includes(logDate) : appData.isOnPeriod} existingLog={logDate ? logs[logDate] : appData.todayLog} onSave={handleSaveLog} dateLabel={dayLabel} />
      <RecordDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} data={appData} onUpdateSettings={(s) => setAppData((p) => ({ ...p, ...s }))} />
    </>
  );
}
