import { C, F } from "../lib/constants";
import { fmt, statusColor, statusBg } from "../lib/helpers";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";
import StatusPill from "./shared/StatusPill";
import RangeBar from "./shared/RangeBar";

const RecordDetailModal = ({ report, onClose }) => {
  if (!report) return null;
  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.bg, borderRadius: "22px 22px 0 0", maxHeight: "88vh", overflowY: "auto", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "14px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontFamily: F.heading, fontSize: 18, fontWeight: 400, color: C.text }}>{report.title}</h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginTop: 3 }}>{fmt(report.date)}</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "18px 20px 0" }}>
          {report.markers.map((m) => (
            <div key={m.name} style={{ background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${m.status !== "normal" ? statusColor(m.status) + "44" : C.border}`, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</p>
                <StatusPill status={m.status} />
              </div>
              <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginBottom: 4 }}>
                <span style={{ fontFamily: F.heading, fontSize: 18, color: statusColor(m.status) }}>{m.value}</span> {m.unit} · Range: {m.low}–{m.high}
              </p>
              <RangeBar value={m.value} low={m.low} high={m.high} status={m.status} />
              {m.trendNote && <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>{m.trendNote}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;
