"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UsageRecord, UsageMetricType, LimitLevel } from "@/types";

interface UsageStore {
  records: UsageRecord[];
  limits: Record<string, { limit: number; overageRate: number }>;
  overageBillingEnabled: boolean;
  updateUsage: (metric: UsageMetricType, used: number) => void;
  incrementUsage: (metric: UsageMetricType, amount?: number) => void;
  getCurrentLevel: () => LimitLevel;
  getUsagePercent: () => number;
  getExceededMetrics: () => UsageRecord[];
  setOverageBilling: (enabled: boolean) => void;
}

const defaultRecords: UsageRecord[] = [
  { metric: "workflow-runs", label: "Workflow Runs", used: 16750, limit: 25000, unit: "runs" },
  { metric: "ai-requests", label: "AI Requests", used: 45230, limit: 100000, unit: "requests" },
  { metric: "storage-gb", label: "Storage", used: 42, limit: 100, unit: "GB" },
  { metric: "voice-minutes", label: "Voice Minutes", used: 340, limit: 1000, unit: "minutes" },
  { metric: "api-calls", label: "API Calls", used: 28100, limit: 100000, unit: "calls" },
  { metric: "employees", label: "AI Employees", used: 18, limit: 25, unit: "employees" },
  { metric: "agents", label: "AI Agents", used: 8, limit: 15, unit: "agents" },
  { metric: "automations", label: "Automations", used: 28, limit: 50, unit: "automations" },
  { metric: "knowledge-base-size", label: "Knowledge Base", used: 3.2, limit: 100, unit: "GB" },
];

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      records: defaultRecords,
      limits: {
        "workflow-runs": { limit: 25000, overageRate: 0.01 },
        "ai-requests": { limit: 100000, overageRate: 0.001 },
        "storage-gb": { limit: 100, overageRate: 5 },
        "voice-minutes": { limit: 1000, overageRate: 0.02 },
      },
      overageBillingEnabled: false,

      updateUsage: (metric, used) => set((state) => ({
        records: state.records.map((r) => r.metric === metric ? { ...r, used } : r),
      })),

      incrementUsage: (metric, amount = 1) => set((state) => ({
        records: state.records.map((r) => r.metric === metric ? { ...r, used: r.used + amount } : r),
      })),

      getCurrentLevel: () => {
        const maxPct = Math.max(...get().records.map((r) => (r.used / r.limit) * 100));
        if (maxPct >= 110) return "paused";
        if (maxPct >= 100) return "grace";
        if (maxPct >= 90) return "warning-90";
        if (maxPct >= 80) return "warning-80";
        return "normal";
      },

      getUsagePercent: () => {
        const records = get().records;
        if (records.length === 0) return 0;
        const pcts = records.map((r) => (r.used / r.limit) * 100);
        return Math.round(Math.max(...pcts));
      },

      getExceededMetrics: () => get().records.filter((r) => r.used >= r.limit),

      setOverageBilling: (enabled) => set({ overageBillingEnabled: enabled }),
    }),
    { name: "buildagent-usage" }
  )
);
