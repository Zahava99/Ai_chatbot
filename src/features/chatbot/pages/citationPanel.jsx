import { X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CitationPanel({ source, onClose }) {
  console.log(source);
  if (!source) return null;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border shrink-0">
        <span className="text-sm font-medium text-app opacity-90">Citation</span>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-app opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Close citation panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Document info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <FileText size={15} className="text-blue-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-app leading-snug break-words">
              {source.documentName}
            </p>
            {source.pageNumber != null && (
              <p className="text-xs text-app opacity-50 mt-0.5">
                Page {source.pageNumber}
              </p>
            )}
          </div>
        </div>

        {/* Source index badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold">
            {source.index}
          </span>
          <span className="text-xs text-app opacity-50">Source {source.index}</span>
        </div>

        {/* Excerpt / chunk content */}
        {source.excerpt && (
          <div className="border border-app-border rounded-xl p-4 bg-black/[0.02] dark:bg-white/[0.02]">
            <p className="text-xs font-medium text-app opacity-50 uppercase tracking-wide mb-2">
              Excerpt
            </p>
            <p className="text-sm text-app opacity-80 leading-relaxed whitespace-pre-wrap">
              {source.excerpt}
            </p>
          </div>
        )}

        {/* Relevance score if available */}
        {/* {source.relevanceScore != null && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-app opacity-50">Relevance:</span>
            <span className="text-xs font-medium text-emerald-500">
              {(source.relevanceScore * 100).toFixed(1)}%
            </span>
          </div>
        )} */}
      </div>
    </div>
  );
}
