import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, MessageSquare, Target, Cpu,
  TrendingUp, TrendingDown, Clock, Upload,
  ArrowRight, MoreHorizontal, RefreshCw,
  CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── mock data ─────────────────────────────────────────────── */
const STATS = [
  {
    icon: FileText,
    label: "Tổng tài liệu",
    value: "24",
    sub: "8 subjects",
    delta: "+3",
    deltaLabel: "this week",
    up: true,
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
  },
  {
    icon: MessageSquare,
    label: "Tổng câu hỏi",
    value: "1,284",
    sub: "across all sessions",
    delta: "+128",
    deltaLabel: "today",
    up: true,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
  {
    icon: Target,
    label: "Accuracy Score",
    value: "92.4%",
    sub: "RAGAS evaluation",
    delta: "+1.2%",
    deltaLabel: "vs last run",
    up: true,
    accent: "text-purple-400",
    bg: "bg-purple-500/10",
    ring: "ring-purple-500/20",
  },
  {
    icon: Cpu,
    label: "Active Embedding",
    value: "e5-base",
    sub: "multilingual-e5-base",
    delta: "Running",
    deltaLabel: "",
    up: null,
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    ring: "ring-orange-500/20",
  },
];

const STATUS_META = {
  indexed:    { label: "Indexed",    cls: "text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-400" },
  processing: { label: "Processing", cls: "text-yellow-400 bg-yellow-500/10",  dot: "bg-yellow-400 animate-pulse" },
  error:      { label: "Error",      cls: "text-red-400 bg-red-500/10",         dot: "bg-red-400" },
};

const RECENT_UPLOADS = [
  { id: 1, name: "Lecture_01.pdf",     subject: "Machine Learning",  size: "2.4 MB", status: "indexed",    date: "May 26, 2026", chunks: 48 },
  { id: 2, name: "Chapter_3.docx",     subject: "Deep Learning",     size: "1.1 MB", status: "indexed",    date: "May 25, 2026", chunks: 22 },
  { id: 3, name: "Slides_Week5.pptx",  subject: "NLP",               size: "5.8 MB", status: "processing", date: "May 25, 2026", chunks: 0  },
  { id: 4, name: "Research_Paper.pdf", subject: "Computer Vision",   size: "3.2 MB", status: "error",      date: "May 24, 2026", chunks: 0  },
  { id: 5, name: "Textbook_Ch7.pdf",   subject: "Algorithms",        size: "8.1 MB", status: "indexed",    date: "May 23, 2026", chunks: 134 },
];

const QUICK_ACTIONS = [
  { icon: Upload,    label: "Upload Document", to: "/documents_upload", accent: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" },
  { icon: MessageSquare, label: "New Chat",   to: "/chat",             accent: "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { icon: Target,    label: "Run Benchmark",  to: "/benchmark",        accent: "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20" },
  { icon: RefreshCw, label: "Re-index All",   to: "/documents_upload",        accent: "text-orange-400 bg-orange-500/10 hover:bg-orange-500/20" },
];

/* ─── sub-components ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, delta, deltaLabel, up, accent, bg, ring }) {
  return (
    <div className={cn("bg-panel border border-app-border rounded-2xl p-5 flex flex-col gap-4 hover:ring-2 transition-all duration-150", ring)}>
      {/* top row */}
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
          <Icon size={20} className={accent} />
        </div>
        {up !== null ? (
          <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", up ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10")}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {delta}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            {delta}
          </div>
        )}
      </div>

      {/* value */}
      <div>
        <p className="text-2xl font-bold text-app leading-none tracking-tight">{value}</p>
        <p className="text-xs text-app opacity-40 mt-1.5">{label}</p>
      </div>

      {/* footer */}
      <p className="text-xs text-app opacity-30 border-t border-app-border pt-3">
        {sub}{deltaLabel ? ` · ${deltaLabel}` : ""}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium", m.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", m.dot)} />
      {m.label}
    </span>
  );
}

/* ─── page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState(null);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="p-6 xl:p-8 max-w-6xl mx-auto space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-app opacity-40 mb-1 uppercase tracking-widest">Dashboard</p>
          <h1 className="text-2xl font-bold text-app leading-tight">{greeting}, Lecturer 👋</h1>
          <p className="text-sm text-app opacity-50 mt-1">
            Here's an overview of your EduChat workspace.
          </p>
        </div>
        <button
          onClick={() => navigate("/documents_upload")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Upload size={15} />
          Upload Document
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="text-xs text-app opacity-40 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, to, accent }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                accent
              )}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent uploads ── */}
      <div className="bg-panel border border-app-border rounded-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <Clock size={14} className="text-app opacity-50" />
            </div>
            <span className="text-sm font-semibold text-app">Recent Uploads</span>
            <span className="text-xs text-app opacity-30 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
              {RECENT_UPLOADS.length}
            </span>
          </div>
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {/* table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2 border-b border-app-border">
          {["Document", "Subject", "Chunks", "Status", "Date"].map((h) => (
            <span key={h} className="text-xs text-app opacity-30 font-medium">{h}</span>
          ))}
        </div>

        {/* rows */}
        <div className="divide-y divide-app-border">
          {RECENT_UPLOADS.map((doc) => (
            <div
              key={doc.id}
              onMouseEnter={() => setHoveredRow(doc.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => navigate(`/documents_upload/${doc.id}`)}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              {/* name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                  {doc.status === "processing" ? (
                    <Loader2 size={14} className="text-yellow-400 animate-spin" />
                  ) : doc.status === "error" ? (
                    <AlertCircle size={14} className="text-red-400" />
                  ) : (
                    <FileText size={14} className="text-app opacity-40" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-app truncate">{doc.name}</p>
                  <p className="text-xs text-app opacity-30">{doc.size}</p>
                </div>
              </div>

              {/* subject */}
              <span className="text-xs text-app opacity-50 whitespace-nowrap">{doc.subject}</span>

              {/* chunks */}
              <span className="text-xs text-app opacity-40 text-right">
                {doc.chunks > 0 ? doc.chunks : "—"}
              </span>

              {/* status */}
              <StatusBadge status={doc.status} />

              {/* date */}
              <span className="text-xs text-app opacity-30 whitespace-nowrap">{doc.date}</span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t border-app-border bg-black/[0.02] dark:bg-white/[0.02]">
          <p className="text-xs text-app opacity-25">
            Showing {RECENT_UPLOADS.length} most recent uploads
          </p>
        </div>
      </div>

    </div>
  );
}
