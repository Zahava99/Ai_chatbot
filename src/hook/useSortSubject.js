import { useState, useMemo } from "react";

/**
 * Sort criteria for subjects/documents.
 * - "name"       → Alphabetical order by subject name (or title)
 * - "size"       → By file size (sizeBytes)
 * - "uploadDate" → By upload date (createdAtUtc)
 */
const SORT_OPTIONS = {
  NAME: "name",
  SIZE: "size",
  UPLOAD_DATE: "uploadDate",
};

/**
 * Hook to sort a list of items by name (alphabetical), file size, or upload date.
 * Works for both subject lists and document lists.
 *
 * @param {Array} items - Array of objects to sort.
 *   For subjects: { id, name, code, totalSizeBytes?, documentCount?, latestUploadDate?, createdAtUtc? }
 *   For documents: { id, title, originalFileName, sizeBytes, createdAtUtc, subjectId }
 *
 * @param {Object} [options]
 * @param {string} [options.defaultSortBy="name"] - Initial sort criterion.
 * @param {string} [options.defaultOrder="asc"] - Initial order: "asc" or "desc".
 * @param {Function} [options.getSubjectName] - Optional function to resolve subject name from a doc's subjectId.
 *
 * @returns {{
 *   sortedItems: Array,
 *   sortBy: string,
 *   order: string,
 *   setSortBy: Function,
 *   toggleOrder: Function,
 *   setOrder: Function,
 *   SORT_OPTIONS: Object
 * }}
 */
export default function useSortSubject(items = [], { defaultSortBy = "name", defaultOrder = "asc", getSubjectName } = {}) {
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [order, setOrder] = useState(defaultOrder);

  const toggleOrder = () => setOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const sortedItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    const sorted = [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SORT_OPTIONS.NAME: {
          // Support both subject (name) and document (title) shapes
          // If getSubjectName is provided, sort by subject name (for document lists)
          const nameA = getSubjectName
            ? (getSubjectName(a.subjectId) || "").toLowerCase()
            : (a.name || a.title || "").toLowerCase();
          const nameB = getSubjectName
            ? (getSubjectName(b.subjectId) || "").toLowerCase()
            : (b.name || b.title || "").toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        }

        case SORT_OPTIONS.SIZE: {
          const sizeA = a.sizeBytes ?? a.totalSizeBytes ?? a.documentCount ?? 0;
          const sizeB = b.sizeBytes ?? b.totalSizeBytes ?? b.documentCount ?? 0;
          comparison = sizeA - sizeB;
          break;
        }

        case SORT_OPTIONS.UPLOAD_DATE: {
          const dateA = new Date(a.createdAtUtc || a.latestUploadDate || 0).getTime();
          const dateB = new Date(b.createdAtUtc || b.latestUploadDate || 0).getTime();
          comparison = dateA - dateB;
          break;
        }

        default:
          comparison = 0;
      }

      return order === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [items, sortBy, order, getSubjectName]);

  return {
    sortedItems,
    sortBy,
    order,
    setSortBy,
    setOrder,
    toggleOrder,
    SORT_OPTIONS,
  };
}

export { SORT_OPTIONS };
