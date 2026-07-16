import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CMSPage, CMSVersion } from "@/types/cms";

interface CMSStoreState {
  pages: CMSPage[];
  versions: CMSVersion[];
  selectedPageId: string | null;
  isDirty: boolean;
  lastSaved: number | null;
  setPages: (pages: CMSPage[]) => void;
  addPage: (page: CMSPage) => void;
  updatePage: (id: string, updates: Partial<CMSPage>) => void;
  deletePage: (id: string) => void;
  setSelectedPage: (id: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setLastSaved: (timestamp: number) => void;
  addVersion: (version: CMSVersion) => void;
  getPageBySlug: (slug: string) => CMSPage | undefined;
}

export const useCMSStore = create<CMSStoreState>()(
  persist(
    (set, get) => ({
      pages: [],
      versions: [],
      selectedPageId: null,
      isDirty: false,
      lastSaved: null,

      setPages: (pages) => set({ pages }),
      addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),
      updatePage: (id, updates) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
          isDirty: true,
        })),
      deletePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
          selectedPageId: state.selectedPageId === id ? null : state.selectedPageId,
        })),
      setSelectedPage: (id) => set({ selectedPageId: id }),
      setIsDirty: (dirty) => set({ isDirty: dirty }),
      setLastSaved: (timestamp) => set({ lastSaved: timestamp, isDirty: false }),
      addVersion: (version) =>
        set((state) => ({ versions: [...state.versions, version] })),
      getPageBySlug: (slug) => get().pages.find((p) => p.slug === slug),
    }),
    { name: "buildagent-cms-pages" }
  )
);
