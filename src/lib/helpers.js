import { C } from "./constants";

const pad = (n) => String(n).padStart(2, "0");

export const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const fmt = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const fmtMonth = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { month: "short", year: "numeric" });
export const fmtShort = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const fmtDay = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const todayKey = () => { const d = new Date(); return toKey(d.getFullYear(), d.getMonth(), d.getDate()); };

export const statusColor = (s) => ({ normal: C.success, low: C.error, high: C.warning }[s] || C.textMuted);
export const statusBg = (s) => ({ normal: C.successMuted, low: C.errorMuted, high: C.warningMuted }[s] || C.border);
export const statusLabel = (s) => ({ normal: "Normal", low: "Low", high: "High" }[s] || s);

export const computeCycleData = (periodDays) => {
  const today = todayKey();
  const isOnPeriod = periodDays.includes(today);

  if (periodDays.length === 0) {
    return { isOnPeriod: false, cycleDay: null, daysUntilNextPeriod: null, nextPeriodDate: "—", predictedCycleLength: 28 };
  }

  const sorted = [...periodDays].sort();
  const daySet = new Set(sorted);

  // A period start is a day where the previous calendar day is NOT also a period day
  const starts = sorted.filter(d => {
    const prev = new Date(d + "T12:00:00");
    prev.setDate(prev.getDate() - 1);
    return !daySet.has(toKey(prev.getFullYear(), prev.getMonth(), prev.getDate()));
  });

  // Calculate average cycle length from gaps between consecutive period starts
  let predictedCycleLength = 28;
  if (starts.length >= 2) {
    const lengths = [];
    for (let i = 1; i < starts.length; i++) {
      const a = new Date(starts[i - 1] + "T12:00:00");
      const b = new Date(starts[i] + "T12:00:00");
      lengths.push(Math.round((b - a) / 86400000));
    }
    predictedCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  }

  const lastStart = starts[starts.length - 1];
  const lastStartDate = new Date(lastStart + "T12:00:00");
  const todayDate = new Date(today + "T12:00:00");

  const cycleDay = Math.max(1, Math.round((todayDate - lastStartDate) / 86400000) + 1);

  const nextPeriod = new Date(lastStartDate);
  nextPeriod.setDate(nextPeriod.getDate() + predictedCycleLength);

  const daysUntilNextPeriod = Math.max(0, Math.round((nextPeriod - todayDate) / 86400000));
  const nextPeriodDate = nextPeriod.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  // Generate predicted period days (next 2 cycles worth)
  const predictedDays = [];
  for (let cycle = 0; cycle < 2; cycle++) {
    const start = new Date(nextPeriod);
    start.setDate(start.getDate() + cycle * predictedCycleLength);
    for (let i = 0; i < 5; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      predictedDays.push(toKey(d.getFullYear(), d.getMonth(), d.getDate()));
    }
  }

  // Build cycle history from consecutive period starts (most recent first)
  const fmt = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const cycleHistory = [];
  for (let i = starts.length - 1; i >= 1; i--) {
    if (cycleHistory.length >= 6) break;
    const startDate = new Date(starts[i - 1] + "T12:00:00");
    const nextStartDate = new Date(starts[i] + "T12:00:00");
    const endOfCycle = new Date(nextStartDate);
    endOfCycle.setDate(endOfCycle.getDate() - 1);

    const cycleLength = Math.round((nextStartDate - startDate) / 86400000);

    // Count consecutive period days from this start
    let periodLength = 0;
    const d = new Date(startDate);
    while (daySet.has(toKey(d.getFullYear(), d.getMonth(), d.getDate()))) {
      periodLength++;
      d.setDate(d.getDate() + 1);
    }

    // Period end = start + periodLength - 1
    const periodEndDate = new Date(startDate);
    periodEndDate.setDate(periodEndDate.getDate() + Math.max(periodLength - 1, 0));
    const periodLabel = periodLength > 0
      ? `${fmt(starts[i - 1])} – ${fmt(periodEndDate.toISOString().slice(0, 10))}`
      : fmt(starts[i - 1]);

    cycleHistory.push({
      label: periodLabel,
      cycleLength,
      periodLength: periodLength || null,
    });
  }

  // Add the most recent (current) cycle as the first entry — it won't appear in the loop above
  // because there's no next start to close it yet
  // (lastStart and lastStartDate are already declared above)
  let currentPeriodLength = 0;
  const cd = new Date(lastStartDate);
  while (daySet.has(toKey(cd.getFullYear(), cd.getMonth(), cd.getDate()))) {
    currentPeriodLength++;
    cd.setDate(cd.getDate() + 1);
  }
  const currentPeriodEnd = new Date(lastStartDate);
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + Math.max(currentPeriodLength - 1, 0));
  const currentLabel = currentPeriodLength > 0
    ? `${fmt(lastStart)} – ${fmt(currentPeriodEnd.toISOString().slice(0, 10))}`
    : fmt(lastStart);
  cycleHistory.unshift({
    label: currentLabel,
    cycleLength: null, // cycle not complete yet
    periodLength: currentPeriodLength || null,
    current: true,
  });

  return { isOnPeriod, cycleDay, daysUntilNextPeriod, nextPeriodDate, predictedCycleLength, predictedDays, cycleHistory };
};
