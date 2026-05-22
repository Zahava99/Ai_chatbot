import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Header from "@/components/common/header";

const ROLES = [
  { id: "student", label: "Sinh viên", icon: "🎓" },
  { id: "lecturer", label: "Giảng viên", icon: "👨‍🏫" },
];

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to auth API
    console.log({ role, email, password });
  };

  return (
    <div className="min-h-screen bg-[#1c1c1f] flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-6 self-start max-w-md w-full mx-auto">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl">
            📖
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold text-white leading-tight">EduChat</p>
            <p className="text-sm text-white/50">Hỏi đáp tài liệu môn học</p>
          </div>
        </div>

      {/* Card */}
      <div className="bg-zinc-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Tab switcher */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          <span className="flex-1 py-2 rounded-lg text-sm font-medium text-center bg-white/10 text-white shadow-sm">
            Đăng nhập
          </span>
          <Link
            to="/register"
            className="flex-1 py-2 rounded-lg text-sm font-medium text-center text-white/50 hover:text-white transition-colors"
          >
            Đăng ký
          </Link>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 text-sm font-medium transition-colors",
                role === r.id
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
              )}
            >
              <span className="text-2xl">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        <hr className="border-white/10 mb-5" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Email trường
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nguyen.an@hcmut.edu.vn"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm transition-colors mt-2"
          >
            Đăng nhập
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-white/40 mt-4">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-emerald-400 hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
