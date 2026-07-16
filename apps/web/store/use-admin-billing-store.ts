"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AICostRecord, AICostSummary, Invoice, PaymentTransaction, Subscription } from "@/types";

interface AdminBillingStore {
  totalRevenue: number;
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  totalCustomers: number;
  failedPayments: number;
  refundsTotal: number;
  pendingInvoices: number;
  aiCosts: AICostRecord[];
  setRevenue: (revenue: number) => void;
  setMRR: (mrr: number) => void;
  setARR: (arr: number) => void;
  addAICost: (cost: AICostRecord) => void;
  getAICostSummary: (period?: string) => AICostSummary;
  getRevenueData: () => { date: string; revenue: number; costs: number }[];
  getFailedPayments: (invoices: Invoice[], transactions: PaymentTransaction[]) => number;
  getPendingInvoices: (invoices: Invoice[]) => number;
}

const sampleAICosts: AICostRecord[] = [
  { provider: "openai", model: "gpt-4o", costPerRequest: 0.0025, costPerToken: 0.00001, totalCost: 2450.50, totalRequests: 450000, totalTokens: 85000000, date: "2026-07" },
  { provider: "claude", model: "claude-3-opus", costPerRequest: 0.003, costPerToken: 0.000015, totalCost: 1830.20, totalRequests: 280000, totalTokens: 52000000, date: "2026-07" },
  { provider: "gemini", model: "gemini-1.5-pro", costPerRequest: 0.0015, costPerToken: 0.000005, totalCost: 890.75, totalRequests: 320000, totalTokens: 41000000, date: "2026-07" },
  { provider: "groq", model: "mixtral-8x7b", costPerRequest: 0.0005, costPerToken: 0.000002, totalCost: 320.10, totalRequests: 580000, totalTokens: 95000000, date: "2026-07" },
  { provider: "ollama", model: "llama-3-70b", costPerRequest: 0.0008, costPerToken: 0.000003, totalCost: 0, totalRequests: 15000, totalTokens: 2800000, date: "2026-07" },
  { provider: "openrouter", model: "various", costPerRequest: 0.002, costPerToken: 0.000008, totalCost: 1250.00, totalRequests: 200000, totalTokens: 38000000, date: "2026-07" },
];

export const useAdminBillingStore = create<AdminBillingStore>()(
  persist(
    (set, get) => ({
      totalRevenue: 48500,
      mrr: 32200,
      arr: 386400,
      activeSubscriptions: 127,
      totalCustomers: 843,
      failedPayments: 3,
      refundsTotal: 1250,
      pendingInvoices: 8,
      aiCosts: sampleAICosts,

      setRevenue: (revenue) => set({ totalRevenue: revenue }),
      setMRR: (mrr) => set({ mrr }),
      setARR: (arr) => set({ arr }),

      addAICost: (cost) => set((state) => ({ aiCosts: [...state.aiCosts, cost] })),

      getAICostSummary: (period) => {
        const costs = period ? get().aiCosts.filter((c) => c.date === period) : get().aiCosts;
        const totalCost = costs.reduce((sum, c) => sum + c.totalCost, 0);
        const costByProvider: Record<string, number> = {};
        costs.forEach((c) => { costByProvider[c.provider] = (costByProvider[c.provider] || 0) + c.totalCost; });
        return {
          totalCost,
          costByProvider,
          costByClient: {},
          costByWorkflow: {},
          costByEmployee: {},
          costByAgent: {},
          profitMargin: get().mrr > 0 ? ((get().mrr - totalCost) / get().mrr) * 100 : 0,
          period: period || "all",
        };
      },

      getRevenueData: () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.slice(0, 7).map((date, i) => ({
          date,
          revenue: 25000 + Math.random() * 10000 + i * 2000,
          costs: 8000 + Math.random() * 3000 + i * 500,
        }));
      },

      getFailedPayments: (invoices, transactions) =>
        transactions.filter((t) => t.status === "failed").length,

      getPendingInvoices: (invoices) =>
        invoices.filter((i) => i.status === "pending").length,
    }),
    { name: "buildagent-admin-billing" }
  )
);
