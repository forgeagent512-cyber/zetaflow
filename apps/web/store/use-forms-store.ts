import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FormDefinition } from "@/types/cms";

interface FormsStoreState {
  forms: FormDefinition[];
  selectedFormId: string | null;
  setForms: (forms: FormDefinition[]) => void;
  addForm: (form: FormDefinition) => void;
  updateForm: (id: string, updates: Partial<FormDefinition>) => void;
  deleteForm: (id: string) => void;
  setSelectedForm: (id: string | null) => void;
}

export const useFormsStore = create<FormsStoreState>()(
  persist(
    (set) => ({
      forms: [],
      selectedFormId: null,

      setForms: (forms) => set({ forms }),
      addForm: (form) => set((state) => ({ forms: [...state.forms, form] })),
      updateForm: (id, updates) =>
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          ),
        })),
      deleteForm: (id) =>
        set((state) => ({
          forms: state.forms.filter((f) => f.id !== id),
        })),
      setSelectedForm: (id) => set({ selectedFormId: id }),
    }),
    { name: "buildagent-forms" }
  )
);
