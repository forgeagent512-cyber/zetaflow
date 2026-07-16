import { apiClient } from "./api/client";

export const credentialsService = {
  getAll: async () => {
    const res = await apiClient.get("/api/credentials");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/api/credentials/${id}`);
    return res.data;
  },
  create: async (data: { name: string; type: string; value: string }) => {
    const res = await apiClient.post("/api/credentials", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/credentials/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/credentials/${id}`);
    return res.data;
  },
  rotate: async (id: string) => {
    const res = await apiClient.post(`/api/credentials/${id}/rotate`);
    return res.data;
  },
};
