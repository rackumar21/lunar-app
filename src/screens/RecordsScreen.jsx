import { C, F, WATCH_LIST } from "../lib/constants";
import { fmt, statusBg, statusColor, statusLabel } from "../lib/helpers";
import Label from "../components/shared/Label";
import StatusPill from "../components/shared/StatusPill";
import ComingSoon from "../components/shared/ComingSoon";

const RecordsScreen = ({ reports, onViewReport, onAddReport }) => (
  <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 20px 0" }}>
      <div>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 4 }}>Health</p>
        <h2 style={{ fontFamily: F.heading, fontSize: 26, fontWeight: 400, color: C.text, marginBottom: 3 }}>Records</h2>
        <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec }}>Your personal health paper trail</p>
      </div>
      <button className="press" onClick={onAddReport} style={{ marginTop: 6, padding: "9px 14px", borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontSize: 12, fontWeight: 600, color: C.white }}>+ Add</button>
    </div>

    <div style={{ margin: "14px 20px 0", background: C.errorMuted, borderRadius: 14, padding: "12px 14px", border: `1px solid ${C.error}22` }}>
      <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.error, marginBottom: 10 }}>⚠ Watch list</p>
      {WATCH_LIST.map((item) => (
        <div key={item.name} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.text }}>{item.name}</span>
            <StatusPill status={item.status} />
          </div>
          <p style={{ fontFamily: F.body, fontSize: 11, color: C.textSec }}>{item.note}</p>
        </div>
      ))}
    </div>

    <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
      {reports.map((r) => (
        <div key={r.id} className="press" onClick={() => onViewReport(r)} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 16px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ flex: 1, marginRight: 10 }}>
              <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{r.title}</p>
              <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>{fmt(r.date)}</p>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 20, background: r.flagCount === 0 ? C.successMuted : C.errorMuted, color: r.flagCount === 0 ? C.success : C.error, fontFamily: F.body, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
              {r.flagCount === 0 ? "All normal" : `${r.flagCount} flagged`}
            </span>
          </div>
          {r.markers.filter(m => m.status !== "normal").map(m => (
            <span key={m.name} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: statusBg(m.status), fontFamily: F.body, fontSize: 11, color: statusColor(m.status), fontWeight: 600, marginRight: 6, marginBottom: 6 }}>
              {m.name} · {statusLabel(m.status)}
            </span>
          ))}
          <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 4 }}>Tap to view all markers →</p>
        </div>
      ))}
    </div>

    <div style={{ margin: "12px 20px 0", background: C.comingSoonMuted, borderRadius: 14, padding: "13px 15px", border: `1px dashed ${C.comingSoon}44`, display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: 20 }}>🩺</span>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <p style={{ fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.comingSoon }}>Doctor Visit Mode</p>
          <ComingSoon />
        </div>
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.comingSoon, opacity: 0.8, lineHeight: 1.5 }}>One tap: generate a clean summary of your cycles and flagged markers to show your GP.</p>
      </div>
    </div>
  </div>
);

export default RecordsScreen;
