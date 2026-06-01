import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultNotebooks = [
  {
    id: 1,
    title: "Vietnam Post-Revolution History...",
    date: "May 20, 2026",
    sources: "1 source",
    pinned: false,
    subjectId: "VNR202", // which subject this chat belongs to
  },
];

export const useNotebookStore = create(
  persist(
    (set, get) => ({
      notebooks: defaultNotebooks,
      activeNotebookId: null,

      addNotebook: (notebook) =>
        set((state) => ({ notebooks: [notebook, ...state.notebooks] })),

      deleteNotebook: (id) =>
        set((state) => ({
          notebooks: state.notebooks.filter((nb) => nb.id !== id),
        })),

      togglePin: (id) =>
        set((state) => ({
          notebooks: state.notebooks.map((nb) =>
            nb.id === id ? { ...nb, pinned: !nb.pinned } : nb
          ),
        })),

      renameNotebook: (id, title) =>
        set((state) => ({
          notebooks: state.notebooks.map((nb) =>
            nb.id === id ? { ...nb, title } : nb
          ),
        })),

      setActiveNotebook: (id) => set({ activeNotebookId: id }),

      getActiveNotebook: () => {
        const { notebooks, activeNotebookId } = get();
        return notebooks.find((nb) => nb.id === activeNotebookId) ?? null;
      },
    }),
    {
      name: "notebooks-storage",
    }
  )
);
