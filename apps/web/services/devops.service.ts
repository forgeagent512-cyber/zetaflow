import { apiClient } from "./api/client";

export const devopsService = {
  getWhiteLabel: async () => {
    const res = await apiClient.get("/api/devops/white-label");
    return res.data;
  },
  updateWhiteLabel: async (data: any) => {
    const res = await apiClient.put("/api/devops/white-label", data);
    return res.data;
  },
  verifyDomain: async () => {
    const res = await apiClient.post("/api/devops/white-label/verify-domain");
    return res.data;
  },
  getDeployments: async () => {
    const res = await apiClient.get("/api/deployments");
    return res.data;
  },
  createDeployment: async (data: any) => {
    const res = await apiClient.post("/api/deployments", data);
    return res.data;
  },
  deployNow: async (id: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/deploy`);
    return res.data;
  },
  pauseDeployment: async (id: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/pause`);
    return res.data;
  },
  resumeDeployment: async (id: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/resume`);
    return res.data;
  },
  restartDeployment: async (id: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/restart`);
    return res.data;
  },
  rollbackDeployment: async (id: string, version: string) => {
    const res = await apiClient.post(`/api/deployments/${id}/rollback`, { version });
    return res.data;
  },
  deleteDeployment: async (id: string) => {
    const res = await apiClient.delete(`/api/deployments/${id}`);
    return res.data;
  },
  getDeploymentLogs: async (id: string) => {
    const res = await apiClient.get(`/api/deployments/${id}/logs`);
    return res.data;
  },
  getOrganizations: async () => {
    const res = await apiClient.get("/api/organizations");
    return res.data;
  },
  getOrganization: async (id: string) => {
    const res = await apiClient.get(`/api/organizations/${id}`);
    return res.data;
  },
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
  getNotifications: async () => {
    const res = await apiClient.get("/api/notifications");
    return res.data;
  },
  getBackups: async () => {
    const res = await apiClient.get("/api/backups");
    return res.data;
  },
  createBackup: async (type?: string) => {
    const res = await apiClient.post("/api/backups", { type });
    return res.data;
  },
  getLicense: async (orgId: string) => {
    const res = await apiClient.get(`/api/licenses/${orgId}`);
    return res.data;
  },
  getFeatureFlags: async () => {
    const res = await apiClient.get("/api/feature-flags");
    return res.data;
  },
  runLaunchChecklist: async (orgId?: string) => {
    const res = await apiClient.post("/api/launch-center/checklist", { orgId });
    return res.data;
  },
  exportData: async (entityType: string, ids?: string[]) => {
    const res = await apiClient.post("/api/import-export/export", { entityType, ids });
    return res.data;
  },
};