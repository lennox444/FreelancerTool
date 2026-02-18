import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min, IsBoolean, IsUUID } from 'class-validator';
import { ExpenseCategory, RecurringInterval } from '@prisma/client';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  description: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(RecurringInterval)
  recurringInterval?: RecurringInterval;

  @IsOptional()
  @IsDateString()
  recurringStartDate?: string;

  @IsOptional()
  @IsDateString()
  recurringEndDate?: string;
}
