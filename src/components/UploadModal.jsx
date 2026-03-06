import { useState, useRef } from "react";
import { C, F } from "../lib/constants";
import Label from "./shared/Label";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";

const CYCLE_PHASES = ["Menstrual", "Follicular", "Ovulation", "Luteal", "Not sure"];

// Keyword lists for auto-detecting report type from extracted markers
const HORMONE_KEYWORDS = ["lh", "fsh", "estradiol", "estrogen", "progesterone", "testosterone", "dheas", "dhea", "prolactin", "amh", "cortisol", "insulin"];
const THYROID_KEYWORDS = ["tsh", "free t3", "free t4", "t3", "t4", "thyroid"];
const VITAMIN_KEYWORDS = ["vitamin", "b12", "folate", "folic", "ferritin", "calcium", "zinc", "magnesium"];

function detectCategory(markers) {
  const names = markers.map((m) => m.name.toLowerCase());
  if (names.some((n) => HORMONE_KEYWORDS.some((kw) => n.includes(kw)))) return "Hormone Panel";
  if (names.some((n) => THYROID_KEYWORDS.some((kw) => n.includes(kw)))) return "Thyroid";
  if (names.some((n) => VITAMIN_KEYWORDS.some((kw) => n.includes(kw)))) return "Vitamins & Minerals";
  return "General Health";
}

const monthLabel = (ds) =>
  ds ? new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "";

const toBase64 = (f) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });

const UploadModal = ({ isOpen, onClose, onSave }) => {
  // queue: array of { id, file, status, markers, reportDate, manualDate, category, error }
  // status: 'pending' | 'extracting' | 'done' | 'error'
  const [queue, setQueue] = useState([]);
  const [cyclePhase, setCyclePhase] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    setQueue([]);
    setCyclePhase("");
    setSaving(false);
    onClose();
  };

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setQueue(
      selected.map((file, i) => ({
        id: i, file,
        status: "pending",
        markers: [], reportDate: null, manualDate: "", category: null, error: null,
      }))
    );
  };

  const handleExtractAll = async () => {
    // Immediately mark all as extracting so the UI switches to the processing view
    setQueue((prev) => prev.map((q) => ({ ...q, status: "extracting" })));

    await Promise.all(
      queue.map(async (item) => {
        try {
          const fileBase64 = await toBase64(item.file);
          const res = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileBase64, mediaType: item.file.type, cyclePhase: cyclePhase || null }),
          });
          let json;
          try { json = await res.json(); } catch {
            if (res.status === 413) throw new Error("File too large (max 10MB)");
            if (res.status === 404) throw new Error("Upload isn't available right now");
            throw new Error("Couldn't read this file");
          }
          if (!res.ok) throw new Error(json.error || "Couldn't read the report");
          const markers = json.markers || [];
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: "done", markers, reportDate: json.reportDate || null, category: detectCategory(markers) }
                : q
            )
          );
        } catch (err) {
          setQueue((prev) =>
            prev.map((q) => q.id === item.id ? { ...q, status: "error", error: err.message } : q)
          );
        }
      })
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    for (const item of queue.filter((q) => q.status === "done")) {
      const date = item.reportDate || item.manualDate;
      const flagCount = item.markers.filter((m) => m.status === "low" || m.status === "high").length;
      await onSave({ title: monthLabel(date), date, category: item.category, markers: item.markers, flagCount });
    }
    handleClose();
  };

  if (!isOpen) return null;

  const inFormStep = queue.length === 0 || queue.every((q) => q.status === "pending");
  const inReviewStep = queue.length > 0 && queue.every((q) => q.status === "done" || q.status === "error");
  const doneItems = queue.filter((q) => q.status === "done");
  const missingDate = doneItems.some((q) => !q.reportDate && !q.manualDate);

  return (
    <div
      className="fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <div
        className="slide-up"
        style={{ width: "100%", maxWidth: 430, background: C.bg, borderRadius: "22px 22px 0 0", paddingBottom: 40, maxHeight: "90vh", overflowY: "auto" }}
      >
        <Handle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, color: C.text }}>
              {inReviewStep ? "Review reports" : "Add records"}
            </h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginTop: 2 }}>
              {inReviewStep
                ? `${doneItems.length} report${doneItems.length !== 1 ? "s" : ""} ready to save`
                : "Upload one or more health documents"}
            </p>
          </div>
          <CloseBtn onClose={handleClose} />
        </div>

        <div style={{ padding: "20px 20px 0" }}>

          {/* ── FORM STEP ── */}
          {inFormStep && (
            <>
              <Label mb={4}>
                Which cycle phase were you in?{" "}
                <span style={{ fontWeight: 400, color: C.textMuted }}>(optional)</span>
              </Label>
              <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginBottom: 10 }}>
                Helps Lunar apply the right hormone reference ranges.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {CYCLE_PHASES.map((phase) => (
                  <button
                    key={phase}
                    className="press"
                    onClick={() => setCyclePhase(phase === cyclePhase ? "" : phase)}
                    style={{ padding: "7px 13px", borderRadius: 20, border: `1.5px solid ${cyclePhase === phase ? C.primary : C.border}`, background: cyclePhase === phase ? C.primaryMuted : C.white, fontFamily: F.body, fontSize: 12, color: cyclePhase === phase ? C.primary : C.textSec, fontWeight: cyclePhase === phase ? 600 : 400 }}
                  >
                    {phase}
                  </button>
                ))}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                style={{ display: "none" }}
                onChange={handleFilesChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "100%", padding: "20px", borderRadius: 14, border: `2px dashed ${queue.length > 0 ? C.primary : C.border}`, background: queue.length > 0 ? C.primaryMuted : C.white, textAlign: "center", marginBottom: 20, cursor: "pointer", boxSizing: "border-box" }}
              >
                {queue.length > 0 ? (
                  <>
                    <p style={{ fontSize: 22, marginBottom: 4 }}>📄</p>
                    <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.primary }}>
                      {queue.length} file{queue.length !== 1 ? "s" : ""} selected
                    </p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textSec, marginTop: 3 }}>Tap to change</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 24, marginBottom: 6 }}>📎</p>
                    <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 3 }}>Tap to attach files</p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>PDF, JPG, or PNG · Select multiple · Max 10MB each</p>
                  </>
                )}
              </div>

              <button
                className="press"
                onClick={handleExtractAll}
                disabled={queue.length === 0}
                style={{ width: "100%", padding: "15px", borderRadius: 14, background: queue.length === 0 ? C.border : `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: queue.length === 0 ? C.textMuted : C.white, cursor: queue.length > 0 ? "pointer" : "not-allowed", boxSizing: "border-box" }}
              >
                Read {queue.length > 1 ? `${queue.length} reports` : "report"}
              </button>
            </>
          )}

          {/* ── PROCESSING STEP ── */}
          {!inFormStep && !inReviewStep && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {queue.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: C.white, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>
                    {item.status === "extracting" ? "⏳" : item.status === "done" ? "✅" : item.status === "error" ? "❌" : "📄"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.file.name}
                    </p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textSec }}>
                      {item.status === "extracting" ? "Reading…" :
                       item.status === "done" ? `${item.markers.length} markers found` :
                       item.status === "error" ? item.error : "Waiting…"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── REVIEW STEP ── */}
          {inReviewStep && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {queue.map((item) => (
                  <div
                    key={item.id}
                    style={{ padding: "14px 16px", borderRadius: 14, background: item.status === "error" ? C.errorMuted : C.white, border: `1px solid ${item.status === "error" ? C.error + "33" : C.border}` }}
                  >
                    {item.status === "error" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>❌</span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.error, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.file.name}</p>
                          <p style={{ fontFamily: F.body, fontSize: 11, color: C.error }}>{item.error}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <p style={{ fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.text }}>
                            {item.reportDate ? monthLabel(item.reportDate) : item.file.name}
                          </p>
                          <span style={{ padding: "3px 10px", borderRadius: 20, background: C.primaryMuted, color: C.primary, fontFamily: F.body, fontSize: 11, fontWeight: 600, marginLeft: 8, whiteSpace: "nowrap" }}>
                            {item.category}
                          </span>
                        </div>
                        <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec }}>
                          {item.markers.length} markers
                          {item.markers.filter((m) => m.status === "low" || m.status === "high").length > 0 &&
                            ` · ${item.markers.filter((m) => m.status === "low" || m.status === "high").length} flagged`}
                        </p>
                        {!item.reportDate && (
                          <div style={{ marginTop: 10 }}>
                            <Label mb={4}>Date not found — enter it</Label>
                            <input
                              type="date"
                              value={item.manualDate}
                              onChange={(e) =>
                                setQueue((prev) =>
                                  prev.map((q) => q.id === item.id ? { ...q, manualDate: e.target.value } : q)
                                )
                              }
                              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                <button
                  className="press"
                  onClick={() => setQueue([])}
                  style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.textSec }}
                >
                  ← Back
                </button>
                <button
                  className="press"
                  onClick={handleSaveAll}
                  disabled={saving || doneItems.length === 0 || missingDate}
                  style={{ flex: 2, padding: "13px", borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.white, opacity: saving || doneItems.length === 0 || missingDate ? 0.7 : 1 }}
                >
                  {saving ? "Saving…" : doneItems.length === 1 ? "Save report" : `Save ${doneItems.length} reports`}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default UploadModal;
