import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { DatevExportService } from './datev-export.service';

@Module({
  providers: [PdfService, DatevExportService],
  exports: [PdfService, DatevExportService],
})
export class PdfModule {}
