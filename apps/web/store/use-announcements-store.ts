import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Announcement } from "@/types/cms";

interface AnnouncementStoreState {
  announcements: Announcement[];
  setAnnouncements: (announcements: Announcement[]) => void;
  addAnnouncement: (announcement: Announcement) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  getActiveAnnouncements: () => Announcement[];
}

export const useAnnouncementStore = create<AnnouncementStoreState>()(
  persist(
    (set, get) => ({
      announcements: [],

      setAnnouncements: (announcements) => set({ announcements }),
      addAnnouncement: (announcement) =>
        set((state) => ({ announcements: [...state.announcements, announcement] })),
      updateAnnouncement: (id, updates) =>
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),
      deleteAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        })),

      getActiveAnnouncements: () => {
        const now = new Date().toISOString();
        return get().announcements.filter(
          (a) =>
            a.status === "active" &&
            (!a.startAt || a.startAt <= now) &&
            (!a.endAt || a.endAt >= now)
        );
      },
    }),
    { name: "buildagent-announcements" }
  )
);
