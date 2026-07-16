import { apiClient } from "./api/client";

export const seoService = {
  analyze: async (url: string, content: string) => {
    const res = await apiClient.post("/api/seo/analyze", { url, content });
    return res.data;
  },
  generateMeta: async (title: string, description: string, keywords: string[]) => {
    const res = await apiClient.post("/api/seo/generate-meta", { title, description, keywords });
    return res.data;
  },
  generateSchema: async (type: string, data: any) => {
    const res = await apiClient.post("/api/seo/generate-schema", { type, data });
    return res.data;
  },
  getPages: async () => {
    const res = await apiClient.post("/api/seo/pages", {});
    return res.data;
  },
  createPage: async (data: any) => {
    const res = await apiClient.post("/api/seo/pages", { ...data, action: "create" });
    return res.data;
  },
  getRedirects: async () => {
    const res = await apiClient.post("/api/seo/redirects", {});
    return res.data;
  },
  createRedirect: async (from: string, to: string, statusCode?: number) => {
    const res = await apiClient.post("/api/seo/redirects", { action: "create", from, to, statusCode });
    return res.data;
  },
  checkBrokenLinks: async () => {
    const res = await apiClient.get("/api/seo/broken-links");
    return res.data;
  },
};

export const geoService = {
  getEntities: async () => {
    const res = await apiClient.post("/api/geo/entities", {});
    return res.data;
  },
  createEntity: async (data: any) => {
    const res = await apiClient.post("/api/geo/entities", { ...data, action: "create" });
    return res.data;
  },
  buildKnowledgeGraph: async (name: string, description: string, entities: any[]) => {
    const res = await apiClient.post("/api/geo/knowledge-graph", { name, description, entities });
    return res.data;
  },
  optimizeForAI: async (content: string) => {
    const res = await apiClient.post("/api/geo/optimize", { content });
    return res.data;
  },
};

export const aeoService = {
  generateFAQs: async (topic: string) => {
    const res = await apiClient.post("/api/aeo/faqs", { topic });
    return res.data;
  },
  generateAnswer: async (question: string) => {
    const res = await apiClient.post("/api/aeo/answer", { question });
    return res.data;
  },
  generateHowTo: async (topic: string, steps: string[]) => {
    const res = await apiClient.post("/api/aeo/how-to", { topic, steps });
    return res.data;
  },
  optimizeSnippet: async (content: string) => {
    const res = await apiClient.post("/api/aeo/featured-snippet", { content });
    return res.data;
  },
};

export const contentService = {
  generateLandingPage: async (data: any) => {
    const res = await apiClient.post("/api/content/landing-page", data);
    return res.data;
  },
  generateBlogPost: async (topic: string, keywords: string[]) => {
    const res = await apiClient.post("/api/content/blog-post", { topic, keywords });
    return res.data;
  },
  generateArticle: async (topic: string, outline: string[]) => {
    const res = await apiClient.post("/api/content/article", { topic, outline });
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
};