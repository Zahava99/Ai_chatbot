import { useState, useEffect, useCallback } from "react";
import { getDocuments } from "@/features/documents/services/documentService";

/**
 * Hook to fetch documents with pagination.
 * Returns { data, totalCount, totalPages, loading, error, refetch }
 */
export function useDocuments(params = {}) {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize params so useEffect dependency is stable
  const paramKey = JSON.stringify(params);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDocuments(JSON.parse(paramKey));
      setData(result.items ?? []);
      setTotalCount(result.totalCount ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, [paramKey]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return { data, totalCount, totalPages, loading, error, refetch: fetchDocs };
}
