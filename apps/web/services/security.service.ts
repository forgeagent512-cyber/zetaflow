import { apiClient } from "./api/client";

export const securityService = {
  validateInput: async (input: string, rules?: string[]) => {
    const res = await apiClient.post("/api/security/validate-input", { input, rules });
    return res.data;
  },
  detectInjection: async (input: string) => {
    const res = await apiClient.post("/api/security/detect-injection", { input });
    return res.data;
  },
  encrypt: async (data: string) => {
    const res = await apiClient.post("/api/security/encrypt", { data });
    return res.data;
  },
  decrypt: async (encryptedData: string) => {
    const res = await apiClient.post("/api/security/decrypt", { encryptedData });
    return res.data;
  },
};
