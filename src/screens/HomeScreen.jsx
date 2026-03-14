import { useState } from "react";
import { C, F, PHASES, PHASE_INSIGHTS, getPhaseForDay } from "../lib/constants";
import CycleWheel from "../components/CycleWheel";
import PeriodLogModal from "../components/PeriodLogModal";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const HomeScreen = ({ data, onOpenLog, onOpenSettings, userName, onBatchAddPeriodDays, onRemovePeriodDay, isDesktop }) => {
  const phase = data.isOnPeriod ? PHASES[0] : (data.cycleDay ? getPhaseForDay(data.cycleDay) : null);

  // Compute avg cycle and period length from history (for the stats cards)
  const history = data.cycleHistory || [];
  const completedCycles = history.filter(c => c.cycleLength > 0);
  const avgCycle = completedCycles.length > 0 ? Math.round(completedCycles.reduce((s, c) => s + c.cycleLength, 0) / completedCycles.length) : null;
  const avgPeriod = history.length > 0 ? Math.round(history.reduce((s, c) => s + (c.periodLength || 0), 0) / history.filter(c => c.periodLength).length) : null;
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  const handleEndToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    onRemovePeriodDay(today);
  };

  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const phasePills = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {PHASES.map((p) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: phase && p.name === phase.name ? p.color + "22" : "transparent", border: `1px solid ${phase && p.name === phase.name ? p.color : C.border}` }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          <span style={{ fontFamily: F.body, fontSize: 10, color: phase && p.name === phase.name ? p.color : C.textMuted, fontWeight: phase && p.name === phase.name ? 600 : 400 }}>{p.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 0 16px" }}>

      {isDesktop ? (
        // ── Desktop: centered dashboard, max 1100px ─────────────────────────
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>

          {/* Header */}
          <div style={{ padding: "28px 48px 24px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>{dateStr}</p>
            <h1 style={{ fontFamily: F.heading, fontSize: 28, fontWeight: 300, color: C.text }}>{greeting()}, {userName} ☀️</h1>
          </div>

          {/* 2-column body */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

            {/* Left panel */}
            <div style={{ flex: "0 0 340px", borderRight: `1px solid ${C.border}`, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
              <CycleWheel cycleDay={data.cycleDay} totalDays={data.predictedCycleLength} isOnPeriod={data.isOnPeriod} size={230} />
              {phasePills}
              {phase && (
                <div style={{ padding: "12px 14px", background: phase.color + "12", borderRadius: 12, border: `1px solid ${phase.color}25` }}>
                  <p style={{ fontFamily: F.body, fontSize: 12, color: C.text, lineHeight: 1.7 }}>{PHASE_INSIGHTS[phase.name]}</p>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Log today */}
              <button className="press" onClick={onOpenLog} style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: `1px solid ${data.todayLog ? C.primaryLight : C.border}`, background: data.todayLog ? C.primaryMuted : C.white, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{data.todayLog ? "✏️" : "✍️"}</span>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: data.todayLog ? C.primary : C.text }}>{data.todayLog ? "Today logged ✓" : "Log today"}</p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>{data.todayLog ? "Click to edit your entry" : "How are you feeling today?"}</p>
                  </div>
                </div>
                <span style={{ fontFamily: F.body, fontSize: 18, color: C.textMuted }}>›</span>
              </button>

              {/* Period + Next period */}
              <div style={{ display: "flex", gap: 12 }}>
                <button className="press" onClick={() => setIsPeriodModalOpen(true)} style={{ flex: 1, padding: "14px 18px", borderRadius: 14, border: `1.5px dashed ${data.isOnPeriod ? C.rose : C.primaryLight}`, background: data.isOnPeriod ? C.roseMuted : "transparent", fontFamily: F.body, fontSize: 13, fontWeight: 500, color: data.isOnPeriod ? C.rose : C.textSec, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                  <span>{data.isOnPeriod ? "🔴" : "🩸"}</span>
                  {data.isOnPeriod ? "Period ongoing · click to edit" : "Log period"}
                </button>
                <div style={{ flex: 1, background: C.white, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>Next period</p>
                    <p style={{ fontFamily: F.heading, fontSize: 18, color: C.text }}>{data.nextPeriodDate ?? "—"}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: F.heading, fontSize: 28, color: C.primary, lineHeight: 1 }}>{data.daysUntilNextPeriod ?? "—"}</p>
                    <p style={{ fontFamily: F.body, fontSize: 10, color: C.textMuted }}>days away</p>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${[data.cycleDay, avgCycle, avgPeriod].filter(Boolean).length || 1}, 1fr)`, gap: 12 }}>
                {data.cycleDay && (
                  <div style={{ background: C.white, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.border}` }}>
                    <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Cycle Day</p>
                    <p style={{ fontFamily: F.heading, fontSize: 28, color: C.text, lineHeight: 1 }}>{data.cycleDay}</p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 4 }}>of ~{data.predictedCycleLength} days</p>
                  </div>
                )}
                {avgCycle && (
                  <div style={{ background: C.white, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.border}` }}>
                    <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Avg Cycle</p>
                    <p style={{ fontFamily: F.heading, fontSize: 28, color: C.text, lineHeight: 1 }}>{avgCycle}<span style={{ fontSize: 13, color: C.textMuted }}> d</span></p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 4 }}>from {completedCycles.length} cycles</p>
                  </div>
                )}
                {avgPeriod && (
                  <div style={{ background: C.white, borderRadius: 14, padding: "14px 18px", border: `1px solid ${C.border}` }}>
                    <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Avg Period</p>
                    <p style={{ fontFamily: F.heading, fontSize: 28, color: C.text, lineHeight: 1 }}>{avgPeriod}<span style={{ fontSize: 13, color: C.textMuted }}> d</span></p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 4 }}>average duration</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : (
        // ── Mobile: unchanged ──────────────────────────────────────────────
        <>
          <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>{dateStr}</p>
              <h1 style={{ fontFamily: F.heading, fontSize: 24, fontWeight: 300, color: C.text, lineHeight: 1.3 }}>{greeting()}, {userName} ☀️</h1>
            </div>
            <button className="press" onClick={onOpenSettings} style={{ marginTop: 2, width: 34, height: 34, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>⚙️</button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
            <CycleWheel cycleDay={data.cycleDay} totalDays={data.predictedCycleLength} isOnPeriod={data.isOnPeriod} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16, flexWrap: "wrap", padding: "0 20px" }}>
            {PHASES.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: phase && p.name === phase.name ? p.color + "22" : "transparent", border: `1px solid ${phase && p.name === phase.name ? p.color : C.border}` }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }} />
                <span style={{ fontFamily: F.body, fontSize: 10, color: phase && p.name === phase.name ? p.color : C.textMuted, fontWeight: phase && p.name === phase.name ? 600 : 400 }}>{p.name}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "0 20px" }}>
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

            <button className="press" onClick={() => setIsPeriodModalOpen(true)} style={{ width: "100%", padding: 14, borderRadius: 14, border: `1.5px dashed ${data.isOnPeriod ? C.rose : C.primaryLight}`, background: data.isOnPeriod ? C.roseMuted : "transparent", fontFamily: F.body, fontSize: 13, fontWeight: 500, color: data.isOnPeriod ? C.rose : C.textSec, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
              <span>{data.isOnPeriod ? "🔴" : "🩸"}</span>
              {data.isOnPeriod ? "Period ongoing · tap to edit" : "Log period"}
            </button>

            <div style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>Next period</p>
                <p style={{ fontFamily: F.heading, fontSize: 20, color: C.text }}>{data.nextPeriodDate ?? "—"}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: F.heading, fontSize: 30, color: C.primary, lineHeight: 1 }}>{data.daysUntilNextPeriod ?? "—"}</p>
                <p style={{ fontFamily: F.body, fontSize: 10, color: C.textMuted }}>days away</p>
              </div>
            </div>
          </div>
        </>
      )}

      <PeriodLogModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        isOnPeriod={data.isOnPeriod}
        onSave={onBatchAddPeriodDays}
        onEndToday={handleEndToday}
      />
    </div>
  );
};

export default HomeScreen;
