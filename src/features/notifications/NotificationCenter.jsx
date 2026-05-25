import { useState } from "react";
import {
  X, Upload, Cpu, BarChart3, AlertCircle,
  CheckCircle2, Info, Trash2, Bell, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── mock data ──────────────────────────────────────────────── */
const INITIAL = [
  {
    id: 1,
    type: "success",
    category: "upload",
    icon: Upload,
    title: "Upload completed",
    desc: "Lecture_01.pdf has been uploaded successfully.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "success",
    category: "embedding",
    icon: Cpu,
    title: "Embedding completed",
    desc: "Chapter_3.docx embedded with multilingual-e5-base. 22 chunks created.",
    time: "5 min ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    category: "benchmark",
    icon: BarChart3,
    title: "Benchmark done",
    desc: "RAGAS evaluation finished. Faithfulness: 92% · Recall: 87%.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: 4,
    type: "error",
    category: "error",
    icon: AlertCircle,
    title: "Indexing failed",
    desc: "Slides_Week5.pptx could not be indexed. Check file format and retry.",
    time: "2 hr ago",
    read: true,
  },
  {
    id: 5,
    type: "success",
    category: "upload",
    icon: Upload,
    title: "Upload completed",
    desc: "Textbook_Ch7.pdf uploaded. Processing started.",
    time: "3 hr ago",
    read: true,
  },
];

const TYPE_CONFIG = {
  success: {
    iconCls: "text-emerald-400",
    dotCls:  "bg-emerald-400",
    bgCls:   "bg-emerald-500/10",
  },
  info: {
    iconCls: "text-blue-400",
    dotCls:  "bg-blue-400",
    bgCls:   "bg-blue-500/10",
  },
  error: {
    iconCls: "text-red-400",
    dotCls:  "bg-red-400",
    bgCls:   "bg-red-500/10",
  },
};

const FILTERS = [
  { id: "all",       label: "All" },
  { id: "upload",    label: "Uploads" },
  { id: "embedding", label: "Embedding" },
  { id: "benchmark", label: "Benchmark" },
  { id: "error",     label: "Errors" },
];

/* ─── component ──────────────────────────────────────────────── */
export default function NotificationCenter({ onClose }) {
  const [items, setItems]     = useState(INITIAL);
  const [filter, setFilter]   = useState("all");

  const unreadCount = items.filter((n) => !n.read).length;

  const visible = filter === "all"
    ? items
    : items.filter((n) => n.category === filter);

  function markRead(id) {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function dismiss(id) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  function clearAll() {
    setItems([]);
  }

  return (
    <div className="w-[360px] bg-panel border border-app-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-app-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
            <Bell size={14} className="text-app opacity-60" />
          </div>
          <span className="text-sm font-semibold text-app">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 leading-none">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearAll}
            title="Clear all"
            className="p-1.5 rounded-lg text-app opacity-30 hover:opacity-70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-app opacity-30 hover:opacity-70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1 px-3 py-2 border-b border-app-border overflow-x-auto shrink-0 scrollbar-none">
        {FILTERS.map((f) => {
          const count = f.id === "all"
            ? items.length
            : items.filter((n) => n.category === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                filter === f.id
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              {f.label}
              {count > 0 && (
                <span className={cn(
                  "text-[10px] px-1 rounded-full leading-none",
                  filter === f.id ? "bg-emerald-500/20 text-emerald-400" : "bg-black/10 dark:bg-white/10 text-app opacity-50"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto max-h-[360px]">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <Bell size={20} className="text-app opacity-20" />
            </div>
            <p className="text-sm text-app opacity-40">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-app-border">
            {visible.map((n) => {
              const cfg  = TYPE_CONFIG[n.type];
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors group",
                    n.read
                      ? "hover:bg-black/5 dark:hover:bg-white/5"
                      : "bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {/* unread indicator */}
                  {!n.read && (
                    <span className={cn("absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shrink-0", cfg.dotCls)} />
                  )}

                  {/* icon */}
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cfg.bgCls)}>
                    <Icon size={15} className={cfg.iconCls} />
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-tight", n.read ? "text-app opacity-60 font-normal" : "text-app font-medium")}>
                      {n.title}
                    </p>
                    <p className="text-xs text-app opacity-45 mt-0.5 leading-snug">{n.desc}</p>
                    <p className="text-[10px] text-app opacity-25 mt-1.5">{n.time}</p>
                  </div>

                  {/* dismiss */}
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-app opacity-30 hover:opacity-70 hover:bg-black/10 dark:hover:bg-white/10 transition-all shrink-0 self-start mt-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {items.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-app-border bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle2 size={12} />
            Mark all as read
          </button>
          <button
            onClick={() => setItems(INITIAL)}
            className="flex items-center gap-1.5 text-xs text-app opacity-30 hover:opacity-60 transition-colors"
          >
            <RefreshCw size={11} />
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
