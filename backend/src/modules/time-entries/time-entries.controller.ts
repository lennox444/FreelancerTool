import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
    constructor(private readonly timeEntriesService: TimeEntriesService) { }

    @Post()
    async create(@Body() createTimeEntryDto: CreateTimeEntryDto, @Request() req) {
        const entry = await this.timeEntriesService.create(
            createTimeEntryDto,
            req.user.id,
        );
        return {
            data: entry,
            meta: { timestamp: new Date().toISOString() },
        };
    }

    @Get()
    async findAll(@Request() req, @Query('projectId') projectId?: string) {
        const entries = await this.timeEntriesService.findAll(req.user.id, projectId);
        return {
            data: entries,
            meta: {
                total: entries.length,
                timestamp: new Date().toISOString()
            },
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        const entry = await this.timeEntriesService.findOne(id, req.user.id);
        return {
            data: entry,
            meta: { timestamp: new Date().toISOString() },
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateTimeEntryDto: UpdateTimeEntryDto,
        @Request() req,
    ) {
        const entry = await this.timeEntriesService.update(
            id,
            updateTimeEntryDto,
            req.user.id,
        );
        return {
            data: entry,
            meta: { timestamp: new Date().toISOString() },
        };
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        const result = await this.timeEntriesService.remove(id, req.user.id);
        return {
            data: result,
            meta: { timestamp: new Date().toISOString() },
        };
    }
}
