import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Search, Trash2, Pencil, ChevronRight } from "lucide-react";

const SESSIONS = [
  { id: 1, title: "What is gradient descent?", subject: "Machine Learning", msgs: 12, date: "May 26, 2026", preview: "Gradient descent is an optimization algorithm used to minimize a function..." },
  { id: 2, title: "Explain backpropagation", subject: "Deep Learning", msgs: 8, date: "May 25, 2026", preview: "Backpropagation is the algorithm used to train neural networks..." },
  { id: 3, title: "CNN vs RNN differences", subject: "Deep Learning", msgs: 15, date: "May 24, 2026", preview: "CNNs are primarily used for spatial data while RNNs handle sequential..." },
  { id: 4, title: "Transformer architecture overview", subject: "NLP", msgs: 22, date: "May 23, 2026", preview: "The transformer model uses self-attention mechanisms to process..." },
  { id: 5, title: "What is transfer learning?", subject: "Machine Learning", msgs: 6, date: "May 22, 2026", preview: "Transfer learning is a technique where a model trained on one task..." },
  { id: 6, title: "Explain BERT model", subject: "NLP", msgs: 18, date: "May 21, 2026", preview: "BERT (Bidirectional Encoder Representations from Transformers) is..." },
];

export default function SessionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState(SESSIONS);

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Sessions</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{sessions.length} chat sessions</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 mb-5">
        <Search size={15} className="text-app opacity-40 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sessions..."
          className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none"
        />
      </div>

      {/* Session list */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden divide-y divide-app-border">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-start gap-4 px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
            onClick={() => navigate("/chat")}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare size={16} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-app truncate">{s.title}</p>
                <span className="text-xs text-app opacity-30 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full shrink-0">{s.subject}</span>
              </div>
              <p className="text-xs text-app opacity-50 truncate">{s.preview}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-app opacity-30">{s.date}</span>
                <span className="text-xs text-app opacity-30">·</span>
                <span className="text-xs text-app opacity-30">{s.msgs} messages</span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="p-1.5 rounded-md text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSessions((prev) => prev.filter((x) => x.id !== s.id)); }}
                className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={13} />
              </button>
              <ChevronRight size={14} className="text-app opacity-30 ml-1" />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <MessageSquare size={28} className="text-app opacity-20" />
            <p className="text-sm text-app opacity-40">No sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
