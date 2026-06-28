import { useState, useMemo } from "react";

/**
 * Generic pagination hook.
 * @param {Object} options
 * @param {number} options.totalCount - Total number of items from API
 * @param {number} [options.pageSize=10] - Items per page
 * @param {number} [options.initialPage=1] - Starting page
 * @returns {{ page, pageSize, totalPages, canPrev, canNext, nextPage, prevPage, goToPage, setPageSize }}
 */
export default function usePagination({ totalCount = 0, pageSize: initialPageSize = 10, initialPage = 1 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (n) => setPage(Math.max(1, Math.min(n, totalPages)));

  return { page, pageSize, totalPages, canPrev, canNext, nextPage, prevPage, goToPage, setPage, setPageSize };
}
