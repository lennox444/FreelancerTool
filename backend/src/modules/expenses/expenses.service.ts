import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseCategory, RecurringInterval } from '@prisma/client';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpenseDto, ownerId: string) {
    const isRecurring = dto.isRecurring ?? false;
    const startDate = dto.recurringStartDate ? new Date(dto.recurringStartDate) : new Date();

    let nextExpenseDate: Date | undefined;
    if (isRecurring && dto.recurringInterval) {
      nextExpenseDate = this.calculateNextExpenseDate(startDate, dto.recurringInterval);
    }

    return this.prisma.expense.create({
      data: {
        ownerId,
        amount: dto.amount,
        description: dto.description,
        category: dto.category,
        date: dto.date ? new Date(dto.date) : new Date(),
        receiptUrl: dto.receiptUrl,
        notes: dto.notes,
        projectId: dto.projectId ?? null,
        isRecurring,
        recurringInterval: dto.recurringInterval,
        recurringStartDate: isRecurring ? startDate : undefined,
        recurringEndDate: dto.recurringEndDate ? new Date(dto.recurringEndDate) : undefined,
        nextExpenseDate: nextExpenseDate,
      },
    });
  }

  async findAll(
    ownerId: string,
    filters?: {
      category?: ExpenseCategory;
      from?: string;
      to?: string;
      projectId?: string;
    },
  ) {
    const where: any = {
      ownerId,
      // Exclude recurring templates from the regular list
      OR: [
        { isRecurring: false },
        { isRecurring: true, parentExpenseId: { not: null } },
      ],
    };

    if (filters?.category) where.category = filters.category;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.from || filters?.to) {
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) where.date.lte = new Date(filters.to);
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, ownerId },
    });
    if (!expense) throw new NotFoundException('Expense not found or access denied');
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto, ownerId: string) {
    await this.findOne(id, ownerId);
    const updateData: any = { ...dto };
    if (dto.date) updateData.date = new Date(dto.date);
    if ((dto as any).recurringStartDate) updateData.recurringStartDate = new Date((dto as any).recurringStartDate);
    if ((dto as any).recurringEndDate) updateData.recurringEndDate = new Date((dto as any).recurringEndDate);

    // Recompute nextExpenseDate if interval changes
    if ((dto as any).recurringInterval && (dto as any).isRecurring) {
      const from = (dto as any).recurringStartDate ? new Date((dto as any).recurringStartDate) : new Date();
      updateData.nextExpenseDate = this.calculateNextExpenseDate(from, (dto as any).recurringInterval);
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, ownerId: string) {
    await this.findOne(id, ownerId);
    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted successfully' };
  }

  /**
   * Returns all recurring subscription templates for the owner
   */
  async getSubscriptions(ownerId: string) {
    return this.prisma.expense.findMany({
      where: {
        ownerId,
        isRecurring: true,
        parentExpenseId: null,
      },
      orderBy: { nextExpenseDate: 'asc' },
    });
  }

  /**
   * Get summary: income vs expenses for a date range
   */
  async getSummary(ownerId: string, year?: number, month?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = month !== undefined
      ? new Date(targetYear, month - 1, 1)
      : new Date(`${targetYear}-01-01`);
    const endDate = month !== undefined
      ? new Date(targetYear, month, 0, 23, 59, 59)
      : new Date(`${targetYear}-12-31T23:59:59`);

    const [expenses, invoices] = await Promise.all([
      this.prisma.expense.findMany({
        where: {
          ownerId,
          date: { gte: startDate, lte: endDate },
          // Exclude recurring templates from summary
          OR: [
            { isRecurring: false },
            { isRecurring: true, parentExpenseId: { not: null } },
          ],
        },
      }),
      this.prisma.invoice.findMany({
        where: {
          ownerId,
          status: { in: ['PAID', 'PARTIALLY_PAID'] },
          issueDate: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.totalPaid), 0);

    // By category
    const byCategory: Record<string, number> = {};
    for (const expense of expenses) {
      byCategory[expense.category] = (byCategory[expense.category] || 0) + Number(expense.amount);
    }

    // Monthly breakdown
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthStart = new Date(`${targetYear}-${String(month).padStart(2, '0')}-01`);
      const monthEnd = new Date(targetYear, month, 0, 23, 59, 59);

      const monthRevenue = invoices
        .filter((inv) => {
          const d = new Date(inv.issueDate);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, inv) => sum + Number(inv.totalPaid), 0);

      const monthExpenses = expenses
        .filter((exp) => {
          const d = new Date(exp.date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      return {
        month,
        monthName: new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(monthStart),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses,
      };
    });

    return {
      year: targetYear,
      month,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      byCategory,
      monthlyData,
    };
  }

  /**
   * Daily cron at 05:00 — generate expense entries from recurring templates
   */
  @Cron('0 5 * * *')
  async generateRecurringExpenses() {
    this.logger.log('Running recurring expense generation...');
    const now = new Date();

    const templates = await this.prisma.expense.findMany({
      where: {
        isRecurring: true,
        parentExpenseId: null,
        nextExpenseDate: { lte: now },
        OR: [
          { recurringEndDate: null },
          { recurringEndDate: { gte: now } },
        ],
      },
    });

    for (const template of templates) {
      try {
        // Create actual expense entry
        await this.prisma.expense.create({
          data: {
            ownerId: template.ownerId,
            amount: template.amount,
            description: template.description,
            category: template.category,
            date: now,
            notes: template.notes,
            receiptUrl: template.receiptUrl,
            isRecurring: false,
            parentExpenseId: template.id,
          },
        });

        // Advance nextExpenseDate
        const nextDate = this.calculateNextExpenseDate(
          template.nextExpenseDate ?? now,
          template.recurringInterval!,
        );

        await this.prisma.expense.update({
          where: { id: template.id },
          data: { nextExpenseDate: nextDate },
        });

        this.logger.log(`Generated expense for template ${template.id}, next: ${nextDate.toISOString()}`);
      } catch (err) {
        this.logger.error(`Failed to generate expense for template ${template.id}`, err);
      }
    }
  }

  private calculateNextExpenseDate(from: Date, interval: RecurringInterval): Date {
    const next = new Date(from);
    switch (interval) {
      case RecurringInterval.MONTHLY:
        next.setMonth(next.getMonth() + 1);
        break;
      case RecurringInterval.QUARTERLY:
        next.setMonth(next.getMonth() + 3);
        break;
      case RecurringInterval.YEARLY:
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }
}
