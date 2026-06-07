import { useState } from "react";
import { Search, MoreVertical, Trash2, Ban, Activity, Mail, Phone, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const STUDENTS = [
  { id: 1,  name: "Trần Thị Bình",    email: "binh.tran@edu.vn",    phone: "0901 111 001", studentId: "SV2021001", major: "CNTT",      year: 3, status: "active",   lastActive: "May 26, 2026", questions: 89,  documents: 12 },
  { id: 2,  name: "Lê Văn Cường",     email: "cuong.le@edu.vn",     phone: "0901 111 002", studentId: "SV2021002", major: "CNTT",      year: 3, status: "active",   lastActive: "May 25, 2026", questions: 67,  documents: 8  },
  { id: 3,  name: "Phạm Thị Dung",    email: "dung.pham@edu.vn",    phone: "0901 111 003", studentId: "SV2022001", major: "Toán Tin",  year: 2, status: "inactive", lastActive: "May 20, 2026", questions: 23,  documents: 3  },
  { id: 4,  name: "Hoàng Văn Em",     email: "em.hoang@edu.vn",     phone: "0901 111 004", studentId: "SV2023001", major: "CNTT",      year: 1, status: "banned",   lastActive: "May 10, 2026", questions: 5,   documents: 1  },
  { id: 5,  name: "Vũ Thị Phương",    email: "phuong.vu@edu.vn",    phone: "0901 111 005", studentId: "SV2021003", major: "KHMT",      year: 3, status: "active",   lastActive: "May 26, 2026", questions: 198, documents: 22 },
  { id: 6,  name: "Ngô Quang Huy",    email: "huy.ngo@edu.vn",      phone: "0901 111 006", studentId: "SV2022002", major: "CNTT",      year: 2, status: "active",   lastActive: "May 26, 2026", questions: 134, documents: 17 },
  { id: 7,  name: "Đinh Thị Khánh",   email: "khanh.dinh@edu.vn",   phone: "0901 111 007", studentId: "SV2023002", major: "Toán Tin",  year: 1, status: "active",   lastActive: "May 24, 2026", questions: 44,  documents: 5  },
  { id: 8,  name: "Bùi Minh Khoa",    email: "khoa.bui@edu.vn",     phone: "0901 111 008", studentId: "SV2020001", major: "KHMT",      year: 4, status: "inactive", lastActive: "May 15, 2026", questions: 11,  documents: 2  },
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

const AVATAR_COLORS = [
  "bg-sky-500", "bg-indigo-500", "bg-pink-500", "bg-amber-500",
  "bg-teal-500", "bg-rose-500", "bg-cyan-500", "bg-lime-600",
];

const YEAR_LABEL = { 1: "Year 1", 2: "Year 2", 3: "Year 3", 4: "Year 4" };

export default function StudentManagementPage() {
  const [search, setSearch]             = useState("");
  const [students, setStudents]         = useState(STUDENTS);
  const [openMenu, setOpenMenu]         = useState(null);
  const [activityUser, setActivityUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear]     = useState("all");

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.major.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchYear   = filterYear   === "all" || String(s.year) === filterYear;
    return matchSearch && matchStatus && matchYear;
  });

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

  const stats = [
    { label: "Total Students", value: students.length,                                      color: "text-app" },
    { label: "Active",         value: students.filter((s) => s.status === "active").length,  color: "text-emerald-400" },
    { label: "Majors",         value: [...new Set(students.map((s) => s.major))].length,     color: "text-sky-400" },
    { label: "Total Questions",value: students.reduce((acc, s) => acc + s.questions, 0),     color: "text-blue-400" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">Student Management</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{students.length} students enrolled</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-sm shadow-emerald-900/20">
          <GraduationCap size={15} />
          Add Student
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
      <div className="flex flex-col gap-3 mb-4 sm:flex-row">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5">
          <Search size={15} className="text-app opacity-40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID, or major…"
            className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Year filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-app-border bg-panel">
            {["all", "1", "2", "3", "4"].map((y) => (
              <button
                key={y}
                onClick={() => setFilterYear(y)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  filterYear === y
                    ? "bg-sky-500/15 text-sky-400"
                    : "text-app opacity-40 hover:opacity-70"
                )}
              >
                {y === "all" ? "All Years" : `Y${y}`}
              </button>
            ))}
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
      </div>

      {/* Table */}
      <div className="bg-panel border border-app-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-app-border">
              {["Student", "Student ID", "Contact", "Major", "Year", "Status", "Questions", "Docs", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-app opacity-40 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-sm text-app opacity-30">
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                  {/* Student */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                        AVATAR_COLORS[idx % AVATAR_COLORS.length]
                      )}>
                        {s.name.split(" ").slice(-1)[0][0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-app">{s.name}</p>
                        <p className="text-xs text-app opacity-40">Last active: {s.lastActive}</p>
                      </div>
                    </div>
                  </td>

                  {/* Student ID */}
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-app opacity-60 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                      {s.studentId}
                    </span>
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
                        {s.phone}
                      </span>
                    </div>
                  </td>

                  {/* Major */}
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full w-fit font-medium">
                      <BookOpen size={11} />
                      {s.major}
                    </span>
                  </td>

                  {/* Year */}
                  <td className="px-5 py-3">
                    <span className="text-xs text-app opacity-60">{YEAR_LABEL[s.year]}</span>
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
                  <td className="px-5 py-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-app opacity-40 hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                    >
                      <MoreVertical size={15} />
                    </button>

                    {openMenu === s.id && (
                      <div className="absolute right-4 top-8 w-44 bg-panel border border-app-border rounded-xl shadow-xl z-50 py-1">
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
                <p className="text-xs text-app opacity-40 mt-0.5">{activityUser.name} · {activityUser.studentId}</p>
              </div>
              <button onClick={() => setActivityUser(null)} className="text-app opacity-40 hover:opacity-80 transition-opacity">✕</button>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {[
                { action: "Asked question",   detail: "What is Big-O notation?",        time: "May 26, 11:20" },
                { action: "Uploaded document", detail: "lecture_notes_week4.pdf",        time: "May 26, 10:05" },
                { action: "Asked question",    detail: "Explain recursion with examples", time: "May 25, 15:40" },
                { action: "Joined session",    detail: "Lập trình hướng đối tượng",      time: "May 25, 14:30" },
                { action: "Logged in",         detail: "—",                              time: "May 25, 14:28" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-app-border last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
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
