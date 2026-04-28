import { create } from 'zustand';

interface UserConfigState {
  hasCompletedOnboarding: boolean;
  socialAccounts: any[];
  setHasCompletedOnboarding: (val: boolean) => void;
}

export const useConfigStore = create<UserConfigState>((set) => ({
  hasCompletedOnboarding: false,
  socialAccounts: [],
  setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val })
}));
