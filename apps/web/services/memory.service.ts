import { apiClient } from "./api/client";

export const memoryService = {
  getMemory: async (employeeId: string, search?: string, limit?: number) => {
    const params = new URLSearchParams({ employeeId });
    if (search) params.set("search", search);
    if (limit) params.set("limit", String(limit));
    const res = await apiClient.get(`/api/ai-memory?${params}`);
    return res.data;
  },
  storeMemory: async (employeeId: string, type: string, content: string, metadata?: any) => {
    const res = await apiClient.post("/api/ai-memory", { employeeId, type, content, metadata });
    return res.data;
  },
  recall: async (employeeId: string, query: string, limit?: number) => {
    const res = await apiClient.post("/api/ai-memory/recall", { employeeId, query, limit });
    return res.data;
  },
  cleanup: async (employeeId: string) => {
    const res = await apiClient.delete("/api/ai-memory/cleanup", { data: { employeeId } });
    return res.data;
  },
  getConversation: async (employeeId: string, limit?: number) => {
    const params = new URLSearchParams({ employeeId });
    if (limit) params.set("limit", String(limit));
    const res = await apiClient.get(`/api/ai-memory/conversation?${params}`);
    return res.data;
  },
};