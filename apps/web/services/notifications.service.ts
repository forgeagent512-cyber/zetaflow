import { apiClient } from "./api/client";

export const notificationsService = {
  getAll: async () => {
    const res = await apiClient.get("/api/notifications");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/api/notifications/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/api/notifications", data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/notifications/${id}`);
    return res.data;
  },
  markRead: async (id: string) => {
    const res = await apiClient.post(`/api/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.post("/api/notifications/read-all");
    return res.data;
  },
  getSettings: async () => {
    const res = await apiClient.get("/api/notifications/settings");
    return res.data;
  },
  updateSettings: async (settings: any) => {
    const res = await apiClient.put("/api/notifications/settings", settings);
    return res.data;
  },
};
