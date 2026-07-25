import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchExperiments,
  fetchExperimentDashboard,
} from "@/api/benchmarkApi";

const METRICS = ["avgFaithfulness", "avgAnswerRelevancy", "avgContextPrecision", "avgContextRecall", "avgAnswerCorrectness"];
const METRIC_LABELS = {
  avgFaithfulness: "Faithfulness",
  avgAnswerRelevancy: "Answer Relevancy",
  avgContextPrecision: "Context Precision",
  avgContextRecall: "Context Recall",
  avgAnswerCorrectness: "Answer Correctness",
};

const COLORS = ["bg-blue-400", "bg-emerald-400", "bg-purple-400", "bg-orange-400", "bg-pink-400", "bg-cyan-400", "bg-yellow-400", "bg-red-400"];
const TEXT_COLORS = ["text-blue-400", "text-emerald-400", "text-purple-400", "text-orange-400", "text-pink-400", "text-cyan-400", "text-yellow-400", "text-red-400"];

const FIELD_CLASS =
  "w-full rounded-xl border border-app-border bg-black/5 px-4 py-2.5 text-sm text-app outline-none transition placeholder:opacity-30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function ExperimentSelect({ value, options, disabled, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative w-full max-w-sm" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((c) => !c)}
        className={cn(FIELD_CLASS, "flex items-center justify-between gap-3 pr-3 text-left")}
      >
        <span className={cn("min-w-0 truncate", selectedOption ? "" : "opacity-40")}>
          {selectedOption?.label ?? "Select an experiment"}
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 text-app opacity-40 transition-transform", open ? "rotate-180" : "")}
        />
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-app-border bg-panel py-1 shadow-2xl"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-app transition-colors hover:bg-black/5 focus:bg-black/5 focus:outline-none dark:hover:bg-white/10 dark:focus:bg-white/10",
                  selected && "bg-emerald-500/10 text-emerald-400"
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {selected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Group runs by chunking strategy, averaging metrics across each group. */
function groupByChunkingStrategy(runs) {
  const groups = {};

  for (const run of runs) {
    const key = run.chunkingStrategy || "unknown";
    if (!groups[key]) {
      groups[key] = { name: key, runs: [] };
    }
    groups[key].runs.push(run);
  }

  return Object.values(groups).map((group) => {
    const count = group.runs.length;
    const averaged = {};

    for (const metric of METRICS) {
      const values = group.runs.filter((r) => r[metric] != null).map((r) => r[metric]);
      averaged[metric] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
    }

    const latencies = group.runs.filter((r) => r.avgLatencyMs != null).map((r) => r.avgLatencyMs);
    averaged.avgLatencyMs = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null;

    const questions = group.runs.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);

    return {
      name: group.name,
      runCount: count,
      totalQuestions: questions,
      ...averaged,
    };
  });
}

export default function ChunkStrategyPage() {
  const [experiments, setExperiments] = useState([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState("");
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState("");

  const experimentOptions = useMemo(
    () =>
      experiments.map((exp) => ({
        value: String(exp.id),
        label: exp.name || `Experiment #${exp.id}`,
      })),
    [experiments]
  );

  const doneRuns = useMemo(() => runs.filter((r) => r.status === "done"), [runs]);
  const strategies = useMemo(() => groupByChunkingStrategy(doneRuns), [doneRuns]);

  const loadExperiments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchExperiments();
      const list = normalizeList(data);
      setExperiments(list);
      if (list.length > 0 && !selectedExperimentId) {
        setSelectedExperimentId(String(list[0].id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load experiments");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async (experimentId) => {
    if (!experimentId) return;
    setLoadingDashboard(true);
    setError("");
    try {
      const data = await fetchExperimentDashboard(experimentId);
      setRuns(normalizeList(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      setRuns([]);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    void loadExperiments();
  }, [loadExperiments]);

  useEffect(() => {
    if (selectedExperimentId) {
      void loadDashboard(selectedExperimentId);
    }
  }, [selectedExperimentId, loadDashboard]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">Chunk Strategy Comparison</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Compare chunking strategies using RAGAS metrics</p>
      </div>

      {/* Experiment selector */}
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm text-app opacity-60 shrink-0">Experiment:</label>
        <ExperimentSelect
          value={selectedExperimentId}
          options={experimentOptions}
          disabled={loading}
          onChange={setSelectedExperimentId}
        />
        <button
          type="button"
          onClick={() => {
            void loadExperiments();
            if (selectedExperimentId) void loadDashboard(selectedExperimentId);
          }}
          disabled={loading || loadingDashboard}
          className="flex items-center gap-1.5 rounded-xl border border-app-border px-3 py-2 text-sm text-app opacity-70 transition-colors hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10 disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading || loadingDashboard ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {(loading || loadingDashboard) && (
        <div className="flex items-center gap-2 text-sm text-app opacity-50 mb-6">
          <RefreshCw size={14} className="animate-spin" />
          Loading...
        </div>
      )}

      {!loading && !loadingDashboard && strategies.length === 0 && (
        <div className="bg-panel border border-app-border rounded-xl p-5 text-sm text-app opacity-50 text-center">
          {runs.length === 0
            ? "No runs found for this experiment."
            : "No completed runs found. Only runs with status \"done\" are shown."}
        </div>
      )}

      {strategies.length > 0 && (
        <>
          {/* Strategy cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {strategies.map((s, i) => (
              <div key={s.name} className="bg-panel border border-app-border rounded-xl p-5">
                <div className={`w-2 h-2 rounded-full ${COLORS[i % COLORS.length]} mb-3`} />
                <p className="text-base font-semibold text-app mb-1">{s.name}</p>
                <p className="text-xs text-app opacity-40 mb-4">
                  {s.runCount} run{s.runCount !== 1 ? "s" : ""} · {s.totalQuestions} questions
                  {s.avgLatencyMs != null ? ` · ${s.avgLatencyMs.toFixed(0)}ms avg` : ""}
                </p>
                <div className="flex flex-col gap-2">
                  {METRICS.map((m) => {
                    const value = s[m] != null ? (s[m] * 100).toFixed(1) : null;
                    return (
                      <div key={m} className="flex items-center gap-2">
                        <span className="text-xs text-app opacity-50 w-24 truncate">{METRIC_LABELS[m]}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          {value != null ? (
                            <div className={`h-full rounded-full ${COLORS[i % COLORS.length]}`} style={{ width: `${value}%` }} />
                          ) : null}
                        </div>
                        <span className={`text-xs font-medium ${TEXT_COLORS[i % TEXT_COLORS.length]} w-12 text-right`}>
                          {value != null ? `${value}%` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border">
                  <th className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium">Strategy</th>
                  {METRICS.map((m) => (
                    <th key={m} className="text-center px-3 py-3 text-xs text-app opacity-40 font-medium">
                      {METRIC_LABELS[m]}
                    </th>
                  ))}
                  <th className="text-center px-3 py-3 text-xs text-app opacity-40 font-medium">Latency (ms)</th>
                  <th className="text-center px-3 py-3 text-xs text-app opacity-40 font-medium">Runs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {strategies.map((s, i) => (
                  <tr key={s.name} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${COLORS[i % COLORS.length]}`} />
                        <span className="text-sm font-medium text-app">{s.name}</span>
                      </div>
                    </td>
                    {METRICS.map((metric) => (
                      <td key={metric} className={`text-center px-3 py-3 text-sm font-medium ${TEXT_COLORS[i % TEXT_COLORS.length]}`}>
                        {s[metric] != null ? `${(s[metric] * 100).toFixed(1)}%` : "—"}
                      </td>
                    ))}
                    <td className="text-center px-3 py-3 text-sm text-app opacity-60">
                      {s.avgLatencyMs != null ? `${s.avgLatencyMs.toFixed(0)}` : "—"}
                    </td>
                    <td className="text-center px-3 py-3 text-sm text-app opacity-60">{s.runCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
