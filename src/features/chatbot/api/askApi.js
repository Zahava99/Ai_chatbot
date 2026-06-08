import axios from "axios";
import { API_CONFIG } from "@/config/api";

const askClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Send a question to the chatbot API.
 * @param {string} subjectId
 * @param {string} question
 * @param {string|null} conversationId - Pass on follow-up messages to continue the same conversation.
 * @returns {Promise<{ answer: string, sources: Array, conversationId: string|null }>}
 *   sources shape: [{ index, documentName, pageNumber, excerpt, relevanceScore }]
 */
export async function askQuestion(subjectId, question, conversationId = null) {
  const payload = { subjectId, question };
  if (conversationId) payload.conversationId = conversationId;

  const { data } = await askClient.post("/api/ask", payload);

  if (typeof data === "string") {
    return { answer: data, sources: [], conversationId: null };
  }

  const answer = data.answer ?? data.response ?? data.text ?? "";
  const sources = Array.isArray(data.sources) ? data.sources : [];
  const returnedConversationId = data.conversationId ?? null;

  return { answer, sources, conversationId: returnedConversationId };
}
