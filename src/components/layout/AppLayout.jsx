import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, FileText,
  FlaskConical, BarChart3, History, LineChart, Settings,
  Bell, LogOut, ChevronLeft, ChevronRight, Moon, Check,
  Sun, Monitor, User, HelpCircle, ExternalLink,
  Database, GraduationCap, Users, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import NotificationCenter from "@/features/notifications/NotificationCenter";
import useAuthStore from "@/stores/useAuthStore";
import { hasRole } from "@/components/common/RoleGuard";
import { clearTokens } from "@/features/auth/api/authUtils";
import { logout as logoutApi } from "@/features/auth/api/authApi";

/* ─── nav structure ──────────────────────────────────────────── */
// roles: omit = any authenticated user, ["admin"] = admin only, etc.
const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["researcher"] },
      // { to: "/chat",      icon: MessageSquare,   label: "Chat",      badge: "3" },
      { to: "/admin",     icon: Monitor,         label: "Admin",     roles: ["admin"] },
    ],
  },
  {
    label: "Document Management",
    items: [
      { to: "/documents",        icon: FileText,  label: "Tài liệu", roles: ["researcher"]},
      { to: "/subjects",         icon: BookOpen,  label: "Môn học", roles: ["researcher"] },
      { to: "/documents_upload", icon: Database,  label: "Upload Tài Liệu", roles: ["researcher"] },
      { to: "/admin/subjects",         icon: BookOpen,  label: "Môn học" },
      { to: "/admin/documents",         icon: BookOpen,  label: "Tài liệu", roles: ["admin"] },
    ],
  },
  {
    label: "User Management",
    roles: ["admin"],
    items: [
      { to: "/admin/users", icon: Users,         label: "Overview" },
      { to: "/admin/lectures",    icon: GraduationCap, label: "Giảng Viên" },
      { to: "/admin/students",    icon: Users,         label: "Sinh Viên" },
    ],
  },
  {
    label: "Research",
    roles: ["admin"],
    items: [
      { to: "/research",  icon: FlaskConical, label: "Research Lab" },
      { to: "/benchmark", icon: BarChart3,    label: "Benchmark" },
      { to: "/analytics", icon: LineChart,    label: "Analytics" },
    ],
  },
  {
    label: "System",
    roles: ["admin"],
    items: [
      { to: "/sessions", icon: History,  label: "Sessions" },
      { to: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

const THEME_OPTIONS = [
  { value: "light", label: "Light",   icon: Sun },
  { value: "dark",  label: "Dark",    icon: Moon },
  { value: "system",label: "System",  icon: Monitor },
];

/* ─── NavItem ────────────────────────────────────────────────── */
function NavItem({ to, icon: Icon, label, badge, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-100 group",
          collapsed ? "justify-center" : "",
          isActive
            ? "bg-emerald-500/10 text-emerald-400 font-medium"
            : "text-app opacity-55 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* active indicator bar */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-emerald-400" />
          )}
          <Icon size={16} className="shrink-0" />
          {!collapsed && (
            <span className="flex-1 truncate">{label}</span>
          )}
          {!collapsed && badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 leading-none">
              {badge}
            </span>
          )}
          {collapsed && badge && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border-2 border-panel" />
          )}
        </>
      )}
    </NavLink>
  );
}

/* ─── AppLayout ──────────────────────────────────────────────── */
export default function AppLayout() {
  const [collapsed, setCollapsed]           = useState(false);
  const [notifOpen, setNotifOpen]           = useState(false);
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, setTheme } = useTheme();
  const dropdownRef    = useRef(null);
  const themePickerRef = useRef(null);
  const notifRef       = useRef(null);

  const user      = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  // Filter nav groups and items by the current user's role
  // Support both `roles` (array from /me API) and legacy `role` field
  const userRoles = user?.roles ?? user?.role;
  const visibleGroups = NAV_GROUPS
    .filter((g) => hasRole(userRoles, g.roles))
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => hasRole(userRoles, item.roles)),
    }))
    .filter((g) => g.items.length > 0);

  const avatarInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?";

  /* close on outside click */
  useEffect(() => {
    function handle(e) {
      if (dropdownRef.current    && !dropdownRef.current.contains(e.target))    setDropdownOpen(false);
      if (themePickerRef.current && !themePickerRef.current.contains(e.target)) setThemePickerOpen(false);
      if (notifRef.current       && !notifRef.current.contains(e.target))       setNotifOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* current page title */
  const pageTitle = (() => {
    const flat = NAV_GROUPS.flatMap((g) => g.items);
    return flat.find((i) => location.pathname.startsWith(i.to))?.label ?? "EduChat";
  })();

  function applyTheme(val) {
    if (val === "system") {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    } else {
      setTheme(val);
    }
    setThemePickerOpen(false);
  }

  const ThemeIcon = THEME_OPTIONS.find((o) => o.value === theme)?.icon ?? Moon;

  return (
    <div className="flex h-screen bg-app overflow-hidden">

      {/* ════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════ */}
      <aside
        className={cn(
          "flex flex-col bg-panel border-r border-app-border shrink-0 transition-all duration-200 overflow-hidden",
          collapsed ? "w-[52px]" : "w-[220px]"
        )}
      >
        {/* ── Logo ── */}
        <div
          className={cn(
            "flex items-center h-14 border-b border-app-border shrink-0 px-3",
            collapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity min-w-0"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3C7.03 3 3 7.03 3 12v4a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H5.07A7 7 0 0 1 19 12h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-4c0-4.97-4.03-9-9-9Z"
                  fill="white"
                />
              </svg>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-app leading-none">EduChat</p>
                <p className="text-[10px] text-app opacity-30 leading-none mt-0.5">AI Learning Assistant</p>
              </div>
            )}
          </button>
        </div>

        {/* ── Nav groups ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              {/* group label */}
              {!collapsed && (
                <p className="text-[10px] font-semibold text-app opacity-25 uppercase tracking-widest px-2.5 mb-1.5">
                  {group.label}
                </p>
              )}
              {collapsed && (
                <div className="h-px bg-app-border mx-1 mb-2 opacity-50" />
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to} {...item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom: theme + collapse ── */}
        <div className="px-2 pb-3 pt-2 border-t border-app-border shrink-0 flex flex-col gap-1">
          {/* Theme toggle */}
          <div className="relative" ref={themePickerRef}>
            <button
              onClick={() => setThemePickerOpen((v) => !v)}
              title={collapsed ? "Theme" : undefined}
              className={cn(
                "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                collapsed ? "justify-center" : ""
              )}
            >
              <ThemeIcon size={15} className="shrink-0" />
              {!collapsed && <span className="flex-1 text-left">Theme</span>}
            </button>

            {themePickerOpen && (
              <div
                className={cn(
                  "absolute bottom-full mb-1 bg-panel border border-app-border rounded-xl shadow-2xl py-1 z-50 w-40",
                  collapsed ? "left-full ml-2 bottom-0" : "left-0"
                )}
              >
                {THEME_OPTIONS.map(({ value, label, icon: TIcon }) => (
                  <button
                    key={value}
                    onClick={() => applyTheme(value)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <TIcon size={14} className="shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    {theme === value && <Check size={13} className="text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand sidebar" : undefined}
            className={cn(
              "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-app opacity-40 hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
              collapsed ? "justify-center" : ""
            )}
          >
            {collapsed ? (
              <ChevronRight size={15} />
            ) : (
              <>
                <ChevronLeft size={15} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MAIN AREA
      ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top header ── */}
        <header className="flex items-center justify-between px-5 h-14 bg-header border-b border-app-border shrink-0">
          {/* Left: breadcrumb / page title */}
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold text-app truncate">{pageTitle}</p>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-lg text-app opacity-55 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={16} />
                {/* unread dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-header" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <NotificationCenter onClose={() => setNotifOpen(false)} />
                </div>
              )}
            </div>

            {/* Help */}
            <button
              className="p-2 rounded-lg text-app opacity-55 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Help"
            >
              <HelpCircle size={16} />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-app-border mx-1" />

            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {avatarInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-app leading-none">{user?.fullName ?? "User"}</p>
                  <p className="text-[10px] text-app opacity-40 leading-none mt-0.5">{user?.email ?? ""}</p>
                </div>
                <ChevronRight
                  size={12}
                  className={cn("text-app opacity-30 transition-transform", dropdownOpen ? "rotate-90" : "")}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-panel border border-app-border shadow-2xl z-50 py-1 overflow-hidden">
                  {/* user info */}
                  <div className="px-4 py-3 border-b border-app-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {avatarInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-app truncate">{user?.fullName ?? "User"}</p>
                        <p className="text-xs text-app opacity-40 truncate">{user?.email ?? ""}</p>
                      </div>
                    </div>
                  </div>

                  {/* menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <User size={14} className="shrink-0" />
                      Profile & Settings
                    </button>
                    <button
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink size={14} className="shrink-0" />
                      Documentation
                    </button>
                  </div>

                  <div className="border-t border-app-border py-1">
                    <button
                      onClick={async () => {
                        setDropdownOpen(false);
                        try { await logoutApi(); } catch { /* ignore */ }
                        finally {
                          clearTokens();
                          clearUser();
                          navigate("/login");
                        }
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      <LogOut size={14} className="shrink-0" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
