import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaItem, MediaFolder } from "@/types/cms";

interface MediaLibraryState {
  items: MediaItem[];
  folders: MediaFolder[];
  selectedFolder: string | null;
  selectedItems: string[];
  viewMode: "grid" | "list";
  searchQuery: string;
  setItems: (items: MediaItem[]) => void;
  addItem: (item: MediaItem) => void;
  updateItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteItem: (id: string) => void;
  deleteItems: (ids: string[]) => void;
  setFolders: (folders: MediaFolder[]) => void;
  addFolder: (folder: MediaFolder) => void;
  setSelectedFolder: (id: string | null) => void;
  setSelectedItems: (ids: string[]) => void;
  toggleItemSelection: (id: string) => void;
  clearSelection: () => void;
  setViewMode: (mode: "grid" | "list") => void;
  setSearchQuery: (query: string) => void;
  getFilteredItems: () => MediaItem[];
}

export const useMediaLibrary = create<MediaLibraryState>()(
  persist(
    (set, get) => ({
      items: [],
      folders: [{ id: "root", name: "Root", parentId: null, children: [] }],
      selectedFolder: null,
      selectedItems: [],
      viewMode: "grid",
      searchQuery: "",

      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          selectedItems: state.selectedItems.filter((si) => si !== id),
        })),
      deleteItems: (ids) =>
        set((state) => ({
          items: state.items.filter((i) => !ids.includes(i.id)),
          selectedItems: [],
        })),
      setFolders: (folders) => set({ folders }),
      addFolder: (folder) =>
        set((state) => ({ folders: [...state.folders, folder] })),
      setSelectedFolder: (id) => set({ selectedFolder: id }),
      setSelectedItems: (ids) => set({ selectedItems: ids }),
      toggleItemSelection: (id) =>
        set((state) => ({
          selectedItems: state.selectedItems.includes(id)
            ? state.selectedItems.filter((si) => si !== id)
            : [...state.selectedItems, id],
        })),
      clearSelection: () => set({ selectedItems: [] }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      getFilteredItems: () => {
        const { items, selectedFolder, searchQuery } = get();
        let filtered = selectedFolder
          ? items.filter((i) => i.folder === selectedFolder)
          : items;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return filtered;
      },
    }),
    { name: "buildagent-media-library" }
  )
);
