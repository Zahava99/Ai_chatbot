import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Header from "@/components/common/header";
import { AuthBrand, AuthCard } from "@/features/auth/components/authCommonUI";
import { changePassword } from "@/features/auth/api/authApi";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("form"); // "form" | "done"
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fields, setFields] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(key, val) {
    setFields((f) => ({ ...f, [key]: val }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (fields.newPass.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (fields.newPass !== fields.confirm) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await changePassword(fields.current, fields.confirm);
      setStep("done");
    } catch (err) {
      setError(err.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AuthBrand />
        <AuthCard>
          {step === "form" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <KeyRound size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-app">Change Password</p>
                  <p className="text-xs text-app opacity-50">Update your account password</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="block text-sm text-app opacity-60 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={fields.current}
                      onChange={(e) => handleChange("current", e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 hover:opacity-80 transition-opacity"
                      tabIndex={-1}
                    >
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-sm text-app opacity-60 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={fields.newPass}
                      onChange={(e) => handleChange("newPass", e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 hover:opacity-80 transition-opacity"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div>
                  <label className="block text-sm text-app opacity-60 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={fields.confirm}
                      onChange={(e) => handleChange("confirm", e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 hover:opacity-80 transition-opacity"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>

              <p className="text-center text-sm text-app opacity-40 mt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-emerald-400 hover:underline font-medium flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft size={14} /> Go back
                </button>
              </p>
            </>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-app">Password Updated!</p>
              <p className="text-sm text-app opacity-50 text-center">
                Your password has been changed successfully.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors text-center mt-2"
              >
                Done
              </button>
            </div>
          )}
        </AuthCard>
      </div>
    </div>
  );
}
