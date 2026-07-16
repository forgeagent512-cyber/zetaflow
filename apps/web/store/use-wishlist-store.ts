"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  favorites: string[];
  compare: string[];
  recentlyViewed: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  addRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      compare: [],
      recentlyViewed: [],

      addFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.includes(productId) ? state.favorites : [...state.favorites, productId],
        })),

      removeFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== productId),
        })),

      isFavorite: (productId) => get().favorites.includes(productId),

      toggleFavorite: (productId) => {
        if (get().isFavorite(productId)) {
          get().removeFavorite(productId);
        } else {
          get().addFavorite(productId);
        }
      },

      addToCompare: (productId) =>
        set((state) => ({
          compare: state.compare.length >= 4 ? state.compare : [...state.compare, productId],
        })),

      removeFromCompare: (productId) =>
        set((state) => ({
          compare: state.compare.filter((id) => id !== productId),
        })),

      clearCompare: () => set({ compare: [] }),

      isInCompare: (productId) => get().compare.includes(productId),

      addRecentlyViewed: (productId) =>
        set((state) => ({
          recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 20),
        })),

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    { name: "buildagent-wishlist" }
  )
);
