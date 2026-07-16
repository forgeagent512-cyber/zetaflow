import { apiClient } from "./api/client";

export const geoService = {
  getEntities: async () => {
    const res = await apiClient.get("/api/geo/entities");
    return res.data;
  },
  getEntity: async (id: string) => {
    const res = await apiClient.get(`/api/geo/entities/${id}`);
    return res.data;
  },
  createEntity: async (data: any) => {
    const res = await apiClient.post("/api/geo/entities", { ...data, action: "create" });
    return res.data;
  },
  updateEntity: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/geo/entities/${id}`, data);
    return res.data;
  },
  deleteEntity: async (id: string) => {
    const res = await apiClient.delete(`/api/geo/entities/${id}`);
    return res.data;
  },
  buildKnowledgeGraph: async (name: string, description: string, entities: any[]) => {
    const res = await apiClient.post("/api/geo/knowledge-graph", { name, description, entities });
    return res.data;
  },
  getKnowledgeGraph: async (id: string) => {
    const res = await apiClient.get(`/api/geo/knowledge-graph/${id}`);
    return res.data;
  },
  optimizeForAI: async (content: string) => {
    const res = await apiClient.post("/api/geo/optimize", { content });
    return res.data;
  },
  getEntityPages: async (entityId: string) => {
    const res = await apiClient.get(`/api/geo/entities/${entityId}/pages`);
    return res.data;
  },
  getTopicClusters: async () => {
    const res = await apiClient.get("/api/geo/topic-clusters");
    return res.data;
  },
  createTopicCluster: async (data: any) => {
    const res = await apiClient.post("/api/geo/topic-clusters", { ...data, action: "create" });
    return res.data;
  },
};
