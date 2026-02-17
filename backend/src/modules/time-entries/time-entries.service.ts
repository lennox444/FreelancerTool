import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';

@Injectable()
export class TimeEntriesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTimeEntryDto, ownerId: string) {
        return this.prisma.timeEntry.create({
            data: {
                ownerId,
                projectId: dto.projectId,
                description: dto.description,
                duration: dto.duration,
                pauseDuration: dto.pauseDuration || 0,
                startTime: new Date(dto.startTime),
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
            },
            include: {
                project: true,
            },
        });
    }

    async findAll(ownerId: string, projectId?: string) {
        return this.prisma.timeEntry.findMany({
            where: {
                ownerId,
                ...(projectId ? { projectId } : {}),
            },
            include: {
                project: true,
            },
            orderBy: {
                startTime: 'desc',
            },
        });
    }

    async findOne(id: string, ownerId: string) {
        const entry = await this.prisma.timeEntry.findFirst({
            where: { id, ownerId },
            include: {
                project: true,
            },
        });

        if (!entry) {
            throw new NotFoundException('Zeiteintrag nicht gefunden');
        }

        return entry;
    }

    async update(id: string, dto: UpdateTimeEntryDto, ownerId: string) {
        await this.findOne(id, ownerId);

        return this.prisma.timeEntry.update({
            where: { id },
            data: {
                projectId: dto.projectId,
                description: dto.description,
                duration: dto.duration,
                pauseDuration: dto.pauseDuration,
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
            },
            include: {
                project: true,
            },
        });
    }

    async remove(id: string, ownerId: string) {
        await this.findOne(id, ownerId);
        await this.prisma.timeEntry.delete({
            where: { id },
        });
        return { success: true };
    }
}
