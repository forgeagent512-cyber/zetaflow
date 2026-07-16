import { apiClient } from "./api/client";

export const licensesService = {
  get: async (orgId: string) => {
    const res = await apiClient.get(`/api/licenses/${orgId}`);
    return res.data;
  },
  generate: async (data: { orgId: string; plan: string; seats?: number }) => {
    const res = await apiClient.post("/api/licenses/generate", data);
    return res.data;
  },
  validate: async (licenseKey: string) => {
    const res = await apiClient.post("/api/licenses/validate", { licenseKey });
    return res.data;
  },
  activate: async (licenseKey: string, activationData?: any) => {
    const res = await apiClient.post("/api/licenses/activate", { licenseKey, ...activationData });
    return res.data;
  },
};
