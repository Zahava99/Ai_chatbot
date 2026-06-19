import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Layers, MoreVertical, AlertCircle } from "lucide-react";
import useSubjectStore from "@/stores/useSubjectStore";
import MustChangePasswordBanner from "@/components/common/MustChangePasswordBanner";

// Cycles through accent colours for subject cards
const ACCENT_COLORS = [
  "bg-blue-500/10 text-blue-400",
  "bg-purple-500/10 text-purple-400",
  "bg-emerald-500/10 text-emerald-400",
  "bg-orange-500/10 text-orange-400",
  "bg-red-500/10 text-red-400",
  "bg-pink-500/10 text-pink-400",
];

const EMPTY_FORM = { code: "", name: "", description: "" };

export default function SubjectListPage() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const subjects  = useSubjectStore((s) => s.subjects);
  const loading   = useSubjectStore((s) => s.subjectsLoading);
  const error     = useSubjectStore((s) => s.subjectsError);

  useEffect(() => {
    useSubjectStore.getState().fetchSubjects();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreateError(null);
    setShowCreate(true);
  }

  async function handleCreate() {
    if (!form.code.trim() || !form.name.trim()) {
      setCreateError("Code and Name are required.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await useSubjectStore.getState().createSubject({
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setShowCreate(false);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Must Change Password Banner */}
      <MustChangePasswordBanner />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Môn học</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">
            {loading ? "Loading…" : `${subjects.length} subjects`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} /> New Subject
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-panel border border-app-border rounded-xl p-5 animate-pulse min-h-[180px]">
              <div className="w-11 h-11 rounded-xl bg-black/10 dark:bg-white/10 mb-4" />
              <div className="h-4 w-2/3 rounded bg-black/10 dark:bg-white/10 mb-2" />
              <div className="h-3 w-full rounded bg-black/10 dark:bg-white/10 mb-1" />
              <div className="h-3 w-4/5 rounded bg-black/10 dark:bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Subject grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map((s, idx) => {
            const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            // Derive initials from subject code or name
            const initials = s.code
              ? s.code.slice(0, 2).toUpperCase()
              : s.name.slice(0, 2).toUpperCase();

            return (
              <div
                key={s.id}
                onClick={() => navigate(`/admin/subjects/${s.id}`, { state: { subject: s } })}
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

                {/* Instructors */}
                {s.instructors && s.instructors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-app-border">
                    <p className="text-xs text-app opacity-30 mb-1">Instructors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.instructors.map((inst) => (
                        <span
                          key={inst.userId}
                          className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium"
                        >
                          {inst.fullName || inst.email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Create card */}
          <button
            onClick={openCreate}
            className="border-2 border-dashed border-app-border rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-black/30 dark:hover:border-white/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all group min-h-[180px]"
          >
            <div className="w-10 h-10 rounded-full border-2 border-app-border group-hover:border-black/40 dark:group-hover:border-white/60 flex items-center justify-center transition-colors">
              <Plus size={18} className="text-app opacity-50 group-hover:opacity-80" />
            </div>
            <span className="text-sm text-app opacity-50 group-hover:opacity-80 transition-colors">Create new subject</span>
          </button>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-semibold text-app mb-4">Create Subject</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Code <span className="text-red-400">*</span></label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="e.g. VNR202"
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Subject Name <span className="text-red-400">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. History of Vietnam Communist Party"
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-app opacity-60 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description..."
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>
              {createError && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle size={14} className="shrink-0" />
                  {createError}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCreate(false)}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
