import apiClient from "@/lib/apiClient";

/**
 * Fetch paginated document list.
 * @param {object} params - Query params: page, pageSize, search, subjectId, status, sortBy, sortDesc
 * @returns {Promise<{ items: Array, page: number, pageSize: number, totalCount: number, totalPages: number }>}
 */
export async function getDocuments(params = {}) {
  const { data } = await apiClient.get("/api/v1/documents", { params });
  return data;
}
