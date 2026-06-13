import axios from "axios";
import { API_CONFIG, getAuthHeaders } from "@/config/api";

const sessionClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 120000, // Extended timeout for AI responses (can take 60s+)
});

/**
 * Create a new chat session for a subject.
 * POST /api/v1/chat/sessions
 * @param {number} subjectId
 * @param {string} title
 * @returns {Promise<{ id: number }>} The created session's ID.
 */
export async function createChatSession(subjectId, title) {
  const { data } = await sessionClient.post(
    "/api/v1/chat/sessions",
    { subjectId, title },
    { headers: await getAuthHeaders() }
  );

  return { id: data.id };
}

/**
 * Fetch all chat sessions (optionally filtered by subjectId).
 * GET /api/v1/chat/sessions
 * @param {number|null} subjectId - If provided, only return sessions for this subject.
 * @returns {Promise<Array<{ id: number, subjectId: number, title: string, date: string }>>}
 */
export async function fetchSessions(subjectId = null) {
  const { data } = await sessionClient.get("/api/v1/chat/sessions", {
    headers: await getAuthHeaders(),
  });

  const list = Array.isArray(data) ? data : [];

  // Filter by subjectId if provided
  const filtered = subjectId != null
    ? list.filter((s) => s.subjectId === subjectId)
    : list;

  return filtered.map((s) => ({
    id: s.id,
    subjectId: s.subjectId,
    title: s.title || "Untitled",
    date: s.createdAtUtc
      ? new Date(s.createdAtUtc).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "",
    time: s.createdAtUtc
      ? new Date(s.createdAtUtc).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
  }));
}

/**
 * Fetch all messages for a specific chat session.
 * GET /api/v1/chat/sessions/:sessionId/messages
 * @param {number|string} sessionId
 * @returns {Promise<Array<{ id: string, role: string, text: string, sources: Array, timestamp: string|null }>>}
 */
export async function fetchSessionMessages(sessionId) {
  const { data } = await sessionClient.get(
    `/api/v1/chat/sessions/${sessionId}/messages`,
    { headers: await getAuthHeaders() }
  );

  const list = Array.isArray(data) ? data : (data.messages ?? []);

  return list.map((m) => {
    // Map citations to the sources format the UI expects
    const citations = Array.isArray(m.citations) ? m.citations : [];
    const sources = citations.length > 0
      ? citations.map((c, i) => ({
          index: i + 1,
          documentName: c.documentTitle ?? c.documentName ?? "Unknown",
          pageNumber: c.pageNumber ?? null,
          excerpt: c.snippet ?? c.excerpt ?? "",
          relevanceScore: c.score ?? c.relevanceScore ?? null,
          chunkId: c.chunkId ?? null,
          documentId: c.documentId ?? null,
        }))
      : Array.isArray(m.sources) ? m.sources : [];

    return {
      id: m.id ?? `msg-${Math.random()}`,
      role: m.role === "user" ? "user" : "bot",
      text: m.content ?? m.text ?? m.message ?? "",
      sources,
      timestamp: m.createdAtUtc ?? m.created_at ?? m.timestamp ?? null,
    };
  });
}

/**
 * Send a message in a chat session and get the assistant's response.
 * POST /api/v1/chat/sessions/:sessionId/messages
 * @param {number|string} sessionId
 * @param {string} content - The user's message text.
 * @returns {Promise<{ answer: string, sources: Array }>}
 *   sources shape: [{ index, documentName, pageNumber, excerpt, relevanceScore }]
 */
export async function sendSessionMessage(sessionId, content) {
  const { data } = await sessionClient.post(
    `/api/v1/chat/sessions/${sessionId}/messages`,
    { content },
    { headers: await getAuthHeaders() }
  );

  const answer = data.content ?? data.answer ?? data.text ?? "";

  // Map citations to the sources format the UI expects
  const citations = Array.isArray(data.citations) ? data.citations : [];
  const sources = citations.map((c, i) => ({
    index: i + 1,
    documentName: c.documentTitle ?? c.documentName ?? "Unknown",
    pageNumber: c.pageNumber ?? null,
    excerpt: c.snippet ?? c.excerpt ?? "",
    relevanceScore: c.score ?? c.relevanceScore ?? null,
    chunkId: c.chunkId ?? null,
    documentId: c.documentId ?? null,
  }));

  return { answer, sources };
}

/**
 * Delete a chat session.
 * DELETE /api/v1/chat/sessions/:sessionId
 * @param {number} sessionId
 * @returns {Promise<void>}
 */
export async function deleteChatSession(sessionId) {
  await sessionClient.delete(`/api/v1/chat/sessions/${sessionId}`, {
    headers: await getAuthHeaders(),
  });
}
