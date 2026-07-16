import { apiClient } from "./api/client";

export const playgroundService = {
  generate: async (data: any) => {
    const res = await apiClient.post("/api/playground/generate", data);
    return res.data;
  },
  compare: async (prompt: string, models: any[]) => {
    const res = await apiClient.post("/api/playground/compare", { prompt, models });
    return res.data;
  },
  getSessions: async () => {
    const res = await apiClient.get("/api/playground/sessions");
    return res.data;
  },
  saveSession: async (data: any) => {
    const res = await apiClient.post("/api/playground/sessions", data);
    return res.data;
  },
  getSession: async (id: string) => {
    const res = await apiClient.get(`/api/playground/sessions/${id}`);
    return res.data;
  },
  deleteSession: async (id: string) => {
    const res = await apiClient.delete(`/api/playground/sessions/${id}`);
    return res.data;
  },
};