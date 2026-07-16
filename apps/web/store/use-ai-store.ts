"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { aiService } from "@/services/ai.service";

interface AIState {
  selectedTier: string;
  selectedTaskType: string;
  selectedModel: string;
  isGenerating: boolean;
  isFetching: boolean;
  response: string;
  health: any[];
  providers: any[];
  freeModels: any[];
  compareResults: any[];
  setSelectedTier: (tier: string) => void;
  setSelectedTaskType: (taskType: string) => void;
  setSelectedModel: (model: string) => void;
  generate: (messages: any[], tier?: string, taskType?: string) => Promise<any>;
  classify: (prompt: string, context?: string) => Promise<any>;
  estimateCost: (model: string, prompt: string, tier: string) => Promise<any>;
  selectModel: (taskType: string, tier: string) => Promise<any>;
  compare: (messages: any[], models: string[]) => Promise<any>;
  fetchHealth: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  fetchFreeModels: () => Promise<void>;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      selectedTier: "economy",
      selectedTaskType: "writing",
      selectedModel: "",
      isGenerating: false,
      isFetching: false,
      response: "",
      health: [],
      providers: [],
      freeModels: [],
      compareResults: [],

      setSelectedTier: (tier) => set({ selectedTier: tier }),
      setSelectedTaskType: (taskType) => set({ selectedTaskType: taskType }),
      setSelectedModel: (model) => set({ selectedModel: model }),

      generate: async (messages, tier, taskType) => {
        set({ isGenerating: true });
        try {
          const result = await aiService.generate({
            messages,
            tier: tier ?? get().selectedTier,
            taskType: taskType ?? get().selectedTaskType,
          });
          set({ response: result.data?.content ?? JSON.stringify(result.data), isGenerating: false });
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      classify: async (prompt, context) => {
        set({ isGenerating: true });
        try {
          const result = await aiService.classify(prompt, context);
          set({ isGenerating: false });
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      estimateCost: async (model, prompt, tier) => {
        set({ isFetching: true });
        try {
          const result = await aiService.estimateCost(model, prompt, tier);
          set({ isFetching: false });
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      selectModel: async (taskType, tier) => {
        set({ isFetching: true });
        try {
          const result = await aiService.selectModel(taskType, tier);
          const model = result.data?.model ?? "";
          set({ selectedModel: model, isFetching: false });
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      compare: async (messages, models) => {
        set({ isGenerating: true });
        try {
          const result = await aiService.compare(messages, models);
          set({ compareResults: result.data ?? [], isGenerating: false });
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      fetchHealth: async () => {
        try {
          const result = await aiService.getHealth();
          set({ health: result.data ?? [] });
        } catch {}
      },

      fetchProviders: async () => {
        try {
          const result = await aiService.getProviders();
          set({ providers: result.data ?? [] });
        } catch {}
      },

      fetchFreeModels: async () => {
        try {
          const result = await aiService.getFreeModels();
          set({ freeModels: result.data ?? [] });
        } catch {}
      },
    }),
    { name: "buildagent-ai-store", partialize: (state) => ({ selectedTier: state.selectedTier, selectedTaskType: state.selectedTaskType, selectedModel: state.selectedModel }) }
  )
);