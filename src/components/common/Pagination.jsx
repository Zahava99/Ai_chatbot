import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable pagination controls.
 *
 * @param {{ page: number, pageSize: number, totalCount: number, totalPages: number, canPrev: boolean, canNext: boolean, nextPage: () => void, prevPage: () => void, goToPage: (n: number) => void }} props
 */
export default function Pagination({ page, pageSize, totalCount, totalPages, canPrev, canNext, nextPage, prevPage, goToPage }) {
  if (totalPages <= 1) return null;

  // Build page numbers with ellipsis
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-app opacity-40">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={prevPage}
          disabled={!canPrev}
          className="p-1.5 rounded-lg border border-app-border text-app opacity-60 hover:opacity-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        {pageNumbers.map((item, idx) =>
          item === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-xs text-app opacity-30">…</span>
          ) : (
            <button
              key={item}
              onClick={() => goToPage(item)}
              className={cn(
                "min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors",
                item === page
                  ? "bg-black/10 dark:bg-white/15 text-app"
                  : "text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              {item}
            </button>
          )
        )}
        <button
          onClick={nextPage}
          disabled={!canNext}
          className="p-1.5 rounded-lg border border-app-border text-app opacity-60 hover:opacity-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
