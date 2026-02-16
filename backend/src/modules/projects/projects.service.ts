import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, ownerId: string) {
    // Validate customer ownership if customerId provided
    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: dto.customerId, ownerId },
      });

      if (!customer) {
        throw new BadRequestException(
          'Customer not found or access forbidden',
        );
      }
    }

    // Validate dates if both provided
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (end < start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Create project
    const project = await this.prisma.project.create({
      data: {
        ownerId,
        name: dto.name,
        description: dto.description,
        customerId: dto.customerId,
        status: dto.status || ProjectStatus.PLANNING,
        budget: dto.budget,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        notes: dto.notes,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    return project;
  }

  async findAll(
    ownerId: string,
    search?: string,
    status?: ProjectStatus,
    customerId?: string,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
  ) {
    const where: any = { ownerId };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Customer filter
    if (customerId) {
      where.customerId = customerId;
    }

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { [sortBy]: order },
    });

    return projects;
  }

  async findOne(id: string, ownerId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            status: true,
            issueDate: true,
            dueDate: true,
          },
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, ownerId: string) {
    // Verify ownership
    const existingProject = await this.findOne(id, ownerId);

    // Validate customer ownership if updating customerId
    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: dto.customerId, ownerId },
      });

      if (!customer) {
        throw new BadRequestException(
          'Customer not found or access forbidden',
        );
      }
    }

    // Validate dates if both provided
    if (dto.startDate && dto.endDate) {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (end < start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Update project
    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        customerId: dto.customerId,
        status: dto.status,
        budget: dto.budget,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        notes: dto.notes,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    return project;
  }

  async remove(id: string, ownerId: string) {
    // Verify ownership
    const project = await this.findOne(id, ownerId);

    // Check if project has invoices
    const invoiceCount = await this.prisma.invoice.count({
      where: { projectId: id },
    });

    if (invoiceCount > 0) {
      throw new BadRequestException(
        'Cannot delete project with associated invoices',
      );
    }

    // Delete project
    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }
}
