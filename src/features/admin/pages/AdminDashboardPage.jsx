import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, GraduationCap, BookOpen, ShieldCheck,
  TrendingUp, TrendingDown, Activity, Settings,
  ArrowRight, UserPlus, AlertCircle, CheckCircle2,
  Clock, Cpu, BarChart2, Database, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAdminUsers } from "@/features/admin/api/adminApi";
import { getDocuments } from "@/api/documentApi";

/* ─── mock data ─────────────────────────────────────────────── */
const STATS = [
  {
    icon: Users,
    label: "Tổng người dùng",
    value: "312",
    sub: "across all roles",
    delta: "+14",
    deltaLabel: "this week",
    up: true,
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
  },
  {
    icon: GraduationCap,
    label: "Giảng viên",
    value: "28",
    sub: "6 departments",
    delta: "+2",
    deltaLabel: "this month",
    up: true,
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
  },
  {
    icon: BookOpen,
    label: "Sinh viên",
    value: "284",
    sub: "active accounts",
    delta: "+12",
    deltaLabel: "this week",
    up: true,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
  {
    icon: Cpu,
    label: "System Status",
    value: "Online",
    sub: "All services running",
    delta: "Healthy",
    deltaLabel: "",
    up: null,
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    ring: "ring-orange-500/20",
  },
];

const QUICK_ACTIONS = [
  // {
  //   icon: UserPlus,
  //   label: "Add User",
  //   to: "/admin/users",
  //   accent: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",
  // },
  {
    icon: GraduationCap,
    label: "Manage Lecturers",
    to: "/lectures",
    accent: "text-violet-400 bg-violet-500/10 hover:bg-violet-500/20",
  },
  {
    icon: BookOpen,
    label: "Manage Students",
    to: "/students",
    accent: "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    icon: Settings,
    label: "System Settings",
    to: "/settings",
    accent: "text-orange-400 bg-orange-500/10 hover:bg-orange-500/20",
  },
];

const ROLE_DISTRIBUTION = [
  { role: "Students",  count: 284, total: 312, color: "bg-emerald-400" },
  { role: "Lecturers", count: 28,  total: 312, color: "bg-violet-400"  },
  { role: "Admins",    count: 5,   total: 312, color: "bg-blue-400"    },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    user: "Trần Thị Bình",
    action: "Registered new account",
    role: "student",
    time: "2 min ago",
    type: "register",
  },
  {
    id: 2,
    user: "TS. Lê Quốc Bảo",
    action: "Uploaded lecture material",
    role: "lecturer",
    time: "18 min ago",
    type: "upload",
  },
  {
    id: 3,
    user: "Nguyễn Văn An",
    action: "Updated system settings",
    role: "admin",
    time: "1 hr ago",
    type: "settings",
  },
  {
    id: 4,
    user: "Võ Thị Thu Hà",
    action: "Added new course subject",
    role: "lecturer",
    time: "3 hrs ago",
    type: "upload",
  },
  {
    id: 5,
    user: "Phạm Hoàng Long",
    action: "Account deactivated",
    role: "lecturer",
    time: "Yesterday",
    type: "ban",
  },
];

const SYSTEM_HEALTH = [
  { label: "API Server",     status: "online",  latency: "42 ms"  },
  { label: "Vector DB",      status: "online",  latency: "11 ms"  },
  { label: "Embedding Model",status: "online",  latency: "128 ms" },
  { label: "File Storage",   status: "online",  latency: "8 ms"   },
  { label: "Auth Service",   status: "warning", latency: "310 ms" },
];

const ROLE_BADGE = {
  admin:    "text-blue-400 bg-blue-500/10",
  lecturer: "text-violet-400 bg-violet-500/10",
  student:  "text-emerald-400 bg-emerald-500/10",
};

const ACTIVITY_ICON = {
  register: <UserPlus   size={13} className="text-emerald-400" />,
  upload:   <Database   size={13} className="text-blue-400"    />,
  settings: <Settings   size={13} className="text-orange-400"  />,
  ban:      <AlertCircle size={13} className="text-red-400"    />,
};

const HEALTH_META = {
  online:  { dot: "bg-emerald-400",             label: "Online",  cls: "text-emerald-400" },
  warning: { dot: "bg-yellow-400 animate-pulse", label: "Slow",   cls: "text-yellow-400"  },
  offline: { dot: "bg-red-400",                 label: "Offline", cls: "text-red-400"     },
};

/* ─── sub-components ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, delta, deltaLabel, up, accent, bg, ring }) {
  return (
    <div
      className={cn(
        "bg-panel border border-app-border rounded-2xl p-5 flex flex-col gap-4 hover:ring-2 transition-all duration-150",
        ring
      )}
    >
      {/* top row */}
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
          <Icon size={20} className={accent} />
        </div>
        {up !== null ? (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
              up ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
            )}
          >
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {delta}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            {delta}
          </div>
        )}
      </div>

      {/* value */}
      <div>
        <p className="text-2xl font-bold text-app leading-none tracking-tight">{value}</p>
        <p className="text-xs text-app opacity-40 mt-1.5">{label}</p>
      </div>

      {/* footer */}
      <p className="text-xs text-app opacity-30 border-t border-app-border pt-3">
        {sub}
        {deltaLabel ? ` · ${deltaLabel}` : ""}
      </p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-panel border border-app-border rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-black/10 dark:bg-white/10" />
        <div className="w-12 h-5 rounded-full bg-black/10 dark:bg-white/10" />
      </div>
      <div>
        <div className="h-7 w-20 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-3 w-32 rounded bg-black/10 dark:bg-white/10 mt-2" />
      </div>
      <div className="border-t border-app-border pt-3">
        <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
      </div>
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [usersData, docsData] = await Promise.all([
          fetchAdminUsers({ page: 1, pageSize: 1000 }),
          getDocuments(1, 100).catch(() => ({ items: [], totalCount: 0 })),
        ]);

        const users = usersData.items || [];
        const docs = docsData.items || [];

        const totalUsers = users.length;
        const totalLecturers = users.filter((u) => u.roles.includes("Researcher")).length;
        const totalStudents = users.filter((u) => u.roles.includes("Student")).length;
        const totalAdmins = users.filter((u) => u.roles.includes("Admin")).length;

        // Populate Stats
        const calculatedStats = [
          {
            icon: Users,
            label: "Tổng người dùng",
            value: String(totalUsers),
            sub: "across all roles",
            delta: "",
            deltaLabel: "",
            up: null,
            accent: "text-blue-400",
            bg: "bg-blue-500/10",
            ring: "ring-blue-500/20",
          },
          {
            icon: GraduationCap,
            label: "Giảng viên",
            value: String(totalLecturers),
            sub: "Researchers",
            delta: "",
            deltaLabel: "",
            up: null,
            accent: "text-violet-400",
            bg: "bg-violet-500/10",
            ring: "ring-violet-500/20",
          },
          {
            icon: BookOpen,
            label: "Sinh viên",
            value: String(totalStudents),
            sub: "enrolled",
            delta: "",
            deltaLabel: "",
            up: null,
            accent: "text-emerald-400",
            bg: "bg-emerald-500/10",
            ring: "ring-emerald-500/20",
          },
          {
            icon: Cpu,
            label: "System Status",
            value: "Online",
            sub: "All services running",
            delta: "Healthy",
            deltaLabel: "",
            up: null,
            accent: "text-orange-400",
            bg: "bg-orange-500/10",
            ring: "ring-orange-500/20",
          },
        ];
        setStats(calculatedStats);

        // Role distribution
        const dist = [
          { role: "Students",  count: totalStudents, total: totalUsers, color: "bg-emerald-400" },
          { role: "Lecturers", count: totalLecturers,  total: totalUsers, color: "bg-violet-400"  },
          { role: "Admins",    count: totalAdmins,   total: totalUsers, color: "bg-blue-400"    },
        ];
        setRoleDistribution(dist);

        // Recent activity:
        const recentUsers = [...users]
          .filter((u) => u.lastLoginUtc)
          .map((u) => ({
            id: `user-${u.id}`,
            user: u.fullName || u.email,
            action: "Logged into platform",
            role: u.roles[0]?.toLowerCase() || "student",
            time: u.lastLoginUtc,
            type: "register",
            dateObj: new Date(u.lastLoginUtc),
          }));

        const newRegistrations = [...users]
          .map((u) => ({
            id: `reg-${u.id}`,
            user: u.fullName || u.email,
            action: "Registered new account",
            role: u.roles[0]?.toLowerCase() || "student",
            time: u.lastLoginUtc || new Date().toISOString(),
            type: "register",
            dateObj: u.lastLoginUtc ? new Date(u.lastLoginUtc) : new Date(0),
          }));

        const recentDocs = docs.map((d) => ({
          id: `doc-${d.id}`,
          user: "Lecturer",
          action: `Uploaded document: ${d.title}`,
          role: "lecturer",
          time: d.createdAtUtc,
          type: "upload",
          dateObj: new Date(d.createdAtUtc),
        }));

        const merged = [...recentUsers, ...newRegistrations, ...recentDocs]
          .sort((a, b) => b.dateObj - a.dateObj)
          .slice(0, 10)
          .map((item) => {
            const diff = new Date() - item.dateObj;
            let timeStr = "Just now";
            if (diff > 0) {
              const diffMin = Math.floor(diff / 60000);
              const diffHr = Math.floor(diff / 3600000);
              if (diffMin < 60) {
                timeStr = diffMin <= 1 ? "Just now" : `${diffMin} min ago`;
              } else if (diffHr < 24) {
                timeStr = `${diffHr} hr ago`;
              } else {
                timeStr = item.dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }
            }
            return {
              id: item.id,
              user: item.user,
              action: item.action,
              role: item.role,
              time: timeStr,
              type: item.type,
            };
          });

        setRecentActivity(merged);
      } catch (err) {
        console.error("[AdminDashboard] Failed to fetch stats", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 xl:p-8 max-w-6xl mx-auto space-y-8 animate-pulse-subtle">
        {/* Header */}
        <div className="flex items-start justify-between animate-pulse">
          <div>
            <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10 mb-2" />
            <div className="h-7 w-48 rounded bg-black/10 dark:bg-white/10" />
            <div className="h-4 w-64 rounded bg-black/10 dark:bg-white/10 mt-2" />
          </div>
          <div className="w-36 h-10 rounded-xl bg-black/10 dark:bg-white/10" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center justify-center py-20 text-sm text-app opacity-40 gap-2">
          <Loader2 className="animate-spin" size={24} />
          Loading system statistics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 xl:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 xl:p-8 max-w-6xl mx-auto space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-app opacity-40 mb-1 uppercase tracking-widest">Admin Dashboard</p>
          <h1 className="text-2xl font-bold text-app leading-tight">{greeting}, Admin 👋</h1>
          <p className="text-sm text-app opacity-50 mt-1">
            Platform overview — users, system health, and recent activity.
          </p>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
        >
          <Settings size={15} />
          System Settings
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="text-xs text-app opacity-40 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, to, accent }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                accent
              )}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-column row: Role distribution + System health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Role distribution */}
        <div className="bg-panel border border-app-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <BarChart2 size={14} className="text-app opacity-50" />
              </div>
              <span className="text-sm font-semibold text-app">User Distribution</span>
            </div>
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Manage <ArrowRight size={12} />
            </button>
          </div>
          <div className="px-5 py-4 flex flex-col gap-4">
            {roleDistribution.map(({ role, count, total, color }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={role} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-app font-medium">{role}</span>
                    <span className="text-app opacity-40">{count} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-app opacity-30 border-t border-app-border pt-3 mt-1">
              {roleDistribution.reduce((acc, r) => acc + r.count, 0)} total registered accounts
            </p>
          </div>
        </div>

        {/* System health */}
        <div className="bg-panel border border-app-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
                <ShieldCheck size={14} className="text-app opacity-50" />
              </div>
              <span className="text-sm font-semibold text-app">System Health</span>
            </div>
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              Details <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-app-border">
            {SYSTEM_HEALTH.map((svc) => {
              const m = HEALTH_META[svc.status];
              return (
                <div
                  key={svc.label}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", m.dot)} />
                    <span className="text-sm text-app">{svc.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-app opacity-40">{svc.latency}</span>
                    <span className={cn("text-xs font-medium", m.cls)}>{m.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-app-border bg-black/[0.02] dark:bg-white/[0.02]">
            <p className="text-xs text-app opacity-25">Last checked just now</p>
          </div>
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className="bg-panel border border-app-border rounded-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <Clock size={14} className="text-app opacity-50" />
            </div>
            <span className="text-sm font-semibold text-app">Recent Activity</span>
            <span className="text-xs text-app opacity-30 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
              {recentActivity.length}
            </span>
          </div>
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {/* table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 border-b border-app-border">
          {["User", "Role", "Action", "Time"].map((h) => (
            <span key={h} className="text-xs text-app opacity-30 font-medium">
              {h}
            </span>
          ))}
        </div>

        {/* rows */}
        <div className="divide-y divide-app-border">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredRow(item.id)}
              onMouseLeave={() => setHoveredRow(null)}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {/* user */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                  {item.user[0]}
                </div>
                <p className="text-sm font-medium text-app truncate">{item.user}</p>
              </div>

              {/* role */}
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium capitalize whitespace-nowrap",
                  ROLE_BADGE[item.role] || "text-app"
                )}
              >
                {item.role}
              </span>

              {/* action */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                {ACTIVITY_ICON[item.type] || ACTIVITY_ICON["settings"]}
                <span className="text-xs text-app opacity-60">{item.action}</span>
              </div>

              {/* time */}
              <span className="text-xs text-app opacity-30 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t border-app-border bg-black/[0.02] dark:bg-white/[0.02]">
          <p className="text-xs text-app opacity-25">
            Showing {recentActivity.length} most recent events
          </p>
        </div>
      </div>

    </div>
  );
}
