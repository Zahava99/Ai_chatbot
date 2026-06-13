import { useState, useEffect } from "react";
import { Search, MoreVertical, Trash2, Ban, Activity, Mail, Phone, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAdminUsers } from "@/features/admin/api/adminApi";
import AddStudentModal from "@/features/admin/components/AddStudentModal";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Map API isActive + banned flag → display status */
function resolveStatus(user) {
  if (user.isBanned) return "banned";
  return user.isActive ? "active" : "inactive";
}

/** Format ISO UTC date → readable string, e.g. "Jun 10, 2026" */
function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/** Get initials from full name */
function initials(name = "") {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1]?.[0]?.toUpperCase() ?? "?";
}

// ─── constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  active: "text-emerald-400 bg-emerald-500/10",
  inactive: "text-yellow-400 bg-yellow-500/10",
  banned: "text-red-400 bg-red-500/10",
};

const STATUS_DOT = {
  active: "bg-emerald-400",
  inactive: "bg-yellow-400",
  banned: "bg-red-400",
};

const AVATAR_COLORS = [
  "bg-sky-500", "bg-indigo-500", "bg-pink-500", "bg-amber-500",
  "bg-teal-500", "bg-rose-500", "bg-cyan-500", "bg-lime-600",
];

// ─── component ───────────────────────────────────────────────────────────────

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [activityUser, setActivityUser] = useState(null);

  // ── add student modal ──────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);

  function handleStudentCreated(newUser) {
    setStudents((prev) => [
      ...prev,
      {
        id: newUser.id ?? Date.now(),
        name: newUser.fullName ?? "—",
        email: newUser.email ?? "—",
        status: resolveStatus(newUser),
        lastActive: fmtDate(newUser.lastLoginUtc),
        phone: newUser.phone ?? null,
        studentId: newUser.studentId ?? null,
        major: newUser.major ?? null,
        year: newUser.year ?? null,
        questions: newUser.questions ?? 0,
        documents: newUser.documents ?? 0,
      },
    ]);
  }

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetchAdminUsers()
      .then(({ items }) => {
        const mapped = items
          .filter((u) => Array.isArray(u.roles) && u.roles.includes("Student"))
          .map((u) => ({
            id: u.id,
            name: u.fullName ?? "—",
            email: u.email ?? "—",
            status: resolveStatus(u),
            lastActive: fmtDate(u.lastLoginUtc),
            phone: u.phone ?? null,
            studentId: u.studentId ?? null,
            major: u.major ?? null,
            year: u.year ?? null,
            questions: u.questions ?? 0,
            documents: u.documents ?? 0,
          }));
        setStudents(mapped);
      })
      .catch((err) => {
        console.error("[StudentMgmt]", err);
        setError("Failed to load students.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── local actions (optimistic) ─────────────────────────────────────────────
  function handleBan(id) {
    setStudents((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: s.status === "banned" ? "active" : "banned" } : s)
    );
    setOpenMenu(null);
  }

  function handleDelete(id) {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setOpenMenu(null);
  }

  // ── derived ────────────────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.studentId ?? "").toLowerCase().includes(q) ||
      (s.major ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: "Total Students", value: students.length, color: "text-app" },
    { label: "Active", value: students.filter((s) => s.status === "active").length, color: "text-emerald-400" },
    { label: "Inactive", value: students.filter((s) => s.status === "inactive").length, color: "text-yellow-400" },
    { label: "Banned", value: students.filter((s) => s.status === "banned").length, color: "text-red-400" },
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Student Management</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">
            {loading ? "Loading…" : `${students.length} students enrolled`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-sm shadow-emerald-900/20"
        >
          <GraduationCap size={15} />
          Add Student
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-panel border border-app-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>
              {loading ? <span className="opacity-30">—</span> : value}
            </p>
            <p className="text-xs text-app opacity-50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
          <Search size={15} className="text-app opacity-40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID, or major…"
            className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl border border-app-border bg-panel">
          {["all", "active", "inactive", "banned"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                filterStatus === s
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-app opacity-40 hover:opacity-70"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              {["Student", "Student ID", "Contact", "Major", "Status", "Questions", "Docs", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">

            {/* loading skeleton */}
            {loading && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-app opacity-40">
                    <Loader2 size={15} className="animate-spin" />
                    Loading students…
                  </div>
                </td>
              </tr>
            )}

            {/* error */}
            {!loading && error && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-red-400 opacity-70">
                  {error}
                </td>
              </tr>
            )}

            {/* empty */}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm text-app opacity-30">
                  No students found.
                </td>
              </tr>
            )}

            {/* rows */}
            {!loading && !error && filtered.map((s, idx) => (
              <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                {/* Student */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                      AVATAR_COLORS[idx % AVATAR_COLORS.length]
                    )}>
                      {initials(s.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-app">{s.name}</p>
                      <p className="text-xs text-app opacity-40">
                        Last active: {s.lastActive ?? "Never"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Student ID */}
                <td className="px-5 py-3">
                  {s.studentId ? (
                    <span className="text-xs font-mono text-app opacity-60 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      {s.studentId}
                    </span>
                  ) : (
                    <span className="text-xs text-app opacity-25">—</span>
                  )}
                </td>

                {/* Contact */}
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs text-app opacity-60">
                      <Mail size={11} className="shrink-0" />
                      {s.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-app opacity-40">
                      <Phone size={11} className="shrink-0" />
                      {s.phone ?? <span className="opacity-50">—</span>}
                    </span>
                  </div>
                </td>

                {/* Major */}
                <td className="px-5 py-3">
                  {s.major ? (
                    <span className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full w-fit font-medium">
                      <BookOpen size={11} />
                      {s.major}
                    </span>
                  ) : (
                    <span className="text-xs text-app opacity-25">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-3">
                  <span className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit capitalize",
                    STATUS_STYLES[s.status]
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_DOT[s.status])} />
                    {s.status}
                  </span>
                </td>

                {/* Questions */}
                <td className="px-5 py-3 text-sm text-app opacity-60">{s.questions}</td>

                {/* Documents */}
                <td className="px-5 py-3 text-sm text-app opacity-60">{s.documents}</td>

                {/* Actions */}
                <td className="px-5 py-3">
                  <button
                    onClick={(e) => {
                      if (openMenu === s.id) {
                        setOpenMenu(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({ top: rect.bottom + 4, left: rect.right - 176 });
                        setOpenMenu(s.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-app opacity-40 hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                  >
                    <MoreVertical size={15} />
                  </button>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* Action dropdown — rendered at fixed position to escape overflow:hidden */}
      {openMenu !== null && (() => {
        const s = filtered.find((x) => x.id === openMenu);
        if (!s) return null;
        return (
          <>
            {/* backdrop to close on outside click */}
            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
            <div
              className="fixed z-50 w-44 bg-panel border border-app-border rounded-xl shadow-xl py-1"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              <button
                onClick={() => { setActivityUser(s); setOpenMenu(null); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Activity size={12} /> Activity Logs
              </button>
              <button
                onClick={() => handleBan(s.id)}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-500/5 transition-colors"
              >
                <Ban size={12} />
                {s.status === "banned" ? "Unban Student" : "Ban Student"}
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/5 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </>
        );
      })()}

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-app opacity-30 mt-3 text-right">
          Showing {filtered.length} of {students.length} students
        </p>
      )}

      {/* Activity Modal */}
      {activityUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-app">Activity Logs</p>
                <p className="text-xs text-app opacity-40 mt-0.5">{activityUser.name} · {activityUser.studentId ?? "—"}</p>
              </div>
              <button onClick={() => setActivityUser(null)} className="text-app opacity-40 hover:opacity-80 transition-opacity">✕</button>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              <p className="text-xs text-app opacity-30 text-center py-6">
                Activity log data is not available from the current API.
              </p>
            </div>
            <button
              onClick={() => setActivityUser(null)}
              className="w-full mt-4 py-2.5 rounded-xl border border-app-border text-sm text-app opacity-70 hover:opacity-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleStudentCreated}
        />
      )}
    </div>
  );
}
