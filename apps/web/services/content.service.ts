import { apiClient } from "./api/client";

export const contentService = {
  generateLandingPage: async (data: any) => {
    const res = await apiClient.post("/api/content/landing-page", data);
    return res.data;
  },
  generateBlogPost: async (topic: string, keywords: string[], options?: any) => {
    const res = await apiClient.post("/api/content/blog-post", { topic, keywords, options });
    return res.data;
  },
  generateArticle: async (topic: string, outline: string[], options?: any) => {
    const res = await apiClient.post("/api/content/article", { topic, outline, options });
    return res.data;
  },
  generateCaseStudy: async (data: any) => {
    const res = await apiClient.post("/api/content/case-study", data);
    return res.data;
  },
  generateEmail: async (data: any) => {
    const res = await apiClient.post("/api/content/email", data);
    return res.data;
  },
  generateSalesPage: async (data: any) => {
    const res = await apiClient.post("/api/content/sales-page", data);
    return res.data;
  },
  generateWhitepaper: async (data: any) => {
    const res = await apiClient.post("/api/content/whitepaper", data);
    return res.data;
  },
};
