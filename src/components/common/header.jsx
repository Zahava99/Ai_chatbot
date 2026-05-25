import { useState, useRef, useEffect } from "react";
import {
  Settings,
  Grid3x3,
  LogOut,
  HelpCircle,
  MessageSquareWarning,
  MessageSquare,
  Globe,
  ScrollText,
  Moon,
  ChevronRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeSubmenuOpen, setThemeSubmenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
        setThemeSubmenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    navigate("/login");
  }

  // const settingsItems = [
  //   { icon: HelpCircle, label: "Help" },
  //   { icon: MessageSquareWarning, label: "Send feedback" },
  //   { icon: MessageSquare, label: "Discord" },
  //   { icon: Globe, label: "Output Language" },
  //   { icon: ScrollText, label: "Licenses" },
  // ];

  const themeOptions = [
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" },
    { value: "system", label: "System default" },
  ];

  return (
    <header className="flex items-center justify-between px-4 h-14 bg-header shrink-0 border-b border-app-border">
      {/* Left: Logo */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-app">
          <path
            d="M12 3C7.03 3 3 7.03 3 12v4a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H5.07A7 7 0 0 1 19 12h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-4c0-4.97-4.03-9-9-9Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-medium text-app tracking-wide">EduChat</span>
      </button>

      {/* Right: Settings + Apps + Avatar */}
      <div className="flex items-center gap-1">

        {/* Settings with dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => { setSettingsOpen((p) => !p); setThemeSubmenuOpen(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-app-border text-app hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm"
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>

          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-lg bg-panel border border-app-border shadow-xl z-50 py-1 overflow-visible">

              {/* {settingsItems.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </button>
              ))} */}

              {/* <div className="my-1 border-t border-app-border" /> */}

              {/* Dark mode row — hover on wrapper keeps submenu open */}
              <div
                className="relative"
                onMouseEnter={() => setThemeSubmenuOpen(true)}
                onMouseLeave={() => setThemeSubmenuOpen(false)}
              >
                <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <Moon size={16} className="shrink-0" />
                  <span className="flex-1 text-left">Dark mode</span>
                  <ChevronRight size={14} className="opacity-50" />
                </button>

                {themeSubmenuOpen && (
                  <div className="absolute right-full top-0 w-44 rounded-lg bg-panel border border-app-border shadow-xl z-50 py-1">
                    {themeOptions.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setTheme(
                            value === "system"
                              ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
                              : value
                          );
                          setThemeSubmenuOpen(false);
                          setSettingsOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="flex-1 text-left">{label}</span>
                        {theme === value && <Check size={14} className="text-app" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Apps / Grid */}
        <button className="p-2 rounded-md text-app opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <Grid3x3 size={16} />
        </button>

        {/* Avatar with dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            A
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md bg-panel border border-app-border shadow-lg z-50 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
