import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  targetHourlyRate?: number;
}
