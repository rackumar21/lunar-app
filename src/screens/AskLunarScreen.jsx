import { useState, useRef, useEffect } from "react";
import { C, F } from "../lib/constants";
import { AI_SUGGESTIONS } from "../lib/ai";
import { analytics } from "../lib/analytics";

const AskLunarScreen = ({ context, messages, onMessagesChange, onNewChat, keyboardOpen, onSaveMemories, isDesktop }) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [memoryNote, setMemoryNote] = useState(null);
  const scrollRef = useRef(null);

  // Show "Noted" notification for 2.5s when a new memory is saved
  useEffect(() => {
    if (!memoryNote) return;
    const t = setTimeout(() => setMemoryNote(null), 2500);
    return () => clearTimeout(t);
  }, [memoryNote]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // When keyboard opens/closes, the header shows/hides which resizes the scroll area.
  // Re-scroll to bottom so the latest message stays visible.
  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 80);
  }, [keyboardOpen]);

  // When keyboard opens: iOS Chrome scrolls the page up (even with position:fixed).
  // Reset page scroll to 0 immediately, then scroll messages to the latest.
  useEffect(() => {
    const onViewportResize = () => {
      window.scrollTo(0, 0);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
    };
    window.visualViewport?.addEventListener('resize', onViewportResize);
    return () => window.visualViewport?.removeEventListener('resize', onViewportResize);
  }, []);

  // Track whether user has scrolled up — if so, show header even when keyboard is open
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
  };

  // Header and suggestions visible when: keyboard closed, OR user has scrolled up to read
  const showHeader = !keyboardOpen || !isAtBottom;

  const handleSend = async (q) => {
    const question = q || input.trim();
    if (!question || isTyping) return;
    onMessagesChange((p) => [...p, { role: "user", text: question }]);
    analytics.track("ai_message_sent");
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context }),
      });
      const data = await res.json();
      onMessagesChange((p) => [...p, { role: "ai", text: data.answer || data.error || "Something went wrong." }]);
      if (data.newFacts?.length) {
        onSaveMemories?.(data.newFacts);
        setMemoryNote(data.newFacts[0]);
      }
    } catch {
      onMessagesChange((p) => [...p, { role: "ai", text: "Couldn't reach Lunar right now. Check your connection and try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // On desktop: full-width background but content centered in a column (ChatGPT pattern)
  const col = isDesktop ? { maxWidth: 800, margin: "0 auto", width: "100%" } : {};
  const hPad = isDesktop ? "16px 24px" : "12px 16px 10px";
  const mPad = isDesktop ? "24px 24px 8px" : "14px 16px 8px";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {showHeader && (
        <>
          <div style={{ flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ ...col, padding: hPad, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🌙</div>
                <div>
                  <h2 style={{ fontFamily: F.heading, fontSize: 18, fontWeight: 400, color: C.text }}>Ask Lunar</h2>
                  <p style={{ fontFamily: F.body, fontSize: 11, color: C.textSec }}>Knows your cycle, symptoms & records</p>
                </div>
              </div>
              {messages.length > 1 && (
                <button className="press" onClick={() => { onNewChat(); analytics.track("new_chat_started"); }} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, fontFamily: F.body, fontSize: 11, fontWeight: 600, color: C.textSec }}>
                  New chat
                </button>
              )}
            </div>
          </div>
          <div style={{ flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ ...col, padding: isDesktop ? "10px 24px" : "10px 16px" }}>
              <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {AI_SUGGESTIONS.map((s) => (
                  <button key={s} className="press" onClick={() => handleSend(s)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, fontFamily: F.body, fontSize: 11, color: C.textSec, whiteSpace: "nowrap" }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {memoryNote && (
        <div style={{ ...col, padding: "6px 24px", flexShrink: 0 }}>
          <span style={{ fontFamily: F.body, fontSize: 11, color: C.textSec, background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 12px" }}>
            ✓ Noted — {memoryNote}
          </span>
        </div>
      )}

      <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ ...col, padding: mPad }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 14, alignItems: "flex-end", gap: 8 }}>
              {msg.role === "ai" && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🌙</div>
              )}
              <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? `linear-gradient(135deg, ${C.primary}, ${C.rose})` : C.white, border: msg.role === "ai" ? `1px solid ${C.border}` : "none" }}>
                <p style={{ fontFamily: F.body, fontSize: 13, color: msg.role === "user" ? C.white : C.text, lineHeight: 1.65, whiteSpace: "pre-line" }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🌙</div>
              <div style={{ padding: "11px 15px", borderRadius: "18px 18px 18px 4px", background: C.white, border: `1px solid ${C.border}` }}>
                <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted }}>Thinking…</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0, borderTop: `1px solid ${C.border}`, background: C.bg }}>
        <div style={{ ...col, padding: isDesktop ? "12px 24px 16px" : "10px 14px 12px", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Message Lunar…" rows={1} style={{ flex: 1, padding: "11px 14px", borderRadius: 20, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 16, color: C.text, resize: "none", outline: "none", lineHeight: 1.5 }} />
          <button className="press" onPointerDown={(e) => e.preventDefault()} onClick={() => handleSend()} disabled={isTyping} style={{ width: 42, height: 42, borderRadius: "50%", background: input.trim() && !isTyping ? `linear-gradient(135deg, ${C.primary}, ${C.rose})` : C.border, fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: input.trim() && !isTyping ? C.white : C.textMuted }}>→</button>
        </div>
      </div>
    </div>
  );
};

export default AskLunarScreen;
