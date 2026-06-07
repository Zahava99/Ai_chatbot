import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshCw, ChevronRight, ChevronDown } from "lucide-react";

const MODELS = ["multilingual-e5-base", "bge-m3", "PhoBERT", "OpenAI text-embedding-3-small"];
const STRATEGIES = ["Fixed chunk", "Semantic chunk", "Recursive chunk"];

export default function ReindexPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap] = useState(64);
  const [model, setModel] = useState(MODELS[0]);
  const [strategy, setStrategy] = useState(STRATEGIES[0]);

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-app opacity-40 mb-5">
        <button onClick={() => navigate("/documents")} className="hover:opacity-80">Documents</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate(`/documents/${id}`)} className="hover:opacity-80">Lecture_01.pdf</button>
        <ChevronRight size={12} />
        <span className="text-app opacity-70">Re-index</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Re-index Document</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Rebuild the vector index with new settings.</p>
      </div>

      <div className="bg-panel border border-app-border rounded-xl p-5 flex flex-col gap-5">
        {/* Embedding model */}
        <div>
          <label className="block text-sm text-app opacity-60 mb-2">Embedding Model</label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition"
            >
              {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
          </div>
        </div>

        {/* Chunk strategy */}
        <div>
          <label className="block text-sm text-app opacity-60 mb-2">Chunk Strategy</label>
          <div className="grid grid-cols-3 gap-2">
            {STRATEGIES.map((s) => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${strategy === s ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-app-border text-app opacity-60 hover:opacity-100"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Chunk size */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-app opacity-60">Chunk Size</label>
            <span className="text-sm text-app font-medium">{chunkSize} tokens</span>
          </div>
          <input
            type="range"
            min={128}
            max={2048}
            step={64}
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-app opacity-30 mt-1">
            <span>128</span><span>2048</span>
          </div>
        </div>

        {/* Overlap */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-app opacity-60">Overlap</label>
            <span className="text-sm text-app font-medium">{overlap} tokens</span>
          </div>
          <input
            type="range"
            min={0}
            max={256}
            step={16}
            value={overlap}
            onChange={(e) => setOverlap(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-app opacity-30 mt-1">
            <span>0</span><span>256</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={() => navigate(`/documents/${id}`)} className="flex-1 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => navigate("/documents/processing")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} /> Start Re-index
        </button>
      </div>
    </div>
  );
}
