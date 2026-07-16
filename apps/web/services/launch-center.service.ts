import { apiClient } from "./api/client";

export const launchCenterService = {
  runChecklist: async (orgId?: string) => {
    const res = await apiClient.post("/api/launch-center/checklist", { orgId });
    return res.data;
  },
  healthCheck: async (orgId?: string) => {
    const res = await apiClient.post("/api/launch-center/health-check", { orgId });
    return res.data;
  },
  generateReport: async (orgId?: string) => {
    const res = await apiClient.post("/api/launch-center/report", { orgId });
    return res.data;
  },
  checkReadiness: async (orgId?: string) => {
    const res = await apiClient.post("/api/launch-center/readiness", { orgId });
    return res.data;
  },
};
