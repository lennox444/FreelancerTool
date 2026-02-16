import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  invoiceId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
