import apiClient from './client';
import type {
  OnboardingProfile,
  ApiResponse,
  FreelancerVertical,
  CurrentWorkflow,
  BusinessStage,
  AcquisitionChannel,
} from '../types';

interface UpdateStepData {
  vertical?: FreelancerVertical;
  currentWorkflow?: CurrentWorkflow;
  businessStage?: BusinessStage;
  acquisitionChannel?: AcquisitionChannel;
  acquisitionChannelOther?: string;
}

export const onboardingApi = {
  /**
   * Get current onboarding status
   */
  getStatus: async (): Promise<OnboardingProfile> => {
    const response = await apiClient.get<ApiResponse<OnboardingProfile>>(
      '/onboarding/status'
    );
    return response.data.data;
  },

  /**
   * Get full onboarding profile
   */
  getProfile: async (): Promise<OnboardingProfile> => {
    const response = await apiClient.get<ApiResponse<OnboardingProfile>>(
      '/onboarding/profile'
    );
    return response.data.data;
  },

  /**
   * Update specific onboarding step
   */
  updateStep: async (
    stepNumber: number,
    data: UpdateStepData
  ): Promise<OnboardingProfile> => {
    const response = await apiClient.patch<ApiResponse<OnboardingProfile>>(
      `/onboarding/step/${stepNumber}`,
      data
    );
    return response.data.data;
  },

  /**
   * Skip specific step
   */
  skipStep: async (stepNumber: number): Promise<OnboardingProfile> => {
    const response = await apiClient.post<ApiResponse<OnboardingProfile>>(
      `/onboarding/skip/${stepNumber}`
    );
    return response.data.data;
  },

  /**
   * Mark onboarding as completed
   */
  complete: async (): Promise<OnboardingProfile> => {
    const response = await apiClient.post<ApiResponse<OnboardingProfile>>(
      '/onboarding/complete'
    );
    return response.data.data;
  },
};
