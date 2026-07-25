import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, MessageSquare, Target,
  TrendingUp, TrendingDown, Clock, Upload,
  ArrowRight, MoreHorizontal, RefreshCw,
  CheckCircle2, AlertCircle, Loader2,
  BookOpen, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
// import MustChangePasswordBanner from "@/components/common/MustChangePasswordBanner";
import { getDocuments } from "@/api/documentApi";
import { getSubjects } from "@/api/subjectApi";



const STATUS_META = {
  indexed:    { label: "Indexed",    cls: "text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-400" },
  processing: { label: "Processing", cls: "text-yellow-400 bg-yellow-500/10",  dot: "bg-yellow-400 animate-pulse" },
  error:      { label: "Error",      cls: "text-red-400 bg-red-500/10",         dot: "bg-red-400" },
};



const QUICK_ACTIONS = [
  { icon: Upload,    label: "Upload Document", to: "/documents_upload", accent: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" },
  { icon: FileText, label: "Document",   to: "/documents",             accent: "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { icon: BookOpen,    label: "Subjects",  to: "/subjects",        accent: "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20" },
  // { icon: RefreshCw, label: "Re-index All",   to: "/documents_upload",        accent: "text-orange-400 bg-orange-500/10 hover:bg-orange-500/20" },
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

function StatCardSkeleton() {
  return (
    <div className="bg-panel border border-app-border rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-black/10 dark:bg-white/10" />
        <div className="w-12 h-5 rounded-full bg-black/10 dark:bg-white/10" />
      </div>
      <div>
        <div className="h-7 w-20 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-3 w-32 rounded bg-black/10 dark:bg-white/10 mt-2" />
      </div>
      <div className="border-t border-app-border pt-3">
        <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
      </div>
    </div>
  );
}

function mapBackendStatus(status) {
  const s = String(status).toLowerCase();
  if (s === "indexed") return "indexed";
  if (s === "failed") return "error";
  return "processing"; // for Uploaded, Processing, etc.
}

/* ─── page ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState(null);
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [docsData, subjectsData] = await Promise.all([
          getDocuments(1, 100),
          getSubjects().catch(() => []),
        ]);

        const docs = docsData.items || [];
        const subjects = subjectsData || [];
        const subjectMap = {};
        subjects.forEach((s) => {
          subjectMap[s.id] = s.name;
        });

        // Filter subjects assigned to current user (instructor)
        const userId = user?.id;
        const userSubjects = userId
          ? subjects.filter((s) =>
              s.instructors?.some((ins) => ins.id === userId || ins.userId === userId)
            )
          : subjects;

        // Filter documents belonging to user's subjects
        const userSubjectIds = new Set(userSubjects.map((s) => s.id));
        const userDocs = userId
          ? docs.filter((d) => userSubjectIds.has(d.subjectId))
          : docs;

        const totalDocCount = userDocs.length;
        const totalSubjectCount = userSubjects.length;
        const totalChunks = userDocs.reduce((sum, d) => sum + (d.chunkCount || 0), 0);

        // Document indexing status
        const indexedCount = userDocs.filter((d) => String(d.status).toLowerCase() === "indexed").length;

        // Populate stats
        const computedStats = [
          {
            icon: FileText,
            label: "Tổng tài liệu",
            value: String(totalDocCount),
            sub: `${totalSubjectCount} môn học`,
            delta: "",
            deltaLabel: "",
            up: null,
            accent: "text-blue-400",
            bg: "bg-blue-500/10",
            ring: "ring-blue-500/20",
          },
          {
            icon: BookOpen,
            label: "Tổng môn học",
            value: String(totalSubjectCount),
            sub: "subjects managed",
            delta: "",
            deltaLabel: "",
            up: null,
            accent: "text-emerald-400",
            bg: "bg-emerald-500/10",
            ring: "ring-emerald-500/20",
          },
          {
            icon: Layers,
            label: "Tổng chunks",
            value: totalChunks.toLocaleString(),
            sub: "indexed content",
            delta: "",
            deltaLabel: "",
            up: null,
            accent: "text-purple-400",
            bg: "bg-purple-500/10",
            ring: "ring-purple-500/20",
          },
          {
            icon: CheckCircle2,
            label: "Đã indexed",
            value: `${indexedCount}/${totalDocCount}`,
            sub: "documents indexed",
            delta: indexedCount === totalDocCount ? "All done" : "In progress",
            deltaLabel: "",
            up: null,
            accent: "text-orange-400",
            bg: "bg-orange-500/10",
            ring: "ring-orange-500/20",
          },
        ];
        setStats(computedStats);

        // Recent Uploads — show only docs belonging to user's subjects (most recent first)
        const sortedDocs = userId
          ? [...userDocs].sort((a, b) => new Date(b.createdAtUtc) - new Date(a.createdAtUtc))
          : [...docs].sort((a, b) => new Date(b.createdAtUtc) - new Date(a.createdAtUtc));
        const uploadsToShow = sortedDocs.slice(0, 5);
        const mappedUploads = uploadsToShow.map((d) => {
          let sizeStr = "—";
          if (d.sizeBytes) {
            const kb = d.sizeBytes / 1024;
            if (kb < 1024) {
              sizeStr = `${kb.toFixed(1)} KB`;
            } else {
              sizeStr = `${(kb / 1024).toFixed(1)} MB`;
            }
          }

          const dateStr = d.createdAtUtc
            ? new Date(d.createdAtUtc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—";

          return {
            id: d.id,
            name: d.originalFileName || d.title,
            subject: subjectMap[d.subjectId] || `Subject #${d.subjectId}`,
            size: sizeStr,
            status: mapBackendStatus(d.status),
            date: dateStr,
            chunks: d.chunkCount || 0,
          };
        });
        setRecentUploads(mappedUploads);
      } catch (err) {
        console.error("[LecturerDashboard] Failed to fetch stats", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 xl:p-8 max-w-6xl mx-auto space-y-8 animate-pulse-subtle">
        {/* Header */}
        <div className="flex items-start justify-between animate-pulse">
          <div>
            <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10 mb-2" />
            <div className="h-7 w-48 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-4 w-64 rounded bg-black/10 dark:bg-white/10 mt-2" />
          </div>
          <div className="w-36 h-10 rounded-xl bg-black/10 dark:bg-white/10" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center justify-center py-20 text-sm text-app opacity-40 gap-2">
          <Loader2 className="animate-spin" size={24} />
          Loading workspace statistics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 xl:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      </div>
    );
  }

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

      {/* ── Must Change Password Banner ── */}
      {/* <MustChangePasswordBanner /> */}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="text-xs text-app opacity-40 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              {recentUploads.length}
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
          {recentUploads.map((doc) => (
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
            Showing {recentUploads.length} most recent uploads
          </p>
        </div>
      </div>

    </div>
  );
}
