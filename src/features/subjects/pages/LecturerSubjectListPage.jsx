import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Layers, MoreVertical, Search, AlertCircle } from "lucide-react";
import useSubjectStore from "@/stores/useSubjectStore";

const ACCENT_COLORS = [
  "bg-blue-500/10 text-blue-400",
  "bg-purple-500/10 text-purple-400",
  "bg-emerald-500/10 text-emerald-400",
  "bg-orange-500/10 text-orange-400",
  "bg-red-500/10 text-red-400",
  "bg-pink-500/10 text-pink-400",
];

export default function LecturerSubjectListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const subjects      = useSubjectStore((s) => s.subjects);
  const loading       = useSubjectStore((s) => s.subjectsLoading);
  const error         = useSubjectStore((s) => s.subjectsError);

  useEffect(() => {
    useSubjectStore.getState().fetchSubjects();
  }, []);

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Môn học</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">
            {loading ? "Loading…" : `${subjects.length} subjects`}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 mb-5 max-w-sm">
        <Search size={15} className="text-app opacity-40 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects…"
          className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none"
        />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-panel border border-app-border rounded-xl p-5 animate-pulse min-h-[160px]">
              <div className="w-11 h-11 rounded-xl bg-black/10 dark:bg-white/10 mb-4" />
              <div className="h-4 w-2/3 rounded bg-black/10 dark:bg-white/10 mb-2" />
              <div className="h-3 w-full rounded bg-black/10 dark:bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s, idx) => {
            const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            const initials = s.code ? s.code.slice(0, 2).toUpperCase() : s.name.slice(0, 2).toUpperCase();

            return (
              <div
                key={s.id}
                onClick={() => navigate(`/subjects/${s.id}`, { state: { subject: s } })}
                className="bg-panel border border-app-border rounded-xl p-5 hover:border-black/25 dark:hover:border-white/25 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-sm font-bold`}>
                    {initials}
                  </div>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-app opacity-40 hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                  >
                    <MoreVertical size={15} />
                  </button>
                </div>
                <p className="text-xs font-mono text-app opacity-30 mb-0.5">{s.code}</p>
                <h3 className="text-base font-semibold text-app mb-1 leading-snug">{s.name}</h3>
                <p className="text-xs text-app opacity-50 leading-snug mb-4 line-clamp-2">{s.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-app opacity-50">
                    <FileText size={13} />
                    <span>{s.documentCount} docs</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-app opacity-50">
                    <Layers size={13} />
                    <span>{s.chapterCount} chapters</span>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-app opacity-30">
              No subjects match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
