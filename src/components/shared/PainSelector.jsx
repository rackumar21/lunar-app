import { C, F, PAIN_STEPS } from "../../lib/constants";

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

export default PainSelector;
