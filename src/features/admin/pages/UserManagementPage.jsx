import { useState, useEffect } from "react";
import { Search, MoreVertical, Shield, User, Trash2, Ban, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAdminUsers } from "@/features/admin/api/adminApi";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Map API flags → display status */
function resolveStatus(user) {
  if (user.isBanned) return "banned";
  return user.isActive ? "active" : "inactive";
}

/** Resolve role from roles array */
function resolveRole(user) {
  if (Array.isArray(user.roles)) {
    if (user.roles.includes("Admin")) return "admin";
    // Treat any non-Admin, non-Student role (Lecturer, Researcher, etc.) as lecturer
    const isStudent = user.roles.includes("Student");
    if (!isStudent && user.roles.length > 0) return "lecturer";
  }
  return "student";
}

/** Format ISO date → readable string */
function fmtDate(iso) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/** Get last initial from full name */
function initials(name = "") {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1]?.[0]?.toUpperCase() ?? "?";
}

// ─── constants ───────────────────────────────────────────────────────────────

const ROLE_STYLES = {
  admin: "text-purple-400 bg-purple-500/10",
  lecturer: "text-orange-400 bg-orange-500/10",
  student: "text-blue-400 bg-blue-500/10",
};

const STATUS_STYLES = {
  active: "text-emerald-400 bg-emerald-500/10",
  inactive: "text-yellow-400 bg-yellow-500/10",
  banned: "text-red-400 bg-red-500/10",
};

const AVATAR_COLORS = [
  "bg-sky-500", "bg-indigo-500", "bg-pink-500", "bg-amber-500",
  "bg-teal-500", "bg-rose-500", "bg-cyan-500", "bg-lime-600",
];

// ─── component ───────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [activityUser, setActivityUser] = useState(null);

  // ── fetch users from API ───────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetchAdminUsers()
      .then(({ items }) => {
        const mapped = items.map((u) => ({
          id: u.id,
          name: u.fullName ?? "—",
          email: u.email ?? "—",
          role: resolveRole(u),
          status: resolveStatus(u),
          lastActive: fmtDate(u.lastLoginUtc),
          questions: u.questions ?? 0,
        }));
        setUsers(mapped);
      })
      .catch((err) => {
        console.error("[UserMgmt]", err);
        setError("Failed to load users.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── local actions (optimistic) ─────────────────────────────────────────────
  function handleBan(id) {
    setUsers((prev) =>
      prev.map((u) => u.id === id ? { ...u, status: u.status === "banned" ? "active" : "banned" } : u)
    );
    setOpenMenu(null);
  }

  function handleDelete(id) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setOpenMenu(null);
  }

  // ── derived ────────────────────────────────────────────────────────────────
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">User Management</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">
            {loading ? "Loading…" : `${users.length} users total`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Active Users", value: users.filter((u) => u.status === "active").length, color: "text-emerald-400" },
          { label: "Students", value: users.filter((u) => u.role === "student").length, color: "text-blue-400" },
          { label: "Admins", value: users.filter((u) => u.role === "admin").length, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-panel border border-app-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>
              {loading ? <span className="opacity-30">—</span> : value}
            </p>
            <p className="text-xs text-app opacity-50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 mb-4">
        <Search size={15} className="text-app opacity-40 shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none" />
      </div>

      {/* Table */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              {["User", "Role", "Status", "Last Active", "Questions", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">

            {/* loading */}
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-app opacity-40">
                    <Loader2 size={15} className="animate-spin" />
                    Loading users…
                  </div>
                </td>
              </tr>
            )}

            {/* error */}
            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-red-400 opacity-70">
                  {error}
                </td>
              </tr>
            )}

            {/* empty */}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-app opacity-30">
                  No users found.
                </td>
              </tr>
            )}

            {/* rows */}
            {!loading && !error && filtered.map((u, idx) => (
              <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                      AVATAR_COLORS[idx % AVATAR_COLORS.length]
                    )}>
                      {initials(u.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-app">{u.name}</p>
                      <p className="text-xs text-app opacity-40">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize flex items-center gap-1 w-fit", ROLE_STYLES[u.role])}>
                    {u.role === "admin" ? <Shield size={11} /> : <User size={11} />}
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_STYLES[u.status])}>
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-app opacity-50">{u.lastActive}</td>
                <td className="px-5 py-3 text-sm text-app opacity-60">{u.questions}</td>
                <td className="px-5 py-3 relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-app opacity-40 hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                  >
                    <MoreVertical size={15} />
                  </button>
                  {openMenu === u.id && (
                    <div className="absolute right-4 top-8 w-40 bg-panel border border-app-border rounded-xl shadow-xl z-50 py-1">
                      <button
                        onClick={() => { setActivityUser(u); setOpenMenu(null); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <Activity size={12} /> Activity Logs
                      </button>
                      <button
                        onClick={() => handleBan(u.id)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-500/5 transition-colors"
                      >
                        <Ban size={12} /> {u.status === "banned" ? "Unban User" : "Ban User"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-app opacity-30 mt-3 text-right">
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {/* Activity modal */}
      {activityUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-app">Activity Logs — {activityUser.name}</p>
              <button onClick={() => setActivityUser(null)} className="text-app opacity-40 hover:opacity-80 transition-opacity">✕</button>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              <p className="text-xs text-app opacity-30 text-center py-6">
                Activity log data is not available from the current API.
              </p>
            </div>
            <button onClick={() => setActivityUser(null)} className="w-full mt-4 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
