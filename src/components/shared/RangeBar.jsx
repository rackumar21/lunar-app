import { C } from "../../lib/constants";
import { statusColor } from "../../lib/helpers";

const RangeBar = ({ value, low, high, status }) => {
  const min = low * 0.5, max = high * 1.5;
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const lp = ((low - min) / (max - min)) * 100;
  const hp = ((high - min) / (max - min)) * 100;
  return (
    <div style={{ position: "relative", height: 6, background: C.border, borderRadius: 3, marginTop: 8 }}>
      <div style={{ position: "absolute", left: `${lp}%`, width: `${hp - lp}%`, height: "100%", background: C.successMuted, borderRadius: 2 }} />
      <div style={{ position: "absolute", left: `${pct}%`, top: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", background: statusColor(status), border: `2px solid ${C.white}`, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
    </div>
  );
};

export default RangeBar;
