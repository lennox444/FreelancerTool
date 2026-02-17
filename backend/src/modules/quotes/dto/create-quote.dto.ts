import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsDateString()
  validUntil: string;

  @IsOptional()
  @IsString()
  quoteNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
