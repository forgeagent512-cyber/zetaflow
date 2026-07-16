import { apiClient } from "./api/client";

export const organizationsService = {
  getAll: async () => {
    const res = await apiClient.get("/api/organizations");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/api/organizations/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/api/organizations", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/organizations/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/organizations/${id}`);
    return res.data;
  },
  getUsers: async (id: string) => {
    const res = await apiClient.get(`/api/organizations/${id}/users`);
    return res.data;
  },
  addUser: async (id: string, userId: string, role: string) => {
    const res = await apiClient.post(`/api/organizations/${id}/users`, { userId, role });
    return res.data;
  },
  removeUser: async (id: string, userId: string) => {
    const res = await apiClient.delete(`/api/organizations/${id}/users/${userId}`);
    return res.data;
  },
  getUsage: async (id: string) => {
    const res = await apiClient.get(`/api/organizations/${id}/usage`);
    return res.data;
  },
  getBilling: async (id: string) => {
    const res = await apiClient.get(`/api/organizations/${id}/billing`);
    return res.data;
  },
};
