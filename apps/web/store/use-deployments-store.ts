"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoreDeployment, DeploymentLog } from "@/types/cms";

interface DeploymentsStore {
  deployments: StoreDeployment[];
  addDeployment: (deployment: StoreDeployment) => void;
  updateDeployment: (id: string, data: Partial<StoreDeployment>) => void;
  removeDeployment: (id: string) => void;
  addLog: (deploymentId: string, log: DeploymentLog) => void;
  retryDeployment: (id: string) => void;
  rollbackDeployment: (id: string) => void;
  pauseDeployment: (id: string) => void;
  resumeDeployment: (id: string) => void;
  getActiveDeployments: () => StoreDeployment[];
  getByProductId: (productId: string) => StoreDeployment[];
}

const sampleDeployments: StoreDeployment[] = [
  {
    id: "dep1",
    productId: "1",
    productName: "Sales Pro AI",
    productIcon: "/store/icons/sales-pro.svg",
    status: "running",
    config: { leadSources: ["website", "email"], crm: "salesforce" },
    logs: [
      { id: "l1", message: "Deployment initialized", level: "info", timestamp: "2026-06-01T08:00:00Z" },
      { id: "l2", message: "Sales Pro AI started successfully", level: "info", timestamp: "2026-06-01T08:05:00Z" },
      { id: "l3", message: "CRM integration established", level: "info", timestamp: "2026-06-01T08:07:00Z" },
    ],
    startedAt: "2026-06-01T08:00:00Z",
    completedAt: "2026-06-01T08:07:00Z",
  },
  {
    id: "dep2",
    productId: "2",
    productName: "Customer Support AI",
    productIcon: "/store/icons/support.svg",
    status: "running",
    config: { channels: ["email", "chat", "phone"], platform: "zendesk" },
    logs: [
      { id: "l4", message: "Deployment initialized", level: "info", timestamp: "2026-06-05T10:00:00Z" },
      { id: "l5", message: "Support channels configured", level: "info", timestamp: "2026-06-05T10:03:00Z" },
      { id: "l6", message: "Customer Support AI is live", level: "info", timestamp: "2026-06-05T10:08:00Z" },
    ],
    startedAt: "2026-06-05T10:00:00Z",
    completedAt: "2026-06-05T10:08:00Z",
  },
];

export const useDeploymentsStore = create<DeploymentsStore>()(
  persist(
    (set, get) => ({
      deployments: sampleDeployments,

      addDeployment: (deployment) =>
        set((state) => ({ deployments: [deployment, ...state.deployments] })),

      updateDeployment: (id, data) =>
        set((state) => ({
          deployments: state.deployments.map((d) => (d.id === id ? { ...d, ...data } : d)),
        })),

      removeDeployment: (id) =>
        set((state) => ({ deployments: state.deployments.filter((d) => d.id !== id) })),

      addLog: (deploymentId, log) =>
        set((state) => ({
          deployments: state.deployments.map((d) =>
            d.id === deploymentId ? { ...d, logs: [...d.logs, log] } : d
          ),
        })),

      retryDeployment: (id) =>
        set((state) => ({
          deployments: state.deployments.map((d) =>
            d.id === id ? { ...d, status: "installing", logs: [...d.logs, { id: `l${Date.now()}`, message: "Retrying deployment...", level: "info", timestamp: new Date().toISOString() }] } : d
          ),
        })),

      rollbackDeployment: (id) =>
        set((state) => ({
          deployments: state.deployments.map((d) =>
            d.id === id ? { ...d, status: "stopped", logs: [...d.logs, { id: `l${Date.now()}`, message: "Rollback initiated", level: "warn", timestamp: new Date().toISOString() }] } : d
          ),
        })),

      pauseDeployment: (id) =>
        set((state) => ({
          deployments: state.deployments.map((d) =>
            d.id === id ? { ...d, status: "paused" as const } : d
          ),
        })),

      resumeDeployment: (id) =>
        set((state) => ({
          deployments: state.deployments.map((d) =>
            d.id === id ? { ...d, status: "running" as const } : d
          ),
        })),

      getActiveDeployments: () =>
        get().deployments.filter((d) => d.status === "running" || d.status === "installing"),

      getByProductId: (productId) => get().deployments.filter((d) => d.productId === productId),
    }),
    { name: "buildagent-deployments" }
  )
);
