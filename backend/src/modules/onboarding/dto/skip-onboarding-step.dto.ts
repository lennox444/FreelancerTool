import { IsInt, Min, Max } from 'class-validator';

export class SkipOnboardingStepDto {
  @IsInt()
  @Min(1)
  @Max(5)
  stepNumber: number;
}
