import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBankAccountDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    bankName: string;

    @IsOptional()
    @IsString()
    iban: string;

    @IsOptional()
    @IsString()
    bic: string;

    @IsOptional()
    @IsString()
    accountHolder: string;

    @IsOptional()
    @IsBoolean()
    isPaypal: boolean;

    @IsOptional()
    @IsString()
    paypalEmail: string;

    @IsOptional()
    @IsBoolean()
    isDefault: boolean;
}

export class UpdateBankAccountDto extends CreateBankAccountDto { }
