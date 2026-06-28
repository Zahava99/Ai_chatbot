import { useState, useEffect } from "react";
import { Search, MoreVertical, Shield, Trash2, Ban, Activity, Mail, GraduationCap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAdminUsers } from "@/features/admin/api/adminApi";
import { getSubjects } from "@/api/subjectApi";
import AddLecturerModal from "@/features/admin/components/AddLecturerModal";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Map API isActive + (future) banned flag → display status */
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
  banned: "text-red-400    bg-red-500/10",
};

const STATUS_DOT = {
  active: "bg-emerald-400",
  inactive: "bg-yellow-400",
  banned: "bg-red-400",
};

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-orange-500",
  "bg-teal-500", "bg-rose-500", "bg-indigo-500",
];

// ─── component ───────────────────────────────────────────────────────────────

export default function LecturerManagementPage() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [activityUser, setActivityUser] = useState(null);

  // ── add lecturer modal ─────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);

  function handleLecturerCreated(newUser) {
    setLecturers((prev) => [
      ...prev,
      {
        id: newUser.id ?? Date.now(),
        name: newUser.fullName ?? "—",
        email: newUser.email ?? "—",
        status: resolveStatus(newUser),
        lastActive: fmtDate(newUser.lastLoginUtc),
        phone: newUser.phone ?? null,
        department: null,
        subjects: null,
        documents: null,
      },
    ]);
  }

  // ── subjects state ──────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAdminUsers(), getSubjects()])
      .then(([usersRes, subjectsData]) => {
        const subjectsList = Array.isArray(subjectsData) ? subjectsData : [];
        setSubjects(subjectsList);

        const items = usersRes.items;
        const mapped = items
          .filter((u) => Array.isArray(u.roles) && u.roles.includes("Researcher"))
          .map((u) => {
            // Find subjects where this lecturer is an instructor
            const userSubjects = subjectsList.filter((s) =>
              Array.isArray(s.instructors) &&
              s.instructors.some((inst) => inst.id === u.id || inst.userId === u.id)
            );
            const subjectCodes = userSubjects.map((s) => s.code).filter(Boolean);
            const totalDocs = userSubjects.reduce((sum, s) => sum + (s.documentCount ?? 0), 0);

            return {
              id: u.id,
              name: u.fullName ?? "—",
              email: u.email ?? "—",
              status: resolveStatus(u),
              lastActive: fmtDate(u.lastLoginUtc),
              phone: u.phone ?? null,
              department: null,
              subjects: subjectCodes.length > 0 ? subjectCodes.join(", ") : null,
              documents: totalDocs > 0 ? totalDocs : null,
            };
          });
        setLecturers(mapped);
      })
      .catch((err) => {
        console.error("[LecturerMgmt]", err);
        setError("Failed to load lecturers.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── local actions (optimistic) ─────────────────────────────────────────────
  function handleBan(id) {
    setLecturers((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: l.status === "banned" ? "active" : "banned" } : l
      )
    );
    setOpenMenu(null);
  }

  function handleDelete(id) {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    setOpenMenu(null);
  }

  // ── derived ────────────────────────────────────────────────────────────────
  const filtered = lecturers
    .filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || l.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      // Lecturers with subjects come first, then sort by document count descending
      const aHasSubject = a.subjects ? 1 : 0;
      const bHasSubject = b.subjects ? 1 : 0;
      if (bHasSubject !== aHasSubject) return bHasSubject - aHasSubject;
      return (b.documents ?? 0) - (a.documents ?? 0);
    });

  const stats = [
    { label: "Total Lecturers", value: lecturers.length, color: "text-app" },
    { label: "Active", value: lecturers.filter((l) => l.status === "active").length, color: "text-emerald-400" },
    { label: "Inactive", value: lecturers.filter((l) => l.status === "inactive").length, color: "text-yellow-400" },
    { label: "Banned", value: lecturers.filter((l) => l.status === "banned").length, color: "text-red-400" },
  ];

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Lecturer Management</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">
            {loading ? "Loading…" : `${lecturers.length} lecturers registered`}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-sm shadow-emerald-900/20"
        >
          <GraduationCap size={15} />
          Add Lecturer
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
            placeholder="Search by name or email…"
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
              {/* {["Lecturer", "Contact", "Department", "Status", "Courses", "Documents", ""].map((h) => ( */}
              {["Lecturer", "Contact", "Status", "Subjects","Documents", ""].map((h) => (
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
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-app opacity-40">
                    <Loader2 size={15} className="animate-spin" />
                    Loading lecturers…
                  </div>
                </td>
              </tr>
            )}

            {/* error */}
            {!loading && error && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-red-400 opacity-70">
                  {error}
                </td>
              </tr>
            )}

            {/* empty */}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-app opacity-30">
                  No lecturers found.
                </td>
              </tr>
            )}

            {/* rows */}
            {!loading && !error && filtered.map((l, idx) => (
              <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">

                {/* Name + avatar */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                      AVATAR_COLORS[idx % AVATAR_COLORS.length]
                    )}>
                      {initials(l.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-app">{l.name}</p>
                      <p className="text-xs text-app opacity-40">
                        Last active: {l.lastActive ?? "Never"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-xs text-app opacity-60">
                      <Mail size={11} className="shrink-0" />
                      {l.email}
                    </span>
                    {/* <span className="flex items-center gap-1.5 text-xs text-app opacity-40">
                      <Phone size={11} className="shrink-0" />
                      {l.phone ?? <span className="opacity-50">—</span>}
                    </span> */}
                  </div>
                </td>

                {/* Department */}
                {/* <td className="px-5 py-3">
                  {l.department ? (
                    <span className="flex items-center gap-1.5 text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full w-fit font-medium">
                      <BookOpen size={11} />
                      {l.department}
                    </span>
                  ) : (
                    <span className="text-xs text-app opacity-25">—</span>
                  )}
                </td> */}

                {/* Status */}
                <td className="px-5 py-3">
                  <span className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit capitalize",
                    STATUS_STYLES[l.status]
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_DOT[l.status])} />
                    {l.status}
                  </span>
                </td>

                {/* Subjects */}
                <td className="px-5 py-3">
                  {l.subjects ? (
                    <span className="text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-medium">
                      {l.subjects}
                    </span>
                  ) : (
                    <span className="text-xs text-app opacity-25">—</span>
                  )}
                </td>

                {/* Documents */}
                <td className="px-5 py-3">
                  {l.documents ? (
                    <span className="text-xs text-app opacity-60">{l.documents}</span>
                  ) : (
                    <span className="text-xs text-app opacity-25">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-3">
                  <button
                    onClick={(e) => {
                      if (openMenu === l.id) {
                        setOpenMenu(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({ top: rect.bottom + 4, left: rect.right - 176 });
                        setOpenMenu(l.id);
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
        const l = filtered.find((x) => x.id === openMenu);
        if (!l) return null;
        return (
          <>
            {/* backdrop to close on outside click */}
            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
            <div
              className="fixed z-50 w-44 bg-panel border border-app-border rounded-xl shadow-xl py-1"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              <button
                onClick={() => { setActivityUser(l); setOpenMenu(null); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Activity size={12} /> Activity Logs
              </button>
              <button
                onClick={() => { setActivityUser(l); setOpenMenu(null); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-blue-400 hover:bg-blue-500/5 transition-colors"
              >
                <Shield size={12} /> Edit Permissions
              </button>
              <button
                onClick={() => handleBan(l.id)}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-500/5 transition-colors"
              >
                <Ban size={12} />
                {l.status === "banned" ? "Unban Lecturer" : "Ban Lecturer"}
              </button>
              <button
                onClick={() => handleDelete(l.id)}
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
          Showing {filtered.length} of {lecturers.length} lecturers
        </p>
      )}

      {/* Activity Modal */}
      {activityUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-app">Activity Logs</p>
                <p className="text-xs text-app opacity-40 mt-0.5">{activityUser.name}</p>
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

      {/* Add Lecturer Modal */}
      <AddLecturerModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleLecturerCreated}
      />

    </div>
  );
}
