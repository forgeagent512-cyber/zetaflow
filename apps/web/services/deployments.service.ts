import { apiClient } from "./api/client";

export const deploymentsService = {
  getAll: async () => {
    const res = await apiClient.get("/api/deployments");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/api/deployments/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/api/deployments", data);
    return res.data;
  },
  deployNow: async (id: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/deploy`);
    return res.data;
  },
  pause: async (id: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/pause`);
    return res.data;
  },
  resume: async (id: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/resume`);
    return res.data;
  },
  restart: async (id: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/restart`);
    return res.data;
  },
  rollback: async (id: string, version: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/rollback`, { version });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/deployments/${id}`);
    return res.data;
  },
  getLogs: async (id: string) => {
    const res = await apiClient.get(`/api/deployments/${id}/logs`);
    return res.data;
  },
  getDeploymentLogs: async (id: string) => {
    const res = await apiClient.get(`/api/deployments/${id}/logs`);
    return res.data;
  },
  getStatus: async (id: string) => {
    const res = await apiClient.get(`/api/deployments/${id}/status`);
    return res.data;
  },
};
