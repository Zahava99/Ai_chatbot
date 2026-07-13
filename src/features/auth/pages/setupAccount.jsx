import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthBrand, AuthCard } from "@/features/auth/components/authCommonUI";
import { confirmEmail } from "@/features/auth/api/authApi";

export default function SetupAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const code = searchParams.get("code") ?? "";

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);

  // Call confirm email API on mount
  useEffect(() => {
    async function confirm() {
      if (!email || !code) {
        setError("Link xác nhận không hợp lệ. Vui lòng sử dụng link từ email của bạn.");
        setStatus("error");
        return;
      }

      try {
        await confirmEmail(email, code);
        setStatus("success");
      } catch (err) {
        setError(err.message || "Xác nhận tài khoản thất bại. Vui lòng thử lại.");
        setStatus("error");
      }
    }

    confirm();
  }, [email, code]);

  // Auto-close tab after 5 seconds on success
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      window.close();
      navigate("/login");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AuthBrand />
        <AuthCard>
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
                <CheckCircle2 size={28} className="text-emerald-400 opacity-50" />
              </div>
              <p className="text-sm text-app opacity-50">Đang xác nhận tài khoản…</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-app">Xác nhận thành công!</p>
              <p className="text-sm text-app opacity-50 text-center">
                Tài khoản đã được xác nhận thành công. Bạn có thể đăng nhập ngay bây giờ.
              </p>
              <p className="text-xs text-app opacity-40">
                Tự động đóng tab sau {countdown} giây…
              </p>
              <button
                onClick={() => { window.close(); navigate("/login"); }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors text-center mt-2"
              >
                Đăng nhập
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle size={28} className="text-red-400" />
              </div>
              <p className="text-base font-semibold text-app">Xác nhận thất bại</p>
              <p className="text-sm text-red-400 text-center">
                {error}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors text-center mt-2"
              >
                Về trang đăng nhập
              </button>
            </div>
          )}
        </AuthCard>
      </div>
    </div>
  );
}
