import { apiClient } from "./api/client";

export const blogService = {
  getPosts: async (filters?: { status?: string; categoryId?: string }) => {
    const res = await apiClient.post("/api/blog/posts", { filters });
    return res.data;
  },
  getPost: async (id: string) => {
    const res = await apiClient.get(`/api/blog/posts/${id}`);
    return res.data;
  },
  createPost: async (data: any) => {
    const res = await apiClient.post("/api/blog/posts", { ...data, action: "create" });
    return res.data;
  },
  updatePost: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/blog/posts/${id}`, data);
    return res.data;
  },
  deletePost: async (id: string) => {
    const res = await apiClient.delete(`/api/blog/posts/${id}`);
    return res.data;
  },
  publishPost: async (id: string) => {
    const res = await apiClient.post(`/api/blog/posts/${id}/publish`);
    return res.data;
  },
  getCategories: async () => {
    const res = await apiClient.get("/api/blog/categories");
    return res.data;
  },
  createCategory: async (data: any) => {
    const res = await apiClient.post("/api/blog/categories", { ...data, action: "create" });
    return res.data;
  },
  updateCategory: async (id: string, data: any) => {
    const res = await apiClient.put(`/api/blog/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id: string) => {
    const res = await apiClient.delete(`/api/blog/categories/${id}`);
    return res.data;
  },
};
