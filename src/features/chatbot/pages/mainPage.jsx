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
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/common/header";
import LoadingScreen from "@/components/common/loadingscreen";
import { useNotebookStore } from "@/features/chatbot/store/notebookStore";
import SubjectCard from "@/features/chatbot/components/SubjectCard";

// --- Dropdown Menu ---
// function CardMenu({ onDelete, onEditTitle, onPinToTop, isPinned }) {
//   return (
//     <div className="absolute z-50 top-0 left-full ml-1 w-44 bg-panel border border-app-border rounded-xl shadow-xl overflow-hidden py-1">
//       <button
//         onClick={onDelete}
//         className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
//       >
//         <Trash2 size={15} className="opacity-60" />
//         Delete
//       </button>
//       <button
//         onClick={onEditTitle}
//         className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
//       >
//         <Pencil size={15} className="opacity-60" />
//         Edit title
//       </button>
//       <button
//         onClick={onPinToTop}
//         className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-app opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
//       >
//         <Pin size={15} className="opacity-60" />
//         {isPinned ? "Unpin" : "Pin to top"}
//       </button>
//     </div>
//   );
// }

// --- TopBar ---
function TopBar({ view, setView, sort, setSort, onCreateNew, searchQuery, setSearchQuery }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchBlur = () => {
    if (!searchQuery) setSearchOpen(false);
  };

  const handleSearchToggle = () => {
    if (searchOpen && searchQuery) {
      // clear and close
      setSearchQuery("");
      setSearchOpen(false);
    } else {
      setSearchOpen((v) => !v);
    }
  };

  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-1">
        {/* <button className="px-3 py-1.5 rounded-full text-sm font-medium bg-black/10 dark:bg-white/10 text-app">
          All
        </button> */}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-200 overflow-hidden",
            searchOpen ? "w-48 bg-black/10 dark:bg-white/10 rounded-lg px-3 py-1.5" : "w-8"
          )}
        >
          <button
            onClick={handleSearchToggle}
            className="text-app opacity-70 hover:opacity-100 shrink-0"
          >
            <Search size={16} />
          </button>
          {searchOpen && (
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-app placeholder:opacity-40 outline-none w-full"
              onBlur={handleSearchBlur}
            />
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-black/10 dark:bg-white/10 rounded-lg p-0.5">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors text-app",
              view === "grid" ? "bg-black/10 dark:bg-white/20 opacity-100" : "opacity-50 hover:opacity-100"
            )}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors text-app",
              view === "list" ? "bg-black/10 dark:bg-white/20 opacity-100" : "opacity-50 hover:opacity-100"
            )}
          >
            <List size={15} />
          </button>
        </div>

        {/* Sort */}
        <button
          onClick={() => setSort((s) => (s === "recent" ? "oldest" : "recent"))}
          className="flex items-center gap-1.5 text-sm text-app opacity-70 hover:opacity-100 bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15 rounded-lg px-3 py-1.5 transition-colors"
        >
          {sort === "recent" ? "Most recent" : "Oldest first"}
          <ChevronDown size={14} />
        </button>

        {/* Create new */}
        {/* <Button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white/90 rounded-full px-4 py-1.5 text-sm font-medium h-auto"
        >
          <Plus size={15} />
          Create new
        </Button> */}
      </div>
    </header>
  );
}

// --- Create Card ---
// function CreateCard({ onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       className="flex flex-col items-center justify-center gap-3 w-[275px] h-[222px] rounded-xl border-2 border-dashed border-app-border hover:border-black/30 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
//     >
//       <div className="w-10 h-10 rounded-full border-2 border-app-border group-hover:border-black/40 dark:group-hover:border-white/60 flex items-center justify-center transition-colors">
//         <Plus size={20} className="text-app opacity-50 group-hover:opacity-80" />
//       </div>
//       <span className="text-sm text-app opacity-60 group-hover:opacity-80 transition-colors text-center leading-tight">
//         Create new notebook
//       </span>
//     </button>
//   );
// }

// --- Notebook Card ---
// function NotebookCard({ notebook, view, onDelete, onTogglePin }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     if (!menuOpen) return;
//     function handleClick(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setMenuOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, [menuOpen]);

//   const menuActions = {
//     onDelete: () => { onDelete(notebook.id); setMenuOpen(false); },
//     onEditTitle: () => { console.log("edit", notebook.id); setMenuOpen(false); },
//     onPinToTop: () => { onTogglePin(notebook.id); setMenuOpen(false); },
//     isPinned: notebook.pinned,
//   };

//   if (view === "list") {
//     return (
//       <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors group">
//         <div className="w-9 h-9 rounded-lg bg-black/10 dark:bg-zinc-700 flex items-center justify-center shrink-0">
//           <FileText size={20} className="text-app opacity-70" />
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-1.5">
//             <p className="text-sm font-medium text-app truncate">{notebook.title}</p>
//             {notebook.pinned && <Pin size={12} className="text-app opacity-40 shrink-0" />}
//           </div>
//           <p className="text-xs text-app opacity-40 mt-0.5">
//             {notebook.date} · {notebook.sources}
//           </p>
//         </div>
//         <div className="relative" ref={menuRef}>
//           <button
//             onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
//             className="opacity-0 group-hover:opacity-100 text-app opacity-50 hover:opacity-100 transition-all p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
//           >
//             <MoreVertical size={15} />
//           </button>
//           {menuOpen && <CardMenu {...menuActions} />}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-[275px] group">
//       <div className="w-[275px] h-[222px] rounded-xl bg-panel border border-app-border hover:border-black/25 dark:hover:border-white/25 flex flex-col items-start justify-between p-4 transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-zinc-700/80">
//         {/* Top row */}
//         <div className="flex items-center justify-between w-full">
//           <FileText size={48} className="text-app opacity-60" />
//           <div className="flex items-center gap-1" ref={menuRef}>
//             {notebook.pinned && <Pin size={13} className="text-app opacity-40" />}
//             <button
//               onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
//               className={cn(
//                 "text-app opacity-60 hover:opacity-100 transition-all p-1 rounded hover:bg-black/10 dark:hover:bg-white/10",
//                 menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
//               )}
//             >
//               <MoreVertical size={16} />
//             </button>
//             {menuOpen && <CardMenu {...menuActions} />}
//           </div>
//         </div>
//         <div className="w-full">
//           <p className="text-sm font-medium text-app leading-tight line-clamp-2">
//             {notebook.title}
//           </p>
//         </div>
//       </div>

//       <div className="mt-2 px-0.5">
//         <p className="text-[11px] text-app opacity-40 leading-tight">
//           {notebook.date} · {notebook.sources}
//         </p>
//       </div>
//     </div>
//   );
// }

// --- Subject data ---
const INITIAL_SUBJECTS = [
  { id: "TestSE1",   code: "TestSE1",   name: "Test Subject 1",       semester: 1, pinned: false },
  { id: "TestSE1.2", code: "TestSE1.2", name: "Test Subject 1.2",     semester: 1, pinned: false },
  { id: "HCM202",    code: "HCM202",    name: "Ho Chi Minh Ideology", semester: 8, pinned: false },
  { id: "MLN131",    code: "MLN131",    name: "Marxism-Leninism I",   semester: 8, pinned: false },
  { id: "VNR202",    code: "VNR202",    name: "Vietnamese Revolution",semester: 8, pinned: false },
  { id: "MLN122",    code: "MLN122",    name: "Marxism-Leninism II",  semester: 8, pinned: false },
];

// --- Main Page ---
export default function MainPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [selectedSemester, setSelectedSemester] = useState(null); // null = All
  const [searchQuery, setSearchQuery] = useState("");

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
  const handleSubjectClick = (subject) => {
    // Navigate to the subject's notebook view
    navigate("/notebook", { state: { subjectId: subject.id, subjectCode: subject.code } });
  };

  const handleToggleSubjectPin = (id) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  const pinnedSubjects = subjects.filter((s) => s.pinned);
  const unpinnedSubjects = subjects.filter((s) => !s.pinned);

  const q = searchQuery.trim().toLowerCase();

  const pinned = notebooks
    .filter((nb) => nb.pinned)
    .filter((nb) => !q || nb.title.toLowerCase().includes(q));

  const recent = notebooks
    .filter((nb) => !nb.pinned)
    .filter((nb) => !q || nb.title.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === "recent"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  // For subjects, search applies on top of pin/semester filters
  const searchFilteredUnpinned = unpinnedSubjects.filter(
    (s) => !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );
  const searchFilteredPinned = pinnedSubjects.filter(
    (s) => !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );

  const cardProps = { view, onDelete: handleDelete, onTogglePin: handleTogglePin };

  return (
    <>
      {loading && <LoadingScreen />}
      <div className="min-h-screen bg-app text-app flex flex-col">
        <Header />

        <div className="flex-1 flex flex-col w-full mx-auto px-57">
          <TopBar
            view={view}
            setView={setView}
            sort={sort}
            setSort={setSort}
            onCreateNew={handleCreateNew}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main className="flex-1 py-8 flex flex-col gap-10">

            {/* Pinned section */}
            <section>
              <h2 className="text-base font-medium text-app opacity-80 mb-5 flex items-center gap-2">
                <Pin size={15} className="opacity-50" />
                Pinned
              </h2>

              {pinned.length === 0 && searchFilteredPinned.length === 0 ? (
                <p className="text-sm text-app opacity-30 italic">No pinned notebook card</p>
              ) : view === "grid" ? (
                <div className="flex flex-wrap gap-4">
                  {searchFilteredPinned.map((s) => (
                    <SubjectCard key={s.id} subject={s} view={view} onClick={handleSubjectClick} onTogglePin={handleToggleSubjectPin} />
                  ))}
                  {pinned.map((nb) => (
                    <NotebookCard key={nb.id} notebook={nb} {...cardProps} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-w-2xl">
                  {searchFilteredPinned.map((s) => (
                    <SubjectCard key={s.id} subject={s} view={view} onClick={handleSubjectClick} onTogglePin={handleToggleSubjectPin} />
                  ))}
                  {pinned.map((nb) => (
                    <NotebookCard key={nb.id} notebook={nb} {...cardProps} />
                  ))}
                </div>
              )}
            </section>

            {/* Subjects section */}
            <section>
              <h2 className="text-base font-medium text-app opacity-80 mb-4 flex items-center gap-2">
                <BookOpen size={15} className="opacity-50" />
                Subjects
              </h2>

              {/* Semester filter bar */}
              <div className="flex items-center gap-1.5 flex-wrap mb-6">
                <button
                  onClick={() => setSelectedSemester(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    selectedSemester === null
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                      : "bg-black/10 dark:bg-white/10 text-app opacity-60 hover:opacity-100"
                  )}
                >
                  All
                </button>
                {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      selectedSemester === sem
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        : "bg-black/10 dark:bg-white/10 text-app opacity-60 hover:opacity-100"
                    )}
                  >
                    Semester {sem}
                  </button>
                ))}
              </div>

              {(() => {
                // Apply semester filter, then exclude pinned
                const filtered = searchFilteredUnpinned.filter(
                  (s) => selectedSemester === null || s.semester === selectedSemester
                );

                // Group by semester
                const bySemester = filtered.reduce((acc, s) => {
                  const key = s.semester;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(s);
                  return acc;
                }, {});
                const semesters = Object.keys(bySemester).sort((a, b) => Number(a) - Number(b));

                if (semesters.length === 0) {
                  return (
                    <p className="text-sm text-app opacity-30 italic">
                      {q
                        ? `No results for "${searchQuery}"`
                        : selectedSemester
                        ? `No subjects in Semester ${selectedSemester}`
                        : "All subjects are pinned"}
                    </p>
                  );
                }

                return (
                  <div className="flex flex-col gap-8">
                    {semesters.map((sem) => (
                      <div key={sem}>
                        {/* Only show semester label when viewing All */}
                        {selectedSemester === null && (
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-semibold text-app opacity-40 uppercase tracking-widest">
                              Semester {sem}
                            </span>
                            <div className="flex-1 h-px bg-app-border opacity-50" />
                          </div>
                        )}

                        {view === "grid" ? (
                          <div className="flex flex-wrap gap-4">
                            {bySemester[sem].map((subject) => (
                              <SubjectCard
                                key={subject.id}
                                subject={subject}
                                view={view}
                                onClick={handleSubjectClick}
                                onTogglePin={handleToggleSubjectPin}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 max-w-2xl">
                            {bySemester[sem].map((subject) => (
                              <SubjectCard
                                key={subject.id}
                                subject={subject}
                                view={view}
                                onClick={handleSubjectClick}
                                onTogglePin={handleToggleSubjectPin}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </section>

          </main>
        </div>
      </div>
    </>
  );
}
