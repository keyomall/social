import { create } from 'zustand';

interface UserConfigState {
  hasCompletedOnboarding: boolean;
  organizationId: string;
  socialAccounts: any[];
  setHasCompletedOnboarding: (val: boolean) => void;
  setOrganizationId: (id: string) => void;
}

export const useConfigStore = create<UserConfigState>((set) => ({
  hasCompletedOnboarding: false,
  organizationId: "org-default-123", // Default local dev ID
  socialAccounts: [],
  setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
  setOrganizationId: (id) => set({ organizationId: id })
}));
