import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ChevronRight, AlertCircle, Layers, FileText, BookOpen,
} from "lucide-react";
import useSubjectStore from "@/stores/useSubjectStore";

export default function LecturerSubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // Prefer router state (passed on navigate); fall back to store after F5
  const subjectFromState = state?.subject ?? null;
  const subjectFromStore = useSubjectStore((s) => s.subjects.find((x) => String(x.id) === String(id)) ?? null);
  const subject = subjectFromState ?? subjectFromStore;

  const chaptersBySubject = useSubjectStore((s) => s.chaptersBySubject);
  const chapters = chaptersBySubject[id] ?? [];
  const loading  = useSubjectStore((s) => s.chaptersLoading);
  const error    = useSubjectStore((s) => s.chaptersError);

  useEffect(() => {
    useSubjectStore.getState().fetchSubjects();
    useSubjectStore.getState().fetchChapters(id);
  }, [id]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-app opacity-40 mb-5">
        <button onClick={() => navigate("/subjects")} className="hover:opacity-80 transition-opacity">
          Môn học
        </button>
        <ChevronRight size={12} />
        <span className="text-app opacity-70">{subject?.name ?? `Subject #${id}`}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-400">
          {subject?.code?.slice(0, 3) ?? "—"}
        </div>
        <div>
          <p className="text-xs font-mono text-app opacity-30 mb-0.5">{subject?.code}</p>
          <h1 className="text-xl font-semibold text-app">{subject?.name ?? `Subject #${id}`}</h1>
          {subject?.description && (
            <p className="text-sm text-app opacity-50 mt-0.5">{subject.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: FileText,  label: "Documents",  value: subject?.documentCount ?? "—", color: "text-blue-400 bg-blue-500/10"      },
          { icon: Layers,    label: "Chapters",   value: subject?.chapterCount  ?? "—", color: "text-purple-400 bg-purple-500/10"  },
          { icon: BookOpen,  label: "Subject ID", value: `#${id}`,                      color: "text-emerald-400 bg-emerald-500/10" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-panel border border-app-border rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon size={16} />
            </div>
            <p className="text-lg font-bold text-app">{value}</p>
            <p className="text-xs text-app opacity-50">{label}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Chapters — read-only for lecturers */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-app-border">
          <p className="text-sm font-semibold text-app">
            Chapters {!loading && `(${chapters.length})`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="divide-y divide-app-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="w-6 h-6 rounded-lg bg-black/10 dark:bg-white/10 shrink-0" />
                <div className="h-3.5 w-2/3 rounded bg-black/10 dark:bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* Chapter list */}
        {!loading && (
          <div className="divide-y divide-app-border">
            {chapters.length === 0 && (
              <p className="px-5 py-10 text-sm text-app opacity-30 text-center">
                No chapters yet.
              </p>
            )}
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-app opacity-40">{chapter.orderIndex}</span>
                </div>
                <Layers size={14} className="text-app opacity-30 shrink-0" />
                <p className="text-sm font-medium text-app">{chapter.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
