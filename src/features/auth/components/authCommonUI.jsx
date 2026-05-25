import { cn } from "@/lib/utils";

const ROLES = [
  { id: "student", label: "Student", icon: "🎓" },
  { id: "lecturer", label: "Lecturer", icon: "👨‍🏫" },
];

// --- Brand header shown above the card on both login and register ---
export function AuthBrand() {
  return (
    <div className="flex items-center gap-3 mb-6 self-start max-w-md w-full mx-auto">
      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl">
        📖
      </div>
      <div className="text-left">
        <p className="text-lg font-semibold text-app leading-tight">EduChat</p>
        <p className="text-sm text-app opacity-50">
          Questions and answers regarding course materials.
        </p>
      </div>
    </div>
  );
}

// --- Card shell that wraps each auth form ---
export function AuthCard({ children }) {
  return (
    <div className="bg-panel border border-app-border rounded-2xl shadow-xl w-full max-w-md p-6">
      {children}
    </div>
  );
}

// --- Role selector shared by login and register ---
export function RoleSelector({ role, setRole }) {
  return (
    <>
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
                : "border-app-border bg-black/5 dark:bg-white/5 text-app opacity-60 hover:opacity-100 hover:border-app-border"
            )}
          >
            <span className="text-2xl">{r.icon}</span>
            <span>{r.label}</span>
          </button>
        ))}
      </div>
      <hr className="border-app-border mb-5" />
    </>
  );
}
