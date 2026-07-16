"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { aeoService } from "@/services/aeo.service";

interface AEOState {
  faqs: any[];
  howToContent: any[];
  answers: any[];
  isGenerating: boolean;
  isFetching: boolean;
  fetchFAQs: () => Promise<void>;
  generateFAQs: (topic: string) => Promise<any>;
  updateFAQ: (id: string, data: any) => Promise<any>;
  deleteFAQ: (id: string) => Promise<void>;
  generateAnswer: (question: string, context?: string) => Promise<any>;
  generateHowTo: (topic: string, steps: string[]) => Promise<any>;
  generateComparison: (items: string[], criteria: string[]) => Promise<any>;
  generateGlossary: (terms: string[]) => Promise<any>;
  optimizeSnippet: (content: string) => Promise<any>;
}

export const useAEOStore = create<AEOState>()(
  persist(
    (set, get) => ({
      faqs: [],
      howToContent: [],
      answers: [],
      isGenerating: false,
      isFetching: false,

      fetchFAQs: async () => {
        set({ isFetching: true });
        try {
          const result = await aeoService.getFAQs();
          set({ faqs: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      generateFAQs: async (topic) => {
        set({ isGenerating: true });
        try {
          const result = await aeoService.generateFAQs(topic);
          set((state) => ({ faqs: [...state.faqs, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      updateFAQ: async (id, data) => {
        try {
          const result = await aeoService.updateFAQ(id, data);
          set((state) => ({
            faqs: state.faqs.map((f) => (f.id === id ? { ...f, ...result.data } : f)),
          }));
          return result.data;
        } catch (error) {
          throw error;
        }
      },

      deleteFAQ: async (id) => {
        try {
          await aeoService.deleteFAQ(id);
          set((state) => ({ faqs: state.faqs.filter((f) => f.id !== id) }));
        } catch {}
      },

      generateAnswer: async (question, context) => {
        set({ isGenerating: true });
        try {
          const result = await aeoService.generateAnswer(question, context);
          set((state) => ({ answers: [...state.answers, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateHowTo: async (topic, steps) => {
        set({ isGenerating: true });
        try {
          const result = await aeoService.generateHowTo(topic, steps);
          set((state) => ({ howToContent: [...state.howToContent, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateComparison: async (items, criteria) => {
        set({ isGenerating: true });
        try {
          const result = await aeoService.generateComparison(items, criteria);
          set({ isGenerating: false });
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateGlossary: async (terms) => {
        set({ isGenerating: true });
        try {
          const result = await aeoService.generateGlossary(terms);
          set({ isGenerating: false });
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      optimizeSnippet: async (content) => {
        set({ isGenerating: true });
        try {
          const result = await aeoService.optimizeSnippet(content);
          set({ isGenerating: false });
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },
    }),
    { name: "buildagent-aeo-store" }
  )
);
