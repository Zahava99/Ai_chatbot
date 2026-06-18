import { API_CONFIG } from "@/config/api";
import { getAccessToken } from "@/features/auth/api/authUtils";

const SUBJECTS_BASE = `${API_CONFIG.BASE_URL}/api/v1/subjects`;

function authHeaders() {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response, label) {
  if (!response.ok) {
    let message = `${label} (${response.status})`;
    try {
      const err = await response.json();
      message = err.detail ?? err.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  // Some endpoints return 204 No Content or empty body
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

/**
 * GET /api/v1/subjects
 * Returns a list of all subjects.
 *
 * @returns {Promise<Array<{ id: number, code: string, name: string, description: string, chapterCount: number, documentCount: number }>>}
 */
export async function getSubjects() {
  const response = await fetch(SUBJECTS_BASE, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response, "Failed to fetch subjects");
}

/**
 * POST /api/v1/subjects
 * Creates a new subject.
 *
 * @param {{ code: string, name: string, description: string }} payload
 * @returns {Promise<{ id: number, code: string, name: string, description: string }>}
 */
export async function createSubject(payload) {
  const response = await fetch(SUBJECTS_BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Failed to create subject");
}

/**
 * PUT /api/v1/subjects/:id
 * Updates a subject's name and description.
 *
 * @param {number|string} subjectId
 * @param {{ name: string, description: string|null }} payload
 * @returns {Promise<object>}
 */
export async function updateSubject(subjectId, payload) {
  const response = await fetch(`${SUBJECTS_BASE}/${subjectId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Failed to update subject");
}

/**
 * GET /api/v1/subjects/:subjectId/chapters
 * Returns the chapter list for a subject.
 *
 * @param {number|string} subjectId
 * @returns {Promise<Array<{ id: number, subjectId: number, title: string, orderIndex: number }>>}
 */
export async function getChapters(subjectId) {
  const response = await fetch(`${SUBJECTS_BASE}/${subjectId}/chapters`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response, "Failed to fetch chapters");
}

/**
 * POST /api/v1/subjects/:subjectId/chapters
 * Creates a new chapter within a subject.
 *
 * @param {number|string} subjectId
 * @param {{ title: string, orderIndex: number }} payload
 * @returns {Promise<{ id: number }>}
 */
export async function createChapter(subjectId, payload) {
  const response = await fetch(`${SUBJECTS_BASE}/${subjectId}/chapters`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Failed to create chapter");
}


/**
 * POST /api/v1/subjects/:subjectId/instructors
 * Assigns an instructor to a subject.
 *
 * @param {number|string} subjectId
 * @param {number|string} userId - The user ID of the instructor to assign
 * @returns {Promise<object|null>}
 */
export async function assignInstructor(subjectId, userId) {
  const response = await fetch(`${SUBJECTS_BASE}/${subjectId}/instructors`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response, "Failed to assign instructor");
}

/**
 * DELETE /api/v1/subjects/:subjectId/instructors/:userId
 * Unassigns an instructor from a subject.
 *
 * @param {number|string} subjectId
 * @param {number|string} userId - The user ID of the instructor to unassign
 * @returns {Promise<object|null>}
 */
export async function unassignInstructor(subjectId, userId) {
  const response = await fetch(`${SUBJECTS_BASE}/${subjectId}/instructors/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response, "Failed to unassign instructor");
}
