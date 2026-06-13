import axios from "axios";
import { API_CONFIG } from "@/config/api";

const subjectsClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Fetch all subjects from the API.
 * GET /api/v1/subjects
 * Response: [{ id, code, name, description, chapterCount, documentCount }]
 * @returns {Promise<Array>} Mapped array of subject objects.
 */
export async function fetchSubjects() {
  const { data } = await subjectsClient.get("/api/v1/subjects");

  return (Array.isArray(data) ? data : []).map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description,
    chapterCount: s.chapterCount,
    documentCount: s.documentCount,
    // semester is not available yet
    semester: null,
    pinned: false,
  }));
}
