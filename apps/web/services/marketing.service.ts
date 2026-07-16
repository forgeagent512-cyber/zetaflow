import { apiClient } from "./api/client";

export const marketingService = {
  getCampaigns: async () => {
    const res = await apiClient.post("/api/marketing/campaigns", {});
    return res.data;
  },
  createCampaign: async (data: any) => {
    const res = await apiClient.post("/api/marketing/campaigns", { ...data, action: "create" });
    return res.data;
  },
  generateEmail: async (data: any) => {
    const res = await apiClient.post("/api/marketing/email", data);
    return res.data;
  },
  generateSocial: async (platform: string, topic: string, tone?: string) => {
    const res = await apiClient.post("/api/marketing/social", { platform, topic, tone });
    return res.data;
  },
  generateVideoScript: async (platform: string, topic: string, duration?: number, product?: any) => {
    const res = await apiClient.post("/api/marketing/video-script", { platform, topic, duration, product });
    return res.data;
  },
  discoverKeywords: async (seed: string) => {
    const res = await apiClient.post("/api/marketing/keywords", { action: "discover", seed });
    return res.data;
  },
  analyzeCompetitor: async (domain: string) => {
    const res = await apiClient.post("/api/marketing/competitors", { action: "analyze", domain });
    return res.data;
  },
};