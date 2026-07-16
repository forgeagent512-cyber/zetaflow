import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EmailTemplate } from "@/types/cms";

interface EmailTemplatesStoreState {
  templates: EmailTemplate[];
  selectedTemplateId: string | null;
  setTemplates: (templates: EmailTemplate[]) => void;
  addTemplate: (template: EmailTemplate) => void;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplate: (id: string | null) => void;
  getTemplateByType: (type: string) => EmailTemplate | undefined;
}

export const useEmailTemplatesStore = create<EmailTemplatesStoreState>()(
  persist(
    (set, get) => ({
      templates: [],
      selectedTemplateId: null,

      setTemplates: (templates) => set({ templates }),
      addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      setSelectedTemplate: (id) => set({ selectedTemplateId: id }),
      getTemplateByType: (type) => get().templates.find((t) => t.type === type),
    }),
    { name: "buildagent-email-templates" }
  )
);

// Note: setSelectedFormId should be selectedTemplateId - fixed in interface above
