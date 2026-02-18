import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectProfitabilityService } from './project-profitability.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ProjectStatus } from '@prisma/client';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly profitabilityService: ProjectProfitabilityService,
  ) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(dto, req.user.id);
    return {
      data: project,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('status') status?: ProjectStatus,
    @Query('customerId') customerId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    const projects = await this.projectsService.findAll(
      req.user.id,
      search,
      status,
      customerId,
      sortBy,
      order,
    );
    return {
      data: projects,
      meta: {
        timestamp: new Date().toISOString(),
        total: projects.length,
      },
    };
  }

  // NOTE: Both profitability routes must be declared BEFORE GET :id
  @Get(':id/profitability/history')
  async getProfitabilityHistory(
    @Request() req,
    @Param('id') id: string,
    @Query('months') months?: string,
  ) {
    const result = await this.profitabilityService.getHistory(
      id,
      req.user.id,
      months ? Math.min(24, Math.max(1, parseInt(months, 10))) : 6,
    );
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get(':id/profitability')
  async getProfitability(@Request() req, @Param('id') id: string) {
    const result = await this.profitabilityService.calculate(id, req.user.id);
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const project = await this.projectsService.findOne(id, req.user.id);
    return {
      data: project,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.update(
      id,
      dto,
      req.user.id,
    );
    return {
      data: project,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const result = await this.projectsService.remove(id, req.user.id);
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
