import { C, F } from "../lib/constants";
import { fmtMonth, statusColor, statusBg } from "../lib/helpers";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";
import StatusPill from "./shared/StatusPill";
import RangeBar from "./shared/RangeBar";

// Build a trend note for a marker by looking up the same name in older reports
function getTrendNote(markerName, currentValue, currentDate, allReports) {
  if (!allReports?.length) return null;
  // Find the most recent previous report that contains this marker
  const older = allReports
    .filter(r => r.date < currentDate)
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const r of older) {
    const prev = (r.markers || []).find(m => m.name.toLowerCase() === markerName.toLowerCase());
    if (!prev) continue;
    const curr = parseFloat(currentValue);
    const past = parseFloat(prev.value);
    if (isNaN(curr) || isNaN(past)) return null;
    const diff = curr - past;
    if (Math.abs(diff) < 0.001) return null;
    const dir = diff > 0 ? "↑" : "↓";
    const monthYear = new Date(r.date + "T12:00:00").toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    return `${dir} from ${prev.value} ${prev.unit} in ${monthYear}`;
  }
  return null;
}

const RecordDetailModal = ({ report, onClose, allReports, onDelete }) => {
  if (!report) return null;
  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.bg, borderRadius: "22px 22px 0 0", maxHeight: "88vh", overflowY: "auto", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontFamily: F.heading, fontSize: 18, fontWeight: 400, color: C.text }}>{report.title}</h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginTop: 3 }}>{fmtMonth(report.date)}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {onDelete && (
              <button
                className="press"
                onClick={() => { if (window.confirm("Delete this report?")) onDelete(report.id); }}
                style={{ padding: "6px 12px", borderRadius: 10, border: `1px solid ${C.error}44`, background: C.errorMuted, fontFamily: C.body, fontSize: 11, fontWeight: 600, color: C.error }}
              >
                Delete
              </button>
            )}
            <CloseBtn onClose={onClose} />
          </div>
        </div>
        <div style={{ padding: "18px 20px 0" }}>
          {report.markers.map((m) => {
            const trendNote = m.trendNote || getTrendNote(m.name, m.value, report.date, allReports);
            return (
              <div key={m.name} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${m.status === "low" || m.status === "high" ? statusColor(m.status) + "44" : C.border}`, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</p>
                  {(m.status === "low" || m.status === "high") && <StatusPill status={m.status} />}
                </div>
                <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginBottom: 4 }}>
                  <span style={{ fontFamily: F.heading, fontSize: 18, color: m.status ? statusColor(m.status) : C.text }}>{m.value}</span>{m.unit ? ` ${m.unit}` : ""}
                  {m.low != null && m.high != null && ` · Range: ${m.low}–${m.high}`}
                </p>
                {m.low != null && m.high != null && <RangeBar value={m.value} low={m.low} high={m.high} status={m.status} />}
                {trendNote && <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>{trendNote}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;
