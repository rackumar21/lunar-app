import { C } from "../../lib/constants";
import { statusColor, statusBg, statusLabel } from "../../lib/helpers";

const StatusPill = ({ status }) => (
  <span style={{ padding: "3px 9px", borderRadius: 20, background: statusBg(status), color: statusColor(status), fontFamily: "'Libre Franklin', system-ui, sans-serif", fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
    <span style={{ fontSize: 8 }}>{status === "normal" ? "✓" : "⚠"}</span>{statusLabel(status)}
  </span>
);

export default StatusPill;
