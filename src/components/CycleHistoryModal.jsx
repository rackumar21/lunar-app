import { useState } from "react";
import { C, F } from "../lib/constants";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";
import Label from "./shared/Label";

const CycleHistoryModal = ({ isOpen, onClose, onSave }) => {
  const [cycles, setCycles] = useState([{ startDate: "", duration: 5 }]);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const update = (i, field, value) =>
    setCycles(p => p.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const handleSave = () => {
    const allDays = [];
    cycles.forEach(({ startDate, duration }) => {
      if (!startDate) return;
      const start = new Date(startDate + "T12:00:00");
      for (let i = 0; i < duration; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        allDays.push(d.toISOString().slice(0, 10));
      }
    });
    if (allDays.length === 0) return;
    onSave(allDays);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.white, borderRadius: "22px 22px 0 0", maxHeight: "88vh", overflowY: "auto", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, color: C.text }}>Log past cycles</h3>
          <CloseBtn onClose={onClose} />
        </div>

        <div style={{ padding: "16px 20px 0" }}>
          <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, lineHeight: 1.6, marginBottom: 16 }}>
            Enter when each period started and how long it lasted. Lunar uses this to calculate your cycle length and predict future periods.
          </p>

          {cycles.map((cycle, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.textSec }}>Period {i + 1}</p>
                {cycles.length > 1 && (
                  <button onClick={() => setCycles(p => p.filter((_, idx) => idx !== i))} style={{ fontFamily: F.body, fontSize: 11, color: C.error, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Remove</button>
                )}
              </div>

              <Label mb={6}>Start date</Label>
              <input
                type="date"
                value={cycle.startDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => update(i, "startDate", e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontFamily: F.body, fontSize: 13, color: C.text, background: C.white, marginBottom: 12, boxSizing: "border-box" }}
              />

              <Label mb={8}>Duration</Label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button className="press" onClick={() => cycle.duration > 1 && update(i, "duration", cycle.duration - 1)} style={{ width: 34, height: 34, borderRadius: 10, background: C.border, fontSize: 18, color: C.textSec }}>−</button>
                <span style={{ fontFamily: F.heading, fontSize: 20, color: C.text, minWidth: 60, textAlign: "center" }}>{cycle.duration} <span style={{ fontFamily: F.body, fontSize: 12, color: C.textSec }}>days</span></span>
                <button className="press" onClick={() => cycle.duration < 10 && update(i, "duration", cycle.duration + 1)} style={{ width: 34, height: 34, borderRadius: 10, background: C.border, fontSize: 18, color: C.textSec }}>+</button>
              </div>
            </div>
          ))}

          {cycles.length < 7 && (
            <button className="press" onClick={() => setCycles(p => [...p, { startDate: "", duration: 5 }])} style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1.5px dashed ${C.primaryLight}`, background: "transparent", fontFamily: F.body, fontSize: 13, color: C.primary, marginBottom: 14, marginTop: 4 }}>
              + Add another cycle
            </button>
          )}

          <button className="press" onClick={handleSave} style={{ width: "100%", padding: "13px", borderRadius: 12, background: saved ? C.success : `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.white, transition: "background 0.3s" }}>
            {saved ? "✓ Saved!" : "Save history"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CycleHistoryModal;
