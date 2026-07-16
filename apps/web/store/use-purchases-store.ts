"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PurchasedProduct, StoreDeployment } from "@/types/cms";

interface PurchasesStore {
  purchases: PurchasedProduct[];
  addPurchase: (purchase: PurchasedProduct) => void;
  updatePurchase: (id: string, data: Partial<PurchasedProduct>) => void;
  addDeployment: (productId: string, deployment: StoreDeployment) => void;
  getPurchase: (productId: string) => PurchasedProduct | undefined;
  getActivePurchases: () => PurchasedProduct[];
}

const samplePurchases: PurchasedProduct[] = [
  {
    id: "p1",
    productId: "1",
    productName: "Sales Pro AI",
    productIcon: "/store/icons/sales-pro.svg",
    license: "single-company",
    price: 299,
    currency: "USD",
    purchasedAt: "2026-06-01T00:00:00Z",
    deployments: [
      {
        id: "dep1",
        productId: "1",
        productName: "Sales Pro AI",
        productIcon: "/store/icons/sales-pro.svg",
        status: "running",
        config: {},
        logs: [],
        startedAt: "2026-06-01T08:00:00Z",
      },
    ],
    updates: 3,
  },
  {
    id: "p2",
    productId: "2",
    productName: "Customer Support AI",
    productIcon: "/store/icons/support.svg",
    license: "agency",
    price: 199,
    currency: "USD",
    purchasedAt: "2026-06-05T00:00:00Z",
    deployments: [
      {
        id: "dep2",
        productId: "2",
        productName: "Customer Support AI",
        productIcon: "/store/icons/support.svg",
        status: "running",
        config: {},
        logs: [],
        startedAt: "2026-06-05T10:00:00Z",
      },
    ],
    updates: 1,
  },
];

export const usePurchasesStore = create<PurchasesStore>()(
  persist(
    (set, get) => ({
      purchases: samplePurchases,

      addPurchase: (purchase) =>
        set((state) => ({ purchases: [purchase, ...state.purchases] })),

      updatePurchase: (id, data) =>
        set((state) => ({
          purchases: state.purchases.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      addDeployment: (productId, deployment) =>
        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.productId === productId ? { ...p, deployments: [...p.deployments, deployment] } : p
          ),
        })),

      getPurchase: (productId) => get().purchases.find((p) => p.productId === productId),

      getActivePurchases: () => get().purchases.filter((p) => p.deployments.some((d) => d.status === "running")),
    }),
    { name: "buildagent-purchases" }
  )
);
