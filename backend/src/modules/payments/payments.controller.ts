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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    const payment = await this.paymentsService.create(
      createPaymentDto,
      req.ownerId,
    );
    return {
      data: payment,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('invoiceId') invoiceId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const payments = await this.paymentsService.findAll(req.ownerId, {
      invoiceId,
      from,
      to,
    });
    return {
      data: payments,
      meta: {
        total: payments.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('stats')
  async getStats(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const stats = await this.paymentsService.getStats(
      req.ownerId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return {
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const payment = await this.paymentsService.findOne(id, req.ownerId);
    return {
      data: payment,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Request() req,
  ) {
    const payment = await this.paymentsService.update(
      id,
      updatePaymentDto,
      req.ownerId,
    );
    return {
      data: payment,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.paymentsService.remove(id, req.ownerId);
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
