import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, History, Play, RefreshCw, Upload } from "lucide-react";
import { getSubjects } from "@/api/subjectApi";
import { cn } from "@/lib/utils";
import {
  createExperiment,
  createExperimentRuns,
  fetchChunkingStrategies,
  fetchEmbeddingModels,
  fetchExperiments,
  fetchLlmModels,
  fetchTestQuestions,
  importTestQuestions,
  startExperiment,
} from "@/features/benchmark/api/benchmarkApi";

const DEFAULT_EXPERIMENT_TYPE = "embedding_bench";

const EXPERIMENT_TYPES = [
  { value: "embedding_bench", label: "Embedding Benchmark" },
  { value: "chunking_bench", label: "Chunking Benchmark" },
];

const EXPERIMENT_TYPE_VALUES = new Set(EXPERIMENT_TYPES.map((type) => type.value));

const FIELD_CLASS =
  "w-full rounded-xl border border-app-border bg-black/5 px-4 py-2.5 text-sm text-app outline-none transition placeholder:opacity-30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5";

const OUTLINE_BUTTON_CLASS =
  "flex items-center gap-2 rounded-xl border border-app-border px-4 py-2 text-sm text-app opacity-70 transition-colors hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10";

const PRIMARY_BUTTON_CLASS =
  "flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50";

const TEST_QUESTION_IMPORT_TEMPLATE = `[
  {
    "question": "What is the question?",
    "groundTruth": "Expected answer",
    "referenceContext": "Optional reference context",
    "difficulty": "Easy",
    "externalRef": "Q001"
  }
]`;

const DIFFICULTY_BY_KEY = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function normalizeExperimentType(value) {
  return EXPERIMENT_TYPE_VALUES.has(value) ? value : DEFAULT_EXPERIMENT_TYPE;
}

function optionalString(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
}

function parseImportItems(value) {
  const parsed = JSON.parse(value);
  const items = Array.isArray(parsed) ? parsed : parsed?.items;

  if (!Array.isArray(items)) {
    throw new Error("Import payload must be a JSON array or an object with an items array.");
  }

  if (items.length === 0) {
    throw new Error("Import payload must contain at least one test question.");
  }

  return items.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Item ${index + 1} must be an object.`);
    }

    const question = optionalString(item.question);
    const groundTruth = optionalString(item.groundTruth);
    const difficulty = optionalString(item.difficulty);
    const normalizedDifficulty = difficulty ? DIFFICULTY_BY_KEY[difficulty.toLowerCase()] : null;

    if (!question) {
      throw new Error(`Item ${index + 1} is missing question.`);
    }
    if (!groundTruth) {
      throw new Error(`Item ${index + 1} is missing groundTruth.`);
    }
    if (difficulty && !normalizedDifficulty) {
      throw new Error(`Item ${index + 1} difficulty must be Easy, Medium, or Hard.`);
    }

    return {
      question,
      groundTruth,
      referenceContext: optionalString(item.referenceContext),
      difficulty: normalizedDifficulty,
      externalRef: optionalString(item.externalRef),
    };
  });
}

function selectDefaultIds(items) {
  const activeItems = items.filter((item) => item.isActive);
  const source = activeItems.length > 0 ? activeItems : items.slice(0, 1);
  return source.map((item) => String(item.id));
}

function toggleId(ids, setIds, id) {
  const value = String(id);
  setIds((current) =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
  );
}

function ThemedSelect({ id, value, options, disabled, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectOption(option) {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(FIELD_CLASS, "flex items-center justify-between gap-3 pr-3 text-left")}
      >
        <span className={cn("min-w-0 truncate", selectedOption ? "" : "opacity-40")}>
          {selectedOption?.label ?? "Select an option"}
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 text-app opacity-40 transition-transform", open ? "rotate-180" : "")}
        />
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          aria-labelledby={id}
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
                disabled={option.disabled}
                onClick={() => selectOption(option)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-app transition-colors hover:bg-black/5 focus:bg-black/5 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10 dark:focus:bg-white/10",
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

export default function BenchmarkConfigPage() {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [embeddingModels, setEmbeddingModels] = useState([]);
  const [chunkingStrategies, setChunkingStrategies] = useState([]);
  const [llmModels, setLlmModels] = useState([]);
  const [testQuestions, setTestQuestions] = useState([]);
  const [selectedEmbeddingIds, setSelectedEmbeddingIds] = useState([]);
  const [selectedChunkingIds, setSelectedChunkingIds] = useState([]);
  const [selectedLlmIds, setSelectedLlmIds] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: DEFAULT_EXPERIMENT_TYPE,
    subjectId: "",
    description: "",
  });
  const [importJson, setImportJson] = useState(TEST_QUESTION_IMPORT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importingQuestions, setImportingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [importError, setImportError] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const selectedSubjectQuestions = useMemo(() => testQuestions, [testQuestions]);
  const subjectOptions = useMemo(() => {
    if (subjects.length === 0) {
      return [{ value: "", label: "No subjects found", disabled: true }];
    }

    return subjects.map((subject) => ({
      value: String(subject.id),
      label: subject.code ? `${subject.code} - ${subject.name}` : subject.name,
    }));
  }, [subjects]);

  const canSubmit =
    form.name.trim() &&
    form.subjectId &&
    selectedEmbeddingIds.length > 0 &&
    selectedChunkingIds.length > 0 &&
    selectedLlmIds.length > 0 &&
    !submitting;

  const loadSubjectTestQuestions = useCallback(async (subjectId) => {
    if (!subjectId) {
      setTestQuestions([]);
      return;
    }

    setLoadingQuestions(true);
    setError("");

    try {
      const questionsData = await fetchTestQuestions(subjectId);
      setTestQuestions(normalizeList(questionsData));
    } catch (err) {
      setTestQuestions([]);
      setError(getErrorMessage(err));
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  const loadBenchmarkData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        experimentsData,
        subjectsData,
        embeddingsData,
        chunksData,
        llmsData,
      ] = await Promise.all([
        fetchExperiments(),
        getSubjects(),
        fetchEmbeddingModels(),
        fetchChunkingStrategies(),
        fetchLlmModels(),
      ]);

      const nextExperiments = normalizeList(experimentsData);
      const nextSubjects = normalizeList(subjectsData);
      const nextEmbeddings = normalizeList(embeddingsData);
      const nextChunks = normalizeList(chunksData);
      const nextLlms = normalizeList(llmsData);
      const nextSubjectId = form.subjectId || (nextSubjects[0]?.id ? String(nextSubjects[0].id) : "");
      const questionsData = nextSubjectId ? await fetchTestQuestions(nextSubjectId) : [];

      setExperiments(nextExperiments);
      setSubjects(nextSubjects);
      setEmbeddingModels(nextEmbeddings);
      setChunkingStrategies(nextChunks);
      setLlmModels(nextLlms);
      setTestQuestions(normalizeList(questionsData));
      setSelectedEmbeddingIds((current) => current.length ? current : selectDefaultIds(nextEmbeddings));
      setSelectedChunkingIds((current) => current.length ? current : selectDefaultIds(nextChunks));
      setSelectedLlmIds((current) => current.length ? current : selectDefaultIds(nextLlms));
      setForm((current) => ({
        ...current,
        type: normalizeExperimentType(current.type),
        subjectId: current.subjectId || nextSubjectId,
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [form.subjectId]);

  useEffect(() => {
    void Promise.resolve().then(loadBenchmarkData);
  }, [loadBenchmarkData]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: field === "type" ? normalizeExperimentType(value) : value,
    }));
    if (field === "subjectId") {
      setImportError("");
      setImportMessage("");
      void loadSubjectTestQuestions(value);
    }
  }

  async function handleImportQuestions() {
    if (!form.subjectId || importingQuestions) return;

    setImportingQuestions(true);
    setImportError("");
    setImportMessage("");

    try {
      const items = parseImportItems(importJson);
      const result = await importTestQuestions({
        subjectId: Number(form.subjectId),
        items,
      });
      const questionsData = await fetchTestQuestions(form.subjectId);
      const imported = result?.imported ?? 0;

      setTestQuestions(normalizeList(questionsData));
      setImportMessage(`Imported ${imported} test question${imported === 1 ? "" : "s"}.`);
    } catch (err) {
      setImportError(getErrorMessage(err));
    } finally {
      setImportingQuestions(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const created = await createExperiment({
        name: form.name.trim(),
        type: normalizeExperimentType(form.type),
        subjectId: Number(form.subjectId),
        description: form.description.trim() || null,
      });
      const experimentId = created?.id ?? created;

      await createExperimentRuns(experimentId, {
        embeddingModelIds: selectedEmbeddingIds.map(Number),
        chunkingStrategyIds: selectedChunkingIds.map(Number),
        llmModelIds: selectedLlmIds.map(Number),
      });

      try {
        await startExperiment(experimentId);
        navigate(`/benchmark/history?experimentId=${experimentId}`);
      } catch (startError) {
        const startErrorMessage = encodeURIComponent(getErrorMessage(startError));
        navigate(`/benchmark/history?experimentId=${experimentId}&startError=${startErrorMessage}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-app p-6">
      <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Benchmark Config</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">
            Configure and start a backend benchmark experiment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/benchmark/history")}
            className={OUTLINE_BUTTON_CLASS}
          >
            <History size={14} /> View History
          </button>
          <button
            type="button"
            onClick={loadBenchmarkData}
            disabled={loading || submitting}
            className={OUTLINE_BUTTON_CLASS}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-3">Experiment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-app opacity-50 mb-1" htmlFor="experiment-name">
                Name
              </label>
              <input
                id="experiment-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder={`Benchmark run ${experiments.length + 1}`}
                disabled={loading || submitting}
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs text-app opacity-50 mb-1" htmlFor="experiment-type">
                Type
              </label>
              <ThemedSelect
                id="experiment-type"
                value={normalizeExperimentType(form.type)}
                options={EXPERIMENT_TYPES}
                onChange={(value) => updateField("type", value)}
                disabled={loading || submitting}
              />
            </div>
            <div>
              <label className="block text-xs text-app opacity-50 mb-1" htmlFor="subject">
                Subject
              </label>
              <ThemedSelect
                id="subject"
                value={form.subjectId}
                options={subjectOptions}
                onChange={(value) => updateField("subjectId", value)}
                disabled={loading || submitting || subjects.length === 0}
              />
            </div>
            <div>
              <label className="block text-xs text-app opacity-50 mb-1" htmlFor="description">
                Description
              </label>
              <input
                id="description"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Optional"
                disabled={loading || submitting}
                className={FIELD_CLASS}
              />
            </div>
          </div>
          <p className="text-xs text-app opacity-40 mt-3">
            {loadingQuestions
              ? "Loading test questions..."
              : `${selectedSubjectQuestions.length} test questions are available for this subject.`}
          </p>
        </div>

        <div className="bg-panel border border-app-border rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-app">Import Test Questions</p>
              <p className="text-xs text-app opacity-40 mt-1">
                Import into the selected subject using the backend import payload.
              </p>
            </div>
            <span className="text-xs text-app opacity-40">
              {loadingQuestions ? "Loading..." : `${selectedSubjectQuestions.length} available`}
            </span>
          </div>

          <textarea
            value={importJson}
            onChange={(event) => setImportJson(event.target.value)}
            disabled={loading || submitting || importingQuestions || !form.subjectId}
            rows={8}
            spellCheck={false}
            className={cn(FIELD_CLASS, "py-3 font-mono text-xs")}
          />

          {importError && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {importError}
            </div>
          )}

          {importMessage && (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {importMessage}
            </div>
          )}

          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={handleImportQuestions}
              disabled={loading || submitting || importingQuestions || !form.subjectId}
              className={cn(PRIMARY_BUTTON_CLASS, "px-4 py-2.5")}
            >
              {importingQuestions ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
              {importingQuestions ? "Importing..." : "Import Questions"}
            </button>
          </div>
        </div>

        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-3">Embedding Models</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {embeddingModels.length === 0 ? (
              <p className="text-sm text-app opacity-50">No embedding models found.</p>
            ) : (
              embeddingModels.map((model) => (
                <label key={model.id} className="flex items-start gap-3 cursor-pointer rounded-xl border border-app-border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedEmbeddingIds.includes(String(model.id))}
                    onChange={() => toggleId(selectedEmbeddingIds, setSelectedEmbeddingIds, model.id)}
                    disabled={loading || submitting}
                    className="mt-1 accent-emerald-500"
                  />
                  <span>
                    <span className="block text-sm text-app opacity-80">{model.name}</span>
                    <span className="block text-xs text-app opacity-40">{model.detail || (model.isActive ? "Active" : "Inactive")}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-3">Chunking Strategies</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {chunkingStrategies.length === 0 ? (
              <p className="text-sm text-app opacity-50">No chunking strategies found.</p>
            ) : (
              chunkingStrategies.map((strategy) => (
                <button
                  key={strategy.id}
                  type="button"
                  onClick={() => toggleId(selectedChunkingIds, setSelectedChunkingIds, strategy.id)}
                  disabled={loading || submitting}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors disabled:opacity-50 ${
                    selectedChunkingIds.includes(String(strategy.id))
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-app-border text-app opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="block">{strategy.name}</span>
                  <span className="block opacity-50 mt-1">{strategy.detail || (strategy.isActive ? "Active" : "Inactive")}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-panel border border-app-border rounded-xl p-5">
          <p className="text-sm font-semibold text-app mb-3">LLM Models</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {llmModels.length === 0 ? (
              <p className="text-sm text-app opacity-50">No LLM models found.</p>
            ) : (
              llmModels.map((model) => (
                <label key={model.id} className="flex items-start gap-3 cursor-pointer rounded-xl border border-app-border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedLlmIds.includes(String(model.id))}
                    onChange={() => toggleId(selectedLlmIds, setSelectedLlmIds, model.id)}
                    disabled={loading || submitting}
                    className="mt-1 accent-emerald-500"
                  />
                  <span>
                    <span className="block text-sm text-app opacity-80">{model.name}</span>
                    <span className="block text-xs text-app opacity-40">{model.detail || (model.isActive ? "Active" : "Inactive")}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className={cn(PRIMARY_BUTTON_CLASS, "py-3")}
        >
          {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
          {submitting ? "Starting Benchmark..." : "Run Benchmark"}
        </button>
      </form>
      </div>
    </div>
  );
}
