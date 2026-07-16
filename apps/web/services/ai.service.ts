import { apiClient } from "./api/client";

export const aiService = {
  generate: async (data: { messages: Array<{role: string, content: string}>, tier?: string, taskType?: string }) => {
    const res = await apiClient.post("/api/ai/generate", data);
    return res.data;
  },
  classify: async (prompt: string, context?: string) => {
    const res = await apiClient.post("/api/ai/classify", { prompt, context });
    return res.data;
  },
  estimateCost: async (model: string, prompt: string, tier: string) => {
    const res = await apiClient.post("/api/ai/estimate-cost", { model, prompt, tier });
    return res.data;
  },
  selectModel: async (taskType: string, tier: string) => {
    const res = await apiClient.post("/api/ai/select-model", { taskType, tier });
    return res.data;
  },
  compare: async (messages: any[], models: string[]) => {
    const res = await apiClient.post("/api/ai/compare", { messages, models });
    return res.data;
  },
  getHealth: async () => {
    const res = await apiClient.get("/api/ai/health");
    return res.data;
  },
  getProviders: async () => {
    const res = await apiClient.get("/api/ai/providers");
    return res.data;
  },
  getFreeModels: async () => {
    const res = await apiClient.get("/api/ai/free-models");
    return res.data;
  },
};