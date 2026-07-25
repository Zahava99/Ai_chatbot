import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Target, TrendingUp, Zap, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { fetchExperiments, fetchExperimentDashboard } from "@/api/benchmarkApi";

const QUICK_LINKS = [
  { label: "Benchmark Config", desc: "Setup a new benchmark run", to: "/benchmark", icon: BarChart3, color: "bg-blue-500/10 text-blue-400" },
  { label: "Embedding Comparison", desc: "Compare embedding models", to: "/benchmark/embeddings", icon: Zap, color: "bg-purple-500/10 text-purple-400" },
  { label: "Chunk Strategy", desc: "Compare chunking strategies", to: "/benchmark/chunks", icon: Target, color: "bg-emerald-500/10 text-emerald-400" },
  { label: "Experiment History", desc: "View past benchmark runs", to: "/benchmark/history", icon: TrendingUp, color: "bg-orange-500/10 text-orange-400" },
];

function buildMetrics(run) {
  if (!run) return null;
  return [
    { label: "Faithfulness", value: Math.round((run.avgFaithfulness ?? 0) * 100), color: "bg-emerald-400", textColor: "text-emerald-400" },
    { label: "Context Recall", value: Math.round((run.avgContextRecall ?? 0) * 100), color: "bg-blue-400", textColor: "text-blue-400" },
    { label: "Context Precision", value: Math.round((run.avgContextPrecision ?? 0) * 100), color: "bg-purple-400", textColor: "text-purple-400" },
    { label: "Answer Relevancy", value: Math.round((run.avgAnswerRelevancy ?? 0) * 100), color: "bg-orange-400", textColor: "text-orange-400" },
  ];
}

export default function ResearchDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [latestExperiment, setLatestExperiment] = useState(null);
  const [doneRuns, setDoneRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLatest() {
      try {
        const experiments = await fetchExperiments();
        if (cancelled || !experiments?.length) {
          setLoading(false);
          return;
        }

        // Get the most recent experiment
        const sorted = [...experiments].sort((a, b) => b.id - a.id);
        const latest = sorted[0];

        const dashboard = await fetchExperimentDashboard(latest.id);
        if (cancelled) return;

        const runs = Array.isArray(dashboard) ? dashboard : [];
        const completed = runs.filter((r) => r.status === "done" || r.status === "error");

        setLatestExperiment({
          id: latest.id,
          name: latest.name,
          createdAt: latest.createdAtUtc ?? latest.createdAt ?? null,
        });
        setDoneRuns(completed);
        // Default to the last completed run
        if (completed.length > 0) {
          setSelectedRunId(completed[completed.length - 1].experimentRunId);
        }
      } catch {
        // Silently fail — show placeholder
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLatest();
    return () => { cancelled = true; };
  }, []);

  const selectedRun = doneRuns.find((r) => r.experimentRunId === selectedRunId) ?? null;
  const metrics = buildMetrics(selectedRun);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Research Lab</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">RAG evaluation and benchmarking dashboard</p>
      </div>

      {/* RAGAS metrics */}
      <div className="bg-panel border border-app-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-app">Latest RAGAS Scores</p>
          {latestExperiment?.createdAt && (
            <span className="text-xs text-app opacity-40">
              {latestExperiment.name ?? `Experiment #${latestExperiment.id}`} ·{" "}
              {new Date(latestExperiment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-app opacity-30">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading metrics…</span>
          </div>
        ) : metrics ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {metrics.map(({ label, value, textColor }) => (
                <div key={label} className="text-center">
                  <div className={`text-3xl font-bold ${textColor}`}>{value}%</div>
                  <div className="text-xs text-app opacity-50 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="flex flex-col gap-3">
              {metrics.map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-app opacity-50 w-36 shrink-0">{label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs text-app opacity-60 w-8 text-right shrink-0">{value}%</span>
                </div>
              ))}
            </div>

            {/* Run details */}
            {selectedRun && (
              <div className="mt-4 pt-4 border-t border-app-border flex flex-wrap gap-x-6 gap-y-1 text-xs text-app opacity-50">
                {selectedRun.embeddingModel && <span>Embedding: {selectedRun.embeddingModel}</span>}
                {selectedRun.chunkingStrategy && <span>Chunking: {selectedRun.chunkingStrategy}</span>}
                {selectedRun.llmModel && <span>LLM: {selectedRun.llmModel}</span>}
                {selectedRun.totalQuestions != null && <span>Questions: {selectedRun.totalQuestions}</span>}
                {selectedRun.avgLatencyMs != null && <span>Avg Latency: {Math.round(selectedRun.avgLatencyMs)}ms</span>}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-app opacity-40">No experiments found. Run a benchmark to see results here.</p>
          </div>
        )}
        {/* Run selector dropdown */}
        {doneRuns.length > 1 && (
          <div className="pt-4">
            <label className="block text-xs text-app opacity-50 mb-1.5">Select Run</label>
            <div className="relative">
              <select
                value={selectedRunId ?? ""}
                onChange={(e) => setSelectedRunId(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition"
                style={{ backgroundColor: "var(--panel-bg)" }}
              >
                {doneRuns.map((run) => (
                  <option key={run.experimentRunId} value={run.experimentRunId}>
                    {run.runName ?? `Run #${run.experimentRunId}`}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QUICK_LINKS.map(({ label, desc, to, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="flex items-center gap-4 bg-panel border border-app-border rounded-xl p-4 hover:border-black/25 dark:hover:border-white/25 transition-all group text-left"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-app">{label}</p>
              <p className="text-xs text-app opacity-50 mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={15} className="text-app opacity-20 group-hover:opacity-60 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
