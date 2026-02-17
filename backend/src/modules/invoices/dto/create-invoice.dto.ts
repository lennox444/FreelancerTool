import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

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
}
