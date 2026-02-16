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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';
import { InvoiceStatus } from '@prisma/client';

@Controller('invoices')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    const invoice = await this.invoicesService.create(
      createInvoiceDto,
      req.ownerId,
    );
    return {
      data: invoice,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: InvoiceStatus,
    @Query('customerId') customerId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const invoices = await this.invoicesService.findAll(req.ownerId, {
      status,
      customerId,
      from,
      to,
    });
    return {
      data: invoices,
      meta: {
        total: invoices.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('overdue')
  async getOverdue(@Request() req) {
    const invoices = await this.invoicesService.getOverdue(req.ownerId);
    return {
      data: invoices,
      meta: {
        total: invoices.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoicesService.findOne(id, req.ownerId);
    return {
      data: invoice,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req,
  ) {
    const invoice = await this.invoicesService.update(
      id,
      updateInvoiceDto,
      req.ownerId,
    );
    return {
      data: invoice,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.invoicesService.remove(id, req.ownerId);
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post(':id/send')
  async send(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoicesService.sendInvoice(id, req.ownerId);
    return {
      data: invoice,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
