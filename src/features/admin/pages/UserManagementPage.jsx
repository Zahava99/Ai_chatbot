import { useState } from "react";
import { Search, MoreVertical, Shield, User, Trash2, Ban, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const USERS = [
  { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@edu.vn", role: "admin", status: "active", lastActive: "May 26, 2026", questions: 142 },
  { id: 2, name: "Trần Thị Bình", email: "binh.tran@edu.vn", role: "student", status: "active", lastActive: "May 26, 2026", questions: 89 },
  { id: 3, name: "Lê Văn Cường", email: "cuong.le@edu.vn", role: "student", status: "active", lastActive: "May 25, 2026", questions: 67 },
  { id: 4, name: "Phạm Thị Dung", email: "dung.pham@edu.vn", role: "student", status: "inactive", lastActive: "May 20, 2026", questions: 23 },
  { id: 5, name: "Hoàng Văn Em", email: "em.hoang@edu.vn", role: "student", status: "banned", lastActive: "May 10, 2026", questions: 5 },
  { id: 6, name: "Vũ Thị Phương", email: "phuong.vu@edu.vn", role: "student", status: "active", lastActive: "May 26, 2026", questions: 198 },
];

const ROLE_STYLES = {
  admin: "text-purple-400 bg-purple-500/10",
  student: "text-blue-400 bg-blue-500/10",
};

const STATUS_STYLES = {
  active: "text-emerald-400 bg-emerald-500/10",
  inactive: "text-yellow-400 bg-yellow-500/10",
  banned: "text-red-400 bg-red-500/10",
};

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(USERS);
  const [openMenu, setOpenMenu] = useState(null);
  const [activityUser, setActivityUser] = useState(null);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-app">User Management</h1>
          <p className="text-sm text-app opacity-50 mt-0.5">{users.length} users total</p>
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
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
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
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {u.name[0]}
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
                      <button className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-yellow-400 hover:bg-yellow-500/5 transition-colors">
                        <Ban size={12} /> Ban User
                      </button>
                      <button
                        onClick={() => { setUsers((prev) => prev.filter((x) => x.id !== u.id)); setOpenMenu(null); }}
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

      {/* Activity modal */}
      {activityUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-app-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-app">Activity Logs — {activityUser.name}</p>
              <button onClick={() => setActivityUser(null)} className="text-app opacity-40 hover:opacity-80">✕</button>
            </div>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {[
                { action: "Asked question", detail: "What is gradient descent?", time: "May 26, 10:32" },
                { action: "Uploaded document", detail: "Lecture_01.pdf", time: "May 26, 09:15" },
                { action: "Asked question", detail: "Explain backpropagation", time: "May 25, 14:20" },
                { action: "Created session", detail: "New chat session", time: "May 25, 14:18" },
                { action: "Logged in", detail: "—", time: "May 25, 14:17" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-app-border last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-app">{log.action}</p>
                    <p className="text-xs text-app opacity-40">{log.detail}</p>
                  </div>
                  <span className="text-xs text-app opacity-30 shrink-0">{log.time}</span>
                </div>
              ))}
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
