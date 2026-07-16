"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devopsService } from "@/services/devops.service";

interface DevOpsState {
  deployments: any[];
  organizations: any[];
  metrics: any;
  health: any;
  backups: any[];
  notifications: any[];
  whiteLabel: any | null;
  license: any | null;
  features: any[];
  isFetching: boolean;
  isDeploying: boolean;
  fetchDeployments: () => Promise<void>;
  createDeployment: (data: any) => Promise<any>;
  deployNow: (id: string) => Promise<void>;
  pauseDeployment: (id: string) => Promise<void>;
  resumeDeployment: (id: string) => Promise<void>;
  restartDeployment: (id: string) => Promise<void>;
  rollbackDeployment: (id: string, version: string) => Promise<void>;
  deleteDeployment: (id: string) => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  fetchMetrics: (type: string, period?: string) => Promise<void>;
  fetchHealth: () => Promise<void>;
  fetchBackups: () => Promise<void>;
  createBackup: (type?: string) => Promise<any>;
  fetchWhiteLabel: () => Promise<void>;
  updateWhiteLabel: (data: any) => Promise<any>;
  fetchLicense: (orgId: string) => Promise<void>;
  fetchFeatureFlags: () => Promise<void>;
}

export const useDevOpsStore = create<DevOpsState>()(
  persist(
    (set, get) => ({
      deployments: [],
      organizations: [],
      metrics: null,
      health: null,
      backups: [],
      notifications: [],
      whiteLabel: null,
      license: null,
      features: [],
      isFetching: false,
      isDeploying: false,

      fetchDeployments: async () => {
        set({ isFetching: true });
        try {
          const result = await devopsService.getDeployments();
          set({ deployments: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createDeployment: async (data) => {
        set({ isDeploying: true });
        try {
          const result = await devopsService.createDeployment(data);
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
          await devopsService.deployNow(id);
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
          await devopsService.pauseDeployment(id);
          set((state) => ({
            deployments: state.deployments.map((d) =>
              d.id === id ? { ...d, status: "paused" } : d
            ),
          }));
        } catch {}
      },

      resumeDeployment: async (id) => {
        try {
          await devopsService.resumeDeployment(id);
          set((state) => ({
            deployments: state.deployments.map((d) =>
              d.id === id ? { ...d, status: "running" } : d
            ),
          }));
        } catch {}
      },

      restartDeployment: async (id) => {
        try {
          await devopsService.restartDeployment(id);
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
          await devopsService.rollbackDeployment(id, version);
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
          await devopsService.deleteDeployment(id);
          set((state) => ({
            deployments: state.deployments.filter((d) => d.id !== id),
          }));
        } catch {}
      },

      fetchOrganizations: async () => {
        try {
          const result = await devopsService.getOrganizations();
          set({ organizations: result.data ?? [] });
        } catch {}
      },

      fetchMetrics: async (type, period) => {
        set({ isFetching: true });
        try {
          const result = await devopsService.getMetrics(type, period);
          set({ metrics: result.data ?? null, isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      fetchHealth: async () => {
        try {
          const result = await devopsService.getHealth();
          set({ health: result.data ?? null });
        } catch {}
      },

      fetchBackups: async () => {
        set({ isFetching: true });
        try {
          const result = await devopsService.getBackups();
          set({ backups: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      createBackup: async (type) => {
        set({ isFetching: true });
        try {
          const result = await devopsService.createBackup(type);
          set((state) => ({ backups: [...state.backups, result.data], isFetching: false }));
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      fetchWhiteLabel: async () => {
        try {
          const result = await devopsService.getWhiteLabel();
          set({ whiteLabel: result.data ?? null });
        } catch {}
      },

      updateWhiteLabel: async (data) => {
        try {
          const result = await devopsService.updateWhiteLabel(data);
          set({ whiteLabel: result.data ?? null });
          return result.data;
        } catch (error) {
          throw error;
        }
      },

      fetchLicense: async (orgId) => {
        try {
          const result = await devopsService.getLicense(orgId);
          set({ license: result.data ?? null });
        } catch {}
      },

      fetchFeatureFlags: async () => {
        try {
          const result = await devopsService.getFeatureFlags();
          set({ features: result.data ?? [] });
        } catch {}
      },
    }),
    { name: "buildagent-devops" }
  )
);