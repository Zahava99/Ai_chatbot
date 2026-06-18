import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import useAuthStore from "@/stores/useAuthStore";

/**
 * Displays a warning banner when the user must change their password.
 * Also shows an optional error message (e.g. from a 403 response).
 *
 * @param {{ error403?: string | null }} props
 */
export default function MustChangePasswordBanner({ error403 = null }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  if (!user?.mustChangePassword) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 mb-6">
      <AlertTriangle size={20} className="text-amber-500 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-app">
          Password change required
        </p>
        <p className="text-xs text-app opacity-60 mt-0.5">
          {error403 || "You must update your password before continuing."}
        </p>
      </div>
      <button
        onClick={() => navigate("/change-password")}
        className="shrink-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
      >
        Change Password
      </button>
    </div>
  );
}
