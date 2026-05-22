import { useState, useRef, useEffect } from "react";
import { Settings, Grid3x3, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setDropdownOpen(false);
    // Clear any stored auth tokens/session here if needed
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between px-4 h-14 bg-[#1c1c1f] shrink-0">
      {/* Left: Logo */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {/* Icon — simple headphone/wave mark similar to NotebookLM */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white/80"
        >
          <path
            d="M12 3C7.03 3 3 7.03 3 12v4a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H5.07A7 7 0 0 1 19 12h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2v-4c0-4.97-4.03-9-9-9Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-sm font-medium text-white tracking-wide">
          AI-Chatbot
        </span>
      </button>

      {/* Right: Settings + Apps + Avatar */}
      <div className="flex items-center gap-1">
        {/* Settings */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm">
          <Settings size={15} />
          <span>Settings</span>
        </button>

        {/* Apps / Grid */}
        <button className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <Grid3x3 size={16} />
        </button>

        {/* Avatar with dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            A
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md bg-[#2a2a2e] border border-white/10 shadow-lg z-50 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
