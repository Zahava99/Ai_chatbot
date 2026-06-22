import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { fetchExperimentRuns } from "@/features/benchmark/api/benchmarkApi";

const STATUS_STYLES = {
  queued: "text-yellow-400 bg-yellow-500/10",
  running: "text-blue-400 bg-blue-500/10",
  done: "text-emerald-400 bg-emerald-500/10",
  error: "text-red-400 bg-red-500/10",
  skipped: "text-app opacity-50 bg-black/5 dark:bg-white/5",
};

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status) {
  return String(status ?? "-").replaceAll("_", " ");
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong";
}

export default function RAGASResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const experimentId = searchParams.get("experimentId") ?? "";
  const runId = searchParams.get("runId") ?? "";
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRun = useMemo(
    () => runs.find((run) => String(run.id) === runId) ?? runs[0],
    [runs, runId]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadRuns() {
      if (!experimentId) {
        setRuns([]);
        setError("Missing experimentId. Open a run from Experiment History.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await fetchExperimentRuns(experimentId, { signal: controller.signal });
        setRuns(normalizeList(data));
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(getErrorMessage(err));
        setRuns([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void Promise.resolve().then(loadRuns);

    return () => controller.abort();
  }, [experimentId]);

  function handleRefresh() {
    if (!experimentId) return;
    setLoading(true);
    setError("");
    fetchExperimentRuns(experimentId)
      .then((data) => setRuns(normalizeList(data)))
      .catch((err) => {
        setError(getErrorMessage(err));
        setRuns([]);
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate(experimentId ? `/benchmark/history?experimentId=${experimentId}` : "/benchmark/history")}
            className="flex items-center gap-1 text-xs text-app opacity-50 hover:opacity-100 transition-colors mb-3"
          >
            <ArrowLeft size={13} /> Back to history
          </button>
          <h1 className="text-xl font-semibold text-app">Benchmark Run Detail</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">
            {selectedRun ? `Run #${selectedRun.id} - ${selectedRun.runName || "Unnamed run"}` : "Load a benchmark run from Experiment History"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading || !experimentId}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            disabled
            title="CSV export endpoint is not available in the current API contract."
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-sm text-app opacity-40 cursor-not-allowed"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-panel border border-app-border rounded-xl p-8 text-center text-sm text-app opacity-50">
          Loading run detail...
        </div>
      ) : selectedRun ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Status", value: formatStatus(selectedRun.status), color: STATUS_STYLES[selectedRun.status] || "text-app opacity-60 bg-black/5 dark:bg-white/5" },
              { label: "Embedding Model ID", value: selectedRun.embeddingModelId ?? "-", color: "text-blue-400 bg-blue-500/10" },
              { label: "Chunk Strategy ID", value: selectedRun.chunkingStrategyId ?? "-", color: "text-purple-400 bg-purple-500/10" },
              { label: "LLM Model ID", value: selectedRun.llmModelId ?? "-", color: "text-orange-400 bg-orange-500/10" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-panel border border-app-border rounded-xl p-4">
                <p className="text-xs text-app opacity-50 mb-2">{label}</p>
                <span className={`inline-flex text-sm px-2 py-1 rounded-lg font-medium capitalize ${color}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-panel border border-app-border rounded-xl p-5 mb-6">
            <p className="text-sm font-semibold text-app mb-4">Run Timeline</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-app opacity-40 mb-1">Started</p>
                <p className="text-sm text-app opacity-70">{formatDateTime(selectedRun.startedAtUtc)}</p>
              </div>
              <div>
                <p className="text-xs text-app opacity-40 mb-1">Finished</p>
                <p className="text-sm text-app opacity-70">{formatDateTime(selectedRun.finishedAtUtc)}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-panel border border-app-border rounded-xl p-8 text-center text-sm text-app opacity-50">
          No runs found for experiment #{experimentId}.
        </div>
      )}

      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              {["Run", "Started", "Finished", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {runs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-app opacity-50">
                  This view uses GET /api/v1/experiments/{`{id}`}/runs. No run rows were returned.
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr
                  key={run.id}
                  className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${String(run.id) === String(selectedRun?.id) ? "bg-emerald-500/5" : ""}`}
                >
                  <td className="px-5 py-3">
                    <div className="font-mono text-sm text-app opacity-60">#{run.id}</div>
                    <div className="text-xs text-app opacity-40 max-w-md truncate">{run.runName || "-"}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-app opacity-60">{formatDateTime(run.startedAtUtc)}</td>
                  <td className="px-5 py-3 text-sm text-app opacity-60">{formatDateTime(run.finishedAtUtc)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[run.status] || "text-app opacity-50"}`}>
                      {formatStatus(run.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
