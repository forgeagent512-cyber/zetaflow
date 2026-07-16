import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DocPage, DocCategory, DocVersion } from "@/types/cms";

interface DocsStoreState {
  pages: DocPage[];
  categories: DocCategory[];
  selectedPageId: string | null;
  setPages: (pages: DocPage[]) => void;
  addPage: (page: DocPage) => void;
  updatePage: (id: string, updates: Partial<DocPage>) => void;
  deletePage: (id: string) => void;
  setSelectedPage: (id: string | null) => void;
  addVersion: (pageId: string, version: DocVersion) => void;
  setCategories: (categories: DocCategory[]) => void;
  addCategory: (category: DocCategory) => void;
  updateCategory: (id: string, updates: Partial<DocCategory>) => void;
  deleteCategory: (id: string) => void;
}

export const useDocsStore = create<DocsStoreState>()(
  persist(
    (set) => ({
      pages: [],
      categories: [],
      selectedPageId: null,

      setPages: (pages) => set({ pages }),
      addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),
      updatePage: (id, updates) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deletePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
        })),
      setSelectedPage: (id) => set({ selectedPageId: id }),

      addVersion: (pageId, version) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === pageId
              ? { ...p, versionHistory: [...(p.versionHistory || []), version] }
              : p
          ),
        })),

      setCategories: (categories) => set({ categories }),
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    { name: "buildagent-docs-store" }
  )
);
