import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, Download, Eye, Play, RefreshCw } from "lucide-react";
import {
  fetchExperimentDashboard,
  fetchExperimentRuns,
  fetchExperiments,
  startExperiment,
} from "@/features/benchmark/api/benchmarkApi";

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

function formatMetric(value) {
  if (value === null || value === undefined) return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "-";
  return `${Math.round(numeric * 100)}%`;
}

function formatLatency(value) {
  if (value === null || value === undefined) return "-";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "-";
  return `${Math.round(numeric)} ms`;
}

export default function ExperimentHistoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlExperimentId = searchParams.get("experimentId") ?? "";
  const startErrorMessage = searchParams.get("startError") ?? "";
  const [experiments, setExperiments] = useState([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState(urlExperimentId);
  const [runs, setRuns] = useState([]);
  const [dashboardRows, setDashboardRows] = useState([]);
  const [loadingExperiments, setLoadingExperiments] = useState(true);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [startingExperiment, setStartingExperiment] = useState(false);
  const [experimentsError, setExperimentsError] = useState("");
  const [runsError, setRunsError] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const selectedExperiment = useMemo(
    () => experiments.find((experiment) => String(experiment.id) === selectedExperimentId),
    [experiments, selectedExperimentId]
  );

  const hasQueuedRuns = useMemo(
    () => runs.some((run) => run.status === "queued"),
    [runs]
  );

  const canStartExperiment =
    selectedExperimentId &&
    hasQueuedRuns &&
    selectedExperiment?.status !== "done";

  const isRetryingStart = selectedExperiment?.status === "running" && hasQueuedRuns;

  const dashboardByRunId = useMemo(
    () => new Map(dashboardRows.map((row) => [String(row.experimentRunId), row])),
    [dashboardRows]
  );

  const tableRows = useMemo(
    () => runs.map((run) => ({
      ...run,
      dashboard: dashboardByRunId.get(String(run.id)),
    })),
    [dashboardByRunId, runs]
  );

  const loadExperiments = useCallback(async () => {
    setLoadingExperiments(true);
    setExperimentsError("");

    try {
      const data = await fetchExperiments();
      const list = normalizeList(data);
      setExperiments(list);
      setSelectedExperimentId((current) => {
        const preferred = current || urlExperimentId;
        if (preferred && list.some((experiment) => String(experiment.id) === preferred)) {
          return preferred;
        }
        return list[0]?.id ? String(list[0].id) : "";
      });
    } catch (error) {
      setExperimentsError(getErrorMessage(error));
      setExperiments([]);
      setSelectedExperimentId("");
    } finally {
      setLoadingExperiments(false);
    }
  }, [urlExperimentId]);

  const loadRuns = useCallback(async (experimentId, signal) => {
    if (!experimentId) {
      setRuns([]);
      setRunsError("");
      setLoadingRuns(false);
      return;
    }

    setLoadingRuns(true);
    setRunsError("");

    try {
      const data = await fetchExperimentRuns(experimentId, signal ? { signal } : {});
      setRuns(normalizeList(data));
    } catch (error) {
      if (error.name === "AbortError") return;
      setRunsError(getErrorMessage(error));
      setRuns([]);
    } finally {
      if (!signal?.aborted) {
        setLoadingRuns(false);
      }
    }
  }, []);

  const loadDashboard = useCallback(async (experimentId, signal) => {
    if (!experimentId) {
      setDashboardRows([]);
      setDashboardError("");
      setLoadingDashboard(false);
      return;
    }

    setLoadingDashboard(true);
    setDashboardError("");

    try {
      const data = await fetchExperimentDashboard(experimentId, signal ? { signal } : {});
      setDashboardRows(normalizeList(data));
    } catch (error) {
      if (error.name === "AbortError") return;
      setDashboardError(getErrorMessage(error));
      setDashboardRows([]);
    } finally {
      if (!signal?.aborted) {
        setLoadingDashboard(false);
      }
    }
  }, []);

  const loadExperimentData = useCallback(async (experimentId, signal) => {
    await Promise.all([
      loadRuns(experimentId, signal),
      loadDashboard(experimentId, signal),
    ]);
  }, [loadDashboard, loadRuns]);

  useEffect(() => {
    void Promise.resolve().then(loadExperiments);
  }, [loadExperiments]);

  useEffect(() => {
    if (urlExperimentId) {
      void Promise.resolve().then(() => setSelectedExperimentId(urlExperimentId));
    }
  }, [urlExperimentId]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => loadExperimentData(selectedExperimentId, controller.signal));

    return () => controller.abort();
  }, [loadExperimentData, selectedExperimentId]);

  function handleExperimentChange(event) {
    const nextExperimentId = event.target.value;
    setSelectedExperimentId(nextExperimentId);
    if (nextExperimentId) {
      setSearchParams({ experimentId: nextExperimentId });
    }
  }

  function handleRefresh() {
    loadExperiments();
    if (selectedExperimentId) {
      loadExperimentData(selectedExperimentId);
    }
  }

  async function handleStartExperiment() {
    if (!selectedExperimentId) return;

    setStartingExperiment(true);
    setActionMessage("");
    setRunsError("");

    try {
      const result = await startExperiment(selectedExperimentId);
      const startedCount = result?.started ?? 0;
      setActionMessage(`Started ${startedCount} queued run${startedCount === 1 ? "" : "s"}.`);
      setSearchParams({ experimentId: selectedExperimentId });
      await Promise.all([
        loadExperiments(),
        loadExperimentData(selectedExperimentId),
      ]);
    } catch (error) {
      setRunsError(getErrorMessage(error));
    } finally {
      setStartingExperiment(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Experiment History</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">
            {selectedExperiment ? `${runs.length} runs for ${selectedExperiment.name}` : `${runs.length} benchmark runs`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartExperiment}
            disabled={!canStartExperiment || loadingExperiments || loadingRuns || startingExperiment}
            title={
              hasQueuedRuns
                  ? "Start queued benchmark runs"
                  : "No queued runs to start"
            }
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {startingExperiment ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            {startingExperiment ? "Starting..." : isRetryingStart ? "Retry Start" : "Start Experiment"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={loadingExperiments || loadingRuns || startingExperiment}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={14} className={loadingExperiments || loadingRuns ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            disabled
            title="CSV export endpoint is not available in the current API contract."
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-sm text-app opacity-40 cursor-not-allowed"
          >
            <Download size={14} /> Export All CSV
          </button>
        </div>
      </div>

      <div className="bg-panel border border-app-border rounded-xl p-4 mb-4">
        <label className="block text-sm font-semibold text-app mb-2" htmlFor="experiment-select">
          Experiment
        </label>
        <div className="relative">
          <select
            id="experiment-select"
            value={selectedExperimentId}
            onChange={handleExperimentChange}
            disabled={loadingExperiments || experiments.length === 0}
            className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition disabled:opacity-50"
          >
            {experiments.length === 0 ? (
              <option value="">No experiments found</option>
            ) : (
              experiments.map((experiment) => (
                <option key={experiment.id} value={experiment.id}>
                  #{experiment.id} - {experiment.name}
                </option>
              ))
            )}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
        </div>
        {selectedExperiment && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-app opacity-50">
            <span>Type: {formatStatus(selectedExperiment.type)}</span>
            <span>Status: {formatStatus(selectedExperiment.status)}</span>
            <span>Subject: {selectedExperiment.subjectId ?? "-"}</span>
            <span>Created: {formatDateTime(selectedExperiment.createdAtUtc)}</span>
          </div>
        )}
      </div>

      {experimentsError && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {experimentsError}
        </div>
      )}

      {runsError && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {runsError}
        </div>
      )}

      {startErrorMessage && (
        <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-500 dark:text-yellow-400">
          Experiment and queued runs were created, but starting backend jobs failed: {startErrorMessage}. Check the backend job runner, then retry Start Experiment.
        </div>
      )}

      {dashboardError && (
        <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          {dashboardError}
        </div>
      )}

      {actionMessage && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          {actionMessage}
        </div>
      )}

      <div className="bg-panel border border-app-border rounded-xl overflow-x-auto">
        <table className="w-full min-w-[1280px] text-sm">
          <thead>
            <tr className="border-b border-app-border">
              {["Run", "Embedding", "Chunk", "LLM", "Faith.", "Relev.", "Precision", "Recall", "Correct", "Latency", "Questions", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-app opacity-40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {loadingExperiments || loadingRuns || loadingDashboard ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-app opacity-50">Loading benchmark dashboard...</td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-app opacity-50">
                  {selectedExperimentId ? "No runs found for this experiment." : "Select an experiment to view runs."}
                </td>
              </tr>
            ) : (
              tableRows.map((run) => {
                const status = run.dashboard?.status ?? run.status;
                return (
                <tr key={run.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="font-mono text-sm text-app opacity-60">#{run.id}</div>
                    <div className="text-xs text-app opacity-40 max-w-xs truncate">{run.runName || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-app opacity-70">{run.dashboard?.embeddingModel ?? run.embeddingModelId ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-app opacity-60">{run.dashboard?.chunkingStrategy ?? run.chunkingStrategyId ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-app opacity-60">{run.dashboard?.llmModel ?? run.llmModelId ?? "-"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-400">{formatMetric(run.dashboard?.avgFaithfulness)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-orange-400">{formatMetric(run.dashboard?.avgAnswerRelevancy)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-purple-400">{formatMetric(run.dashboard?.avgContextPrecision)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-400">{formatMetric(run.dashboard?.avgContextRecall)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-sky-400">{formatMetric(run.dashboard?.avgAnswerCorrectness)}</td>
                  <td className="px-4 py-3 text-sm text-app opacity-60">{formatLatency(run.dashboard?.avgLatencyMs)}</td>
                  <td className="px-4 py-3 text-sm text-app opacity-60">{run.dashboard?.totalQuestions ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[status] || "text-app opacity-50"}`}>
                      {formatStatus(status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/benchmark/results?experimentId=${run.experimentId}&runId=${run.id}`)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-app hover:opacity-100 transition-all"
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
