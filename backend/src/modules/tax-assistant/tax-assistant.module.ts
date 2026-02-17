import { Module } from '@nestjs/common';
import { TaxAssistantService } from './tax-assistant.service';
import { TaxAssistantController } from './tax-assistant.controller';

@Module({
  controllers: [TaxAssistantController],
  providers: [TaxAssistantService],
})
export class TaxAssistantModule {}
