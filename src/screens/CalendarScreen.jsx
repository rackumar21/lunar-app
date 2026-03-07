import { useState, useRef, useEffect } from "react";
import { C, F, MOODS, PAIN_STEPS } from "../lib/constants";
import { fmtDay } from "../lib/helpers";
import CycleHistoryModal from "../components/CycleHistoryModal";

// Generate every date between start and end (inclusive) as YYYY-MM-DD strings
function datesInRange(start, end) {
  const dates = [];
  const d = new Date(start + "T12:00:00");
  const e = new Date(end + "T12:00:00");
  while (d <= e) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

const CalendarScreen = ({ logs, periodDays, predictedDays, cycleHistory, onBatchAddPeriodDays, onBatchRemovePeriodDays, onOpenLog, onAddPeriodDay, onRemovePeriodDay }) => {
  const TODAY = new Date();
  const DAYS_BACK = 300, DAYS_FORWARD = 90;
  const days = [];
  for (let i = -DAYS_BACK; i <= DAYS_FORWARD; i++) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }

  const todayKey = days[DAYS_BACK];
  const stripRef = useRef(null);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [headerKey, setHeaderKey] = useState(todayKey);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null); // { startDate, endDate, originalStart, originalEnd }

  useEffect(() => {
    if (stripRef.current) {
      const todayEl = stripRef.current.querySelector("[data-today='true']");
      if (todayEl) todayEl.scrollIntoView({ inline: "center", behavior: "instant" });
    }
  }, []);

  const handleScroll = () => {
    if (!stripRef.current) return;
    const strip = stripRef.current;
    const stripRect = strip.getBoundingClientRect();
    const buttons = strip.querySelectorAll("[data-daykey]");
    for (let btn of buttons) {
      const rect = btn.getBoundingClientRect();
      if (rect.right > stripRect.left + 24) {
        setHeaderKey(btn.getAttribute("data-daykey"));
        return;
      }
    }
  };

  const getDayType = (key) => {
    if (periodDays.includes(key)) return "period";
    if (predictedDays.includes(key)) return "predicted";
    if (logs[key]) return "logged";
    return "none";
  };

  const dayColor = (type) => ({
    period: { bg: C.primary, text: C.white, border: "none" },
    predicted: { bg: C.primaryMuted, text: C.primary, border: `1.5px dashed ${C.primary}` },
    logged: { bg: C.white, text: C.text, border: `1px solid ${C.border}` },
    none: { bg: "transparent", text: C.textMuted, border: "none" },
  }[type] || { bg: "transparent", text: C.textMuted, border: "none" });

  const selectedLog = logs[selectedKey];
  const isToday = selectedKey === todayKey;
  const isPeriodDay = periodDays.includes(selectedKey);
  const getMonthLabel = (key) => new Date(key + "T12:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 12px", flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>Your history</p>
          <h2 style={{ fontFamily: F.heading, fontSize: 24, fontWeight: 400, color: C.text }}>{getMonthLabel(headerKey)}</h2>
        </div>
        <button className="press" onClick={() => setIsHistoryOpen(true)} style={{ marginTop: 4, padding: "6px 12px", borderRadius: 20, border: `1px solid ${C.primaryLight}`, background: C.primaryMuted, fontFamily: F.body, fontSize: 11, fontWeight: 600, color: C.primary, flexShrink: 0 }}>
          + Past cycles
        </button>
      </div>

      <div ref={stripRef} onScroll={handleScroll} style={{ display: "flex", overflowX: "auto", padding: "0 20px 14px", gap: 6, flexShrink: 0 }}>
        {days.map((key, idx) => {
          const d = new Date(key + "T12:00:00");
          const dayNum = d.getDate();
          const dayName = d.toLocaleDateString("en-GB", { weekday: "narrow" });
          const type = getDayType(key);
          const style = dayColor(type);
          const isSelected = key === selectedKey;
          const isTod = key === todayKey;
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
                data-daykey={key}
                className="press"
                onClick={() => setSelectedKey(key)}
                style={{ width: 38, flexShrink: 0, padding: "8px 0", borderRadius: 12, background: isSelected ? (style.bg === "transparent" ? C.white : style.bg) : style.bg, border: isSelected ? `2px solid ${C.primary}` : style.border || "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, boxShadow: isSelected ? "0 2px 10px rgba(184,107,78,0.2)" : "none", outline: "none" }}
              >
                <span style={{ fontFamily: F.body, fontSize: 9, color: isSelected ? C.primary : C.textMuted, fontWeight: 600, letterSpacing: "0.06em" }}>{dayName}</span>
                <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: isTod ? 700 : 500, color: isSelected ? C.primary : style.text }}>{dayNum}</span>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: type === "period" ? C.white : type === "logged" ? C.primary : "transparent", opacity: type === "period" || type === "logged" ? 0.8 : 0 }} />
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12, padding: "0 20px 12px", flexShrink: 0 }}>
        {[
          { color: C.primary, label: "Period" },
          { color: C.primary, label: "Predicted", dashed: true },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.dashed ? C.primaryMuted : l.color, border: l.dashed ? `1.5px dashed ${l.color}` : "none" }} />
            <span style={{ fontFamily: F.body, fontSize: 10, color: C.textSec }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: C.border, flexShrink: 0 }} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: F.heading, fontSize: 18, fontWeight: 400, color: C.text, marginBottom: 8 }}>{fmtDay(selectedKey)}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button className="press" onClick={() => onOpenLog(selectedKey)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${selectedLog ? C.primaryLight : C.border}`, background: selectedLog ? C.primaryMuted : C.white, fontFamily: F.body, fontSize: 11, fontWeight: 600, color: selectedLog ? C.primary : C.textSec }}>
              {selectedLog ? "✓ Edit log" : "+ Log symptoms"}
            </button>
            <button className="press" onClick={() => isPeriodDay ? onRemovePeriodDay(selectedKey) : onAddPeriodDay(selectedKey)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${isPeriodDay ? C.rose : C.border}`, background: isPeriodDay ? C.roseMuted : C.white, fontFamily: F.body, fontSize: 11, fontWeight: 600, color: isPeriodDay ? C.rose : C.textSec }}>
              {isPeriodDay ? "🩸 Period day" : "Mark period"}
            </button>
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
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 300, color: C.textMuted, marginBottom: 6 }}>Nothing logged</p>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>Tap a day to view or add a log</p>
          </div>
        )}

        {cycleHistory.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 10 }}>Cycle history</p>
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {cycleHistory.map((cycle, i) => {
                const isEditing = editingCycle?.originalStart === cycle.startDate;
                return (
                  <div key={cycle.startDate || cycle.label} style={{ borderBottom: i < cycleHistory.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginBottom: 3 }}>{cycle.label}</p>
                        <div style={{ display: "flex", gap: 12 }}>
                          {cycle.cycleLength && <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>Cycle <span style={{ fontFamily: F.heading, fontSize: 14, color: C.text, fontWeight: 400 }}>{cycle.cycleLength}d</span></p>}
                          {cycle.periodLength && <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>Period <span style={{ fontFamily: F.heading, fontSize: 14, color: C.text, fontWeight: 400 }}>{cycle.periodLength}d</span></p>}
                        </div>
                      </div>
                      <button
                        className="press"
                        onClick={() => isEditing
                          ? setEditingCycle(null)
                          : setEditingCycle({ startDate: cycle.startDate, endDate: cycle.endDate, originalStart: cycle.startDate, originalEnd: cycle.endDate })
                        }
                        style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${isEditing ? C.border : C.primaryLight}`, background: isEditing ? C.white : C.primaryMuted, fontFamily: F.body, fontSize: 11, fontWeight: 600, color: isEditing ? C.textSec : C.primary, flexShrink: 0 }}
                      >
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                    </div>

                    {isEditing && (
                      <div style={{ padding: "0 16px 14px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
                        <div style={{ display: "flex", gap: 10, marginTop: 12, marginBottom: 12 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, marginBottom: 6 }}>Start</p>
                            <input
                              type="date"
                              value={editingCycle.startDate}
                              onChange={(e) => setEditingCycle(prev => ({ ...prev, startDate: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textMuted, marginBottom: 6 }}>End</p>
                            <input
                              type="date"
                              value={editingCycle.endDate}
                              onChange={(e) => setEditingCycle(prev => ({ ...prev, endDate: e.target.value }))}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }}
                            />
                          </div>
                        </div>
                        <button
                          className="press"
                          onClick={async () => {
                            const oldDates = datesInRange(editingCycle.originalStart, editingCycle.originalEnd);
                            const newDates = datesInRange(editingCycle.startDate, editingCycle.endDate);
                            await onBatchRemovePeriodDays(oldDates);
                            await onBatchAddPeriodDays(newDates);
                            setEditingCycle(null);
                          }}
                          style={{ width: "100%", padding: "11px", borderRadius: 10, background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.white }}
                        >
                          Save changes
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CycleHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSave={onBatchAddPeriodDays}
      />
    </div>
  );
};

export default CalendarScreen;
