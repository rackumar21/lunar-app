import { useState, useMemo, useEffect, useCallback } from "react";
import { SEED, SEED_NOTES, HORMONE_REPORTS, C, F } from "./lib/constants";
import { todayKey, computeCycleData } from "./lib/helpers";
import { logger } from "./lib/logger";
import { analytics } from "./lib/analytics";
import { useAuth } from "./hooks/useAuth";
import { useLogs } from "./hooks/useLogs";
import { usePeriodDays } from "./hooks/usePeriodDays";
import { useReports } from "./hooks/useReports";
import { useMemories } from "./hooks/useMemories";
import Styles from "./components/Styles";
import TabBar from "./components/TabBar";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
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

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
  }, []);

  // Auto-dismiss toast after 3.5s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Global catch-all: any unhandled JS error or rejected Promise shows a generic toast
  useEffect(() => {
    const onError = (event) => {
      logger.error("Uncaught error", { message: event.message, source: event.filename, line: event.lineno });
      showToast("Something went wrong. Please try again.");
    };
    const onUnhandledRejection = (event) => {
      logger.error("Unhandled promise rejection", { reason: String(event.reason) });
      showToast("Something went wrong. Please try again.");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [showToast]);
  // ──────────────────────────────────────────────────────────────────────────

  const [tab, setTab] = useState("home");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  // Detect keyboard open: compare visual viewport against the initial window height.
  // window.innerHeight stays constant on iOS when keyboard opens; visualViewport shrinks.
  // We also listen to window.resize as a fallback for browsers where visualViewport events are unreliable.
  useEffect(() => {
    const INITIAL_HEIGHT = window.innerHeight;
    const checkKeyboard = () => {
      const vvh = window.visualViewport?.height ?? window.innerHeight;
      setKeyboardOpen(INITIAL_HEIGHT - vvh > 150);
    };
    const checkWidth = () => setIsDesktop(window.innerWidth >= 768);
    window.visualViewport?.addEventListener('resize', checkKeyboard);
    window.addEventListener('resize', checkKeyboard);
    window.addEventListener('resize', checkWidth);
    return () => {
      window.visualViewport?.removeEventListener('resize', checkKeyboard);
      window.removeEventListener('resize', checkKeyboard);
      window.removeEventListener('resize', checkWidth);
    };
  }, []);
  const [appData, setAppData] = useState(SEED);
  const [notes, setNotes] = useState(SEED_NOTES);
  const { reports, saveReport, deleteReport, reorderReports } = useReports(user, showToast);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logDate, setLogDate] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const INITIAL_MESSAGE = { role: "ai", text: "Hey! What's on your mind? You can ask me anything about your cycle, how you've been feeling, or your health records." };
  const [chatMessages, setChatMessages] = useState([INITIAL_MESSAGE]);
  const { memories, addMemories } = useMemories(user, showToast);

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

  // Reset to home tab and close all modals whenever the user logs in.
  // Also identify them in analytics so events are tied to their user ID.
  useEffect(() => {
    if (user) {
      setTab("home");
      setIsSettingsOpen(false);
      setIsLogOpen(false);
      setIsUploadOpen(false);
      analytics.identify(user.id);
    } else {
      // User logged out — clear analytics identity so events aren't mis-attributed
      analytics.reset();
    }
  }, [user]);

  // Pass user to hooks so they scope data to the logged-in user
  const { logs, saveLog } = useLogs(user, showToast);
  const { periodDays, addPeriodDay, removePeriodDay, batchAddPeriodDays, batchRemovePeriodDays } = usePeriodDays(user, showToast);

  // Derive cycle state from real period data
  const cycleData = useMemo(() => computeCycleData(periodDays), [periodDays]);
  const displayData = { ...appData, ...cycleData, todayLog: logs[todayKey()] || null };

  const handleSaveLog = (log) => {
    const key = logDate || todayKey();
    saveLog(key, log);
    if (log.note) setNotes((p) => [{ date: key, text: log.note }, ...p.filter(n => n.date !== key)]);
    if (key === todayKey()) setAppData((p) => ({ ...p, todayLog: log }));
    setLogDate(null);
    if (Object.keys(logs).length === 0) analytics.track("first_log_saved");
    analytics.track("log_saved");
  };

  const handleTogglePeriod = () => {
    const today = todayKey();
    if (appData.isOnPeriod) {
      removePeriodDay(today);
    } else {
      addPeriodDay(today);
      analytics.track("period_day_marked");
    }
    setAppData((p) => ({ ...p, isOnPeriod: !p.isOnPeriod }));
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    analytics.track("tab_viewed", { tab: newTab });
  };

  const dayLabel = logDate
    ? new Date(logDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  // While checking auth state, show nothing (avoids flash of wrong screen)
  if (authLoading) return null;

  // ── Shared screen content (same JSX for both mobile and desktop) ────────────
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const askContext = {
    userName,
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
    memories,
  };

  const screens = user ? (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {tab === "home" && <HomeScreen data={displayData} onOpenLog={() => { setLogDate(todayKey()); setIsLogOpen(true); }} onOpenSettings={() => setIsSettingsOpen(true)} userName={userName} onBatchAddPeriodDays={batchAddPeriodDays} onRemovePeriodDay={removePeriodDay} isDesktop={isDesktop} />}
      {tab === "calendar" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", maxWidth: isDesktop ? 900 : "none", margin: isDesktop ? "0 auto" : 0, width: "100%" }}>
            <CalendarScreen logs={logs} periodDays={periodDays} predictedDays={cycleData.predictedDays || []} cycleHistory={cycleData.cycleHistory || []} onBatchAddPeriodDays={batchAddPeriodDays} onBatchRemovePeriodDays={batchRemovePeriodDays} onOpenLog={(date) => { setLogDate(date); setIsLogOpen(true); }} onAddPeriodDay={addPeriodDay} onRemovePeriodDay={removePeriodDay} isDesktop={isDesktop} />
          </div>
        </div>
      )}
      {tab === "ask" && <AskLunarScreen messages={chatMessages} onMessagesChange={setChatMessages} onNewChat={() => { setChatMessages([INITIAL_MESSAGE]); if (user) localStorage.removeItem(`lunar_chat_${user.id}`); }} keyboardOpen={keyboardOpen} onSaveMemories={addMemories} context={askContext} isDesktop={isDesktop} />}
      {tab === "records" && <RecordsScreen reports={reports} onViewReport={setSelectedReport} onAddReport={() => setIsUploadOpen(true)} onReorder={reorderReports} isDesktop={isDesktop} />}
    </div>
  ) : null;
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Styles />

      {isDesktop ? (
        // ── Desktop layout: sidebar on left, content on right ───────────────
        <div style={{ position: "fixed", inset: 0, background: "#F7F3EE", display: "flex" }}>
          <div style={{ width: "100%", display: "flex", height: "100%" }}>

            {/* Sidebar — only shown when logged in */}
            {user && (
              <Sidebar active={tab} onChange={handleTabChange} onOpenSettings={() => setIsSettingsOpen(true)} />
            )}

            {/* Content area */}
            <div style={{ flex: 1, background: "#F7F3EE", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {!user ? (
                <AuthScreen onSignIn={signIn} onSignUp={signUp} isDesktop={isDesktop} />
              ) : (
                screens
              )}
            </div>

          </div>
        </div>
      ) : (
        // ── Mobile layout: unchanged ─────────────────────────────────────────
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "var(--app-height, 100svh)", background: "#F7F3EE", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 430, height: "100%", background: "#F7F3EE", display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 100 }} />

            {!user ? (
              <AuthScreen onSignIn={signIn} onSignUp={signUp} />
            ) : (
              <>
                {screens}
                {!(keyboardOpen && tab === "ask") && <TabBar active={tab} onChange={handleTabChange} />}
              </>
            )}
          </div>
        </div>
      )}

      {user && (
        <>
          <LogModal isOpen={isLogOpen} onClose={() => { setIsLogOpen(false); setLogDate(null); }} isOnPeriod={cycleData.isOnPeriod} existingLog={logs[logDate || todayKey()]} onSave={handleSaveLog} dateLabel={dayLabel} />
          <RecordDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} allReports={reports} onDelete={(id) => { deleteReport(id); setSelectedReport(null); }} />
          <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} data={displayData} onUpdateSettings={(s) => setAppData((p) => ({ ...p, ...s }))} onSignOut={signOut} />
          <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSave={saveReport} />
        </>
      )}

      <Toast message={toast?.message} type={toast?.type} />
    </>
  );
}
