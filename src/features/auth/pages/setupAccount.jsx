import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Header from "@/components/common/header";
import { AuthBrand, AuthCard } from "@/features/auth/components/authCommonUI";
import { confirmAndSetupPassword } from "@/features/auth/api/authApi";

export default function SetupAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const code = searchParams.get("code") ?? "";

  const [step, setStep] = useState("form"); // "form" | "done"
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fields, setFields] = useState({ newPass: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Auto-close tab after 5 seconds on success
  useEffect(() => {
    if (step !== "done") return;
    if (countdown <= 0) {
      window.close();
      // Fallback: if window.close() is blocked by the browser, redirect to login
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown, navigate]);

  function handleChange(key, val) {
    setFields((f) => ({ ...f, [key]: val }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !code) {
      setError("Invalid activation link. Please use the link from your email.");
      return;
    }
    if (fields.newPass.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (fields.newPass !== fields.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await confirmAndSetupPassword(email, code, fields.newPass);
      setStep("done");
    } catch (err) {
      setError(err.message || "Failed to activate account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* <Header /> */}
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
                  <p className="text-sm font-semibold text-app">Kích hoạt tài khoản</p>
                  <p className="text-xs text-app opacity-50">Đặt mật khẩu mới cho tài khoản của bạn</p>
                </div>
              </div>

              {/* Show the email being activated */}
              <div className="mb-4 px-3 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
                <p className="text-xs text-app opacity-50">Email</p>
                <p className="text-sm text-app font-medium mt-0.5">{email || "—"}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-sm text-app opacity-60 mb-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={fields.newPass}
                      onChange={(e) => handleChange("newPass", e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
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

                {/* Confirm password */}
                <div>
                  <label className="block text-sm text-app opacity-60 mb-1.5">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={fields.confirm}
                      onChange={(e) => handleChange("confirm", e.target.value)}
                      placeholder="Nhập lại mật khẩu"
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
                  {loading ? "Đang xử lý…" : "Kích hoạt tài khoản"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-app">Kích hoạt thành công!</p>
              <p className="text-sm text-app opacity-50 text-center">
                Tài khoản đã được kích hoạt. Bạn có thể đăng nhập ngay với mật khẩu vừa đặt.
              </p>
              <p className="text-xs text-app opacity-40">
                Tự động đóng tab sau {countdown} giây…
              </p>
              <button
                onClick={() => { window.close(); navigate("/login"); }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors text-center mt-2"
              >
                Đóng
              </button>
            </div>
          )}
        </AuthCard>
      </div>
    </div>
  );
}
