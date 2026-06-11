import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";

const CHUNKS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  tokens: Math.floor(Math.random() * 150 + 380),
  similarity: (Math.random() * 0.15 + 0.82).toFixed(3),
  content: `This chunk covers section ${i + 1} of the document. Machine learning algorithms build a model based on sample data, known as training data, in order to make predictions or decisions without being explicitly programmed to do so. The algorithm learns from the data and improves its performance over time through experience.`,
}));

export default function AdminChunkViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = CHUNKS.filter((c) =>
    c.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-app opacity-40 mb-5">
        <button onClick={() => navigate("/admin")} className="hover:opacity-80">Admin</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate("/admin/documents")} className="hover:opacity-80">Documents</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate(`/admin/documents/${id}`)} className="hover:opacity-80">Lecture_01.pdf</button>
        <ChevronRight size={12} />
        <span className="text-app opacity-70">Chunks</span>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-app">Chunk Viewer</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
          <Search size={13} className="text-app opacity-40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chunks..."
            className="bg-transparent text-sm text-app placeholder:opacity-30 outline-none w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((chunk) => (
          <div
            key={chunk.id}
            onClick={() => setSelected(selected === chunk.id ? null : chunk.id)}
            className={`bg-panel border rounded-xl p-4 cursor-pointer transition-all ${
              selected === chunk.id
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-app-border hover:border-black/25 dark:hover:border-white/25"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-app opacity-40">#{chunk.id}</span>
                <span className="text-xs text-app opacity-30">·</span>
                <span className="text-xs text-app opacity-50">{chunk.tokens} tokens</span>
              </div>
              <span className="text-xs text-emerald-400 font-medium">
                sim: {chunk.similarity}
              </span>
            </div>
            <p className={`text-sm text-app opacity-60 leading-relaxed ${selected === chunk.id ? "" : "line-clamp-3"}`}>
              {chunk.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
