import { IsEmail, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  defaultPaymentTerms?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
