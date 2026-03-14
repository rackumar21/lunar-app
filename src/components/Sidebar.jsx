import { C, F, TABS } from "../lib/constants";

const Sidebar = ({ active, onChange, onOpenSettings }) => (
  <div style={{
    width: 230,
    flexShrink: 0,
    background: C.white,
    borderRight: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  }}>
    {/* Brand */}
    <div style={{ padding: "32px 24px 28px" }}>
      <p style={{ fontFamily: F.heading, fontSize: 26, fontWeight: 300, fontStyle: "italic", color: C.text }}>🌙 Lunar</p>
      <p style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 5 }}>Your health companion</p>
    </div>

    {/* Nav items */}
    <div style={{ flex: 1 }}>
      {TABS.map((t) => (
        <button
          key={t.id}
          className="press"
          onClick={() => onChange(t.id)}
          style={{
            width: "100%",
            background: active === t.id ? C.primaryMuted : "transparent",
            border: "none",
            borderLeft: `3px solid ${active === t.id ? C.primary : "transparent"}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "13px 20px",
            cursor: "pointer",
          }}
        >
          <span style={{ width: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{t.icon}</span>
          <span style={{
            fontFamily: F.body,
            fontSize: 13,
            fontWeight: active === t.id ? 600 : 400,
            color: active === t.id ? C.primary : C.textSec,
          }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>

    {/* Settings at bottom */}
    <button
      className="press"
      onClick={onOpenSettings}
      style={{
        background: "transparent",
        border: "none",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "18px 20px",
        cursor: "pointer",
        width: "100%",
      }}
    >
      <span style={{ fontSize: 16 }}>⚙️</span>
      <span style={{ fontFamily: F.body, fontSize: 13, color: C.textSec }}>Settings</span>
    </button>
  </div>
);

export default Sidebar;
