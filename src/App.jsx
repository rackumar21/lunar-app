import { useState } from "react";
import { SEED, SEED_NOTES, HORMONE_REPORTS } from "./lib/constants";
import { todayKey } from "./lib/helpers";
import { useLogs } from "./hooks/useLogs";
import { usePeriodDays } from "./hooks/usePeriodDays";
import Styles from "./components/Styles";
import TabBar from "./components/TabBar";
import LogModal from "./components/LogModal";
import RecordDetailModal from "./components/RecordDetailModal";
import SettingsModal from "./components/SettingsModal";
import UploadModal from "./components/UploadModal";
import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import AskLunarScreen from "./screens/AskLunarScreen";
import RecordsScreen from "./screens/RecordsScreen";

export default function LunarApp() {
  const [tab, setTab] = useState("home");
  const [appData, setAppData] = useState(SEED);
  const [notes, setNotes] = useState(SEED_NOTES);
  const [reports] = useState(HORMONE_REPORTS);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logDate, setLogDate] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Real data from Supabase — replaces SEED_LOGS and allPeriodDays
  const { logs, saveLog } = useLogs();
  const { periodDays, addPeriodDay, removePeriodDay } = usePeriodDays();

  const handleSaveLog = (log) => {
    const key = logDate || todayKey();
    saveLog(key, log);
    if (log.note) setNotes((p) => [{ date: key, text: log.note }, ...p.filter(n => n.date !== key)]);
    if (key === todayKey()) setAppData((p) => ({ ...p, todayLog: log }));
    setLogDate(null);
  };

  const handleTogglePeriod = () => {
    const today = todayKey();
    if (appData.isOnPeriod) {
      removePeriodDay(today);
    } else {
      addPeriodDay(today);
    }
    setAppData((p) => ({ ...p, isOnPeriod: !p.isOnPeriod }));
  };

  const dayLabel = logDate
    ? new Date(logDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : new Date("2025-02-26").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <Styles />
      <div style={{ minHeight: "100vh", background: "#C8C0B8", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px 0" }}>
        <div style={{ width: 390, height: 844, background: "#F7F3EE", borderRadius: 50, boxShadow: "0 40px 100px rgba(0,0,0,0.28)", display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 50, overflow: "hidden", pointerEvents: "none", zIndex: 100 }} />

          <div style={{ background: "#F7F3EE", padding: "14px 24px 0", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Libre Franklin', system-ui, sans-serif", fontSize: 12, fontWeight: 600, color: "#28211E" }}>9:41</span>
            <span style={{ fontFamily: "'Libre Franklin', system-ui, sans-serif", fontSize: 11, color: "#28211E" }}>●●● WiFi 🔋</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {tab === "home" && <HomeScreen data={appData} onOpenLog={() => { setLogDate(todayKey()); setIsLogOpen(true); }} onTogglePeriod={handleTogglePeriod} onOpenSettings={() => setIsSettingsOpen(true)} />}
            {tab === "calendar" && <CalendarScreen logs={logs} periodDays={periodDays} />}
            {tab === "ask" && <AskLunarScreen />}
            {tab === "records" && <RecordsScreen reports={reports} onViewReport={setSelectedReport} onAddReport={() => setIsUploadOpen(true)} />}
          </div>

          <TabBar active={tab} onChange={setTab} />
        </div>
      </div>

      <LogModal isOpen={isLogOpen} onClose={() => { setIsLogOpen(false); setLogDate(null); }} isOnPeriod={appData.isOnPeriod} existingLog={logs[logDate || todayKey()]} onSave={handleSaveLog} dateLabel={dayLabel} />
      <RecordDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} data={appData} onUpdateSettings={(s) => setAppData((p) => ({ ...p, ...s }))} />
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSave={(r) => console.log("New report:", r)} />
    </>
  );
}
