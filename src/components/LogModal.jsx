import { useState, useEffect } from "react";
import { C, F, MOODS, SYMPTOMS, FLOW_OPTIONS } from "../lib/constants";
import Label from "./shared/Label";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";
import PainSelector from "./shared/PainSelector";

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

export default LogModal;
