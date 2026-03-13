import { C, F, PHASES, getPhaseForDay } from "../lib/constants";

const CycleWheel = ({ cycleDay, totalDays = 28, isOnPeriod = false, size = 200 }) => {
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.29;

  // If actively bleeding, always show Menstrual — even if cycle day math says otherwise
  const phase = isOnPeriod ? PHASES[0] : (cycleDay ? getPhaseForDay(cycleDay) : null);

  const arc = (startDeg, endDeg, r1, r2) => {
    const toRad = (d) => ((d - 90) * Math.PI) / 180;
    const gap = 2;
    const gs = toRad(startDeg + gap), ge = toRad(endDeg - gap);
    const x1 = cx + r2 * Math.cos(gs), y1 = cy + r2 * Math.sin(gs);
    const x2 = cx + r2 * Math.cos(ge), y2 = cy + r2 * Math.sin(ge);
    const x3 = cx + r1 * Math.cos(ge), y3 = cy + r1 * Math.sin(ge);
    const x4 = cx + r1 * Math.cos(gs), y4 = cy + r1 * Math.sin(gs);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r2} ${r2} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 ${large} 0 ${x4} ${y4} Z`;
  };

  const todayDeg = cycleDay ? (cycleDay / totalDays) * 360 - 90 : -90;
  const todayRad = (todayDeg * Math.PI) / 180;
  const dotR = (outerR + innerR) / 2;
  const dotX = cx + dotR * Math.cos(todayRad);
  const dotY = cy + dotR * Math.sin(todayRad);
  const dotOuter = Math.max(7, size * 0.045);
  const dotInner = Math.max(4, size * 0.025);

  const dayFontSize = Math.round(size * 0.15);
  const phaseFontSize = Math.round(size * 0.056);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {PHASES.map((p) => (
          <path key={p.name} d={arc(p.startDeg, p.endDeg, innerR, outerR)} fill={p.color} opacity={0.18} />
        ))}
        {phase && PHASES.map((p) => (
          p.name === phase.name &&
          <path key={p.name + "-active"} d={arc(p.startDeg, p.endDeg, innerR, outerR)} fill={p.color} opacity={0.55} />
        ))}
        <circle cx={dotX} cy={dotY} r={dotOuter} fill={C.white} stroke={phase ? phase.color : C.textMuted} strokeWidth={2.5} />
        <circle cx={dotX} cy={dotY} r={dotInner} fill={phase ? phase.color : C.textMuted} />
      </svg>
      <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
        <p style={{ fontFamily: F.heading, fontSize: dayFontSize, fontWeight: 400, color: C.text, lineHeight: 1 }}>{cycleDay ?? "—"}</p>
        <p style={{ fontFamily: F.body, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textMuted, marginTop: 2 }}>Day</p>
        <p style={{ fontFamily: F.body, fontSize: phaseFontSize, color: phase ? phase.color : C.textMuted, fontWeight: 600, marginTop: 4 }}>
          {phase ? `${phase.emoji} ${phase.name}` : "Log your period to start"}
        </p>
      </div>
    </div>
  );
};

export default CycleWheel;
