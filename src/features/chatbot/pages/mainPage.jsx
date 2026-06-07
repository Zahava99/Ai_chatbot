import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Pin,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Header from "@/components/common/header";
import LoadingScreen from "@/components/common/loadingscreen";
import { useNotebookStore } from "@/features/chatbot/store/notebookStore";
import SubjectCard from "@/features/chatbot/components/SubjectCard";
import { fetchSubjects } from "@/features/chatbot/api/subjectsApi";

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
      </div>
    </header>
  );
}
// --- API subjects hook ---
function useApiSubjects() {
  const [apiSubjects, setApiSubjects] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const loadSubjects = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const mapped = await fetchSubjects();
      setApiSubjects(mapped);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => { loadSubjects(); }, []);

  return { apiSubjects, apiLoading, apiError, refetch: loadSubjects };
}

// --- Main Page ---
export default function MainPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null); // null = All
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedSubjectIds, setPinnedSubjectIds] = useState(new Set());
  const [collapsedSemesters, setCollapsedSemesters] = useState(new Set());

  const toggleSemesterCollapse = (sem) => {
    setCollapsedSemesters((prev) => {
      const next = new Set(prev);
      next.has(sem) ? next.delete(sem) : next.add(sem);
      return next;
    });
  };

  const notebooks = useNotebookStore((s) => s.notebooks);
  const addNotebook = useNotebookStore((s) => s.addNotebook);
  const deleteNotebook = useNotebookStore((s) => s.deleteNotebook);
  const togglePin = useNotebookStore((s) => s.togglePin);
  const setActiveNotebook = useNotebookStore((s) => s.setActiveNotebook);

  const { apiSubjects, apiLoading, apiError, refetch } = useApiSubjects();

  // Merge pinned state into API subjects
  const subjects = apiSubjects.map((s) => ({
    ...s,
    pinned: pinnedSubjectIds.has(s.id),
  }));

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
    navigate("/notebook", { state: { subjectId: subject.id, subjectCode: subject.code } });
  };

  const handleToggleSubjectPin = (id) => {
    setPinnedSubjectIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const pinnedSubjects = subjects.filter((s) => s.pinned);
  const unpinnedSubjects = subjects.filter((s) => !s.pinned);

  const q = searchQuery.trim().toLowerCase();

  const pinned = notebooks
    .filter((nb) => nb.pinned)
    .filter((nb) => !q || nb.title.toLowerCase().includes(q));

  // For subjects, search applies on top of pin/semester filters
  const searchFilteredUnpinned = subjects.filter(
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
                <button
                  onClick={refetch}
                  disabled={apiLoading}
                  className="ml-auto flex items-center gap-1.5 text-xs text-app opacity-50 hover:opacity-100 transition-opacity"
                  title="Refresh"
                >
                  <RefreshCw size={13} className={cn(apiLoading && "animate-spin")} />
                  {apiLoading ? "Loading..." : "Refresh"}
                </button>
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

              {apiError ? (
                <div className="flex items-center gap-3 text-sm text-red-500/80 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <span>Failed to load: {apiError}</span>
                  <button
                    onClick={refetch}
                    className="ml-auto underline underline-offset-2 hover:text-red-500 transition-colors text-xs"
                  >
                    Retry
                  </button>
                </div>
              ) : apiLoading ? (
                <div
                  className={cn(
                    view === "grid" ? "flex flex-wrap gap-4" : "flex flex-col gap-2 max-w-2xl"
                  )}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-xl bg-black/5 dark:bg-white/5 animate-pulse",
                        view === "grid" ? "w-[275px] h-[222px]" : "h-[56px] w-full"
                      )}
                    />
                  ))}
                </div>
              ) : (() => {
                // Semesters to display: if a filter is active show only that one, else show all 8
                const semestersToShow = selectedSemester !== null
                  ? [selectedSemester]
                  : Array.from({ length: 8 }, (_, i) => i + 1);

                // Build lookup of unpinned subjects by semester (with search applied)
                const bySemester = semestersToShow.reduce((acc, sem) => {
                  acc[sem] = searchFilteredUnpinned.filter((s) => s.semester === sem);
                  return acc;
                }, {});

                // If searching and nothing matches at all, show a global empty message
                const totalMatches = semestersToShow.reduce((n, sem) => n + bySemester[sem].length, 0);
                if (q && totalMatches === 0) {
                  return (
                    <p className="text-sm text-app opacity-30 italic">
                      No results for "{searchQuery}"
                    </p>
                  );
                }

                return (
                  <div className="flex flex-col gap-8">
                    {semestersToShow.map((sem) => (
                      <div key={sem}>
                        {/* Semester label — always shown when viewing All; hidden when a specific semester is selected */}
                        {selectedSemester === null && (
                          <div className="flex items-center gap-3 mb-4">
                            <button
                              onClick={() => toggleSemesterCollapse(sem)}
                              className="flex items-center gap-2 text-xs font-semibold text-app opacity-40 uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                              <ChevronDown
                                size={13}
                                className={cn(
                                  "transition-transform duration-200",
                                  collapsedSemesters.has(sem) && "-rotate-90"
                                )}
                              />
                              Semester {sem}
                            </button>
                            <div className="flex-1 h-px bg-app-border opacity-50" />
                          </div>
                        )}

                        {!collapsedSemesters.has(sem) && (
                          bySemester[sem].length === 0 ? (
                            <p className="text-sm text-app opacity-30 italic">No Subjects</p>
                          ) : view === "grid" ? (
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
                          )
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
