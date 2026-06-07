import { useState, useRef, useEffect } from "react";
import { MoreVertical, ArrowRight, Bot, User } from "lucide-react";
import { useChatbotStore } from "@/features/chatbot/store/chatbotStore";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Give me an overview of the August Revolution",
  "Explain Hồ Chí Minh's ideology",
  "What happened during the land reform?",
  "How did French colonialism affect Vietnam?",
];

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
          isUser
            ? "bg-zinc-900 dark:bg-white"
            : "bg-black/10 dark:bg-white/10"
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
            : "bg-black/5 dark:bg-white/8 text-app rounded-tl-sm"
        )}
      >
        {message.text}
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
export default function ChatBotPanel({ subjectId }) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  const activeSessionId = useChatbotStore((s) => s.activeSessionId);
  const sessions = useChatbotStore((s) => s.sessions);
  const sendMessage = useChatbotStore((s) => s.sendMessage);
  const createSession = useChatbotStore((s) => s.createSession);
  const setActiveSession = useChatbotStore((s) => s.setActiveSession);

  // Resolve active session object reactively
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Show typing indicator for 800 ms while bot "thinks"
  const handleSend = (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;

    // If no active session, create one for this subject first
    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createSession(subjectId ?? "unknown");
    }

    setInput("");
    setIsTyping(true);
    sendMessage(sessionId, trimmed);

    // Hide typing indicator after the same delay used in the store (800 ms)
    setTimeout(() => setIsTyping(false), 900);
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
        {showWelcome ? (
          /* Welcome screen */
          <div className="max-w-lg">
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-semibold text-app mb-3 leading-snug">
              Ask anything about{" "}
              <span className="opacity-60">{subjectId ?? "this subject"}</span>
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
          /* Message thread */
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
            disabled={!input.trim()}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-app opacity-60 hover:opacity-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </main>
  );
}
