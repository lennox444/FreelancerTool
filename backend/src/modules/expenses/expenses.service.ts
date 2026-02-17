import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseCategory } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExpenseDto, ownerId: string) {
    return this.prisma.expense.create({
      data: {
        ownerId,
        amount: dto.amount,
        description: dto.description,
        category: dto.category,
        date: dto.date ? new Date(dto.date) : new Date(),
        receiptUrl: dto.receiptUrl,
        notes: dto.notes,
      },
    });
  }

  async findAll(
    ownerId: string,
    filters?: {
      category?: ExpenseCategory;
      from?: string;
      to?: string;
    },
  ) {
    const where: any = { ownerId };

    if (filters?.category) where.category = filters.category;
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
   * Get summary: income vs expenses for a date range
   */
  async getSummary(ownerId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01`);
    const endDate = new Date(`${targetYear}-12-31T23:59:59`);

    const [expenses, invoices] = await Promise.all([
      this.prisma.expense.findMany({
        where: { ownerId, date: { gte: startDate, lte: endDate } },
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
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      byCategory,
      monthlyData,
    };
  }
}
