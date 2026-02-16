import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingProfile } from '../types';

interface OnboardingState {
  profile: OnboardingProfile | null;
  currentStep: number;
  isCompleted: boolean;

  // Actions
  setProfile: (profile: OnboardingProfile) => void;
  updateStep: (stepData: Partial<OnboardingProfile>) => void;
  goToStep: (stepNumber: number) => void;
  markCompleted: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      profile: null,
      currentStep: 1,
      isCompleted: false,

      setProfile: (profile) =>
        set({
          profile,
          currentStep: profile.currentStep,
          isCompleted: profile.onboardingCompleted,
        }),

      updateStep: (stepData) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...stepData } : null,
        })),

      goToStep: (stepNumber) => set({ currentStep: stepNumber }),

      markCompleted: () => set({ isCompleted: true }),

      reset: () =>
        set({
          profile: null,
          currentStep: 1,
          isCompleted: false,
        }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
