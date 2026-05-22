import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  MoreVertical,
  FileText,
  ChevronDown,
  Trash2,
  Pencil,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/common/header";
import LoadingScreen from "@/components/common/loadingscreen";
import { useNotebookStore } from "@/features/chatbot/store/notebookStore";


// --- Dropdown Menu ---
function CardMenu({ onDelete, onEditTitle, onPinToTop, isPinned }) {
  return (
    <div className="absolute z-50 top-0 left-full ml-1 w-44 bg-[#2a2a2e] border  rounded-xl shadow-xl overflow-hidden py-1">
      <button
        onClick={onDelete}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
      >
        <Trash2 size={15} className="text-white/60" />
        Delete
      </button>
      <button
        onClick={onEditTitle}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
      >
        <Pencil size={15} className="text-white/60" />
        Edit title
      </button>
      <button
        onClick={onPinToTop}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors"
      >
        <Pin size={15} className="text-white/60" />
        {isPinned ? "Unpin" : "Pin to top"}
      </button>
    </div>
  );
}

// --- TopBar ---
function TopBar({ view, setView, sort, setSort, onCreateNew }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex items-center justify-between py-4  ">
      <div className="flex items-center gap-1">
        <button className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white">
          All
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-200 overflow-hidden",
            searchOpen ? "w-48 bg-white/10 rounded-lg px-3 py-1.5" : "w-8"
          )}
        >
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="text-white/70 hover:text-white shrink-0"
          >
            <Search size={16} />
          </button>
          {searchOpen && (
            <input
              autoFocus
              placeholder="Search notebooks..."
              className="bg-transparent text-sm text-white placeholder:text-white/40 outline-none w-full"
              onBlur={() => setSearchOpen(false)}
            />
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white/10 rounded-lg p-0.5">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              view === "grid" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
            )}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              view === "list" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
            )}
          >
            <List size={15} />
          </button>
        </div>

        {/* Sort */}
        <button
          onClick={() => setSort((s) => (s === "recent" ? "oldest" : "recent"))}
          className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg px-3 py-1.5 transition-colors"
        >
          {sort === "recent" ? "Most recent" : "Oldest first"}
          <ChevronDown size={14} />
        </button>

        {/* Create new */}
        <Button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 bg-white text-zinc-900 hover:bg-white/90 rounded-full px-4 py-1.5 text-sm font-medium h-auto"
        >
          <Plus size={15} />
          Create new
        </Button>
      </div>
    </header>
  );
}

// --- Create Card ---
function CreateCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 w-[275px] h-[222px] rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all group"
    >
      <div className="w-10 h-10 rounded-full border-2 border-white/30 group-hover:border-white/60 flex items-center justify-center transition-colors">
        <Plus size={20} className="text-white/50 group-hover:text-white/80" />
      </div>
      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors text-center leading-tight">
        Create new notebook
      </span>
    </button>
  );
}

// --- Notebook Card ---
function NotebookCard({ notebook, view, onDelete, onTogglePin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const menuActions = {
    onDelete: () => { onDelete(notebook.id); setMenuOpen(false); },
    onEditTitle: () => { console.log("edit", notebook.id); setMenuOpen(false); },
    onPinToTop: () => { onTogglePin(notebook.id); setMenuOpen(false); },
    isPinned: notebook.pinned,
  };

  if (view === "list") {
    return (
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
        <div className="w-9 h-9 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
          <FileText size={48} className="text-white/70" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-white truncate">{notebook.title}</p>
            {notebook.pinned && <Pin size={12} className="text-white/40 shrink-0" />}
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            {notebook.date} · {notebook.sources}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-all p-1 rounded-md hover:bg-white/10"
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && <CardMenu {...menuActions} />}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[275px] group">
      <div className="w-[275px] h-[222px] rounded-xl bg-zinc-800 border  hover:border-white/25 flex flex-col items-start justify-between p-4 transition-all cursor-pointer hover:bg-zinc-700/80">
        {/* Top row: icon left, three-dot + pin right — vertically aligned */}
        <div className="flex items-center justify-between w-full">
          <FileText size={48} className="text-white/60" />
          <div className="flex items-center gap-1" ref={menuRef}>
            {notebook.pinned && <Pin size={13} className="text-white/40" />}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className={cn(
                "text-white/60 hover:text-white transition-all p-1 rounded hover:bg-white/10",
                menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && <CardMenu {...menuActions} />}
          </div>
        </div>
        <div className="w-full">
          <p className="text-sm font-medium text-white leading-tight line-clamp-2">
            {notebook.title}
          </p>
        </div>
      </div>

      <div className="mt-2 px-0.5">
        <p className="text-[11px] text-white/40 leading-tight">
          {notebook.date} · {notebook.sources}
        </p>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function MainPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(false);

  const notebooks = useNotebookStore((s) => s.notebooks);
  const addNotebook = useNotebookStore((s) => s.addNotebook);
  const deleteNotebook = useNotebookStore((s) => s.deleteNotebook);
  const togglePin = useNotebookStore((s) => s.togglePin);
  const setActiveNotebook = useNotebookStore((s) => s.setActiveNotebook);

  const handleCreateNew = () => {
    const newNotebook = {
      id: Date.now(),
      title: "Untitled notebook",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      sources: "0 sources",
      pinned: false,
    };
    addNotebook(newNotebook);
    setActiveNotebook(newNotebook.id);
    setLoading(true);
    setTimeout(() => {
      navigate("/notebook", { state: { notebookId: newNotebook.id } });
    }, 1800);
  };

  const handleDelete = (id) => deleteNotebook(id);
  const handleTogglePin = (id) => togglePin(id);

  const pinned = notebooks.filter((nb) => nb.pinned);
  const recent = notebooks
    .filter((nb) => !nb.pinned)
    .sort((a, b) =>
      sort === "recent"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  const cardProps = { view, onDelete: handleDelete, onTogglePin: handleTogglePin };

  return (
    <>
      {loading && <LoadingScreen />}
      <div className="min-h-screen bg-[#1c1c1f] text-white flex flex-col">
        <Header />

        <div className="flex-1 flex flex-col w-full mx-auto px-57">
          <TopBar
            view={view}
            setView={setView}
            sort={sort}
            setSort={setSort}
            onCreateNew={handleCreateNew}
          />

          <main className="flex-1 py-8 flex flex-col gap-10">

            {/* Pinned section */}
            <section>
              <h2 className="text-base font-medium text-white/80 mb-5 flex items-center gap-2">
                <Pin size={15} className="text-white/50" />
                Pinned
              </h2>

              {pinned.length === 0 ? (
                <p className="text-sm text-white/30 italic">No pinned notebook card</p>
              ) : view === "grid" ? (
                <div className="flex flex-wrap gap-4">
                  {pinned.map((nb) => (
                    <NotebookCard key={nb.id} notebook={nb} {...cardProps} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-w-2xl">
                  {pinned.map((nb) => (
                    <NotebookCard key={nb.id} notebook={nb} {...cardProps} />
                  ))}
                </div>
              )}
            </section>

            {/* Recent section */}
            <section>
              <h2 className="text-base font-medium text-white/80 mb-5">
                Recent notebooks
              </h2>

              {view === "grid" ? (
                <div className="flex flex-wrap gap-4">
                  <CreateCard onClick={handleCreateNew} />
                  {recent.map((nb) => (
                    <NotebookCard key={nb.id} notebook={nb} {...cardProps} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-w-2xl">
                  <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full border-2 border-white/30 group-hover:border-white/60 flex items-center justify-center transition-colors shrink-0">
                      <Plus size={18} className="text-white/50 group-hover:text-white/80" />
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                      Create new notebook
                    </span>
                  </button>
                  {recent.map((nb) => (
                    <NotebookCard key={nb.id} notebook={nb} {...cardProps} />
                  ))}
                </div>
              )}
            </section>

          </main>
        </div>
      </div>
    </>
  );
}
