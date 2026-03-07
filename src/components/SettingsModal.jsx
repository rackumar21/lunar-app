import { useState } from "react";
import { C, F } from "../lib/constants";
import Label from "./shared/Label";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";

const SettingsModal = ({ isOpen, onClose, data, onUpdateSettings, onSignOut }) => {
  const [periodLen, setPeriodLen] = useState(data.defaultPeriodLength);
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
            <p style={{ fontFamily: F.heading, fontSize: 24, color: C.text }}>{data.predictedCycleLength} <span style={{ fontSize: 12, color: C.textSec, fontFamily: F.body }}>days</span></p>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 3 }}>{data.cycleHistory?.length > 0 ? `Based on last ${data.cycleHistory.length} cycle${data.cycleHistory.length > 1 ? "s" : ""} · updates automatically` : "Log past cycles to improve this prediction"}</p>
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
          <button className="press" onClick={onSignOut} style={{ width: "100%", padding: "13px", borderRadius: 12, marginBottom: 22, background: C.border, fontSize: 13, fontWeight: 600, color: C.textSec }}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
