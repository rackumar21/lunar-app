import { useState, useMemo, useEffect } from "react";
import { SEED, SEED_NOTES, HORMONE_REPORTS, C, F } from "./lib/constants";
import { todayKey, computeCycleData } from "./lib/helpers";
import { useAuth } from "./hooks/useAuth";
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
import AuthScreen from "./screens/AuthScreen";

export default function LunarApp() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();

  const [tab, setTab] = useState("home");
  const [appData, setAppData] = useState(SEED);
  const [notes, setNotes] = useState(SEED_NOTES);
  const [reports] = useState(HORMONE_REPORTS);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logDate, setLogDate] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const INITIAL_MESSAGE = { role: "ai", text: "Hey! What's on your mind? You can ask me anything about your cycle, how you've been feeling, or your health records." };
  const [chatMessages, setChatMessages] = useState([INITIAL_MESSAGE]);

  // Reset to home tab and close all modals whenever the user logs in
  useEffect(() => {
    if (user) {
      setTab("home");
      setIsSettingsOpen(false);
      setIsLogOpen(false);
      setIsUploadOpen(false);
    }
  }, [user]);

  // Pass user to hooks so they scope data to the logged-in user
  const { logs, saveLog } = useLogs(user);
  const { periodDays, addPeriodDay, removePeriodDay, batchAddPeriodDays } = usePeriodDays(user);

  // Derive cycle state from real period data
  const cycleData = useMemo(() => computeCycleData(periodDays), [periodDays]);
  const displayData = { ...appData, ...cycleData, todayLog: logs[todayKey()] || null };

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
    : new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  // While checking auth state, show nothing (avoids flash of wrong screen)
  if (authLoading) return null;

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

          {/* Show auth screen if not logged in, otherwise show the app */}
          {!user ? (
            <AuthScreen onSignIn={signIn} onSignUp={signUp} />
          ) : (
            <>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {tab === "home" && <HomeScreen data={displayData} onOpenLog={() => { setLogDate(todayKey()); setIsLogOpen(true); }} onOpenSettings={() => setIsSettingsOpen(true)} userName={user.email.split('@')[0]} onBatchAddPeriodDays={batchAddPeriodDays} onRemovePeriodDay={removePeriodDay} />}
                {tab === "calendar" && <CalendarScreen logs={logs} periodDays={periodDays} predictedDays={cycleData.predictedDays || []} cycleHistory={cycleData.cycleHistory || []} onBatchAddPeriodDays={batchAddPeriodDays} onOpenLog={(date) => { setLogDate(date); setIsLogOpen(true); }} onAddPeriodDay={addPeriodDay} onRemovePeriodDay={removePeriodDay} />}
                {tab === "ask" && <AskLunarScreen messages={chatMessages} onMessagesChange={setChatMessages} onNewChat={() => setChatMessages([INITIAL_MESSAGE])} context={{
                  userName: user.email.split('@')[0],
                  today: todayKey(),
                  cycleDay: cycleData.cycleDay,
                  predictedCycleLength: cycleData.predictedCycleLength,
                  daysUntilNextPeriod: cycleData.daysUntilNextPeriod,
                  nextPeriodDate: cycleData.nextPeriodDate,
                  isOnPeriod: cycleData.isOnPeriod,
                  recentPeriods: cycleData.cycleHistory || [],
                  recentLogs: Object.entries(logs)
                    .filter(([date]) => date >= new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
                    .map(([date, log]) => ({ date, ...log }))
                    .sort((a, b) => b.date.localeCompare(a.date)),
                  hormoneReports: reports,
                }} />}
                {tab === "records" && <RecordsScreen reports={reports} onViewReport={setSelectedReport} onAddReport={() => setIsUploadOpen(true)} />}
              </div>
              <TabBar active={tab} onChange={setTab} />
            </>
          )}
        </div>
      </div>

      {user && (
        <>
          <LogModal isOpen={isLogOpen} onClose={() => { setIsLogOpen(false); setLogDate(null); }} isOnPeriod={cycleData.isOnPeriod} existingLog={logs[logDate || todayKey()]} onSave={handleSaveLog} dateLabel={dayLabel} />
          <RecordDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} data={displayData} onUpdateSettings={(s) => setAppData((p) => ({ ...p, ...s }))} onSignOut={signOut} />
          <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSave={(r) => console.log("New report:", r)} />
        </>
      )}
    </>
  );
}
