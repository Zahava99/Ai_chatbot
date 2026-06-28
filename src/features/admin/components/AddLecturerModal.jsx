import { useState } from "react";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { createAdminUser } from "@/features/admin/api/adminApi";

/**
 * Modal for adding a new lecturer (Researcher role).
 *
 * @param {{ show: boolean, onClose: () => void, onCreated: (user: object) => void }} props
 */
export default function AddLecturerModal({ show, onClose, onCreated }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!show) return null;

  function handleClose() {
    setForm({ fullName: "", email: "", password: "" });
    setError(null);
    setShowPassword(false);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newUser = await createAdminUser({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        password: form.password,
        roles: ["Researcher"],
      });
      onCreated(newUser);
      handleClose();
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-semibold text-app">Add Lecturer</p>
            <p className="text-xs text-app opacity-40 mt-0.5">Creates a new account with the Researcher role</p>
          </div>
          <button
            onClick={handleClose}
            className="text-app opacity-40 hover:opacity-80 transition-opacity p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-app opacity-60 font-medium">Full Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Dr. Jane Smith"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-app opacity-60 font-medium">Email</label>
            <input
              required
              type="email"
              placeholder="lecturer@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-app opacity-60 font-medium">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 hover:opacity-70 transition-opacity"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              {loading ? "Creating…" : "Add Lecturer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
