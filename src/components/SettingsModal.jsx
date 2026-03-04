import { useState } from "react";
import { C, F } from "../lib/constants";
import Label from "./shared/Label";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";
import ComingSoon from "./shared/ComingSoon";

const SettingsModal = ({ isOpen, onClose, data, onUpdateSettings, onSignOut }) => {
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
          <button className="press" onClick={onSignOut} style={{ width: "100%", padding: "13px", borderRadius: 12, marginBottom: 22, background: C.border, fontSize: 13, fontWeight: 600, color: C.textSec }}>
            Log out
          </button>
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

export default SettingsModal;
