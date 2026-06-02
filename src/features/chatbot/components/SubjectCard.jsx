import { Pin, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubjectCard({ subject, view, onClick, onTogglePin }) {
  if (view === "list") {
    return (
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors group">
        <div className="w-9 h-9 rounded-lg bg-black/10 dark:bg-zinc-700 flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-app opacity-70" />
        </div>
        <button
          onClick={() => onClick(subject)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-app truncate">{subject.code}</p>
            {subject.pinned && <Pin size={12} className="text-app opacity-40 shrink-0" />}
          </div>
          <p className="text-xs text-app opacity-50 mt-0.5 truncate">{subject.name}</p>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(subject.id); }}
          className={cn(
            "text-app transition-all p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10",
            subject.pinned ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-40 hover:opacity-100"
          )}
          title={subject.pinned ? "Unpin" : "Pin to top"}
        >
          <Pin size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-[275px] group">
      <div
        onClick={() => onClick(subject)}
        className="w-[275px] h-[222px] rounded-xl bg-panel border border-app-border hover:border-black/25 dark:hover:border-white/25 flex flex-col items-start justify-between p-4 transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-zinc-700/80"
      >
        {/* Top row */}
        <div className="flex items-center justify-between w-full">
          <BookOpen size={40} className="text-app opacity-50" />
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(subject.id); }}
            className={cn(
              "text-app transition-all p-1 rounded hover:bg-black/10 dark:hover:bg-white/10",
              subject.pinned ? "opacity-60 hover:opacity-100" : "opacity-0 group-hover:opacity-60 hover:opacity-100"
            )}
            title={subject.pinned ? "Unpin" : "Pin to top"}
          >
            <Pin size={15} className={subject.pinned ? "fill-current" : ""} />
          </button>
        </div>
        <div className="w-full">
          <p className="text-base font-bold text-app leading-tight">{subject.code}</p>
          <p className="text-xs text-app opacity-50 mt-1 leading-tight">{subject.name}</p>
        </div>
      </div>
    </div>
  );
}
