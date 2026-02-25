import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { InvoiceStatus } from '@prisma/client';
import { TaxAssistantService } from '../tax-assistant/tax-assistant.service';

export interface WarningSignal {
  type: string;
  severity: 'error' | 'warning';
  message: string;
  link?: string;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  payments: number;
}

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private taxAssistant: TaxAssistantService,
  ) {}

  /**
   * Single aggregated call for the Business Cockpit overview page
   */
  async getOverview(ownerId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const startOfPrevMonth = new Date(year, now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(year, now.getMonth(), 0, 23, 59, 59, 999);
    const startOfYear = new Date(year, 0, 1);
    // 12-month window for bulk queries
    const twelveMonthsAgo = new Date(year, now.getMonth() - 11, 1);

    const [
      monthRevenue,
      prevMonthRevenue,
      yearRevenue,
      openInvoices,
      overdueInvoices,
      totalCustomers,
      bankAccountCount,
      expensesMTDAgg,
      bulkPayments,
      bulkExpenses,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ownerId, paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { ownerId, paymentDate: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ownerId, paymentDate: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: {
          ownerId,
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE] },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { ownerId, status: InvoiceStatus.OVERDUE },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.customer.count({ where: { ownerId } }),
      this.prisma.bankAccount.count({ where: { ownerId } }).catch(() => -1),
      this.prisma.expense.aggregate({
        where: { ownerId, date: { gte: startOfMonth }, isRecurring: false },
        _sum: { amount: true },
      }),
      // All payments last 12 months for bucketing
      this.prisma.payment.findMany({
        where: { ownerId, paymentDate: { gte: twelveMonthsAgo } },
        select: { paymentDate: true, amount: true },
      }),
      // All expenses last 12 months for bucketing
      this.prisma.expense.findMany({
        where: { ownerId, date: { gte: twelveMonthsAgo } },
        select: { date: true, amount: true },
      }),
    ]);

    // ── 12-month trend bucketing ────────────────────────────────────────────
    const revenueTrend: RevenueTrendPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const mStart = new Date(year, now.getMonth() - i, 1);
      const mEnd = new Date(year, now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthLabel = mStart.toLocaleString('de-DE', { month: 'short', year: '2-digit' });

      const revenue = bulkPayments
        .filter((p) => p.paymentDate >= mStart && p.paymentDate <= mEnd)
        .reduce((s, p) => s + Number(p.amount), 0);

      const expenses = bulkExpenses
        .filter((e) => e.date >= mStart && e.date <= mEnd)
        .reduce((s, e) => s + Number(e.amount), 0);

      revenueTrend.push({
        month: monthLabel,
        revenue: Math.round(revenue * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        profit: Math.round((revenue - expenses) * 100) / 100,
        payments: bulkPayments.filter((p) => p.paymentDate >= mStart && p.paymentDate <= mEnd).length,
      });
    }

    // ── Tax savings ─────────────────────────────────────────────────────────
    let taxSavings = { monthlySavings: 0, setAsidePercentage: 0, quarterlyVat: 0, quarterlyIncomeTax: 0 };
    try {
      const tax = await this.taxAssistant.calculate(ownerId, year);
      taxSavings = {
        monthlySavings: tax.recommendations.monthlySavings,
        setAsidePercentage: tax.recommendations.setAsidePercentage,
        quarterlyVat: tax.prepayments.quarterlyVat,
        quarterlyIncomeTax: tax.prepayments.quarterlyIncomeTax,
      };
    } catch {
      // dashboard must never crash due to tax calc
    }

    // ── Derived figures ─────────────────────────────────────────────────────
    const monthRevenueAmt = Number(monthRevenue._sum.amount || 0);
    const expensesMTD = Number(expensesMTDAgg._sum.amount || 0);
    const netProfitMTD = monthRevenueAmt - expensesMTD;

    // ── Server-side warnings ────────────────────────────────────────────────
    const warnings: WarningSignal[] = [];
    if ((overdueInvoices._count ?? 0) > 0) {
      warnings.push({
        type: 'overdue',
        severity: 'error',
        message: `${overdueInvoices._count} überfällige Rechnung(en) — ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(overdueInvoices._sum.amount || 0))} ausstehend`,
        link: '/invoices?status=OVERDUE',
      });
    }
    if (bankAccountCount === 0) {
      warnings.push({
        type: 'no_bank_account',
        severity: 'warning',
        message: 'Kein Bankkonto hinterlegt — füge dein Konto in den Einstellungen hinzu',
        link: '/settings',
      });
    }
    if (Number(yearRevenue._sum.amount || 0) > 0 && taxSavings.setAsidePercentage === 0) {
      warnings.push({
        type: 'tax_not_configured',
        severity: 'warning',
        message: 'Steuer-Rücklage nicht konfiguriert — prüfe deinen Steuer-Assistenten',
        link: '/tax-assistant',
      });
    }

    return {
      monthRevenue: { amount: monthRevenueAmt, count: monthRevenue._count },
      prevMonthRevenue: { amount: Number(prevMonthRevenue._sum.amount || 0) },
      yearRevenue: { amount: Number(yearRevenue._sum.amount || 0) },
      openInvoices: { amount: Number(openInvoices._sum.amount || 0), count: openInvoices._count },
      overdueInvoices: { amount: Number(overdueInvoices._sum.amount || 0), count: overdueInvoices._count },
      totalCustomers,
      expensesMTD,
      netProfitMTD,
      revenueTrend,
      taxSavings,
      warnings,
    };
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getStats(ownerId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      openInvoices,
      overdueInvoices,
      monthRevenue,
      yearRevenue,
      totalCustomers,
      totalInvoices,
    ] = await Promise.all([
      // Open invoices (SENT, PARTIALLY_PAID, OVERDUE)
      this.prisma.invoice.aggregate({
        where: {
          ownerId,
          status: {
            in: [
              InvoiceStatus.SENT,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Overdue invoices
      this.prisma.invoice.aggregate({
        where: {
          ownerId,
          status: InvoiceStatus.OVERDUE,
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Revenue this month (payments)
      this.prisma.payment.aggregate({
        where: {
          ownerId,
          paymentDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Revenue this year
      this.prisma.payment.aggregate({
        where: {
          ownerId,
          paymentDate: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),

      // Total customers
      this.prisma.customer.count({ where: { ownerId } }),

      // Total invoices
      this.prisma.invoice.count({ where: { ownerId } }),
    ]);

    return {
      openInvoices: {
        amount: Number(openInvoices._sum.amount || 0),
        count: openInvoices._count,
      },
      overdueInvoices: {
        amount: Number(overdueInvoices._sum.amount || 0),
        count: overdueInvoices._count,
      },
      monthRevenue: {
        amount: Number(monthRevenue._sum.amount || 0),
        count: monthRevenue._count,
      },
      yearRevenue: {
        amount: Number(yearRevenue._sum.amount || 0),
      },
      totalCustomers,
      totalInvoices,
    };
  }

  /**
   * Get overdue invoices list
   */
  async getOverdueInvoices(ownerId: string) {
    return this.prisma.invoice.findMany({
      where: {
        ownerId,
        status: InvoiceStatus.OVERDUE,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Get cashflow forecast for next 90 days
   * Based on open invoices due dates
   */
  async getCashflowForecast(ownerId: string) {
    const today = new Date();
    const next90Days = new Date(today);
    next90Days.setDate(today.getDate() + 90);

    // Get all open invoices (SENT, PARTIALLY_PAID) with due dates in next 90 days
    const upcomingInvoices = await this.prisma.invoice.findMany({
      where: {
        ownerId,
        status: {
          in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID],
        },
        dueDate: {
          gte: today,
          lte: next90Days,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Group by week
    const weeklyForecast: Record<
      string,
      { weekStart: Date; weekEnd: Date; expected: number; invoices: number }
    > = {};

    upcomingInvoices.forEach((invoice) => {
      const weekKey = this.getWeekKey(invoice.dueDate);
      const { weekStart, weekEnd } = this.getWeekBounds(invoice.dueDate);

      if (!weeklyForecast[weekKey]) {
        weeklyForecast[weekKey] = {
          weekStart,
          weekEnd,
          expected: 0,
          invoices: 0,
        };
      }

      const remaining = Number(invoice.amount) - Number(invoice.totalPaid);
      weeklyForecast[weekKey].expected += remaining;
      weeklyForecast[weekKey].invoices += 1;
    });

    return {
      summary: {
        totalExpected: upcomingInvoices.reduce(
          (sum, inv) => sum + (Number(inv.amount) - Number(inv.totalPaid)),
          0,
        ),
        invoiceCount: upcomingInvoices.length,
      },
      weekly: Object.values(weeklyForecast).sort(
        (a, b) => a.weekStart.getTime() - b.weekStart.getTime(),
      ),
      invoices: upcomingInvoices.map((inv) => ({
        id: inv.id,
        customer: inv.customer,
        amount: Number(inv.amount),
        totalPaid: Number(inv.totalPaid),
        remaining: Number(inv.amount) - Number(inv.totalPaid),
        dueDate: inv.dueDate,
        status: inv.status,
      })),
    };
  }

  /**
   * Get recent activity (invoices + payments)
   */
  async getRecentActivity(ownerId: string, limit = 10) {
    const [recentInvoices, recentPayments] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { ownerId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),

      this.prisma.payment.findMany({
        where: { ownerId },
        include: {
          invoice: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  company: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    // Combine and sort by date
    const activities = [
      ...recentInvoices.map((inv) => ({
        type: 'invoice' as const,
        id: inv.id,
        date: inv.createdAt,
        amount: Number(inv.amount),
        customer: inv.customer,
        status: inv.status,
        description: inv.description,
      })),
      ...recentPayments.map((pay) => ({
        type: 'payment' as const,
        id: pay.id,
        date: pay.createdAt,
        amount: Number(pay.amount),
        customer: pay.invoice.customer,
        invoiceId: pay.invoiceId,
        note: pay.note,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return activities.slice(0, limit);
  }

  /**
   * Get monthly revenue trend (last 6 months)
   */
  async getRevenueTrend(ownerId: string, months = 6) {
    const result: Array<{ month: string; revenue: number; payments: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const revenue = await this.prisma.payment.aggregate({
        where: {
          ownerId,
          paymentDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: { amount: true },
        _count: true,
      });

      result.push({
        month: monthStart.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        revenue: Number(revenue._sum.amount || 0),
        payments: revenue._count,
      });
    }

    return result;
  }

  /**
   * Helper: Get week key (ISO week)
   */
  private getWeekKey(date: Date): string {
    const { weekStart } = this.getWeekBounds(date);
    return weekStart.toISOString().split('T')[0];
  }

  /**
   * Helper: Get week bounds (Monday to Sunday)
   */
  private getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday

    const weekStart = new Date(current.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  }
}
