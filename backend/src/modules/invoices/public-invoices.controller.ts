import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('public/invoices')
export class PublicInvoicesController {
  constructor(private readonly invoicesService: InvoicesService) { }

  @Get(':token')
  async findByToken(@Param('token') token: string) {
    const invoice = await this.invoicesService.findByPublicToken(token);
    return { data: invoice, meta: { timestamp: new Date().toISOString() } };
  }

  @Post(':token/checkout-session')
  async createCheckoutSession(@Param('token') token: string) {
    const result = await this.invoicesService.createInvoiceCheckoutSession(token);
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }

  @Post(':token/verify-payment')
  async verifyPayment(@Param('token') token: string, @Body('sessionId') sessionId: string) {
    const result = await this.invoicesService.verifyInvoicePayment(token, sessionId);
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }
}
