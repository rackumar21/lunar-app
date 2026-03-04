import { useState } from "react";
import { C, F } from "../lib/constants";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";
import Label from "./shared/Label";

const PeriodLogModal = ({ isOpen, onClose, isOnPeriod, onSave, onEndToday }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [duration, setDuration] = useState(5);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const previewEnd = () => {
    const start = new Date(startDate + "T12:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + duration - 1);
    const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${fmt(start)} → ${fmt(end)}`;
  };

  const handleSave = () => {
    const days = [];
    const start = new Date(startDate + "T12:00:00");
    for (let i = 0; i < duration; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    onSave(days);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const handleEndToday = () => {
    onEndToday();
    onClose();
  };

  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.white, borderRadius: "22px 22px 0 0", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, color: C.text }}>Log period</h3>
          <CloseBtn onClose={onClose} />
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          <Label mb={8}>When did it start?</Label>
          <input
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, fontFamily: F.body, fontSize: 14, color: C.text, background: C.bg, marginBottom: 20, boxSizing: "border-box" }}
          />

          <Label mb={8}>How many days?</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <button className="press" onClick={() => duration > 1 && setDuration(d => d - 1)} style={{ width: 38, height: 38, borderRadius: 10, background: C.border, fontSize: 20, color: C.textSec }}>−</button>
            <span style={{ fontFamily: F.heading, fontSize: 24, color: C.text, minWidth: 80, textAlign: "center" }}>{duration} <span style={{ fontFamily: F.body, fontSize: 13, color: C.textSec }}>days</span></span>
            <button className="press" onClick={() => duration < 10 && setDuration(d => d + 1)} style={{ width: 38, height: 38, borderRadius: 10, background: C.border, fontSize: 20, color: C.textSec }}>+</button>
          </div>

          {startDate && (
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginBottom: 20, textAlign: "center" }}>{previewEnd()}</p>
          )}

          <button className="press" onClick={handleSave} style={{ width: "100%", padding: "13px", borderRadius: 12, background: saved ? C.success : `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.white, marginBottom: 12, transition: "background 0.3s" }}>
            {saved ? "✓ Saved!" : "Save period"}
          </button>

          {isOnPeriod && (
            <button className="press" onClick={handleEndToday} style={{ width: "100%", padding: "13px", borderRadius: 12, background: C.roseMuted, fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.rose }}>
              End period today
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeriodLogModal;
