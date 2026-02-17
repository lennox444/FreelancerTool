import { Controller, Get, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('public/invoices')
export class PublicInvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':token')
  async findByToken(@Param('token') token: string) {
    const invoice = await this.invoicesService.findByPublicToken(token);
    return { data: invoice, meta: { timestamp: new Date().toISOString() } };
  }
}
