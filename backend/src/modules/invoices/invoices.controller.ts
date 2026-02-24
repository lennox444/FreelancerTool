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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';
import { InvoiceStatus } from '@prisma/client';
import { DatevExportService } from '../pdf/datev-export.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly datevExportService: DatevExportService,
  ) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    const invoice = await this.invoicesService.create(createInvoiceDto, req.ownerId);
    return { data: invoice, meta: { timestamp: new Date().toISOString() } };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: InvoiceStatus,
    @Query('customerId') customerId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const invoices = await this.invoicesService.findAll(req.ownerId, { status, customerId, from, to });
    return { data: invoices, meta: { total: invoices.length, timestamp: new Date().toISOString() } };
  }

  @Get('overdue')
  async getOverdue(@Request() req) {
    const invoices = await this.invoicesService.getOverdue(req.ownerId);
    return { data: invoices, meta: { total: invoices.length, timestamp: new Date().toISOString() } };
  }

  @Get('export/datev')
  async exportDatev(
    @Request() req,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    const fiscalYear = year ? parseInt(year) : new Date().getFullYear();
    const from = new Date(`${fiscalYear}-01-01`).toISOString();
    const to = new Date(`${fiscalYear}-12-31`).toISOString();
    const invoices = await this.invoicesService.findAll(req.ownerId, {
      from,
      to,
      status: undefined,
    });
    const paid = invoices.filter((inv) =>
      ['PAID', 'PARTIALLY_PAID'].includes(inv.status),
    );
    const buffer = this.datevExportService.generateInvoicesDATEV(paid, fiscalYear);
    const filename = `DATEV_Rechnungen_${fiscalYear}.csv`;
    res.set({
      'Content-Type': 'text/csv; charset=windows-1252',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoicesService.findOne(id, req.ownerId);
    return { data: invoice, meta: { timestamp: new Date().toISOString() } };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req,
  ) {
    const invoice = await this.invoicesService.update(id, updateInvoiceDto, req.ownerId);
    return { data: invoice, meta: { timestamp: new Date().toISOString() } };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.invoicesService.remove(id, req.ownerId);
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }

  @Post(':id/send')
  async send(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoicesService.sendInvoice(id, req.ownerId);
    return { data: invoice, meta: { timestamp: new Date().toISOString() } };
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const invoice = await this.invoicesService.findOne(id, req.ownerId);
    const pdfBuffer = await this.invoicesService.downloadPdf(id, req.ownerId);
    const filename = `Rechnung-${invoice.invoiceNumber || invoice.id}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/send-email')
  async sendByEmail(@Param('id') id: string, @Request() req) {
    const result = await this.invoicesService.sendInvoiceByEmail(id, req.ownerId);
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }

  @Get(':id/time-entries')
  async getTimeEntries(@Param('id') id: string, @Request() req) {
    const entries = await this.invoicesService.getProjectTimeEntries(id, req.ownerId);
    return { data: entries, meta: { total: entries.length, timestamp: new Date().toISOString() } };
  }

  @Patch(':id/time-entries')
  async setTimeEntries(
    @Param('id') id: string,
    @Body('timeEntryIds') timeEntryIds: string[],
    @Request() req,
  ) {
    const result = await this.invoicesService.setTimeEntries(id, req.ownerId, timeEntryIds || []);
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }
}
