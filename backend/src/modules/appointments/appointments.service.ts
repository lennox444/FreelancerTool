import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
    constructor(private prisma: PrismaService) { }

    async create(createAppointmentDto: CreateAppointmentDto, ownerId: string) {
        // Verify customer ownership if provided
        if (createAppointmentDto.customerId) {
            const customer = await this.prisma.customer.findFirst({
                where: { id: createAppointmentDto.customerId, ownerId },
            });
            if (!customer) throw new NotFoundException('Customer not found');
        }

        // Verify project ownership if provided
        if (createAppointmentDto.projectId) {
            const project = await this.prisma.project.findFirst({
                where: { id: createAppointmentDto.projectId, ownerId },
            });
            if (!project) throw new NotFoundException('Project not found');
        }

        return this.prisma.appointment.create({
            data: {
                ...createAppointmentDto,
                ownerId,
                startTime: new Date(createAppointmentDto.startTime),
                endTime: new Date(createAppointmentDto.endTime),
            },
            include: {
                customer: true,
                project: true,
            },
        });
    }

    async findAll(ownerId: string, filters?: { from?: string; to?: string; customerId?: string }) {
        const where: any = { ownerId };

        if (filters?.customerId) {
            where.customerId = filters.customerId;
        }

        if (filters?.from || filters?.to) {
            where.startTime = {};
            if (filters.from) where.startTime.gte = new Date(filters.from);
            if (filters.to) where.startTime.lte = new Date(filters.to);
        }

        const data = await this.prisma.appointment.findMany({
            where,
            include: {
                customer: {
                    select: { id: true, name: true, company: true },
                },
                project: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { startTime: 'asc' },
        });

        return {
            data: data,
            meta: {
                total: data.length,
                timestamp: new Date().toISOString(),
            },
        };
    }

    async findOne(id: string, ownerId: string) {
        const appointment = await this.prisma.appointment.findFirst({
            where: { id, ownerId },
            include: {
                customer: true,
                project: true,
            },
        });

        if (!appointment) throw new NotFoundException('Appointment not found');
        return appointment;
    }

    async update(id: string, updateAppointmentDto: UpdateAppointmentDto, ownerId: string) {
        await this.findOne(id, ownerId);

        // Verify customer ownership if provided
        if (updateAppointmentDto.customerId) {
            const customer = await this.prisma.customer.findFirst({
                where: { id: updateAppointmentDto.customerId, ownerId },
            });
            if (!customer) throw new NotFoundException('Customer not found');
        }

        // Verify project ownership if provided
        if (updateAppointmentDto.projectId) {
            const project = await this.prisma.project.findFirst({
                where: { id: updateAppointmentDto.projectId, ownerId },
            });
            if (!project) throw new NotFoundException('Project not found');
        }

        const data: any = { ...updateAppointmentDto };
        if (updateAppointmentDto.startTime) data.startTime = new Date(updateAppointmentDto.startTime);
        if (updateAppointmentDto.endTime) data.endTime = new Date(updateAppointmentDto.endTime);

        return this.prisma.appointment.update({
            where: { id },
            data,
            include: {
                customer: true,
                project: true,
            },
        });
    }

    async remove(id: string, ownerId: string) {
        await this.findOne(id, ownerId);
        return this.prisma.appointment.delete({ where: { id } });
    }
}
