import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate auth token check
    const timer = setTimeout(() => {
      const token = localStorage.getItem("auth_token");
      navigate(token ? "/dashboard" : "/login", { replace: true });
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0f1117]">
      {/* Logo */}
      <div className="flex flex-col items-center gap-5 mb-10">
        <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-900/60">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C7.03 3 3 7.03 3 12v4a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H5.07A7 7 0 0 1 19 12h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-4c0-4.97-4.03-9-9-9Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white tracking-tight">EduChat</p>
          <p className="text-sm text-white/40 mt-1">AI-powered learning assistant</p>
        </div>
      </div>

      {/* Loading animation */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
        <p className="text-xs text-white/30 tracking-widest uppercase">Loading</p>
      </div>

      {/* Dots animation */}
      <div className="absolute bottom-12 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
