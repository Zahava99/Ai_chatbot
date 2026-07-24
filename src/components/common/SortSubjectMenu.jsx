import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dropdown menu for sorting documents by subject name, file size, or upload date.
 *
 * @param {Object} props
 * @param {string} props.sortBy - Current sort criterion key from SORT_OPTIONS.
 * @param {string} props.order - Current order: "asc" or "desc".
 * @param {Function} props.setSortBy - Setter for sortBy.
 * @param {Function} props.toggleOrder - Toggles between asc/desc.
 * @param {Object} props.SORT_OPTIONS - { NAME, SIZE, UPLOAD_DATE } constants.
 */
export default function SortSubjectMenu({ sortBy, order, setSortBy, toggleOrder, SORT_OPTIONS }) {
  const [open, setOpen] = useState(false);

  const label =
    sortBy === SORT_OPTIONS.NAME ? "Subject" :
    sortBy === SORT_OPTIONS.SIZE ? "Size" : "Date";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-app-border text-sm text-app opacity-60 hover:opacity-100 transition-colors"
      >
        Sort: {label} ({order === "asc" ? "↑" : "↓"})
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-panel border border-app-border rounded-xl shadow-xl z-50 py-1">
          <button
            onClick={() => { setSortBy(SORT_OPTIONS.NAME); setOpen(false); }}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm text-app transition-colors hover:bg-black/5 dark:hover:bg-white/10",
              sortBy === SORT_OPTIONS.NAME ? "opacity-100 font-medium" : "opacity-60"
            )}
          >
            Subject (A-Z)
          </button>
          <button
            onClick={() => { setSortBy(SORT_OPTIONS.SIZE); setOpen(false); }}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm text-app transition-colors hover:bg-black/5 dark:hover:bg-white/10",
              sortBy === SORT_OPTIONS.SIZE ? "opacity-100 font-medium" : "opacity-60"
            )}
          >
            File Size
          </button>
          <button
            onClick={() => { setSortBy(SORT_OPTIONS.UPLOAD_DATE); setOpen(false); }}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-sm text-app transition-colors hover:bg-black/5 dark:hover:bg-white/10",
              sortBy === SORT_OPTIONS.UPLOAD_DATE ? "opacity-100 font-medium" : "opacity-60"
            )}
          >
            Upload Date
          </button>
          <hr className="my-1 border-app-border" />
          <button
            onClick={() => { toggleOrder(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-app opacity-60 hover:opacity-100 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            {order === "asc" ? "↓ Descending" : "↑ Ascending"}
          </button>
        </div>
      )}
    </div>
  );
}
