import { useState, useRef } from "react";
import { C, F, RECORD_CATEGORIES } from "../lib/constants";
import Label from "./shared/Label";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";

const STATUS_STYLE = {
  normal: { bg: C.sageMuted, color: C.sage },
  low:    { bg: C.warningMuted, color: C.warning },
  high:   { bg: C.errorMuted, color: C.error },
};

const CYCLE_PHASES = ["Menstrual", "Follicular", "Ovulation", "Luteal", "Not sure"];

// Derive "Jan 2026" from a YYYY-MM-DD date string
const monthLabel = (ds) =>
  ds ? new Date(ds + "T12:00:00").toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "";

const UploadModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName]         = useState("");
  const [date, setDate]         = useState("");
  const [category, setCategory] = useState("Hormone Panel");
  const [cyclePhase, setCyclePhase] = useState("");

  const [file, setFile]             = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [extractError, setExtractError] = useState(null);

  const fileInputRef = useRef(null);

  const canSave = !!file;

  const handleClose = () => {
    setName(""); setDate(""); setCategory("Hormone Panel"); setCyclePhase("");
    setFile(null); setExtracted(null); setExtracting(false); setSaving(false); setExtractError(null);
    onClose();
  };

  const toBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleExtract = async () => {
    if (!canSave) return;
    setExtracting(true);
    try {
      const fileBase64 = await toBase64(file);
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64, mediaType: file.type, cyclePhase: cyclePhase || null }),
      });
      let json;
      try {
        json = await res.json();
      } catch {
        if (res.status === 413) throw new Error("That file is too large. Try a smaller PDF (under 8MB).");
        if (res.status === 404) throw new Error("Upload isn't available right now. Try refreshing the page.");
        if (res.status >= 500) throw new Error("Something went wrong on our end. Please try again in a moment.");
        throw new Error("Couldn't read the file. Please try again.");
      }
      if (!res.ok) throw new Error(json.error || "Couldn't read the report. Please try again.");
      // Auto-fill date from PDF if user hasn't set one — exact YYYY-MM-DD
      if (json.reportDate && !date) setDate(json.reportDate);
      setExtracted(json.markers || []);
    } catch (err) {
      setExtractError(err.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    const flagCount = (extracted || []).filter(m => m.status === "low" || m.status === "high").length;
    const title = name.trim() || monthLabel(date);
    await onSave({ title, date, category, markers: extracted || [], flagCount });
    handleClose();
  };

  if (!isOpen) return null;

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
              {extracted ? "Review extracted data" : "Add record"}
            </h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginTop: 2 }}>
              {extracted ? "Confirm the markers Lunar found" : "Upload a new health document"}
            </p>
          </div>
          <CloseBtn onClose={handleClose} />
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          {extracted ? (
            <>
              <p style={{ fontFamily: F.body, fontSize: 13, color: C.textSec, marginBottom: date ? 4 : 16 }}>
                Found <strong>{extracted.length}</strong> marker{extracted.length !== 1 ? "s" : ""}{date ? ` — ${monthLabel(date)}` : ""}
              </p>
              {!date && (
                <div style={{ marginBottom: 16 }}>
                  <Label mb={6}>Couldn't find a date in the PDF — enter it here</Label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              )}

              {extracted.length === 0 ? (
                <div style={{ padding: 20, borderRadius: 12, background: C.white, textAlign: "center", marginBottom: 20 }}>
                  <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted }}>No lab values detected in this file.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {extracted.map((m, i) => {
                    const s = STATUS_STYLE[m.status] || STATUS_STYLE.normal;
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: C.white, border: `1px solid ${C.border}` }}>
                        <div>
                          <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</p>
                          <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec }}>
                            {m.value} {m.unit}
                            {m.low != null && m.high != null && ` · ref ${m.low}–${m.high}`}
                          </p>
                        </div>
                        {m.status && (
                          <span style={{ padding: "4px 10px", borderRadius: 20, background: s.bg, color: s.color, fontFamily: F.body, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
                            {m.status}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                <button
                  className="press"
                  onClick={() => setExtracted(null)}
                  style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.textSec }}
                >
                  ← Back
                </button>
                <button
                  className="press"
                  onClick={handleConfirm}
                  disabled={saving || !date}
                  style={{ flex: 2, padding: "13px", borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: C.white, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Saving…" : "Confirm & save"}
                </button>
              </div>
            </>
          ) : (
            <>
              <Label mb={4}>Name <span style={{ fontFamily: F.body, fontWeight: 400, color: C.textMuted }}>(optional)</span></Label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hormone Panel — Jan 2026"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: "none", marginBottom: 18, boxSizing: "border-box" }}
              />

              <Label mb={8}>Category</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {RECORD_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className="press"
                    onClick={() => setCategory(cat)}
                    style={{ padding: "7px 13px", borderRadius: 20, border: `1.5px solid ${category === cat ? C.primary : C.border}`, background: category === cat ? C.primaryMuted : C.white, fontFamily: F.body, fontSize: 12, color: category === cat ? C.primary : C.textSec, fontWeight: category === cat ? 600 : 400 }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {(category === "Hormone Panel" || category === "Blood Work") && (
                <>
                  <Label mb={4}>Which cycle phase were you in? <span style={{ fontWeight: 400, color: C.textMuted }}>(optional)</span></Label>
                  <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginBottom: 10 }}>
                    Hormone ranges vary by phase — helps Lunar apply the right reference values.
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
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => setFile(e.target.files[0] || null)}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ width: "100%", padding: "20px", borderRadius: 14, border: `2px dashed ${file ? C.primary : C.border}`, background: file ? C.primaryMuted : C.white, textAlign: "center", marginBottom: 20, cursor: "pointer", boxSizing: "border-box" }}
              >
                {file ? (
                  <>
                    <p style={{ fontSize: 22, marginBottom: 4 }}>📄</p>
                    <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.primary }}>{file.name}</p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textSec, marginTop: 3 }}>Tap to change file</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 24, marginBottom: 6 }}>📎</p>
                    <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 3 }}>Tap to attach file</p>
                    <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>PDF, JPG, or PNG · Max 10MB</p>
                  </>
                )}
              </div>

              {extractError && (
                <div style={{ background: C.errorMuted, border: `1px solid ${C.error}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                  <p style={{ fontFamily: F.body, fontSize: 12, color: C.error }}>{extractError}</p>
                </div>
              )}

              <button
                className="press"
                onClick={() => { setExtractError(null); handleExtract(); }}
                disabled={!canSave || extracting}
                style={{ width: "100%", padding: "15px", borderRadius: 14, background: !canSave ? C.border : `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: !canSave ? C.textMuted : C.white, cursor: canSave ? "pointer" : "not-allowed", opacity: extracting ? 0.8 : 1, boxSizing: "border-box" }}
              >
                {extracting ? "Reading your report…" : "Save record"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
