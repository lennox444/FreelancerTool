import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import {
  FreelancerVertical,
  CurrentWorkflow,
  BusinessStage,
  AcquisitionChannel,
} from '@prisma/client';

export class UpdateOnboardingStepDto {
  @IsInt()
  @Min(1)
  @Max(5)
  stepNumber: number;

  // Step 1: Vertical
  @IsOptional()
  @IsEnum(FreelancerVertical)
  vertical?: FreelancerVertical;

  // Step 2: Current Workflow
  @IsOptional()
  @IsEnum(CurrentWorkflow)
  currentWorkflow?: CurrentWorkflow;

  // Step 3: Business Stage
  @IsOptional()
  @IsEnum(BusinessStage)
  businessStage?: BusinessStage;

  // Step 4: Acquisition Channel
  @IsOptional()
  @IsEnum(AcquisitionChannel)
  acquisitionChannel?: AcquisitionChannel;

  @IsOptional()
  @IsString()
  acquisitionChannelOther?: string;
}
