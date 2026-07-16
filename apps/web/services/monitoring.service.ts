import { apiClient } from "./api/client";

export const monitoringService = {
  getMetrics: async (type: string, period?: string) => {
    const params = new URLSearchParams({ type });
    if (period) params.set("period", period);
    const res = await apiClient.get(`/api/monitoring/metrics?${params}`);
    return res.data;
  },
  getHealth: async () => {
    const res = await apiClient.get("/api/monitoring/health");
    return res.data;
  },
  getProviderHealth: async () => {
    const res = await apiClient.get("/api/monitoring/providers");
    return res.data;
  },
};
