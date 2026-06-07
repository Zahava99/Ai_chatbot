import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/common/header";
import { AuthBrand, AuthCard, RoleSelector } from "@/features/auth/components/authCommonUI";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to auth API
    console.log({ role, email, password });
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AuthBrand />

        <AuthCard>
          {/* Tab switcher */}
          {/* <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1 mb-6">
            <span className="flex-1 py-2 rounded-lg text-sm font-medium text-center bg-black/10 dark:bg-white/10 text-app shadow-sm">
              Sign in
            </span>
            <Link
              to="/register"
              className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-app opacity-50 hover:opacity-100 transition-colors"
            >
              Sign up
            </Link>
          </div> */}

          {/* Role selector */}
          {/* <RoleSelector role={role} setRole={setRole} /> */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm transition-colors mt-2"
            >
              Sign in
            </button>
          </form>

          {/* Footer link */}
          {/* <p className="text-center text-sm text-app opacity-40 mt-4">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-emerald-400 hover:underline font-medium">
              Click here to Sign Up
            </Link>
          </p> */}
        </AuthCard>
      </div>
    </div>
  );
}
