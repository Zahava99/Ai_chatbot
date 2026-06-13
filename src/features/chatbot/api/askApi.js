import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "@/config/api";

const askClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Send a question to the chatbot API.
 * @param {string} subjectId
 * @param {string} question
 * @param {number|null} sessionId - The session ID returned from POST /api/v1/chat/sessions.
 * @returns {Promise<{ answer: string, sources: Array }>}
 *   sources shape: [{ index, documentName, pageNumber, excerpt, relevanceScore }]
 */
export async function askQuestion(subjectId, question, sessionId = null) {
  const payload = { subjectId, question };
  if (sessionId != null) payload.sessionId = sessionId;

  const { data } = await askClient.post("/api/ask", payload, {
    headers: await getAuthHeaders(),
  });

  if (typeof data === "string") {
    return { answer: data, sources: [] };
  }

  const answer = data.answer ?? data.response ?? data.text ?? "";
  const sources = Array.isArray(data.sources) ? data.sources : [];

  return { answer, sources };
}
