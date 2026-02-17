import { IsString, IsOptional, IsDateString, IsUrl } from 'class-validator';

export class CreateAppointmentDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;

    @IsOptional()
    @IsString()
    customerId?: string;

    @IsOptional()
    @IsString()
    projectId?: string;

    @IsOptional()
    @IsString()
    contactName?: string;

    @IsOptional()
    @IsString()
    contactEmail?: string;

    @IsOptional()
    @IsString()
    contactPhone?: string;

    @IsOptional()
    @IsString()
    meetingLink?: string;

    @IsOptional()
    @IsString()
    meetingId?: string;
}
