import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { deletePackage } from "@/api/paymentApi";

export default function DeletePackageModal({ pkg, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    try {
      setDeleting(true);
      setError(null);
      await deletePackage(pkg.id);
      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-panel border border-app-border rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <h2 className="text-base font-semibold text-app">Delete Package</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-400" />
          </div>

          <div className="text-center">
            <p className="text-sm text-app">
              Are you sure you want to delete <span className="font-semibold">"{pkg.name}"</span>?
            </p>
            <p className="text-xs text-app opacity-50 mt-1">This action cannot be undone.</p>
          </div>

          {error && (
            <div className="w-full rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 w-full pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 border border-app-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
