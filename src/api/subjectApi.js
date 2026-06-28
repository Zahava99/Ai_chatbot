import axios from "axios";
import { API_CONFIG } from "@/config/api";
import { getAccessToken } from "@/features/auth/api/authUtils";

const subjectClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Attach auth token to every request
subjectClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * GET /api/v1/subjects
 * Returns a list of all subjects.
 *
 * @returns {Promise<Array<{ id: number, code: string, name: string, description: string, chapterCount: number, documentCount: number }>>}
 */
export async function getSubjects() {
  const { data } = await subjectClient.get("/api/v1/subjects");
  return data;
}

/**
 * POST /api/v1/subjects
 * Creates a new subject.
 *
 * @param {{ code: string, name: string, description: string }} payload
 * @returns {Promise<{ id: number, code: string, name: string, description: string }>}
 */
export async function createSubject(payload) {
  const { data } = await subjectClient.post("/api/v1/subjects", payload);
  return data;
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
  const { data } = await subjectClient.put(`/api/v1/subjects/${subjectId}`, payload);
  return data;
}

/**
 * GET /api/v1/subjects/:subjectId/chapters
 * Returns the chapter list for a subject.
 *
 * @param {number|string} subjectId
 * @returns {Promise<Array<{ id: number, subjectId: number, title: string, orderIndex: number }>>}
 */
export async function getChapters(subjectId) {
  const { data } = await subjectClient.get(`/api/v1/subjects/${subjectId}/chapters`);
  return data;
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
  const { data } = await subjectClient.post(`/api/v1/subjects/${subjectId}/chapters`, payload);
  return data;
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
  const { data } = await subjectClient.post(`/api/v1/subjects/${subjectId}/instructors`, { userId });
  return data;
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
  const { data } = await subjectClient.delete(`/api/v1/subjects/${subjectId}/instructors/${userId}`);
  return data;
}
