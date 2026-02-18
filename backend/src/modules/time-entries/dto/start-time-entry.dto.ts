import { IsOptional, IsString } from 'class-validator';

export class StartTimeEntryDto {
    @IsOptional()
    @IsString()
    projectId?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
