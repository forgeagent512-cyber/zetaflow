import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let navigateToLogin: (() => void) | null = null;
let getToken: (() => string | null) | null = null;
let refreshTokens: (() => Promise<string | null>) | null = null;

export function injectAuthDeps(
  navigate: () => void,
  getAccessToken: () => string | null,
  refresh: () => Promise<string | null>
) {
  navigateToLogin = navigate;
  getToken = getAccessToken;
  refreshTokens = refresh;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken?.() ?? null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokens?.();
        if (newToken) {
          pendingRequests.forEach((cb) => cb(newToken));
          pendingRequests = [];
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
      } finally {
        isRefreshing = false;
        pendingRequests = [];
      }

      navigateToLogin?.();
    }

    return Promise.reject(error);
  }
);

export { apiClient };
