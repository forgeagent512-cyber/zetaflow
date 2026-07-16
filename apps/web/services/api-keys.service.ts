import { apiClient } from "./api/client";

export const apiKeysService = {
  getAll: async () => {
    const res = await apiClient.get("/api/api-keys");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/api/api-keys/${id}`);
    return res.data;
  },
  create: async (data: { name: string; permissions?: string[] }) => {
    const res = await apiClient.post("/api/api-keys", data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/api-keys/${id}`);
    return res.data;
  },
  rotate: async (id: string) => {
    const res = await apiClient.post(`/api/api-keys/${id}/rotate`);
    return res.data;
  },
  getUsage: async (id: string) => {
    const res = await apiClient.get(`/api/api-keys/${id}/usage`);
    return res.data;
  },
};
