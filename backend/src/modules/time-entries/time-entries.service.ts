import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { StartTimeEntryDto } from './dto/start-time-entry.dto';

@Injectable()
export class TimeEntriesService {
    constructor(private prisma: PrismaService) { }

    // ─── Active Timer ──────────────────────────────────────────────────

    async startTimer(dto: StartTimeEntryDto, ownerId: string) {
        // Cancel any lingering active timer first (safety valve)
        await this.prisma.timeEntry.updateMany({
            where: { ownerId, isActive: true },
            data: { isActive: false, endTime: new Date() },
        });

        return this.prisma.timeEntry.create({
            data: {
                ownerId,
                projectId: dto.projectId,
                description: dto.description,
                duration: 0,
                pauseDuration: 0,
                startTime: new Date(), // server-side timestamp — cannot be faked
                isActive: true,
            },
            include: { project: true },
        });
    }

    async getActive(ownerId: string) {
        return this.prisma.timeEntry.findFirst({
            where: { ownerId, isActive: true },
            include: { project: true },
        });
    }

    async pauseTimer(id: string, ownerId: string) {
        const entry = await this.findOne(id, ownerId);
        if (!entry.isActive) throw new BadRequestException('Timer ist nicht aktiv');
        if (entry.pauseStartedAt) throw new BadRequestException('Timer ist bereits pausiert');

        return this.prisma.timeEntry.update({
            where: { id },
            data: { pauseStartedAt: new Date() },
            include: { project: true },
        });
    }

    async resumeTimer(id: string, ownerId: string) {
        const entry = await this.findOne(id, ownerId);
        if (!entry.pauseStartedAt) throw new BadRequestException('Timer ist nicht pausiert');

        const pausedMs = new Date().getTime() - entry.pauseStartedAt.getTime();
        const addedSeconds = Math.floor(pausedMs / 1000);

        return this.prisma.timeEntry.update({
            where: { id },
            data: {
                pauseDuration: entry.pauseDuration + addedSeconds,
                pauseStartedAt: null,
            },
            include: { project: true },
        });
    }

    async stopTimer(id: string, ownerId: string) {
        const entry = await this.findOne(id, ownerId);
        if (!entry.isActive) throw new BadRequestException('Timer ist nicht aktiv');

        const now = new Date();

        // If still paused, count final pause segment
        let totalPause = entry.pauseDuration;
        if (entry.pauseStartedAt) {
            totalPause += Math.floor((now.getTime() - entry.pauseStartedAt.getTime()) / 1000);
        }

        const totalElapsed = Math.floor((now.getTime() - entry.startTime.getTime()) / 1000);
        const workSeconds = Math.max(0, totalElapsed - totalPause);

        return this.prisma.timeEntry.update({
            where: { id },
            data: {
                isActive: false,
                endTime: now,
                duration: workSeconds,
                pauseDuration: totalPause,
                pauseStartedAt: null,
            },
            include: { project: true },
        });
    }

    // ─── Standard CRUD ─────────────────────────────────────────────────

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
                isActive: false, // exclude running timers from history list
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
