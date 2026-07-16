"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { monitoringService } from "@/services/monitoring.service";

interface MonitoringState {
  metrics: any;
  health: any;
  providerHealth: any[];
  isFetching: boolean;
  fetchMetrics: (type: string, period?: string) => Promise<void>;
  fetchHealth: () => Promise<void>;
  fetchProviderHealth: () => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>()(
  persist(
    (set, get) => ({
      metrics: null,
      health: null,
      providerHealth: [],
      isFetching: false,

      fetchMetrics: async (type, period) => {
        set({ isFetching: true });
        try {
          const result = await monitoringService.getMetrics(type, period);
          set({ metrics: result.data ?? null, isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      fetchHealth: async () => {
        try {
          const result = await monitoringService.getHealth();
          set({ health: result.data ?? null });
        } catch {}
      },

      fetchProviderHealth: async () => {
        set({ isFetching: true });
        try {
          const result = await monitoringService.getProviderHealth();
          set({ providerHealth: result.data ?? [], isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },
    }),
    { name: "buildagent-monitoring-store" }
  )
);
