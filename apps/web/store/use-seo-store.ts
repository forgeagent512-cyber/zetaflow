"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seoService } from "@/services/seo.service";

interface SEOState {
  pages: any[];
  redirects: any[];
  brokenLinks: any[];
  seoScore: number | null;
  analysis: any | null;
  isAnalyzing: boolean;
  isFetching: boolean;
  fetchPages: () => Promise<void>;
  createPage: (data: any) => Promise<any>;
  fetchRedirects: () => Promise<void>;
  createRedirect: (from: string, to: string, statusCode?: number) => Promise<any>;
  checkBrokenLinks: () => Promise<void>;
  analyzePage: (url: string, content: string) => Promise<void>;
}

export const useSEOStore = create<SEOState>()(
  persist(
    (set, get) => ({
      pages: [],
      redirects: [],
      brokenLinks: [],
      seoScore: null,
      analysis: null,
      isAnalyzing: false,
      isFetching: false,

      fetchPages: async () => {
        set({ isFetching: true });
        try {
          const result = await seoService.getPages();
          set({ pages: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createPage: async (data) => {
        set({ isFetching: true });
        try {
          const result = await seoService.createPage(data);
          set((state) => ({ pages: [...state.pages, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      fetchRedirects: async () => {
        set({ isFetching: true });
        try {
          const result = await seoService.getRedirects();
          set({ redirects: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createRedirect: async (from, to, statusCode) => {
        set({ isFetching: true });
        try {
          const result = await seoService.createRedirect(from, to, statusCode);
          set((state) => ({ redirects: [...state.redirects, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      checkBrokenLinks: async () => {
        set({ isAnalyzing: true });
        try {
          const result = await seoService.checkBrokenLinks();
          set({ brokenLinks: result.data ?? [], isAnalyzing: false });
        } catch {
          set({ isAnalyzing: false });
        }
      },

      analyzePage: async (url, content) => {
        set({ isAnalyzing: true });
        try {
          const result = await seoService.analyze(url, content);
          set({ analysis: result.data, seoScore: result.data?.score ?? null, isAnalyzing: false });
        } catch (error) {
          set({ isAnalyzing: false });
          throw error;
        }
      },
    }),
    { name: "buildagent-seo" }
  )
);