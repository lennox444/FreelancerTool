import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

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
