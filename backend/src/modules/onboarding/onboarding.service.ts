import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UpdateOnboardingStepDto } from './dto/update-onboarding-step.dto';
import { OnboardingEventType } from '@prisma/client';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create onboarding profile for user
   */
  async getOrCreateProfile(userId: string) {
    let profile = await this.prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create new profile
      profile = await this.prisma.onboardingProfile.create({
        data: {
          userId,
          currentStep: 1,
          onboardingCompleted: false,
        },
      });

      // Track ONBOARDING_STARTED event
      await this.trackEvent(userId, OnboardingEventType.ONBOARDING_STARTED, null);
    }

    return profile;
  }

  /**
   * Get onboarding status
   */
  async getStatus(userId: string) {
    return this.getOrCreateProfile(userId);
  }

  /**
   * Get full onboarding profile
   */
  async getProfile(userId: string) {
    const profile = await this.prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Onboarding profile not found');
    }

    return profile;
  }

  /**
   * Update specific onboarding step
   */
  async updateStep(userId: string, dto: UpdateOnboardingStepDto) {
    const { stepNumber, ...stepData } = dto;

    // Validate step number
    if (stepNumber < 1 || stepNumber > 5) {
      throw new BadRequestException('Invalid step number. Must be between 1 and 5.');
    }

    // Get or create profile
    const profile = await this.getOrCreateProfile(userId);

    // Prepare update data
    const updateData: any = { ...stepData };

    // Increment currentStep if completing the current or previous step
    if (stepNumber >= profile.currentStep && stepNumber < 5) {
      updateData.currentStep = stepNumber + 1;
    }

    // Update profile
    const updatedProfile = await this.prisma.onboardingProfile.update({
      where: { userId },
      data: updateData,
    });

    // Track STEP_COMPLETED event
    await this.trackEvent(userId, OnboardingEventType.STEP_COMPLETED, stepNumber, stepData);

    return updatedProfile;
  }

  /**
   * Skip a step
   */
  async skipStep(userId: string, stepNumber: number) {
    // Validate step number
    if (stepNumber < 1 || stepNumber > 5) {
      throw new BadRequestException('Invalid step number. Must be between 1 and 5.');
    }

    // Get or create profile
    const profile = await this.getOrCreateProfile(userId);

    // Increment currentStep if skipping current step
    let updateData: any = {};
    if (stepNumber >= profile.currentStep && stepNumber < 5) {
      updateData.currentStep = stepNumber + 1;
    }

    // Update profile
    const updatedProfile = await this.prisma.onboardingProfile.update({
      where: { userId },
      data: updateData,
    });

    // Track STEP_SKIPPED event
    await this.trackEvent(userId, OnboardingEventType.STEP_SKIPPED, stepNumber);

    return updatedProfile;
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(userId: string) {
    const profile = await this.getOrCreateProfile(userId);

    const updatedProfile = await this.prisma.onboardingProfile.update({
      where: { userId },
      data: {
        onboardingCompleted: true,
        completedAt: new Date(),
        currentStep: 5,
      },
    });

    // Track ONBOARDING_COMPLETED event
    await this.trackEvent(userId, OnboardingEventType.ONBOARDING_COMPLETED, null);

    return updatedProfile;
  }

  /**
   * Track onboarding event for analytics
   */
  private async trackEvent(
    userId: string,
    eventType: OnboardingEventType,
    stepNumber: number | null,
    metadata?: any,
  ) {
    await this.prisma.onboardingEvent.create({
      data: {
        userId,
        eventType,
        stepNumber,
        metadata: metadata || null,
      },
    });
  }
}
