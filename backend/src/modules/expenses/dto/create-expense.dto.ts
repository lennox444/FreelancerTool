import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min } from 'class-validator';
import { ExpenseCategory } from '@prisma/client';

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
}
