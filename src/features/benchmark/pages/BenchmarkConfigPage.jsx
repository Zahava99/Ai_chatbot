import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, ChevronDown } from "lucide-react";

const DATASETS = ["Testset_50QA_v1", "Testset_50QA_v2", "Custom Dataset"];
const MODELS = ["multilingual-e5-base", "bge-m3", "PhoBERT", "OpenAI text-embedding-3-small"];
const CHUNK_STRATEGIES = ["Fixed chunk", "Semantic chunk", "Recursive chunk"];
const LLM_MODELS = ["GPT-4o", "GPT-3.5-turbo", "Gemini 1.5 Pro", "Llama 3"];

export default function BenchmarkConfigPage() {
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(DATASETS[0]);
  const [selectedModels, setSelectedModels] = useState([MODELS[0]]);
  const [selectedChunks, setSelectedChunks] = useState([CHUNK_STRATEGIES[0]]);
  const [llm, setLlm] = useState(LLM_MODELS[0]);
  const [topK, setTopK] = useState(5);

  function toggleItem(list, setList, item) {
    setList((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Benchmark Config</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Configure and run a RAGAS evaluation</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Dataset */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-3">Dataset</p>
          <div className="relative">
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition"
            >
              {DATASETS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
          </div>
        </div>

        {/* Embedding models */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-3">Embedding Models <span className="text-xs text-app opacity-40 font-normal">(select multiple)</span></p>
          <div className="flex flex-col gap-2">
            {MODELS.map((m) => (
              <label key={m} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => toggleItem(selectedModels, setSelectedModels, m)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedModels.includes(m) ? "border-emerald-500 bg-emerald-500" : "border-app-border group-hover:border-emerald-500/50"}`}
                >
                  {selectedModels.includes(m) && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm text-app opacity-70">{m}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Chunk strategies */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-3">Chunk Strategies <span className="text-xs text-app opacity-40 font-normal">(select multiple)</span></p>
          <div className="grid grid-cols-3 gap-2">
            {CHUNK_STRATEGIES.map((s) => (
              <button
                key={s}
                onClick={() => toggleItem(selectedChunks, setSelectedChunks, s)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors ${selectedChunks.includes(s) ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-app-border text-app opacity-60 hover:opacity-100"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* LLM + Top-K */}
        <div className="bg-panel border border-app-border rounded-xl p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-app mb-2">LLM Model</p>
            <div className="relative">
              <select
                value={llm}
                onChange={(e) => setLlm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition"
              >
                {LLM_MODELS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-sm font-semibold text-app">Top-K Retrieval</p>
              <span className="text-sm text-app font-medium">{topK}</span>
            </div>
            <input type="range" min={1} max={20} value={topK} onChange={(e) => setTopK(Number(e.target.value))} className="w-full accent-emerald-500" />
          </div>
        </div>

        {/* Run */}
        <button
          onClick={() => navigate("/benchmark/results")}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
        >
          <Play size={16} /> Run Benchmark
        </button>
      </div>
    </div>
  );
}
