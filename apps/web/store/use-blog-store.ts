import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BlogPost, BlogCategory, BlogTag } from "@/types/cms";

interface BlogStoreState {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
  selectedPostId: string | null;
  setPosts: (posts: BlogPost[]) => void;
  addPost: (post: BlogPost) => void;
  updatePost: (id: string, updates: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  setSelectedPost: (id: string | null) => void;
  setCategories: (categories: BlogCategory[]) => void;
  addCategory: (category: BlogCategory) => void;
  updateCategory: (id: string, updates: Partial<BlogCategory>) => void;
  deleteCategory: (id: string) => void;
  setTags: (tags: BlogTag[]) => void;
  addTag: (tag: BlogTag) => void;
  deleteTag: (id: string) => void;
  getPublishedPosts: () => BlogPost[];
}

export const useBlogStore = create<BlogStoreState>()(
  persist(
    (set, get) => ({
      posts: [],
      categories: [],
      tags: [],
      selectedPostId: null,

      setPosts: (posts) => set({ posts }),
      addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
      updatePost: (id, updates) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deletePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        })),
      setSelectedPost: (id) => set({ selectedPostId: id }),
      setCategories: (categories) => set({ categories }),
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
      setTags: (tags) => set({ tags }),
      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
      deleteTag: (id) => set((state) => ({ tags: state.tags.filter((t) => t.id !== id) })),
      getPublishedPosts: () => get().posts.filter((p) => p.status === "published"),
    }),
    { name: "buildagent-blog-store" }
  )
);
