"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { contentService } from "@/services/content.service";

interface ContentState {
  generatedContent: any[];
  isGenerating: boolean;
  generateLandingPage: (data: any) => Promise<any>;
  generateBlogPost: (topic: string, keywords: string[], options?: any) => Promise<any>;
  generateArticle: (topic: string, outline: string[], options?: any) => Promise<any>;
  generateCaseStudy: (data: any) => Promise<any>;
  generateEmail: (data: any) => Promise<any>;
  generateSalesPage: (data: any) => Promise<any>;
  generateWhitepaper: (data: any) => Promise<any>;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      generatedContent: [],
      isGenerating: false,

      generateLandingPage: async (data) => {
        set({ isGenerating: true });
        try {
          const result = await contentService.generateLandingPage(data);
          set((state) => ({ generatedContent: [...state.generatedContent, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateBlogPost: async (topic, keywords, options) => {
        set({ isGenerating: true });
        try {
          const result = await contentService.generateBlogPost(topic, keywords, options);
          set((state) => ({ generatedContent: [...state.generatedContent, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateArticle: async (topic, outline, options) => {
        set({ isGenerating: true });
        try {
          const result = await contentService.generateArticle(topic, outline, options);
          set((state) => ({ generatedContent: [...state.generatedContent, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateCaseStudy: async (data) => {
        set({ isGenerating: true });
        try {
          const result = await contentService.generateCaseStudy(data);
          set((state) => ({ generatedContent: [...state.generatedContent, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateEmail: async (data) => {
        set({ isGenerating: true });
        try {
          const result = await contentService.generateEmail(data);
          set((state) => ({ generatedContent: [...state.generatedContent, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateSalesPage: async (data) => {
        set({ isGenerating: true });
        try {
          const result = await contentService.generateSalesPage(data);
          set((state) => ({ generatedContent: [...state.generatedContent, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateWhitepaper: async (data) => {
        set({ isGenerating: true });
        try {
          const result = await contentService.generateWhitepaper(data);
          set((state) => ({ generatedContent: [...state.generatedContent, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },
    }),
    { name: "buildagent-content-store" }
  )
);
