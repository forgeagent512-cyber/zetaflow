import { apiClient } from "./api/client";

export const featureFlagsService = {
  getAll: async () => {
    const res = await apiClient.get("/api/feature-flags");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/api/feature-flags/${id}`);
    return res.data;
  },
  create: async (data: { name: string; description?: string; enabled?: boolean }) => {
    const res = await apiClient.post("/api/feature-flags", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/feature-flags/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/feature-flags/${id}`);
    return res.data;
  },
  enable: async (id: string) => {
    const res = await apiClient.post(`/api/feature-flags/${id}/enable`);
    return res.data;
  },
  disable: async (id: string) => {
    const res = await apiClient.post(`/api/feature-flags/${id}/disable`);
    return res.data;
  },
};
