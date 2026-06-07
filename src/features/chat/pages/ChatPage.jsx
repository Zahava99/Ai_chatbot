import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, MoreVertical, Trash2, Pencil,
  MessageSquare, ArrowRight, BookOpen, FileText, Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SESSIONS = [
  { id: 1, title: "What is gradient descent?", preview: "Gradient descent is an optimization algorithm...", date: "May 26, 2026", msgs: 12 },
  { id: 2, title: "Explain backpropagation", preview: "Backpropagation is the algorithm used to...", date: "May 25, 2026", msgs: 8 },
  { id: 3, title: "CNN vs RNN differences", preview: "CNNs are primarily used for spatial data...", date: "May 24, 2026", msgs: 15 },
  { id: 4, title: "Transformer architecture", preview: "The transformer model uses self-attention...", date: "May 23, 2026", msgs: 22 },
];

const SUGGESTED = [
  "Explain the main concepts in Chapter 3",
  "What are the key differences between supervised and unsupervised learning?",
  "Summarize the lecture on neural networks",
  "What is the bias-variance tradeoff?",
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = SESSIONS.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  if (activeSession) {
    return <ChatConversation session={activeSession} onBack={() => setActiveSession(null)} />;
  }

  return (
    <div className="flex h-full">
      {/* Session list sidebar */}
      <div className="w-72 border-r border-app-border flex flex-col bg-panel shrink-0">
        <div className="px-4 py-4 border-b border-app-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-app">Sessions</span>
            <button
              onClick={() => setActiveSession({ id: "new", title: "New Chat", msgs: [] })}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
            <Search size={13} className="text-app opacity-40 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions..."
              className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSession(s)}
              className="relative flex items-start gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <MessageSquare size={15} className="text-app opacity-30 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-app truncate">{s.title}</p>
                <p className="text-xs text-app opacity-40 truncate mt-0.5">{s.preview}</p>
                <p className="text-xs text-app opacity-25 mt-1">{s.date}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === s.id ? null : s.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-app opacity-40 hover:opacity-80 transition-all shrink-0"
              >
                <MoreVertical size={13} />
              </button>
              {openMenu === s.id && (
                <div className="absolute right-2 top-8 w-36 bg-panel border border-app-border rounded-xl shadow-xl z-50 py-1">
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <Pencil size={12} /> Rename
                  </button>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/5 transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty state / home */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="text-5xl">💬</div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-app mb-2">Start a conversation</h2>
          <p className="text-sm text-app opacity-50 max-w-sm leading-relaxed">
            Ask questions about your uploaded documents. The AI will answer with citations from your sources.
          </p>
        </div>

        {/* Suggested prompts */}
        <div className="w-full max-w-lg flex flex-col gap-2">
          <p className="text-xs text-app opacity-40 mb-1 flex items-center gap-1.5">
            <Lightbulb size={12} /> Suggested questions
          </p>
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => setActiveSession({ id: "new", title: q, msgs: [] })}
              className="text-left px-4 py-3 rounded-xl border border-app-border hover:border-black/25 dark:hover:border-white/25 hover:bg-black/5 dark:hover:bg-white/5 text-sm text-app opacity-70 hover:opacity-100 transition-all flex items-center justify-between group"
            >
              <span>{q}</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/documents/upload")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <FileText size={15} /> Upload your first document
        </button>
      </div>
    </div>
  );
}

// ── Inline conversation component ──
function ChatConversation({ session, onBack }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(
    session.id === "new"
      ? []
      : [
          { id: 1, role: "user", content: session.title },
          {
            id: 2,
            role: "assistant",
            content: "Based on your documents, here is a detailed explanation...\n\nThe concept involves several key principles that are outlined in **Chapter 3** of your uploaded material. The main idea is that the algorithm iteratively adjusts parameters to minimize a loss function.\n\n> *Source: Lecture_01.pdf, page 12 — \"The optimization process converges when the gradient approaches zero...\"*",
            sources: [{ doc: "Lecture_01.pdf", page: 12, similarity: 0.94 }],
          },
        ]
  );
  const [thinking, setThinking] = useState(false);
  const [showCitation, setShowCitation] = useState(null);

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Based on the documents in your collection, I found relevant information that addresses your question. The key points are:\n\n1. **First principle**: As described in the lecture notes...\n2. **Second principle**: According to Chapter 3...\n\nThis is supported by multiple sources in your uploaded materials.",
          sources: [{ doc: "Lecture_01.pdf", page: 8, similarity: 0.91 }],
        },
      ]);
    }, 2000);
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-app-border bg-panel shrink-0">
        <button onClick={onBack} className="text-app opacity-50 hover:opacity-100 transition-opacity text-sm">
          ← Back
        </button>
        <span className="text-sm font-medium text-app truncate">{session.title}</span>
        <button
          onClick={() => setShowCitation("settings")}
          className="ml-auto text-xs text-app opacity-40 hover:opacity-80 transition-opacity"
        >
          ⚙ Settings
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="text-4xl">🤔</div>
            <p className="text-sm text-app opacity-50">Ask anything about your documents</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-panel border border-app-border text-app rounded-bl-sm")}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.sources && (
                <div className="mt-3 pt-3 border-t border-app-border/50 flex flex-wrap gap-2">
                  {msg.sources.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setShowCitation(s)}
                      className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition-colors"
                    >
                      📄 {s.doc} p.{s.page} · {(s.similarity * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="bg-panel border border-app-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-app opacity-50">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-app opacity-40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                Searching documents...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-app-border shrink-0">
        <div className="flex items-end gap-3 bg-black/5 dark:bg-white/5 border border-app-border rounded-xl px-4 py-3 focus-within:border-black/20 dark:focus-within:border-white/20 transition-colors">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none resize-none leading-relaxed"
          />
          <button
            onClick={sendMessage}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
          >
            <ArrowRight size={14} />
          </button>
        </div>
        <p className="text-xs text-app opacity-20 text-center mt-2">AI can be inaccurate, please verify responses.</p>
      </div>

      {/* Citation modal */}
      {showCitation && showCitation !== "settings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-app">Citation Source</p>
              <button onClick={() => setShowCitation(null)} className="text-app opacity-40 hover:opacity-80">✕</button>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
              <p className="text-sm text-app opacity-80 leading-relaxed italic">
                "The optimization process converges when the gradient approaches zero, indicating that the algorithm has found a local or global minimum of the loss function..."
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-app opacity-50">
              <span>📄 {showCitation.doc} · Page {showCitation.page}</span>
              <span className="text-emerald-400">Similarity: {(showCitation.similarity * 100).toFixed(0)}%</span>
            </div>
            <button
              onClick={() => setShowCitation(null)}
              className="w-full mt-4 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat settings modal */}
      {showCitation === "settings" && (
        <ChatSettingsModal onClose={() => setShowCitation(null)} />
      )}
    </div>
  );
}

function ChatSettingsModal({ onClose }) {
  const [temp, setTemp] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [topK, setTopK] = useState(5);
  const [style, setStyle] = useState("detailed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <p className="text-base font-semibold text-app">Chat Settings</p>
          <button onClick={onClose} className="text-app opacity-40 hover:opacity-80">✕</button>
        </div>
        <div className="flex flex-col gap-5">
          {[
            { label: "Temperature", value: temp, set: setTemp, min: 0, max: 1, step: 0.1, display: temp.toFixed(1) },
            { label: "Max Tokens", value: maxTokens, set: setMaxTokens, min: 256, max: 4096, step: 256, display: maxTokens },
            { label: "Top-K Retrieval", value: topK, set: setTopK, min: 1, max: 20, step: 1, display: topK },
          ].map(({ label, value, set, min, max, step, display }) => (
            <div key={label}>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-app opacity-60">{label}</label>
                <span className="text-sm text-app font-medium">{display}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm text-app opacity-60 mb-2">Prompt Style</label>
            <div className="grid grid-cols-3 gap-2">
              {["concise", "detailed", "academic"].map((s) => (
                <button key={s} onClick={() => setStyle(s)} className={`py-2 rounded-xl border text-xs font-medium capitalize transition-colors ${style === s ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-app-border text-app opacity-60 hover:opacity-100"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-full mt-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
