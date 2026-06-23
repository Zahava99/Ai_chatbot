import { API_CONFIG, getAuthHeaders } from "@/config/api";

const BENCHMARK_BASE = `${API_CONFIG.BASE_URL}/api/v1`;

async function handleResponse(response, label) {
  if (!response.ok) {
    let message = `${label}: ${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      message = error.detail ?? error.message ?? error.title ?? message;
    } catch {
      // Keep the status-based message when the response body is empty or not JSON.
    }
    throw new Error(message);
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function request(path, options = {}, label = "Benchmark request failed") {
  const response = await fetch(`${BENCHMARK_BASE}${path}`, {
    ...options,
    headers: {
      ...(await getAuthHeaders()),
      ...options.headers,
    },
  });

  return handleResponse(response, label);
}

export function fetchExperiments() {
  return request("/experiments", { method: "GET" }, "Failed to fetch experiments");
}

export function createExperiment(payload) {
  return request(
    "/experiments",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Failed to create experiment"
  );
}

export function createExperimentRuns(id, payload) {
  if (!id) return Promise.reject(new Error("Experiment id is required"));
  return request(
    `/experiments/${id}/runs`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Failed to create experiment runs"
  );
}

export function startExperiment(id) {
  if (!id) return Promise.reject(new Error("Experiment id is required"));
  return request(
    `/experiments/${id}/start`,
    { method: "POST" },
    "Failed to start experiment"
  );
}

export function fetchExperimentById(id) {
  if (!id) return Promise.reject(new Error("Experiment id is required"));
  return request(`/experiments/${id}`, { method: "GET" }, "Failed to fetch experiment detail");
}

export function fetchExperimentRuns(id, options = {}) {
  if (!id) return Promise.reject(new Error("Experiment id is required"));
  return request(
    `/experiments/${id}/runs`,
    { method: "GET", ...options },
    "Failed to fetch experiment runs"
  );
}

export function fetchExperimentDashboard(id, options = {}) {
  if (!id) return Promise.reject(new Error("Experiment id is required"));
  return request(
    `/experiments/${id}/dashboard`,
    { method: "GET", ...options },
    "Failed to fetch experiment dashboard"
  );
}

export function fetchEmbeddingModels() {
  return request("/embedding-models", { method: "GET" }, "Failed to fetch embedding models");
}

export function fetchChunkingStrategies() {
  return request("/chunking-strategies", { method: "GET" }, "Failed to fetch chunking strategies");
}

export function fetchLlmModels() {
  return request("/llm-models", { method: "GET" }, "Failed to fetch LLM models");
}

export function fetchTestQuestions(subjectId) {
  const query = subjectId !== undefined && subjectId !== null && subjectId !== ""
    ? `?subjectId=${encodeURIComponent(subjectId)}`
    : "";
  return request(`/test-questions${query}`, { method: "GET" }, "Failed to fetch test questions");
}

export function importTestQuestions(payload) {
  return request(
    "/test-questions/import",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Failed to import test questions"
  );
}
