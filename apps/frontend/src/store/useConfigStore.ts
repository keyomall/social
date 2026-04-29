import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SocialAccount {
  platform: string;
  handle: string;
}

interface UserConfigState {
  hasCompletedOnboarding: boolean;
  organizationId: string;
  socialAccounts: SocialAccount[];
  setHasCompletedOnboarding: (val: boolean) => void;
  setOrganizationId: (id: string) => void;
}

export const useConfigStore = create<UserConfigState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      organizationId: "org-default-123",
      socialAccounts: [],
      setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
      setOrganizationId: (id) => set({ organizationId: id }),
    }),
    {
      name: "siag-config-store",
    },
  ),
);
