"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { licensesService } from "@/services/licenses.service";

interface LicenseState {
  license: any | null;
  isFetching: boolean;
  fetchLicense: (orgId: string) => Promise<void>;
  generateLicense: (data: { orgId: string; plan: string; seats?: number }) => Promise<any>;
  validateLicense: (licenseKey: string) => Promise<any>;
  activateLicense: (licenseKey: string, activationData?: any) => Promise<any>;
}

export const useLicenseStore = create<LicenseState>()(
  persist(
    (set, get) => ({
      license: null,
      isFetching: false,

      fetchLicense: async (orgId) => {
        set({ isFetching: true });
        try {
          const result = await licensesService.get(orgId);
          set({ license: result.data ?? null, isFetching: false });
        } catch {
          set({ isFetching: false });
        }
      },

      generateLicense: async (data) => {
        set({ isFetching: true });
        try {
          const result = await licensesService.generate(data);
          set({ license: result.data ?? null, isFetching: false });
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },

      validateLicense: async (licenseKey) => {
        try {
          const result = await licensesService.validate(licenseKey);
          return result.data;
        } catch (error) {
          throw error;
        }
      },

      activateLicense: async (licenseKey, activationData) => {
        set({ isFetching: true });
        try {
          const result = await licensesService.activate(licenseKey, activationData);
          set({ isFetching: false });
          return result.data;
        } catch (error) {
          set({ isFetching: false });
          throw error;
        }
      },
    }),
    { name: "buildagent-license-store" }
  )
);
