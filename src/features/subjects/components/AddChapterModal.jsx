import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSubjectStore from "@/stores/useSubjectStore";

export default function AddChapterModal({ subjectId, currentChapterCount, onClose }) {
  const [title, setTitle] = useState("");
  const [orderIndex, setOrderIndex] = useState(currentChapterCount + 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await useSubjectStore.getState().createChapter(subjectId, {
        title,
        orderIndex,
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-panel border border-app-border rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-app">Add Chapter</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app opacity-70 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app-border bg-transparent text-app text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Chapter title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app opacity-70 mb-1.5">Order Index</label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              min={1}
              className="w-full px-3 py-2 rounded-lg border border-app-border bg-transparent text-app text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-app opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !title.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Creating…" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
