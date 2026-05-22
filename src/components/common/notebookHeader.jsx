import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Check, X } from "lucide-react";
import { useNotebookStore } from "@/features/chatbot/store/notebookStore";

export default function NotebookHeader() {
  const navigate = useNavigate();
  const { getActiveNotebook, renameNotebook } = useNotebookStore();
  const notebook = getActiveNotebook();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function startEdit() {
    setDraft(notebook?.title ?? "Untitled notebook");
    setEditing(true);
  }

  function confirmEdit() {
    const trimmed = draft.trim();
    if (trimmed && notebook) {
      renameNotebook(notebook.id, trimmed);
    }
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") cancelEdit();
  }

  const title = notebook?.title ?? "Untitled notebook";

  return (
    <header className="flex items-center justify-between px-4 h-14 bg-[#1c1c1f] shrink-0">
      {/* Left: Logo + notebook name */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo — navigates home */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
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
        </button>

        {/* Divider */}
        <span className="text-white/20 text-lg font-light select-none">/</span>

        {/* Notebook name — inline editable */}
        {editing ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={confirmEdit}
              className="bg-white/10 text-white text-sm font-medium rounded-md px-2 py-1 outline-none border border-white/20 focus:border-white/40 min-w-0 w-64 max-w-xs"
            />
            <button
              onMouseDown={(e) => { e.preventDefault(); confirmEdit(); }}
              className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10 transition-colors shrink-0"
            >
              <Check size={14} />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
              className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 group min-w-0"
          >
            <span className="text-sm font-medium text-white truncate max-w-xs">
              {title}
            </span>
            <Pencil
              size={13}
              className="text-white/0 group-hover:text-white/50 transition-colors shrink-0"
            />
          </button>
        )}
      </div>
    </header>
  );
}
