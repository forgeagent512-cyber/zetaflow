"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { featureFlagsService } from "@/services/feature-flags.service";

interface FeatureFlagState {
  flags: any[];
  isFetching: boolean;
  fetchFlags: () => Promise<void>;
  createFlag: (data: { name: string; description?: string; enabled?: boolean }) => Promise<any>;
  updateFlag: (id: string, data: any) => Promise<any>;
  deleteFlag: (id: string) => Promise<void>;
  enableFlag: (id: string) => Promise<void>;
  disableFlag: (id: string) => Promise<void>;
}

export const useFeatureFlagStore = create<FeatureFlagState>()(
  persist(
    (set, get) => ({
      flags: [],
      isFetching: false,

      fetchFlags: async () => {
        set({ isFetching: true });
        try {
          const result = await featureFlagsService.getAll();
          set({ flags: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createFlag: async (data) => {
        set({ isFetching: true });
        try {
          const result = await featureFlagsService.create(data);
          set((state) => ({ flags: [...state.flags, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      updateFlag: async (id, data) => {
        set({ isFetching: true });
        try {
          const result = await featureFlagsService.update(id, data);
          set((state) => ({
            flags: state.flags.map((f) => (f.id === id ? { ...f, ...result.data } : f)),
            isFetching: false,
          }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      deleteFlag: async (id) => {
        try {
          await featureFlagsService.delete(id);
          set((state) => ({ flags: state.flags.filter((f) => f.id !== id) }));
        } catch {}
      },

      enableFlag: async (id) => {
        try {
          await featureFlagsService.enable(id);
          set((state) => ({
            flags: state.flags.map((f) => (f.id === id ? { ...f, enabled: true } : f)),
          }));
        } catch {}
      },

      disableFlag: async (id) => {
        try {
          await featureFlagsService.disable(id);
          set((state) => ({
            flags: state.flags.map((f) => (f.id === id ? { ...f, enabled: false } : f)),
          }));
        } catch {}
      },
    }),
    { name: "buildagent-feature-flag-store" }
  )
);
