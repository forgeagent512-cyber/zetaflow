import { apiClient } from "./api/client";

export const aeoService = {
  generateFAQs: async (topic: string) => {
    const res = await apiClient.post("/api/aeo/faqs", { topic });
    return res.data;
  },
  getFAQs: async () => {
    const res = await apiClient.get("/api/aeo/faqs");
    return res.data;
  },
  updateFAQ: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/aeo/faqs/${id}`, data);
    return res.data;
  },
  deleteFAQ: async (id: string) => {
    const res = await apiClient.delete(`/api/aeo/faqs/${id}`);
    return res.data;
  },
  generateAnswer: async (question: string, context?: string) => {
    const res = await apiClient.post("/api/aeo/answer", { question, context });
    return res.data;
  },
  generateHowTo: async (topic: string, steps: string[]) => {
    const res = await apiClient.post("/api/aeo/how-to", { topic, steps });
    return res.data;
  },
  getHowTo: async (id: string) => {
    const res = await apiClient.get(`/api/aeo/how-to/${id}`);
    return res.data;
  },
  generateComparison: async (items: string[], criteria: string[]) => {
    const res = await apiClient.post("/api/aeo/comparison", { items, criteria });
    return res.data;
  },
  generateGlossary: async (terms: string[]) => {
    const res = await apiClient.post("/api/aeo/glossary", { terms });
    return res.data;
  },
  optimizeSnippet: async (content: string) => {
    const res = await apiClient.post("/api/aeo/featured-snippet", { content });
    return res.data;
  },
};
