import { C } from "./constants";

const pad = (n) => String(n).padStart(2, "0");

export const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const fmt = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const fmtShort = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const fmtDay = (ds) => new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const todayKey = () => { const d = new Date("2025-02-26"); return toKey(d.getFullYear(), d.getMonth(), d.getDate()); };

export const statusColor = (s) => ({ normal: C.success, low: C.error, high: C.warning }[s] || C.textMuted);
export const statusBg = (s) => ({ normal: C.successMuted, low: C.errorMuted, high: C.warningMuted }[s] || C.border);
export const statusLabel = (s) => ({ normal: "Normal", low: "Low", high: "High" }[s] || s);
