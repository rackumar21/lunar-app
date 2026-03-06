import { C, F } from "../lib/constants";
import { fmtMonth, statusBg, statusColor, statusLabel } from "../lib/helpers";
import StatusPill from "../components/shared/StatusPill";

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

    <div style={{ padding: "12px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
      {reports.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: C.textMuted, fontFamily: F.body, fontSize: 13 }}>
          No records yet — tap + Add to upload your first report.
        </div>
      )}
      {reports.map((r) => (
        <div key={r.id} className="press" onClick={() => onViewReport(r)} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 16px", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ flex: 1, marginRight: 10 }}>
              <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{fmtMonth(r.date)}</p>
              {r.category && <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>{r.category}</p>}
            </div>
            {r.flag_count > 0 && (
              <span style={{ padding: "3px 10px", borderRadius: 20, background: C.errorMuted, color: C.error, fontFamily: F.body, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
                {r.flag_count} flagged
              </span>
            )}
          </div>
          {(r.markers || []).filter(m => m.status !== "normal").map(m => (
            <span key={m.name} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: statusBg(m.status), fontFamily: F.body, fontSize: 11, color: statusColor(m.status), fontWeight: 600, marginRight: 6, marginBottom: 6 }}>
              {m.name} · {statusLabel(m.status)}
            </span>
          ))}
          <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 4 }}>Tap to view all markers →</p>
        </div>
      ))}
    </div>
  </div>
);

export default RecordsScreen;
