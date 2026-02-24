import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min, IsBoolean } from 'class-validator';
import { InvoiceStatus, RecurringInterval } from '@prisma/client';

export class CreateInvoiceDto {
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
  dueDate: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  // Recurring invoice fields
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(RecurringInterval)
  recurringInterval?: string;

  @IsOptional()
  @IsDateString()
  recurringStartDate?: string;

  @IsOptional()
  @IsDateString()
  recurringEndDate?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsBoolean()
  onlinePaymentEnabled?: boolean;
}
