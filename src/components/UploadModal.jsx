import { useState } from "react";
import { C, F, RECORD_CATEGORIES } from "../lib/constants";
import Label from "./shared/Label";
import Handle from "./shared/Handle";
import CloseBtn from "./shared/CloseBtn";

const UploadModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Hormone Panel");
  const [saved, setSaved] = useState(false);
  const canSave = title.trim() && date.trim();

  const handleSave = () => {
    if (!canSave) return;
    setSaved(true);
    setTimeout(() => {
      onSave({ title: title.trim(), date, category });
      onClose();
      setSaved(false);
      setTitle(""); setDate(""); setCategory("Hormone Panel");
    }, 500);
  };

  if (!isOpen) return null;
  return (
    <div className="fade-in" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(40,33,30,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 430, background: C.bg, borderRadius: "22px 22px 0 0", paddingBottom: 40 }}>
        <Handle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 400, color: C.text }}>Add record</h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textSec, marginTop: 2 }}>Upload a new health document</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div style={{ padding: "20px 20px 0" }}>
          <Label mb={8}>Report name</Label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hormone Panel — March 2025" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: "none", marginBottom: 18 }} />
          <Label mb={8}>Date of test</Label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 13, color: C.text, outline: "none", marginBottom: 18 }} />
          <Label mb={8}>Category</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {RECORD_CATEGORIES.map((cat) => (
              <button key={cat} className="press" onClick={() => setCategory(cat)} style={{ padding: "7px 13px", borderRadius: 20, border: `1.5px solid ${category === cat ? C.primary : C.border}`, background: category === cat ? C.primaryMuted : C.white, fontFamily: F.body, fontSize: 12, color: category === cat ? C.primary : C.textSec, fontWeight: category === cat ? 600 : 400 }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ width: "100%", padding: "20px", borderRadius: 14, border: `2px dashed ${C.border}`, background: C.white, textAlign: "center", marginBottom: 20, cursor: "pointer" }}>
            <p style={{ fontSize: 24, marginBottom: 6 }}>📎</p>
            <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 3 }}>Tap to attach file</p>
            <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>PDF, JPG, or PNG · Max 10MB</p>
          </div>
          <button className="press" onClick={handleSave} style={{ width: "100%", padding: "15px", borderRadius: 14, background: !canSave ? C.border : saved ? C.success : `linear-gradient(135deg, ${C.primary}, ${C.rose})`, fontFamily: F.body, fontSize: 14, fontWeight: 600, color: !canSave ? C.textMuted : C.white, transition: "background 0.3s", cursor: canSave ? "pointer" : "not-allowed" }}>
            {saved ? "✓ Saved" : "Save record"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
