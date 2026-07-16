"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkflowTemplate, TemplateMetadata, DifficultyLevel, StoreCategory } from "@/types/cms";

interface TemplateEngineStore {
  templates: WorkflowTemplate[];
  selectedTemplateId: string | null;
  autoScanning: boolean;
  scanProgress: number;
  setTemplates: (templates: WorkflowTemplate[]) => void;
  addTemplate: (template: WorkflowTemplate) => void;
  updateTemplate: (id: string, data: Partial<WorkflowTemplate>) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplateId: (id: string | null) => void;
  setAutoScanning: (scanning: boolean) => void;
  setScanProgress: (progress: number) => void;
  startAutoScan: () => void;
  classifyTemplate: (id: string, metadata: Partial<TemplateMetadata>) => void;
  bulkPublish: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
  bulkArchive: (ids: string[]) => void;
  duplicateTemplate: (id: string) => void;
  getTemplatesByIndustry: (industry: string) => WorkflowTemplate[];
  getTemplatesByCategory: (category: StoreCategory) => WorkflowTemplate[];
  search: (query: string) => WorkflowTemplate[];
}

const sampleTemplates: WorkflowTemplate[] = [
  {
    id: "t1",
    title: "Lead Capture to CRM Sync",
    summary: "Automatically capture leads from multiple sources and sync to your CRM",
    description: "A complete workflow that captures leads from web forms, landing pages, social media ads, and email inquiries, then automatically creates/updates CRM records with lead scoring.",
    thumbnail: "/store/templates/lead-capture.jpg",
    category: "automation-templates",
    industry: ["Real Estate", "Finance", "Insurance"],
    tags: ["leads", "crm", "capture", "sync", "automation"],
    apps: ["HubSpot", "Salesforce", "Google Forms", "Facebook Lead Ads"],
    difficulty: "beginner",
    dependencies: ["n8n", "CRM API access"],
    version: "2.0.0",
    status: "published",
    metadata: {
      industry: "Cross-Industry",
      category: "automation-templates",
      tags: ["leads", "crm", "sync", "automation"],
      apps: ["HubSpot", "Salesforce", "Google Forms"],
      difficulty: "beginner",
      dependencies: ["n8n"],
      estimatedSetupTime: "10 minutes",
      features: ["Multi-source lead capture", "Auto CRM sync", "Lead scoring", "Duplication prevention"],
      useCases: ["Marketing lead management", "Sales pipeline automation"],
      targetIndustry: "All",
      recommendedPlan: "Starter",
    },
    content: {},
    importCount: 4520,
    rating: 4.6,
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-06-15T00:00:00Z",
  },
  {
    id: "t2",
    title: "Invoice Generation & Payment",
    summary: "Auto-generate invoices and track payments",
    description: "End-to-end invoice workflow: generates invoices from orders/projects, sends to clients, tracks payment status, sends reminders, and reconciles with accounting.",
    thumbnail: "/store/templates/invoice.jpg",
    category: "ai-workflows",
    industry: ["Finance", "Legal", "Consulting"],
    tags: ["invoices", "payments", "accounting", "billing"],
    apps: ["QuickBooks", "Xero", "Stripe", "PayPal", "Email"],
    difficulty: "intermediate",
    dependencies: ["n8n", "Accounting software access"],
    version: "1.5.0",
    status: "published",
    metadata: {
      industry: "Finance",
      category: "ai-workflows",
      tags: ["invoices", "payments", "accounting"],
      apps: ["QuickBooks", "Xero", "Stripe"],
      difficulty: "intermediate",
      dependencies: ["n8n"],
      estimatedSetupTime: "20 minutes",
      features: ["Auto invoice generation", "Payment tracking", "Reminder automation", "Accounting sync"],
      useCases: ["Automated billing", "Payment collection"],
      targetIndustry: "Finance, Legal",
      recommendedPlan: "Professional",
    },
    content: {},
    importCount: 3210,
    rating: 4.5,
    createdAt: "2026-02-05T00:00:00Z",
    updatedAt: "2026-06-10T00:00:00Z",
  },
  {
    id: "t3",
    title: "Employee Onboarding Flow",
    summary: "Complete automated employee onboarding process",
    description: "Automate the entire employee onboarding journey from offer letter to first day. Includes document collection, account provisioning, training schedule, and welcome communications.",
    thumbnail: "/store/templates/onboarding.jpg",
    category: "automation-templates",
    industry: ["Technology", "Healthcare", "Finance", "Manufacturing"],
    tags: ["hr", "onboarding", "employees", "provisioning"],
    apps: ["Google Workspace", "Microsoft 365", "Slack", "HRIS", "DocuSign"],
    difficulty: "advanced",
    dependencies: ["n8n", "HRIS system", "Identity provider"],
    version: "3.0.0",
    status: "published",
    metadata: {
      industry: "Cross-Industry",
      category: "automation-templates",
      tags: ["hr", "onboarding", "employees"],
      apps: ["Google Workspace", "Microsoft 365", "Slack"],
      difficulty: "advanced",
      dependencies: ["n8n", "HRIS"],
      estimatedSetupTime: "45 minutes",
      features: ["Document collection", "Account auto-provisioning", "Training schedule", "Welcome sequence"],
      useCases: ["HR automation", "Employee experience"],
      targetIndustry: "All",
      recommendedPlan: "Enterprise",
    },
    content: {},
    importCount: 1890,
    rating: 4.7,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-06-12T00:00:00Z",
  },
  {
    id: "t4",
    title: "Social Media Content Pipeline",
    summary: "AI-powered social media content creation and scheduling",
    description: "Automated social media workflow that generates, curates, schedules, and publishes content across all major platforms with AI-optimized posting times.",
    thumbnail: "/store/templates/social-media.jpg",
    category: "marketing-ai",
    industry: ["All Industries"],
    tags: ["social media", "content", "scheduling", "marketing"],
    apps: ["Meta", "Twitter", "LinkedIn", "Instagram", "Canva", "ChatGPT"],
    difficulty: "beginner",
    dependencies: ["n8n", "Social media API access"],
    version: "1.2.0",
    status: "published",
    metadata: {
      industry: "All",
      category: "marketing-ai",
      tags: ["social media", "content", "marketing"],
      apps: ["Meta", "Twitter", "LinkedIn", "Canva"],
      difficulty: "beginner",
      dependencies: ["n8n"],
      estimatedSetupTime: "15 minutes",
      features: ["AI content generation", "Auto-scheduling", "Cross-platform publishing", "Performance tracking"],
      useCases: ["Social media management", "Content marketing"],
      targetIndustry: "All",
      recommendedPlan: "Starter",
    },
    content: {},
    importCount: 6780,
    rating: 4.8,
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: "2026-06-20T00:00:00Z",
  },
];

const DEFAULT_METADATA: TemplateMetadata = {
  industry: "Cross-Industry",
  category: "automation-templates",
  tags: [],
  apps: [],
  difficulty: "intermediate",
  dependencies: [],
  estimatedSetupTime: "30 minutes",
  features: [],
  useCases: [],
  targetIndustry: "All",
  recommendedPlan: "Professional",
};

export const useTemplateEngine = create<TemplateEngineStore>()(
  persist(
    (set, get) => ({
      templates: sampleTemplates,
      selectedTemplateId: null,
      autoScanning: false,
      scanProgress: 0,

      setTemplates: (templates) => set({ templates }),
      addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, data) =>
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      deleteTemplate: (id) => set((state) => ({ templates: state.templates.filter((t) => t.id !== id) })),
      setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
      setAutoScanning: (scanning) => set({ autoScanning: scanning }),
      setScanProgress: (progress) => set({ scanProgress: progress }),

      startAutoScan: () => {
        set({ autoScanning: true, scanProgress: 0 });
        const interval = setInterval(() => {
          const current = get().scanProgress;
          if (current >= 100) {
            clearInterval(interval);
            set({ autoScanning: false });
            return;
          }
          set({ scanProgress: Math.min(current + Math.random() * 15, 100) });
        }, 800);
      },

      classifyTemplate: (id, metadata) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, metadata: { ...DEFAULT_METADATA, ...t.metadata, ...metadata } } : t
          ),
        }));
      },

      bulkPublish: (ids) =>
        set((state) => ({
          templates: state.templates.map((t) => (ids.includes(t.id) ? { ...t, status: "published" as const } : t)),
        })),

      bulkDelete: (ids) =>
        set((state) => ({
          templates: state.templates.filter((t) => !ids.includes(t.id)),
        })),

      bulkArchive: (ids) =>
        set((state) => ({
          templates: state.templates.map((t) => (ids.includes(t.id) ? { ...t, status: "archived" as const } : t)),
        })),

      duplicateTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) return;
        const duplicate: WorkflowTemplate = {
          ...template,
          id: `t${Date.now()}`,
          title: `${template.title} (Copy)`,
          status: "draft",
          importCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ templates: [...state.templates, duplicate] }));
      },

      getTemplatesByIndustry: (industry) =>
        get().templates.filter((t) => t.industry.includes(industry)),
      getTemplatesByCategory: (category) =>
        get().templates.filter((t) => t.category === category),
      search: (query) => {
        const q = query.toLowerCase();
        return get().templates.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.summary.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
            t.industry.some((i) => i.toLowerCase().includes(q))
        );
      },
    }),
    { name: "buildagent-template-engine" }
  )
);
