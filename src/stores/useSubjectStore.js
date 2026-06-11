import { create } from "zustand";
import { getSubjects, getChapters, createSubject, updateSubject, createChapter } from "@/features/subjects/api/subjectApis";

// Stable empty array — reused as the fallback so selectors never return
// a new reference when a key is missing from chaptersBySubject.
const EMPTY_CHAPTERS = [];

const useSubjectStore = create((set, get) => ({
  // ── Subject list ──────────────────────────────────────────────
  subjects: [],
  subjectsLoading: false,
  subjectsError: null,

  fetchSubjects: async () => {
    if (get().subjects.length > 0) return; // already cached
    set({ subjectsLoading: true, subjectsError: null });
    try {
      const subjects = await getSubjects();
      set({ subjects, subjectsLoading: false });
    } catch (err) {
      set({ subjectsError: err.message, subjectsLoading: false });
    }
  },

  refetchSubjects: async () => {
    set({ subjectsLoading: true, subjectsError: null });
    try {
      const subjects = await getSubjects();
      set({ subjects, subjectsLoading: false });
    } catch (err) {
      set({ subjectsError: err.message, subjectsLoading: false });
    }
  },

  createSubject: async (payload) => {
    const result = await createSubject(payload);
    // API only returns { id }, so refetch the full list to get complete data
    const subjects = await getSubjects();
    set({ subjects });
    return result;
  },

  updateSubject: async (subjectId, payload) => {
    const result = await updateSubject(subjectId, payload);
    // Refetch subjects to keep the list in sync
    const subjects = await getSubjects();
    set({ subjects });
    return result;
  },

  // ── Chapters (keyed by subjectId) ─────────────────────────────
  /** { [subjectId]: Chapter[] } */
  chaptersBySubject: {},
  chaptersLoading: false,
  chaptersError: null,

  /** Returns the stable EMPTY_CHAPTERS constant when key is absent. */
  getChaptersFor: (subjectId) =>
    get().chaptersBySubject[subjectId] ?? EMPTY_CHAPTERS,

  fetchChapters: async (subjectId) => {
    if (get().chaptersBySubject[subjectId]) return; // already cached
    set({ chaptersLoading: true, chaptersError: null });
    try {
      const chapters = await getChapters(subjectId);
      set((state) => ({
        chaptersBySubject: { ...state.chaptersBySubject, [subjectId]: chapters },
        chaptersLoading: false,
      }));
    } catch (err) {
      set({ chaptersError: err.message, chaptersLoading: false });
    }
  },

  refetchChapters: async (subjectId) => {
    set({ chaptersLoading: true, chaptersError: null });
    try {
      const chapters = await getChapters(subjectId);
      set((state) => ({
        chaptersBySubject: { ...state.chaptersBySubject, [subjectId]: chapters },
        chaptersLoading: false,
      }));
    } catch (err) {
      set({ chaptersError: err.message, chaptersLoading: false });
    }
  },

  createChapter: async (subjectId, payload) => {
    const result = await createChapter(subjectId, payload);
    // Refetch chapters to keep the list in sync
    const chapters = await getChapters(subjectId);
    set((state) => ({
      chaptersBySubject: { ...state.chaptersBySubject, [subjectId]: chapters },
    }));
    return result;
  },

  // ── Helpers ───────────────────────────────────────────────────
  clearSubjects: () => set({ subjects: [], subjectsError: null }),
  clearChapters: () => set({ chaptersBySubject: {}, chaptersError: null }),
}));

export default useSubjectStore;
