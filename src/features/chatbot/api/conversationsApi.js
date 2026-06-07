import axios from "axios";
import { API_CONFIG } from "@/config/api";

const conversationsClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Fetch all conversations for a given subject.
 * @param {string} subjectId
 * @returns {Promise<Array>} Mapped array of session objects.
 */
export async function fetchConversations(subjectId) {
  const { data } = await conversationsClient.get("/api/conversations", {
    params: { subjectId },
  });

  // API returns either an array at root or wrapped in a key
  const list = Array.isArray(data) ? data : (data.conversations ?? []);

  return list.map((c) => ({
    id: c.id,
    subjectId: c.subject_id,
    title: c.title,
    date: c.created_at,
  }));
}

/**
 * Fetch all messages for a specific conversation.
 * @param {string} conversationId
 * @returns {Promise<Array>} Mapped array of message objects.
 *   shape: [{ id, role, text, sources, timestamp }]
 */
export async function fetchConversationMessages(conversationId) {
  const { data } = await conversationsClient.get(
    `/api/conversations/${conversationId}/messages`
  );

  // API returns either an array at root or wrapped in a key
  const list = Array.isArray(data) ? data : (data.messages ?? []);

  return list.map((m) => ({
    id: m.id ?? `msg-${Math.random()}`,
    role: m.role === "user" ? "user" : "bot",
    text: m.content ?? m.text ?? m.message ?? "",
    sources: Array.isArray(m.sources) ? m.sources : [],
    timestamp: m.created_at ?? m.timestamp ?? null,
  }));
}
