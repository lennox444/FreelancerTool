import { IsString, IsOptional, IsNumber, IsISO8601 } from 'class-validator';

export class CreateTimeEntryDto {
    @IsOptional()
    @IsString()
    projectId?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    duration: number;

    @IsOptional()
    @IsNumber()
    pauseDuration?: number;

    @IsISO8601()
    startTime: string;

    @IsOptional()
    @IsISO8601()
    endTime?: string;
}
