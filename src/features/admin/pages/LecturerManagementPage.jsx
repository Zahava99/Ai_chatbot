import { useState } from "react";
import { Search, MoreVertical, Shield, BookOpen, Trash2, Ban, Activity, Mail, Phone, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const LECTURERS = [
  { id: 1, name: "PGS.TS. Nguyễn Minh Tuấn", email: "tuan.nguyen@edu.vn", phone: "0901 234 567", department: "Khoa CNTT", status: "active", lastActive: "May 26, 2026", courses: 4, documents: 38 },
  { id: 2, name: "TS. Trần Thị Lan Anh",     email: "lananh.tran@edu.vn", phone: "0912 345 678", department: "Khoa CNTT", status: "active", lastActive: "May 26, 2026", courses: 3, documents: 27 },
  { id: 3, name: "ThS. Lê Quốc Bảo",         email: "bao.le@edu.vn",     phone: "0923 456 789", department: "Khoa Toán",  status: "active", lastActive: "May 25, 2026", courses: 2, documents: 14 },
  { id: 4, name: "TS. Phạm Hoàng Long",       email: "long.pham@edu.vn",  phone: "0934 567 890", department: "Khoa CNTT", status: "inactive", lastActive: "May 18, 2026", courses: 1, documents: 9 },
  { id: 5, name: "ThS. Võ Thị Thu Hà",        email: "ha.vo@edu.vn",      phone: "0945 678 901", department: "Khoa Lý",   status: "active", lastActive: "May 26, 2026", courses: 3, documents: 21 },
  { id: 6, name: "GS.TS. Đỗ Văn Khải",        email: "khai.do@edu.vn",    phone: "0956 789 012", department: "Khoa Toán", status: "banned", lastActive: "May 5, 2026",  courses: 0, documents: 5 },
];

const STATUS_STYLES = {
  active:   "text-emerald-400 bg-emerald-500/10",
  inactive: "text-yellow-400 bg-yellow-500/10",
  banned:   "text-red-400 bg-red-500/10",
};

const STATUS_DOT = {
  active:   "bg-emerald-400",
  inactive: "bg-yellow-400",
  banned:   "bg-red-400",
};

const DEPT_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-indigo-500",
];

export default function LecturerManagementPage() {
  const [search, setSearch]         = useState("");
  const [lecturers, setLecturers]   = useState(LECTURERS);
  const [openMenu, setOpenMenu]     = useState(null);
  const [activityUser, setActivityUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = lecturers.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleBan(id) {
    setLecturers((prev) =>
      prev.map((l) => l.id === id ? { ...l, status: l.status === "banned" ? "active" : "banned" } : l)
    );
    setOpenMenu(null);
  }

  function handleDelete(id) {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    setOpenMenu(null);
  }

  const stats = [
    { label: "Total Lecturers", value: lecturers.length,                                      color: "text-app" },
    { label: "Active",          value: lecturers.filter((l) => l.status === "active").length,  color: "text-emerald-400" },
    { label: "Departments",     value: [...new Set(lecturers.map((l) => l.department))].length, color: "text-violet-400" },
    { label: "Total Courses",   value: lecturers.reduce((s, l) => s + l.courses, 0),           color: "text-blue-400" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Lecturer Management</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{lecturers.length} lecturers registered</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-sm shadow-emerald-900/20">
          <GraduationCap size={15} />
          Add Lecturer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-panel border border-app-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-app opacity-50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
          <Search size={15} className="text-app opacity-40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or department…"
            className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none"
          />
        </div>
        {/* Status filter */}
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
              {["Lecturer", "Department", "Contact", "Status", "Courses", "Documents", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-app opacity-30">
                  No lecturers found.
                </td>
              </tr>
            ) : (
              filtered.map((l, idx) => (
                <tr key={l.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  {/* Lecturer info */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                        DEPT_COLORS[idx % DEPT_COLORS.length]
                      )}>
                        {l.name.split(" ").slice(-1)[0][0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-app">{l.name}</p>
                        <p className="text-xs text-app opacity-40">Last active: {l.lastActive}</p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full w-fit font-medium">
                      <BookOpen size={11} />
                      {l.department}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-xs text-app opacity-60">
                        <Mail size={11} className="shrink-0" />
                        {l.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-app opacity-40">
                        <Phone size={11} className="shrink-0" />
                        {l.phone}
                      </span>
                    </div>
                  </td>

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

                  {/* Courses */}
                  <td className="px-5 py-3 text-sm text-app opacity-60">{l.courses}</td>

                  {/* Documents */}
                  <td className="px-5 py-3 text-sm text-app opacity-60">{l.documents}</td>

                  {/* Actions */}
                  <td className="px-5 py-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === l.id ? null : l.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-app opacity-40 hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                    >
                      <MoreVertical size={15} />
                    </button>

                    {openMenu === l.id && (
                      <div className="absolute right-4 top-8 w-44 bg-panel border border-app-border rounded-xl shadow-xl z-50 py-1">
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
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
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
              {[
                { action: "Uploaded document",  detail: "Giáo trình CNTT_Chap3.pdf", time: "May 26, 10:45" },
                { action: "Updated course",      detail: "Lập trình Web — Semester 2",  time: "May 26, 09:30" },
                { action: "Replied to question", detail: "What is REST API?",           time: "May 25, 16:10" },
                { action: "Added quiz",          detail: "Chapter 4 — OOP Quiz",        time: "May 25, 14:05" },
                { action: "Logged in",           detail: "—",                           time: "May 25, 14:00" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-app-border last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-app">{log.action}</p>
                    <p className="text-xs text-app opacity-40">{log.detail}</p>
                  </div>
                  <span className="text-xs text-app opacity-30 shrink-0">{log.time}</span>
                </div>
              ))}
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
    </div>
  );
}
