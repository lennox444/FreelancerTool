import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';
import { ExpenseCategory } from '@prisma/client';

@Controller('expenses')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Body() dto: CreateExpenseDto, @Request() req) {
    const expense = await this.expensesService.create(dto, req.ownerId);
    return { data: expense, meta: { timestamp: new Date().toISOString() } };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('category') category?: ExpenseCategory,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('projectId') projectId?: string,
  ) {
    const expenses = await this.expensesService.findAll(req.ownerId, { category, from, to, projectId });
    return { data: expenses, meta: { total: expenses.length, timestamp: new Date().toISOString() } };
  }

  @Get('summary')
  async getSummary(
    @Request() req,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const summary = await this.expensesService.getSummary(
      req.ownerId,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
    return { data: summary, meta: { timestamp: new Date().toISOString() } };
  }

  @Get('subscriptions')
  async getSubscriptions(@Request() req) {
    const subscriptions = await this.expensesService.getSubscriptions(req.ownerId);
    return { data: subscriptions, meta: { total: subscriptions.length, timestamp: new Date().toISOString() } };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const expense = await this.expensesService.findOne(id, req.ownerId);
    return { data: expense, meta: { timestamp: new Date().toISOString() } };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto, @Request() req) {
    const expense = await this.expensesService.update(id, dto, req.ownerId);
    return { data: expense, meta: { timestamp: new Date().toISOString() } };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.expensesService.remove(id, req.ownerId);
    return { data: result, meta: { timestamp: new Date().toISOString() } };
  }
}
