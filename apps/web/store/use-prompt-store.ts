"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { promptsService } from "@/services/prompts.service";

interface PromptState {
  prompts: any[];
  currentPrompt: any | null;
  versions: any[];
  filters: { category?: string; tags?: string[] };
  isFetching: boolean;
  fetchPrompts: () => Promise<void>;
  fetchPrompt: (id: string) => Promise<void>;
  createPrompt: (data: any) => Promise<any>;
  updatePrompt: (id: string, data: any) => Promise<any>;
  deletePrompt: (id: string) => Promise<void>;
  fetchVersions: (id: string) => Promise<void>;
  testPrompt: (id: string, variables?: Record<string, any>) => Promise<any>;
  setFilters: (filters: { category?: string; tags?: string[] }) => void;
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      prompts: [],
      currentPrompt: null,
      versions: [],
      filters: {},
      isFetching: false,

      fetchPrompts: async () => {
        set({ isFetching: true });
        try {
          const result = await promptsService.getAll(get().filters);
          set({ prompts: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      fetchPrompt: async (id) => {
        set({ isFetching: true });
        try {
          const result = await promptsService.getById(id);
          set({ currentPrompt: result.data ?? null, isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createPrompt: async (data) => {
        set({ isFetching: true });
        try {
          const result = await promptsService.create(data);
          set((state) => ({ prompts: [...state.prompts, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      updatePrompt: async (id, data) => {
        set({ isFetching: true });
        try {
          const result = await promptsService.update(id, data);
          set((state) => ({
            prompts: state.prompts.map((p) => (p.id === id ? { ...p, ...result.data } : p)),
            currentPrompt: state.currentPrompt?.id === id ? { ...state.currentPrompt, ...result.data } : state.currentPrompt,
            isFetching: false,
          }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      deletePrompt: async (id) => {
        try {
          await promptsService.delete(id);
          set((state) => ({ prompts: state.prompts.filter((p) => p.id !== id) }));
        } catch {}
      },

      fetchVersions: async (id) => {
        set({ isFetching: true });
        try {
          const result = await promptsService.getVersions(id);
          set({ versions: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      testPrompt: async (id, variables) => {
        set({ isFetching: true });
        try {
          const result = await promptsService.test(id, variables);
          set({ isFetching: false });
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      setFilters: (filters) => set({ filters }),
    }),
    { name: "buildagent-prompt-store" }
  )
);
