"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { notificationsService } from "@/services/notifications.service";

interface NotificationState {
  notifications: any[];
  unreadCount: number;
  isFetching: boolean;
  fetchNotifications: () => Promise<void>;
  createNotification: (data: any) => Promise<any>;
  deleteNotification: (id: string) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isFetching: false,

      fetchNotifications: async () => {
        set({ isFetching: true });
        try {
          const result = await notificationsService.getAll();
          const list = result.data ?? [];
          set({
            notifications: list,
            unreadCount: list.filter((n: any) => !n.read).length,
            isFetching: false,
          });
        } catch {
          set({ isFetching: false });
        }
      },

      createNotification: async (data) => {
        try {
          const result = await notificationsService.create(data);
          set((state) => ({
            notifications: [result.data, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
          return result.data;
        } catch (error) {
          throw error;
        }
      },

      deleteNotification: async (id) => {
        try {
          await notificationsService.delete(id);
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: state.notifications.filter((n) => n.id !== id && !n.read).length,
          }));
        } catch {}
      },

      markRead: async (id) => {
        try {
          await notificationsService.markRead(id);
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        } catch {}
      },

      markAllRead: async () => {
        try {
          await notificationsService.markAllRead();
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }));
        } catch {}
      },
    }),
    { name: "buildagent-notification-store" }
  )
);
