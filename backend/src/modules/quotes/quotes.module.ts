import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { PdfModule } from '../pdf/pdf.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PdfModule, MailModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
