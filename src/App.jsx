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
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Detect keyboard open: compare visual viewport against the initial window height.
  // window.innerHeight stays constant on iOS when keyboard opens; visualViewport shrinks.
  // We also listen to window.resize as a fallback for browsers where visualViewport events are unreliable.
  useEffect(() => {
    const INITIAL_HEIGHT = window.innerHeight;
    const check = () => {
      const vvh = window.visualViewport?.height ?? window.innerHeight;
      setKeyboardOpen(INITIAL_HEIGHT - vvh > 150);
    };
    window.visualViewport?.addEventListener('resize', check);
    window.addEventListener('resize', check);
    return () => {
      window.visualViewport?.removeEventListener('resize', check);
      window.removeEventListener('resize', check);
    };
  }, []);
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

  // Load saved chat from localStorage when user logs in
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`lunar_chat_${user.id}`);
      setChatMessages(saved ? JSON.parse(saved) : [INITIAL_MESSAGE]);
    }
  }, [user]);

  // Save chat to localStorage whenever messages change
  useEffect(() => {
    if (user) localStorage.setItem(`lunar_chat_${user.id}`, JSON.stringify(chatMessages));
  }, [chatMessages, user]);

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
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "var(--app-height, 100svh)", background: "#F7F3EE", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 430, height: "100%", background: "#F7F3EE", display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 100 }} />

          {/* Show auth screen if not logged in, otherwise show the app */}
          {!user ? (
            <AuthScreen onSignIn={signIn} onSignUp={signUp} />
          ) : (
            <>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {tab === "home" && <HomeScreen data={displayData} onOpenLog={() => { setLogDate(todayKey()); setIsLogOpen(true); }} onOpenSettings={() => setIsSettingsOpen(true)} userName={user.user_metadata?.full_name || user.email.split('@')[0]} onBatchAddPeriodDays={batchAddPeriodDays} onRemovePeriodDay={removePeriodDay} />}
                {tab === "calendar" && <CalendarScreen logs={logs} periodDays={periodDays} predictedDays={cycleData.predictedDays || []} cycleHistory={cycleData.cycleHistory || []} onBatchAddPeriodDays={batchAddPeriodDays} onOpenLog={(date) => { setLogDate(date); setIsLogOpen(true); }} onAddPeriodDay={addPeriodDay} onRemovePeriodDay={removePeriodDay} />}
                {tab === "ask" && <AskLunarScreen messages={chatMessages} onMessagesChange={setChatMessages} onNewChat={() => { setChatMessages([INITIAL_MESSAGE]); if (user) localStorage.removeItem(`lunar_chat_${user.id}`); }} keyboardOpen={keyboardOpen} context={{
                  userName: user.user_metadata?.full_name || user.email.split('@')[0],
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
              {!(keyboardOpen && tab === "ask") && <TabBar active={tab} onChange={setTab} />}
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
