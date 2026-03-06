import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { C, F } from "../lib/constants";
import { fmtMonth, statusBg, statusColor, statusLabel } from "../lib/helpers";

// Individual sortable report card
function SortableReportCard({ report, onViewReport }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: report.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: "flex",
        alignItems: "stretch",
        background: C.white,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}
    >
      {/* Drag handle — touch/click here to drag */}
      <div
        {...attributes}
        {...listeners}
        style={{
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
          borderRight: `1px solid ${C.border}`,
          background: C.bg,
          flexShrink: 0,
        }}
      >
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
          {[3, 9, 15].map(y =>
            [2, 8].map(x =>
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill={C.textMuted} />
            )
          )}
        </svg>
      </div>

      {/* Tappable card content */}
      <div
        className="press"
        onClick={() => onViewReport(report)}
        style={{ flex: 1, padding: "14px 16px", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ flex: 1, marginRight: 10 }}>
            <p style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{fmtMonth(report.date)}</p>
            {report.category && <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>{report.category}</p>}
          </div>
          {report.flag_count > 0 && (
            <span style={{ padding: "3px 10px", borderRadius: 20, background: C.errorMuted, color: C.error, fontFamily: F.body, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
              {report.flag_count} flagged
            </span>
          )}
        </div>
        {(report.markers || []).filter(m => m.status !== "normal").map(m => (
          <span key={m.name} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: statusBg(m.status), fontFamily: F.body, fontSize: 11, color: statusColor(m.status), fontWeight: 600, marginRight: 6, marginBottom: 6 }}>
            {m.name} · {statusLabel(m.status)}
          </span>
        ))}
        <p style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 4 }}>Tap to view all markers →</p>
      </div>
    </div>
  )
}

const RecordsScreen = ({ reports, onViewReport, onAddReport, onReorder }) => {
  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor),
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = reports.findIndex(r => r.id === active.id)
      const newIndex = reports.findIndex(r => r.id === over.id)
      onReorder(arrayMove(reports, oldIndex, newIndex).map(r => r.id))
    }
  }

  return (
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

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={reports.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reports.map(r => (
                <SortableReportCard key={r.id} report={r} onViewReport={onViewReport} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

export default RecordsScreen;
