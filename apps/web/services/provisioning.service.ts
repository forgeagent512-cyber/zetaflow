import { apiClient } from "./api/client";

export const provisioningService = {
  provision: async (data: { plan: string; region?: string; resources?: any }) => {
    const res = await apiClient.post("/api/provisioning/provision", data);
    return res.data;
  },
  getStatus: async (id: string) => {
    const res = await apiClient.get(`/api/provisioning/${id}/status`);
    return res.data;
  },
  getJobs: async () => {
    const res = await apiClient.get("/api/provisioning/jobs");
    return res.data;
  },
  cancelJob: async (id: string) => {
    const res = await apiClient.post(`/api/provisioning/${id}/cancel`);
    return res.data;
  },
};
