import { apiClient } from "./api/client";

export const importExportService = {
  exportData: async (entityType: string, ids?: string[], format?: string) => {
    const res = await apiClient.post("/api/import-export/export", { entityType, ids, format });
    return res.data;
  },
  importData: async (file: File, entityType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entityType", entityType);
    const res = await apiClient.post("/api/import-export/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  getJobStatus: async (jobId: string) => {
    const res = await apiClient.get(`/api/import-export/jobs/${jobId}`);
    return res.data;
  },
  getJobs: async () => {
    const res = await apiClient.get("/api/import-export/jobs");
    return res.data;
  },
};
