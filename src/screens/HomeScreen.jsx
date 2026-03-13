import { useState } from "react";
import { C, F, PHASES, getPhaseForDay } from "../lib/constants";

import CycleWheel from "../components/CycleWheel";
import Label from "../components/shared/Label";
import PeriodLogModal from "../components/PeriodLogModal";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const HomeScreen = ({ data, onOpenLog, onOpenSettings, userName, onBatchAddPeriodDays, onRemovePeriodDay }) => {
  // If actively on period, always show Menstrual phase regardless of cycle day number.
  // (Day 6 would otherwise flip to Follicular even while still bleeding.)
  const phase = data.isOnPeriod ? PHASES[0] : (data.cycleDay ? getPhaseForDay(data.cycleDay) : null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  const handleEndToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    onRemovePeriodDay(today);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "0 0 16px" }}>
      <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 style={{ fontFamily: F.heading, fontSize: 24, fontWeight: 300, color: C.text, lineHeight: 1.3 }}>
            {greeting()}, {userName} ☀️
          </h1>
        </div>
        <button className="press" onClick={onOpenSettings} style={{ marginTop: 2, width: 34, height: 34, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>⚙️</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
        <CycleWheel cycleDay={data.cycleDay} totalDays={data.predictedCycleLength} />
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

        <PeriodLogModal
          isOpen={isPeriodModalOpen}
          onClose={() => setIsPeriodModalOpen(false)}
          isOnPeriod={data.isOnPeriod}
          onSave={onBatchAddPeriodDays}
          onEndToday={handleEndToday}
        />

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
    </div>
  );
};

export default HomeScreen;
