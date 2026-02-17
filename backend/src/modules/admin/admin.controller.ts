import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole, SubscriptionPlan } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Users ───────────────────────────────────────────────────────────────

  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.adminService.getUsers(search, page, limit);
  }

  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/plan')
  updateUserPlan(
    @Param('id') id: string,
    @Body('plan') plan: SubscriptionPlan,
  ) {
    return this.adminService.updateUserPlan(id, plan);
  }

  @Patch('users/:id/trial')
  extendTrial(
    @Param('id') id: string,
    @Body('days', ParseIntPipe) days: number,
  ) {
    return this.adminService.extendTrial(id, days);
  }

  @Patch('users/:id/status')
  setUserStatus(
    @Param('id') id: string,
    @Body('suspend') suspend: boolean,
  ) {
    return this.adminService.setUserSuspended(id, suspend);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ─── Metrics & Revenue & Health ──────────────────────────────────────────

  @Get('metrics')
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get('revenue')
  getRevenue() {
    return this.adminService.getRevenue();
  }

  @Get('health')
  getHealth() {
    return this.adminService.getHealth();
  }
}
