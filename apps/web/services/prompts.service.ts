import { apiClient } from "./api/client";

export const promptsService = {
  getAll: async (filters?: { category?: string; tags?: string[] }) => {
    const res = await apiClient.post("/api/prompts", { filters });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/api/prompts/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/api/prompts", { ...data, action: "create" });
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/prompts/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/prompts/${id}`);
    return res.data;
  },
  getVersions: async (id: string) => {
    const res = await apiClient.get(`/api/prompts/${id}/versions`);
    return res.data;
  },
  createVersion: async (id: string, data: any) => {
    const res = await apiClient.post(`/api/prompts/${id}/versions`, data);
    return res.data;
  },
  rollbackVersion: async (id: string, versionId: string) => {
    const res = await apiClient.post(`/api/prompts/${id}/versions/${versionId}/rollback`);
    return res.data;
  },
  test: async (id: string, variables?: Record<string, any>) => {
    const res = await apiClient.post(`/api/prompts/${id}/test`, { variables });
    return res.data;
  },
};
