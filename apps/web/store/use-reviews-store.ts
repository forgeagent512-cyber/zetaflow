"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductReview } from "@/types/cms";

interface ReviewsStore {
  reviews: ProductReview[];
  addReview: (review: ProductReview) => void;
  deleteReview: (id: string) => void;
  adminReply: (reviewId: string, reply: string) => void;
  getReviewsByProduct: (productId: string) => ProductReview[];
  getAverageRating: (productId: string) => number;
  getRatingDistribution: (productId: string) => Record<number, number>;
}

const sampleReviews: ProductReview[] = [
  {
    id: "r1",
    productId: "1",
    userId: "u1",
    userName: "Sarah Johnson",
    userAvatar: "",
    rating: 5,
    comment: "Sales Pro AI has transformed our sales process. Lead conversion increased by 40% in the first month. The AI follows up with leads at optimal times and the quality of communication is outstanding.",
    verified: true,
    adminReply: "Thank you Sarah! We're thrilled to hear about your success. Our team continues to improve the lead scoring algorithm.",
    createdAt: "2026-04-15T00:00:00Z",
  },
  {
    id: "r2",
    productId: "1",
    userId: "u2",
    userName: "Michael Chen",
    userAvatar: "",
    rating: 4,
    comment: "Great product overall. The CRM integration works flawlessly. Would love to see more customization options for follow-up sequences.",
    verified: true,
    createdAt: "2026-05-01T00:00:00Z",
  },
  {
    id: "r3",
    productId: "2",
    userId: "u3",
    userName: "Emily Rodriguez",
    userAvatar: "",
    rating: 5,
    comment: "Customer Support AI handles 80% of our tickets autonomously. Response time went from 4 hours to under 2 minutes. Absolutely game-changing for our support team.",
    verified: true,
    adminReply: "Thanks Emily! We're working on even deeper Zendesk integration in the next release.",
    createdAt: "2026-04-20T00:00:00Z",
  },
  {
    id: "r4",
    productId: "3",
    userId: "u4",
    userName: "David Park",
    userAvatar: "",
    rating: 5,
    comment: "The Real Estate AI Pack is incredible. Property matching is surprisingly accurate and the virtual tour feature has become our biggest selling point.",
    verified: true,
    createdAt: "2026-05-10T00:00:00Z",
  },
  {
    id: "r5",
    productId: "5",
    userId: "u5",
    userName: "Lisa Thompson",
    userAvatar: "",
    rating: 4,
    comment: "Marketing AI Suite handles our entire content calendar. The AI-generated blog posts need some editing, but the social media management is flawless.",
    verified: true,
    adminReply: "Thanks Lisa! Content quality improvements are our top priority for Q3.",
    createdAt: "2026-05-20T00:00:00Z",
  },
];

export const useReviewsStore = create<ReviewsStore>()(
  persist(
    (set, get) => ({
      reviews: sampleReviews,

      addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),

      deleteReview: (id) =>
        set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) })),

      adminReply: (reviewId, reply) =>
        set((state) => ({
          reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, adminReply: reply } : r)),
        })),

      getReviewsByProduct: (productId) => get().reviews.filter((r) => r.productId === productId),

      getAverageRating: (productId) => {
        const productReviews = get().reviews.filter((r) => r.productId === productId);
        if (productReviews.length === 0) return 0;
        const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
        return Math.round((sum / productReviews.length) * 10) / 10;
      },

      getRatingDistribution: (productId) => {
        const productReviews = get().reviews.filter((r) => r.productId === productId);
        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        productReviews.forEach((r) => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });
        return distribution;
      },
    }),
    { name: "buildagent-reviews" }
  )
);
