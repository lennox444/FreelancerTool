import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectProfitabilityService } from './project-profitability.service';
import { TaxAssistantModule } from '../tax-assistant/tax-assistant.module';

@Module({
  imports: [TaxAssistantModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectProfitabilityService],
  exports: [ProjectsService, ProjectProfitabilityService],
})
export class ProjectsModule {}

