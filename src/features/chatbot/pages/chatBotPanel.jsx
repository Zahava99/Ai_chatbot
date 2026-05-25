import { useState, useRef, useEffect } from "react";
import { MoreVertical, ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  "Start a project",
  "Learn or understand something",
  "Create a podcast, video, slide deck, etc.",
  "Something else...",
];

export default function ChatBotPanel({ sourceCount = 0 }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    // TODO: wire up to actual chat logic
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex flex-col h-full overflow-hidden min-w-0">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-app-border shrink-0">
        <span className="text-sm font-medium text-app opacity-90">Chat</span>
        <button className="p-1 rounded-md text-app opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Welcome / messages area */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-lg">
          <div className="text-4xl mb-4">👋</div>

          <h1 className="text-2xl font-semibold text-app mb-3 leading-snug">
            Let's start your notebook...
          </h1>

          <p className="text-sm text-app opacity-50 mb-7 leading-relaxed">
            This is your blank canvas to understand, create, or make progress on
            something new. I can help you get started or you can go ahead and add
            your own sources.
          </p>

          <p className="text-sm text-app opacity-60 mb-3">
            What would you like this notebook to help you do?
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-left px-4 py-2.5 rounded-lg border border-app-border hover:border-black/25 dark:hover:border-white/25 hover:bg-black/5 dark:hover:bg-white/5 text-sm text-app opacity-70 hover:opacity-100 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
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
            placeholder="Ask a question or create something"
            className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-app opacity-30 whitespace-nowrap">
              {sourceCount} sources
            </span>
            <button
              onClick={handleSend}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-app opacity-60 hover:opacity-100 transition-all"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
