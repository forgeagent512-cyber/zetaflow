import { apiClient } from "./api/client";

export const backupsService = {
  getAll: async () => {
    const res = await apiClient.get("/api/backups");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/api/backups/${id}`);
    return res.data;
  },
  create: async (type?: string) => {
    const res = await apiClient.post("/api/backups", { type });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/backups/${id}`);
    return res.data;
  },
  restore: async (id: string) => {
    const res = await apiClient.post(`/api/backups/${id}/restore`);
    return res.data;
  },
};
