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
  locale: "es" | "en";
  tourCompleted: boolean;
  setHasCompletedOnboarding: (val: boolean) => void;
  setOrganizationId: (id: string) => void;
  setLocale: (locale: "es" | "en") => void;
  setTourCompleted: (val: boolean) => void;
}

export const useConfigStore = create<UserConfigState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      organizationId: "org-default-123",
      socialAccounts: [],
      locale: "es",
      tourCompleted: false,
      setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
      setOrganizationId: (id) => set({ organizationId: id }),
      setLocale: (locale) => set({ locale }),
      setTourCompleted: (val) => set({ tourCompleted: val }),
    }),
    {
      name: "siag-config-store",
    },
  ),
);
