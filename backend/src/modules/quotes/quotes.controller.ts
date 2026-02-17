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
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';
import { QuoteStatus } from '@prisma/client';

@Controller('quotes')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  async create(@Body() dto: CreateQuoteDto, @Request() req) {
    const quote = await this.quotesService.create(dto, req.ownerId);
    return { data: quote, meta: { timestamp: new Date().toISOString() } };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: QuoteStatus,
    @Query('customerId') customerId?: string,
  ) {
    const quotes = await this.quotesService.findAll(req.ownerId, { status, customerId });
    return { data: quotes, meta: { total: quotes.length, timestamp: new Date().toISOString() } };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const quote = await this.quotesService.findOne(id, req.ownerId);
    return { data: quote, meta: { timestamp: new Date().toISOString() } };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuoteDto, @Request() req) {
    const quote = await this.quotesService.update(id, dto, req.ownerId);
    return { data: quote, meta: { timestamp: new Date().toISOString() } };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.quotesService.remove(id, req.ownerId);
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }

  @Post(':id/send')
  async send(@Param('id') id: string, @Request() req) {
    const quote = await this.quotesService.sendQuote(id, req.ownerId);
    return { data: quote, meta: { timestamp: new Date().toISOString() } };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: QuoteStatus,
    @Request() req,
  ) {
    const quote = await this.quotesService.updateStatus(id, req.ownerId, status);
    return { data: quote, meta: { timestamp: new Date().toISOString() } };
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const quote = await this.quotesService.findOne(id, req.ownerId);
    const pdfBuffer = await this.quotesService.downloadPdf(id, req.ownerId);
    const filename = `Angebot-${quote.quoteNumber || quote.id}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/send-email')
  async sendByEmail(@Param('id') id: string, @Request() req) {
    const result = await this.quotesService.sendByEmail(id, req.ownerId);
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }

  @Post(':id/convert')
  async convertToInvoice(@Param('id') id: string, @Request() req) {
    const invoice = await this.quotesService.convertToInvoice(id, req.ownerId);
    return { data: invoice, meta: { timestamp: new Date().toISOString() } };
  }
}
