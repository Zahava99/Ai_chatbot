import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/common/header";
import { AuthBrand, AuthCard, RoleSelector } from "@/features/auth/components/authCommonUI";

export default function RegisterPage() {
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const confirmTouched = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    // console.log({ role, fullName, email, password, confirmPassword });
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AuthBrand />

        <AuthCard>
          {/* Tab switcher */}
          {/* <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 mb-6">
            <Link
              to="/login"
              className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-app opacity-50 hover:opacity-100 transition-colors"
            >
              Sign in
            </Link>
            <span className="flex-1 py-2 rounded-lg text-sm font-medium text-center bg-black/10 dark:bg-white/10 text-app shadow-sm">
              Sign up
            </span>
          </div> */}

          {/* Role selector */}
          {/* <RoleSelector role={role} setRole={setRole} /> */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">
                Fullname
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">
                School Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 hover:opacity-80 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm text-app opacity-60 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className={cn(
                    "w-full px-4 py-2.5 pr-20 rounded-xl border bg-black/5 dark:bg-white/5 text-sm text-app placeholder:opacity-30 outline-none transition",
                    confirmTouched && !passwordsMatch
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : confirmTouched && passwordsMatch
                      ? "border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      : "border-app-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  )}
                />
                {confirmTouched && (
                  <span className="absolute right-9 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check size={15} className="text-emerald-400" />
                    ) : (
                      <X size={15} className="text-red-400" />
                    )}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app opacity-40 hover:opacity-80 transition-colors"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmTouched && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={confirmTouched && !passwordsMatch}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mt-2"
            >
              Sign up
            </button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
