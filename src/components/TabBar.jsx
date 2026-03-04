import { C, F, TABS } from "../lib/constants";

const TabBar = ({ active, onChange }) => (
  <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", height: 72, flexShrink: 0, paddingBottom: 10, borderRadius: "0 0 50px 50px" }}>
    {TABS.map((t) => (
      <button key={t.id} className="press" onClick={() => onChange(t.id)} style={{ flex: 1, paddingTop: 8, background: "transparent", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
        <span style={{ fontSize: t.id === "ask" ? 18 : 16, color: active === t.id ? C.primary : C.textMuted }}>{t.icon}</span>
        <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: active === t.id ? C.primary : C.textMuted, textAlign: "center", lineHeight: 1.2 }}>{t.label}</span>
        {active === t.id && <div style={{ width: 16, height: 2, borderRadius: 1, background: C.primary }} />}
      </button>
    ))}
  </div>
);

export default TabBar;
