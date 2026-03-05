import { useState, useRef, useEffect } from "react";
import { C, F } from "../lib/constants";
import { AI_SUGGESTIONS } from "../lib/ai";

const AskLunarScreen = ({ context, messages, onMessagesChange, onNewChat, onKeyboardToggle }) => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // When keyboard opens/closes, scroll to the latest message
  useEffect(() => {
    const onViewportResize = () => {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    };
    window.visualViewport?.addEventListener('resize', onViewportResize);
    return () => window.visualViewport?.removeEventListener('resize', onViewportResize);
  }, []);

  const handleSend = async (q) => {
    const question = q || input.trim();
    if (!question || isTyping) return;
    onMessagesChange((p) => [...p, { role: "user", text: question }]);
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
    } catch {
      onMessagesChange((p) => [...p, { role: "ai", text: "Couldn't reach Lunar right now. Check your connection and try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Your AI companion</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.rose})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🌙</div>
            <div>
              <h2 style={{ fontFamily: F.heading, fontSize: 22, fontWeight: 400, color: C.text }}>Ask Lunar</h2>
              <p style={{ fontFamily: F.body, fontSize: 11, color: C.textSec }}>Knows your cycle, symptoms & records</p>
            </div>
          </div>
          {messages.length > 1 && (
            <button className="press" onClick={onNewChat} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, fontFamily: F.body, fontSize: 11, fontWeight: 600, color: C.textSec }}>
              New chat
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "10px 16px", flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {AI_SUGGESTIONS.map((s) => (
            <button key={s} className="press" onClick={() => handleSend(s)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 20, border: `1px solid ${C.border}`, background: C.white, fontFamily: F.body, fontSize: 11, color: C.textSec, whiteSpace: "nowrap" }}>{s}</button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px 8px" }}>
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

      <div style={{ padding: "10px 14px 12px", borderTop: `1px solid ${C.border}`, flexShrink: 0, display: "flex", gap: 10, alignItems: "flex-end", background: C.bg }}>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} onFocus={() => onKeyboardToggle?.(true)} onBlur={() => onKeyboardToggle?.(false)} placeholder="Message Lunar…" rows={1} style={{ flex: 1, padding: "11px 14px", borderRadius: 20, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 16, color: C.text, resize: "none", outline: "none", lineHeight: 1.5 }} />
        <button className="press" onClick={() => handleSend()} disabled={isTyping} style={{ width: 42, height: 42, borderRadius: "50%", background: input.trim() && !isTyping ? `linear-gradient(135deg, ${C.primary}, ${C.rose})` : C.border, fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: input.trim() && !isTyping ? C.white : C.textMuted }}>→</button>
      </div>
    </div>
  );
};

export default AskLunarScreen;
