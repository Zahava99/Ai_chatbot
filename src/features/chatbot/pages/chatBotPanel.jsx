import { useState, useRef, useEffect } from "react";
import { MoreVertical, ArrowRight, Bot, User, AlertCircle, FileText, Loader2 } from "lucide-react";
import { useChatbotStore } from "@/features/chatbot/store/chatbotStore";
import { askQuestion } from "@/features/chatbot/api/askApi";
import { fetchConversationMessages } from "@/features/chatbot/api/conversationsApi";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Give me an overview of the August Revolution",
  "Explain Hồ Chí Minh's ideology",
  "What happened during the land reform?",
  "How did French colonialism affect Vietnam?",
];

// ---------------------------------------------------------------------------
// Source badge with hover popover
// ---------------------------------------------------------------------------
function SourceBadge({ source }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <span className="relative inline-block align-baseline" ref={ref}>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/20 hover:bg-blue-500/35 text-blue-400 text-[10px] font-bold leading-none cursor-pointer transition-colors mx-0.5 align-middle"
        aria-label={`Source ${source.index}`}
      >
        {source.index}
      </button>

      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-panel border border-app-border rounded-xl shadow-xl p-3 text-left pointer-events-none">
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-app-border" />

          {/* Document name */}
          <div className="flex items-start gap-2 mb-2">
            <FileText size={13} className="text-blue-400 shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-app leading-snug line-clamp-2">
              {source.documentName}
            </span>
          </div>

          {/* Page number */}
          {source.pageNumber != null && (
            <p className="text-[11px] text-app opacity-50 mb-2">
              Page {source.pageNumber}
            </p>
          )}

          {/* Excerpt */}
          {source.excerpt && (
            <p className="text-[11px] text-app opacity-60 leading-relaxed line-clamp-4 border-t border-app-border pt-2">
              "{source.excerpt}"
            </p>
          )}
        </div>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Render answer text with [Source N] replaced by inline badges
// ---------------------------------------------------------------------------
function AnswerText({ text, sources }) {
  // Split on [Source N] or [Sources N, M, ...] patterns
  const parts = text.split(/(\[Source[s]?\s[\d,\s]+\])/gi);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/\[Source[s]?\s([\d,\s]+)\]/i);
        if (!match) return <span key={i}>{part}</span>;

        // Extract all numbers from the match, e.g. "1, 2" → [1, 2]
        const indices = match[1]
          .split(",")
          .map((n) => parseInt(n.trim(), 10))
          .filter((n) => !isNaN(n));

        return (
          <span key={i}>
            {indices.map((idx) => {
              const source = sources.find((s) => s.index === idx);
              return source ? (
                <SourceBadge key={idx} source={source} />
              ) : (
                <span key={idx} className="text-blue-400 text-xs mx-0.5">
                  [{idx}]
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------
function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3 mb-5", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isUser ? "bg-zinc-900 dark:bg-white" : "bg-black/10 dark:bg-white/10"
        )}
      >
        {isUser ? (
          <User size={13} className="text-white dark:text-zinc-900" />
        ) : (
          <Bot size={13} className="text-app opacity-70" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-tr-sm"
            : message.error
            ? "bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm"
            : "bg-black/5 dark:bg-white/8 text-app rounded-tl-sm"
        )}
      >
        {isUser || message.error ? (
          <>
            {message.error && (
              <AlertCircle size={13} className="inline mr-1.5 mb-0.5 opacity-70" />
            )}
            {message.text}
          </>
        ) : (
          <AnswerText text={message.text} sources={message.sources ?? []} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typing indicator
// ---------------------------------------------------------------------------
function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-5">
      <div className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
        <Bot size={13} className="text-app opacity-70" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-black/5 dark:bg-white/8 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-app opacity-40 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-app opacity-40 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-app opacity-40 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------
export default function ChatBotPanel({ subjectId, subjectCode }) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  const activeSessionId = useChatbotStore((s) => s.activeSessionId);
  const sessions = useChatbotStore((s) => s.sessions);
  const createSession = useChatbotStore((s) => s.createSession);
  const promoteSessionId = useChatbotStore((s) => s.promoteSessionId);

  // Resolve active session title for the header
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  // Load messages whenever the active session changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      setConversationId(null);
      return;
    }

    // Only seed conversationId if this is a real backend UUID, not a locally
    // generated session ID (e.g. "VNR202-session-1749123456789").
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeSessionId);
    setConversationId(isUUID ? activeSessionId : null);

    // Check the store first (simulated / locally created sessions have messages)
    const storeSession = sessions.find((s) => s.id === activeSessionId);
    if (storeSession?.messages?.length) {
      setMessages(storeSession.messages);
      return;
    }

    // For local new sessions with no messages yet, just show the welcome screen
    if (!isUUID) {
      setMessages([]);
      return;
    }

    // Otherwise fetch from the API
    let cancelled = false;
    setMessages([]);
    setLoadingHistory(true);

    fetchConversationMessages(activeSessionId)
      .then((msgs) => {
        if (!cancelled) setMessages(msgs);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => { cancelled = true; };
  }, [activeSessionId]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  // Scroll to bottom on new messages or typing indicator
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isTyping) return;

    // Capture the session ID before any async work
    let currentSessionId = activeSessionId;

    // Ensure there is an active session
    if (!currentSessionId) {
      currentSessionId = createSession(subjectId ?? "unknown", trimmed.slice(0, 50));
    }

    const userMsg = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const { answer, sources, conversationId: returnedId } = await askQuestion(subjectId, trimmed, conversationId);

      // On the first message of a new chat the backend returns a real UUID.
      // Store it so subsequent messages thread correctly, and promote the
      // local placeholder session ID to the real one.
      if (returnedId) {
        setConversationId(returnedId);
        const isLocalId = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentSessionId);
        if (isLocalId) promoteSessionId(currentSessionId, returnedId);
      }

      const botMsg = {
        id: `msg-${Date.now()}-b`,
        role: "bot",
        text: answer,
        sources,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `msg-${Date.now()}-err`,
        role: "bot",
        text: err.message ?? "Something went wrong. Please try again.",
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <main className="flex flex-col h-full overflow-hidden min-w-0">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-app-border shrink-0">
        <span className="text-sm font-medium text-app opacity-90">
          {activeSession ? activeSession.title : "Chat"}
        </span>
        <button className="p-1 rounded-md text-app opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Messages / welcome area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full gap-2 text-app opacity-30">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading conversation…</span>
          </div>
        ) : showWelcome ? (
          <div className="max-w-lg">
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-semibold text-app mb-3 leading-snug">
              Ask anything about{" "}
              <span className="opacity-60">{subjectCode ?? "this subject"}</span>
            </h1>
            <p className="text-sm text-app opacity-50 mb-7 leading-relaxed">
              I can help you understand course material, summarise topics, or
              answer exam-style questions. Try one of the suggestions below or
              type your own question.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left px-4 py-2.5 rounded-lg border border-app-border hover:border-black/25 dark:hover:border-white/25 hover:bg-black/5 dark:hover:bg-white/5 text-sm text-app opacity-70 hover:opacity-100 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-5 py-4 shrink-0 border-t border-app-border">
        <div className="flex items-end gap-3 bg-black/5 dark:bg-white/5 border border-app-border rounded-xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this subject…"
            className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none resize-none leading-relaxed"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-app opacity-60 hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </main>
  );
}
