import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { PublicInvoicesController } from './public-invoices.controller';
import { PdfModule } from '../pdf/pdf.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PdfModule, MailModule],
  controllers: [InvoicesController, PublicInvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
