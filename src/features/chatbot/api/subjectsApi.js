import axios from "axios";
import { API_CONFIG } from "@/config/api";

const subjectsClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Fetch all subjects from the API.
 * @returns {Promise<Array>} Mapped array of subject objects.
 */
export async function fetchSubjects() {
  const { data } = await subjectsClient.get("/api/subjects");

  return (data.subjects ?? []).map((s) => ({
    id: s.id,
    code: s.name,
    name: s.description,
    semester: s.semester != null ? Number(s.semester) : null,
    document_count: s.document_count,
    chunk_count: s.chunk_count,
    created_at: s.created_at,
    pinned: false,
  }));
}
