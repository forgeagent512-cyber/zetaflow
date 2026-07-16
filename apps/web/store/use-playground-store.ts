"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { playgroundService } from "@/services/playground.service";

interface PlaygroundState {
  sessions: any[];
  currentSession: any | null;
  compareResults: any[];
  isGenerating: boolean;
  isFetching: boolean;
  fetchSessions: () => Promise<void>;
  fetchSession: (id: string) => Promise<void>;
  saveSession: (data: any) => Promise<any>;
  deleteSession: (id: string) => Promise<void>;
  generate: (data: any) => Promise<any>;
  compare: (prompt: string, models: any[]) => Promise<any>;
}

export const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      compareResults: [],
      isGenerating: false,
      isFetching: false,

      fetchSessions: async () => {
        set({ isFetching: true });
        try {
          const result = await playgroundService.getSessions();
          set({ sessions: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      fetchSession: async (id) => {
        set({ isFetching: true });
        try {
          const result = await playgroundService.getSession(id);
          set({ currentSession: result.data ?? null, isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      saveSession: async (data) => {
        set({ isFetching: true });
        try {
          const result = await playgroundService.saveSession(data);
          set((state) => ({ sessions: [...state.sessions, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      deleteSession: async (id) => {
        try {
          await playgroundService.deleteSession(id);
          set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
        } catch {}
      },

      generate: async (data) => {
        set({ isGenerating: true });
        try {
          const result = await playgroundService.generate(data);
          set({ isGenerating: false });
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      compare: async (prompt, models) => {
        set({ isGenerating: true });
        try {
          const result = await playgroundService.compare(prompt, models);
          set({ compareResults: result.data ?? [], isGenerating: false });
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },
    }),
    { name: "buildagent-playground-store" }
  )
);
