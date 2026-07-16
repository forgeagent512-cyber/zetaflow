"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deploymentsService } from "@/services/deployments.service";

interface DeploymentState {
  deployments: any[];
  currentDeployment: any | null;
  logs: any[];
  isFetching: boolean;
  isDeploying: boolean;
  fetchDeployments: () => Promise<void>;
  fetchDeployment: (id: string) => Promise<void>;
  createDeployment: (data: any) => Promise<any>;
  deployNow: (id: string) => Promise<void>;
  pauseDeployment: (id: string) => Promise<void>;
  resumeDeployment: (id: string) => Promise<void>;
  restartDeployment: (id: string) => Promise<void>;
  rollbackDeployment: (id: string, version: string) => Promise<void>;
  deleteDeployment: (id: string) => Promise<void>;
  fetchLogs: (id: string) => Promise<void>;
}

export const useDeploymentStore = create<DeploymentState>()(
  persist(
    (set, get) => ({
      deployments: [],
      currentDeployment: null,
      logs: [],
      isFetching: false,
      isDeploying: false,

      fetchDeployments: async () => {
        set({ isFetching: true });
        try {
          const result = await deploymentsService.getAll();
          set({ deployments: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      fetchDeployment: async (id) => {
        set({ isFetching: true });
        try {
          const result = await deploymentsService.getById(id);
          set({ currentDeployment: result.data ?? null, isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createDeployment: async (data) => {
        set({ isDeploying: true });
        try {
          const result = await deploymentsService.create(data);
          set((state) => ({ deployments: [...state.deployments, result.data], isDeploying: false }));
          return result.data;
        } catch (error) {
          set({ isDeploying: false });
          throw error;
        }
      },

      deployNow: async (id) => {
        set({ isDeploying: true });
        try {
          await deploymentsService.deployNow(id);
          set((state) => ({
            deployments: state.deployments.map((d) =>
              d.id === id ? { ...d, status: "deploying" } : d
            ),
            isDeploying: false,
          }));
        } catch (error) {
          set({ isDeploying: false });
          throw error;
        }
      },

      pauseDeployment: async (id) => {
        try {
          await deploymentsService.pause(id);
          set((state) => ({
            deployments: state.deployments.map((d) =>
              d.id === id ? { ...d, status: "paused" } : d
            ),
          }));
        } catch {}
      },

      resumeDeployment: async (id) => {
        try {
          await deploymentsService.resume(id);
          set((state) => ({
            deployments: state.deployments.map((d) =>
              d.id === id ? { ...d, status: "running" } : d
            ),
          }));
        } catch {}
      },

      restartDeployment: async (id) => {
        try {
          await deploymentsService.restart(id);
          set((state) => ({
            deployments: state.deployments.map((d) =>
              d.id === id ? { ...d, status: "restarting" } : d
            ),
          }));
        } catch {}
      },

      rollbackDeployment: async (id, version) => {
        set({ isDeploying: true });
        try {
          await deploymentsService.rollback(id, version);
          set((state) => ({
            deployments: state.deployments.map((d) =>
              d.id === id ? { ...d, status: "rolling-back", version } : d
            ),
            isDeploying: false,
          }));
        } catch (error) {
          set({ isDeploying: false });
          throw error;
        }
      },

      deleteDeployment: async (id) => {
        try {
          await deploymentsService.delete(id);
          set((state) => ({ deployments: state.deployments.filter((d) => d.id !== id) }));
        } catch {}
      },

      fetchLogs: async (id) => {
        set({ isFetching: true });
        try {
          const result = await deploymentsService.getLogs(id);
          set({ logs: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },
    }),
    { name: "buildagent-deployment-store" }
  )
);
