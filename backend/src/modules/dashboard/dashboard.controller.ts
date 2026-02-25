import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@Request() req) {
    const data = await this.dashboardService.getOverview(req.ownerId);
    return { data, meta: { timestamp: new Date().toISOString() } };
  }

  @Get('stats')
  async getStats(@Request() req) {
    const stats = await this.dashboardService.getStats(req.ownerId);
    return {
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get('overdue')
  async getOverdueInvoices(@Request() req) {
    const invoices = await this.dashboardService.getOverdueInvoices(
      req.ownerId,
    );
    return {
      data: invoices,
      meta: {
        total: invoices.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('cashflow')
  async getCashflowForecast(@Request() req) {
    const forecast = await this.dashboardService.getCashflowForecast(
      req.ownerId,
    );
    return {
      data: forecast,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get('activity')
  async getRecentActivity(
    @Request() req,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const activities = await this.dashboardService.getRecentActivity(
      req.ownerId,
      limit,
    );
    return {
      data: activities,
      meta: {
        total: activities.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('revenue-trend')
  async getRevenueTrend(
    @Request() req,
    @Query('months', new ParseIntPipe({ optional: true })) months?: number,
  ) {
    const trend = await this.dashboardService.getRevenueTrend(
      req.ownerId,
      months,
    );
    return {
      data: trend,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
