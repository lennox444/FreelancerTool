import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOnboardingStepDto } from './dto/update-onboarding-step.dto';
import {
  FreelancerVertical,
  CurrentWorkflow,
  BusinessStage,
  AcquisitionChannel,
  OnboardingEventType,
} from '@prisma/client';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateProfile(userId: string) {
    let profile = await this.prisma.onboardingProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      // Create new profile and track start event
      profile = await this.prisma.onboardingProfile.create({
        data: { userId },
        include: { user: true },
      });

      await this.trackEvent(userId, OnboardingEventType.ONBOARDING_STARTED);
    }

    return profile;
  }

  async getStatus(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    return profile;
  }

  async updateStep(userId: string, dto: UpdateOnboardingStepDto) {
    const { stepNumber, ...stepData } = dto;

    // Verify profile exists
    await this.getOrCreateProfile(userId);

    // Build update data
    const updateData: any = {};
    
    if (stepData.vertical !== undefined) {
      updateData.vertical = stepData.vertical;
    }
    if (stepData.currentWorkflow !== undefined) {
      updateData.currentWorkflow = stepData.currentWorkflow;
    }
    if (stepData.businessStage !== undefined) {
      updateData.businessStage = stepData.businessStage;
    }
    if (stepData.acquisitionChannel !== undefined) {
      updateData.acquisitionChannel = stepData.acquisitionChannel;
    }
    if (stepData.acquisitionChannelOther !== undefined) {
      updateData.acquisitionChannelOther = stepData.acquisitionChannelOther;
    }

    // Update currentStep to next step
    updateData.currentStep = Math.min(stepNumber + 1, 5);

    // Update profile
    const profile = await this.prisma.onboardingProfile.update({
      where: { userId },
      data: updateData,
      include: { user: true },
    });

    // Track completion event
    await this.trackEvent(
      userId,
      OnboardingEventType.STEP_COMPLETED,
      stepNumber,
      stepData,
    );

    return profile;
  }

  async skipStep(userId: string, stepNumber: number) {
    // Verify profile exists
    await this.getOrCreateProfile(userId);

    // Update currentStep to next step
    const profile = await this.prisma.onboardingProfile.update({
      where: { userId },
      data: {
        currentStep: Math.min(stepNumber + 1, 5),
      },
      include: { user: true },
    });

    // Track skip event
    await this.trackEvent(userId, OnboardingEventType.STEP_SKIPPED, stepNumber);

    return profile;
  }

  async completeOnboarding(userId: string) {
    // Verify profile exists
    await this.getOrCreateProfile(userId);

    // Mark as completed
    const profile = await this.prisma.onboardingProfile.update({
      where: { userId },
      data: {
        onboardingCompleted: true,
        completedAt: new Date(),
        currentStep: 5,
      },
      include: { user: true },
    });

    // Track completion event
    await this.trackEvent(userId, OnboardingEventType.ONBOARDING_COMPLETED);

    return profile;
  }

  async getProfile(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    return profile;
  }

  private async trackEvent(
    userId: string,
    eventType: OnboardingEventType,
    stepNumber?: number,
    metadata?: any,
  ) {
    await this.prisma.onboardingEvent.create({
      data: {
        userId,
        eventType,
        stepNumber,
        metadata: metadata || undefined,
      },
    });
  }
}
