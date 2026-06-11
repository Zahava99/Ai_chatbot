import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSubjectStore from "@/stores/useSubjectStore";

export default function UpdateSubjectModal({ subject, subjectId, onClose }) {
  const [name, setName] = useState(subject?.name ?? "");
  const [description, setDescription] = useState(subject?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(subject?.name ?? "");
    setDescription(subject?.description ?? "");
  }, [subject]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await useSubjectStore.getState().updateSubject(subjectId, {
        name,
        description: description || null,
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
          <h2 className="text-lg font-semibold text-app">Update Subject</h2>
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
            <label className="block text-sm font-medium text-app opacity-70 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-app-border bg-transparent text-app text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder="Subject name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-app opacity-70 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-app-border bg-transparent text-app text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
              placeholder="Optional description"
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
            disabled={saving || !name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
