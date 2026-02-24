import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    Request,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Post()
    create(
        @Body() createAppointmentDto: CreateAppointmentDto,
        @Request() req,
    ) {
        return this.appointmentsService.create(createAppointmentDto, req.ownerId);
    }

    @Get()
    findAll(
        @Request() req,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('customerId') customerId?: string,
        @Query('projectId') projectId?: string,
    ) {
        return this.appointmentsService.findAll(req.ownerId, { from, to, customerId, projectId });
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.appointmentsService.findOne(id, req.ownerId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateAppointmentDto: UpdateAppointmentDto,
        @Request() req,
    ) {
        return this.appointmentsService.update(id, updateAppointmentDto, req.ownerId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.appointmentsService.remove(id, req.ownerId);
    }
}
