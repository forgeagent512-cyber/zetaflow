"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BuildWizardState } from "@/types/cms";

interface BuildWizardStore {
  wizard: BuildWizardState;
  setStep: (step: number) => void;
  updateBusiness: (data: Partial<BuildWizardState["business"]>) => void;
  updateGoals: (data: Partial<BuildWizardState["goals"]>) => void;
  toggleApp: (app: keyof BuildWizardState["apps"]) => void;
  setCustomApis: (apis: string[]) => void;
  toggleChoice: (key: "aiEmployees" | "aiAgents" | "workflows", item: string) => void;
  setVoice: (value: boolean) => void;
  setVision: (value: boolean) => void;
  setKnowledgeBase: (value: boolean) => void;
  updateReview: (data: Partial<BuildWizardState["review"]>) => void;
  reset: () => void;
}

const initialWizard: BuildWizardState = {
  step: 1,
  business: {
    name: "",
    industry: "",
    employees: "",
    country: "",
    language: "English",
    timezone: "UTC",
  },
  goals: {
    description: "",
    problems: [],
    currentSoftware: [],
    requiredAutomations: [],
  },
  apps: {
    google: false,
    microsoft: false,
    hubspot: false,
    salesforce: false,
    whatsapp: false,
    slack: false,
    discord: false,
    zapier: false,
    n8n: false,
    crm: false,
    erp: false,
    customApis: [],
  },
  choices: {
    aiEmployees: [],
    aiAgents: [],
    workflows: [],
    voice: false,
    vision: false,
    knowledgeBase: false,
  },
  review: {
    estimatedPrice: 0,
    estimatedMaintenance: 0,
    accepted: false,
  },
};

export const useBuildWizard = create<BuildWizardStore>()(
  persist(
    (set) => ({
      wizard: initialWizard,

      setStep: (step) => set((state) => ({ wizard: { ...state.wizard, step } })),

      updateBusiness: (data) =>
        set((state) => ({
          wizard: { ...state.wizard, business: { ...state.wizard.business, ...data } },
        })),

      updateGoals: (data) =>
        set((state) => ({
          wizard: { ...state.wizard, goals: { ...state.wizard.goals, ...data } },
        })),

      toggleApp: (app) =>
        set((state) => ({
          wizard: {
            ...state.wizard,
            apps: { ...state.wizard.apps, [app]: !state.wizard.apps[app] },
          },
        })),

      setCustomApis: (apis) =>
        set((state) => ({
          wizard: { ...state.wizard, apps: { ...state.wizard.apps, customApis: apis } },
        })),

      toggleChoice: (key, item) =>
        set((state) => {
          const current = state.wizard.choices[key];
          const updated = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
          return {
            wizard: { ...state.wizard, choices: { ...state.wizard.choices, [key]: updated } },
          };
        }),

      setVoice: (value) =>
        set((state) => ({
          wizard: { ...state.wizard, choices: { ...state.wizard.choices, voice: value } },
        })),

      setVision: (value) =>
        set((state) => ({
          wizard: { ...state.wizard, choices: { ...state.wizard.choices, vision: value } },
        })),

      setKnowledgeBase: (value) =>
        set((state) => ({
          wizard: { ...state.wizard, choices: { ...state.wizard.choices, knowledgeBase: value } },
        })),

      updateReview: (data) =>
        set((state) => ({
          wizard: { ...state.wizard, review: { ...state.wizard.review, ...data } },
        })),

      reset: () => set({ wizard: initialWizard }),
    }),
    { name: "buildagent-build-wizard" }
  )
);
