import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil, Check, X,
  Settings, Grid3x3, LogOut,
  HelpCircle, MessageSquareWarning, MessageSquare,
  Globe, ScrollText, Moon, ChevronRight,
} from "lucide-react";
import { useNotebookStore } from "@/features/chatbot/store/notebookStore";
import { useTheme } from "@/context/ThemeContext";

export default function NotebookHeader() {
  const navigate = useNavigate();
  const { getActiveNotebook, renameNotebook } = useNotebookStore();
  const notebook = getActiveNotebook();
  const { theme, setTheme } = useTheme();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeSubmenuOpen, setThemeSubmenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const settingsRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
        setThemeSubmenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function startEdit() {
    setDraft(notebook?.title ?? "Untitled notebook");
    setEditing(true);
  }
  function confirmEdit() {
    const trimmed = draft.trim();
    if (trimmed && notebook) renameNotebook(notebook.id, trimmed);
    setEditing(false);
  }
  function cancelEdit() { setEditing(false); }
  function handleKeyDown(e) {
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") cancelEdit();
  }

  const title = notebook?.title ?? "Untitled notebook";

  const settingsItems = [
    { icon: HelpCircle, label: "Help" },
    { icon: MessageSquareWarning, label: "Send feedback" },
    { icon: MessageSquare, label: "Discord" },
    { icon: Globe, label: "Output Language" },
    { icon: ScrollText, label: "Licenses" },
  ];

  const themeOptions = [
    { value: "dark", label: "Dark" },
    { value: "light", label: "Light" },
    { value: "system", label: "System default" },
  ];

  return (
    <header className="flex items-center justify-between px-4 h-14 bg-notebook border-b border-app-border shrink-0">
      {/* Left: Logo + notebook name */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-app">
            <path
              d="M12 3C7.03 3 3 7.03 3 12v4a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H5.07A7 7 0 0 1 19 12h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-4c0-4.97-4.03-9-9-9Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <span className="text-app opacity-20 text-lg font-light select-none">/</span>

        {editing ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={confirmEdit}
              className="bg-black/10 dark:bg-white/10 text-app text-sm font-medium rounded-md px-2 py-1 outline-none border border-app-border focus:border-black/30 dark:focus:border-white/40 min-w-0 w-64 max-w-xs"
            />
            <button
              onMouseDown={(e) => { e.preventDefault(); confirmEdit(); }}
              className="text-app opacity-60 hover:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <Check size={14} />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
              className="text-app opacity-60 hover:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button onClick={startEdit} className="flex items-center gap-1.5 group min-w-0">
            <span className="text-sm font-medium text-app truncate max-w-xs">{title}</span>
            <Pencil size={13} className="text-app opacity-0 group-hover:opacity-50 transition-colors shrink-0" />
          </button>
        )}
      </div>

      {/* Right: Settings + Apps + Avatar */}
      <div className="flex items-center gap-1">

        {/* Settings dropdown */}
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
              {settingsItems.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </button>
              ))}

              <div className="my-1 border-t border-app-border" />

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
                onClick={() => { setDropdownOpen(false); navigate("/login"); }}
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
