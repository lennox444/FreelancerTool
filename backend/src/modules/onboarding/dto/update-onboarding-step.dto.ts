import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export enum FreelancerVertical {
  DESIGNER = 'DESIGNER',
  DEVELOPER = 'DEVELOPER',
  CONSULTANT = 'CONSULTANT',
  MARKETING_CONTENT = 'MARKETING_CONTENT',
  PHOTOGRAPHER_VIDEOGRAPHER = 'PHOTOGRAPHER_VIDEOGRAPHER',
  OTHER = 'OTHER',
}

export enum CurrentWorkflow {
  EXCEL_SHEETS = 'EXCEL_SHEETS',
  WORD_DOCUMENTS = 'WORD_DOCUMENTS',
  OTHER_SOFTWARE = 'OTHER_SOFTWARE',
  UNORGANIZED = 'UNORGANIZED',
}

export enum BusinessStage {
  JUST_STARTED = 'JUST_STARTED',
  GROWING = 'GROWING',
  ESTABLISHED = 'ESTABLISHED',
  SIDE_BUSINESS = 'SIDE_BUSINESS',
}

export enum AcquisitionChannel {
  LINKEDIN = 'LINKEDIN',
  REDDIT = 'REDDIT',
  FACEBOOK_GROUP = 'FACEBOOK_GROUP',
  REFERRAL = 'REFERRAL',
  GOOGLE_SEARCH = 'GOOGLE_SEARCH',
  OTHER = 'OTHER',
}

export class UpdateOnboardingStepDto {
  @IsOptional()
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
