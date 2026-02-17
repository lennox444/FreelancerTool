import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { TaxAssistantService } from './tax-assistant.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';

@Controller('tax-assistant')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class TaxAssistantController {
  constructor(private readonly taxAssistantService: TaxAssistantService) {}

  @Get()
  async calculate(@Request() req, @Query('year') year?: string) {
    const result = await this.taxAssistantService.calculate(
      req.ownerId,
      year ? parseInt(year) : undefined,
    );
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }
}
