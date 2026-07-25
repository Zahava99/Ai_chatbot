import { useState, useEffect } from "react";
import { Save, ChevronDown, Loader2 } from "lucide-react";
import ResetChunkingButton from "../components/ResetChunkingButton";
import { fetchAdminConfig, updateAdminConfig } from "@/api/adminApi";
import {
  fetchEmbeddingModels,
  fetchChunkingStrategies,
  fetchLlmModels,
} from "@/api/benchmarkApi";

export default function SystemSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Config fields matching the API payload
  const [activeEmbeddingModelId, setActiveEmbeddingModelId] = useState("1");
  const [activeChunkingStrategyId, setActiveChunkingStrategyId] = useState("1");
  const [activeChunkSize, setActiveChunkSize] = useState("");
  const [activeChunkOverlap, setActiveChunkOverlap] = useState("");
  const [activeLlmModelId, setActiveLlmModelId] = useState("1");
  const [retrievalTopK, setRetrievalTopK] = useState("5");
  const [minRelevanceScore, setMinRelevanceScore] = useState("");
  const [scopeRestriction, setScopeRestriction] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [historyWindowTurns, setHistoryWindowTurns] = useState("");
  const [temperature, setTemperature] = useState("");
  const [maxOutputTokens, setMaxOutputTokens] = useState("");
  const [reindexNow, setReindexNow] = useState(false);

  // Dynamic options from API
  const [embeddingModels, setEmbeddingModels] = useState([]);
  const [chunkingStrategies, setChunkingStrategies] = useState([]);
  const [llmModels, setLlmModels] = useState([]);

  // Load dropdown options and current config on mount
  useEffect(() => {
    Promise.all([
      fetchEmbeddingModels().catch(() => []),
      fetchChunkingStrategies().catch(() => []),
      fetchLlmModels().catch(() => []),
      fetchAdminConfig().catch(() => null),
    ]).then(([embeddings, strategies, llms, config]) => {
      setEmbeddingModels(embeddings || []);
      setChunkingStrategies(strategies || []);
      setLlmModels(llms || []);

      if (config) {
        if (config.activeEmbeddingModelId) setActiveEmbeddingModelId(config.activeEmbeddingModelId);
        if (config.activeChunkingStrategyId) setActiveChunkingStrategyId(config.activeChunkingStrategyId);
        setActiveChunkSize(config.activeChunkSize ?? "");
        setActiveChunkOverlap(config.activeChunkOverlap ?? "");
        if (config.activeLlmModelId) setActiveLlmModelId(config.activeLlmModelId);
        if (config.retrievalTopK) setRetrievalTopK(config.retrievalTopK);
        setMinRelevanceScore(config.minRelevanceScore ?? "");
        setScopeRestriction(config.scopeRestriction ?? "");
        setPromptTemplate(config.promptTemplate ?? "");
        setHistoryWindowTurns(config.historyWindowTurns ?? "");
        setTemperature(config.temperature ?? "");
        setMaxOutputTokens(config.maxOutputTokens ?? "");
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload = {
      activeEmbeddingModelId: activeEmbeddingModelId || null,
      activeChunkingStrategyId: activeChunkingStrategyId || null,
      activeChunkSize: activeChunkSize || null,
      activeChunkOverlap: activeChunkOverlap || null,
      activeLlmModelId: activeLlmModelId || null,
      retrievalTopK: retrievalTopK || null,
      minRelevanceScore: minRelevanceScore || null,
      scopeRestriction: scopeRestriction || null,
      promptTemplate: promptTemplate || null,
      historyWindowTurns: historyWindowTurns || null,
      temperature: temperature || null,
      maxOutputTokens: maxOutputTokens || null,
      reindexNow,
    };

    try {
      await updateAdminConfig(payload);
      setSaved(true);
      setReindexNow(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-app">System Settings</h1>
        <p className="text-sm text-app opacity-50 mt-0.5">Configure embedding, chunking, LLM and retrieval settings</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Embedding */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-4">Embedding & Chunking</p>
          <div className="flex flex-col gap-4">
            {/* Embedding Model */}
            <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">Embedding Model</label>
              <div className="relative">
                <select
                  value={activeEmbeddingModelId}
                  onChange={(e) => setActiveEmbeddingModelId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition"
                  style={{ backgroundColor: "var(--panel-bg)" }}
                >
                  {embeddingModels.map((m) => (
                    <option key={m.id} value={String(m.id)}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        {/* Chunking */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-app">Chunking</p>
            <ResetChunkingButton
              chunkingStrategies={chunkingStrategies}
              activeChunkingStrategyId={activeChunkingStrategyId}
              onReset={({ chunkSize, chunkOverlap }) => {
                setActiveChunkSize(chunkSize);
                setActiveChunkOverlap(chunkOverlap);
              }}
            />
          </div>
          <div className="flex flex-col gap-4">
            {/* Chunking Strategy */}
            <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">Chunking Strategy</label>
              <div className="relative">
                <select
                  value={activeChunkingStrategyId}
                  onChange={(e) => setActiveChunkingStrategyId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition"
                  style={{ backgroundColor: "var(--panel-bg)" }}
                >
                  {chunkingStrategies.map((s) => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
              </div>
            </div>

            {/* Chunk Size & Overlap */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Chunk Size</label>
                <input
                  type="number"
                  value={activeChunkSize}
                  onChange={(e) => setActiveChunkSize(e.target.value)}
                  placeholder="Default"
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Chunk Overlap</label>
                <input
                  type="number"
                  value={activeChunkOverlap}
                  onChange={(e) => setActiveChunkOverlap(e.target.value)}
                  placeholder="Default"
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* LLM Settings */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-4">LLM Settings</p>
          <div className="flex flex-col gap-4">
            {/* LLM Model */}
            <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">LLM Model</label>
              <div className="relative">
                <select
                  value={activeLlmModelId}
                  onChange={(e) => setActiveLlmModelId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app outline-none appearance-none focus:border-emerald-500 transition"
                  style={{ backgroundColor: "var(--panel-bg)" }}
                >
                  {llmModels.map((m) => (
                    <option key={m.id} value={String(m.id)}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 pointer-events-none" />
              </div>
            </div>

            {/* Temperature & Max Output Tokens */}
            {/* <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="Default"
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Max Output Tokens</label>
                <input
                  type="number"
                  value={maxOutputTokens}
                  onChange={(e) => setMaxOutputTokens(e.target.value)}
                  placeholder="Default"
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div> */}

            {/* Prompt Template */}
            {/* <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">Prompt Template</label>
              <textarea
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                placeholder="Custom prompt template (optional)"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition resize-none"
              />
            </div> */}

            {/* History Window Turns */}
            {/* <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">History Window Turns</label>
              <input
                type="number"
                value={historyWindowTurns}
                onChange={(e) => setHistoryWindowTurns(e.target.value)}
                placeholder="Default"
                className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
              />
            </div> */}
          </div>
        </div>

        {/* Retrieval Settings */}
        {/* <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-4">Retrieval Settings</p>
          <div className="flex flex-col gap-4"> */}
        {/* <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Top K</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={retrievalTopK}
                  onChange={(e) => setRetrievalTopK(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Min Relevance Score</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={minRelevanceScore}
                  onChange={(e) => setMinRelevanceScore(e.target.value)}
                  placeholder="Default"
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div> */}

        {/* Scope Restriction */}
        {/* <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">Scope Restriction</label>
              <input
                type="text"
                value={scopeRestriction}
                onChange={(e) => setScopeRestriction(e.target.value)}
                placeholder="None"
                className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
              />
            </div> */}
        {/* </div>
        </div> */}

        {/* Reindex */}
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-app">Reindex Now</p>
              <p className="text-xs text-app opacity-40 mt-0.5">Trigger a full re-embedding of all documents on save</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reindexNow}
                onChange={(e) => setReindexNow(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-black/10 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${saved
            ? "bg-emerald-500 text-white"
            : saving
              ? "bg-emerald-600/70 text-white cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
