"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { marketingService } from "@/services/marketing.service";

interface MarketingState {
  campaigns: any[];
  posts: any[];
  scripts: any[];
  keywords: any[];
  competitors: any[];
  isGenerating: boolean;
  isFetching: boolean;
  fetchCampaigns: () => Promise<void>;
  createCampaign: (data: any) => Promise<any>;
  generateSocial: (platform: string, topic: string, tone?: string) => Promise<any>;
  generateVideo: (platform: string, topic: string, duration?: number, product?: any) => Promise<any>;
  discoverKeywords: (seed: string) => Promise<void>;
  analyzeCompetitor: (domain: string) => Promise<void>;
}

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      posts: [],
      scripts: [],
      keywords: [],
      competitors: [],
      isGenerating: false,
      isFetching: false,

      fetchCampaigns: async () => {
        set({ isFetching: true });
        try {
          const result = await marketingService.getCampaigns();
          set({ campaigns: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createCampaign: async (data) => {
        set({ isFetching: true });
        try {
          const result = await marketingService.createCampaign(data);
          set((state) => ({ campaigns: [...state.campaigns, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      generateSocial: async (platform, topic, tone) => {
        set({ isGenerating: true });
        try {
          const result = await marketingService.generateSocial(platform, topic, tone);
          set((state) => ({ posts: [...state.posts, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      generateVideo: async (platform, topic, duration, product) => {
        set({ isGenerating: true });
        try {
          const result = await marketingService.generateVideoScript(platform, topic, duration, product);
          set((state) => ({ scripts: [...state.scripts, result.data], isGenerating: false }));
          return result.data;
        } catch (error) {
          set({ isGenerating: false });
          throw error;
        }
      },

      discoverKeywords: async (seed) => {
        set({ isFetching: true });
        try {
          const result = await marketingService.discoverKeywords(seed);
          set({ keywords: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      analyzeCompetitor: async (domain) => {
        set({ isFetching: true });
        try {
          const result = await marketingService.analyzeCompetitor(domain);
          set({ competitors: [...get().competitors, result.data], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },
    }),
    { name: "buildagent-marketing" }
  )
);