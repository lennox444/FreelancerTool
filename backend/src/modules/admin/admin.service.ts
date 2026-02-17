import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class AdminService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER', {
      apiVersion: '2024-12-18.acacia' as any,
    });
  }

  // ─── User Management ──────────────────────────────────────────────────────

  async getUsers(search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          createdAt: true,
          isSuspended: true,
          stripeCustomerId: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        createdAt: true,
        updatedAt: true,
        isSuspended: true,
        stripeCustomerId: true,
        _count: {
          select: {
            customers: true,
            projects: true,
            invoices: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserPlan(id: string, plan: SubscriptionPlan) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const status =
      plan === SubscriptionPlan.PRO
        ? SubscriptionStatus.ACTIVE
        : SubscriptionStatus.TRIAL;

    return this.prisma.user.update({
      where: { id },
      data: { subscriptionPlan: plan, subscriptionStatus: status },
      select: { id: true, subscriptionPlan: true, subscriptionStatus: true },
    });
  }

  async extendTrial(id: string, days: number) {
    if (days <= 0 || days > 365) {
      throw new BadRequestException('Days must be between 1 and 365');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const base = user.trialEndsAt && user.trialEndsAt > new Date()
      ? user.trialEndsAt
      : new Date();

    const newTrialEnd = new Date(base);
    newTrialEnd.setDate(newTrialEnd.getDate() + days);

    return this.prisma.user.update({
      where: { id },
      data: { trialEndsAt: newTrialEnd },
      select: { id: true, trialEndsAt: true },
    });
  }

  async setUserSuspended(id: string, suspend: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { isSuspended: suspend },
      select: { id: true, isSuspended: true },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { stripeCustomerId: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Cancel Stripe subscription if exists
    if (user.stripeCustomerId) {
      try {
        const subscriptions = await this.stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
        });
        for (const sub of subscriptions.data) {
          await this.stripe.subscriptions.cancel(sub.id);
        }
      } catch (err) {
        console.error('Failed to cancel Stripe subscription during admin delete:', err);
      }
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  // ─── Metrics ──────────────────────────────────────────────────────────────

  async getMetrics() {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const [
      totalUsers,
      newUsersLast7,
      newUsersLast30,
      proUsers,
      onboardingCompleted,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.user.count({ where: { subscriptionPlan: SubscriptionPlan.PRO } }),
      this.prisma.onboardingProfile.count({ where: { onboardingCompleted: true } }),
    ]);

    const totalOnboardingProfiles = await this.prisma.onboardingProfile.count();
    const conversionRate = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;
    const onboardingRate =
      totalOnboardingProfiles > 0
        ? Math.round((onboardingCompleted / totalOnboardingProfiles) * 100)
        : 0;

    // Signup trend: last 14 days
    const signupTrend = await this.buildSignupTrend(fourteenDaysAgo);

    return {
      totalUsers,
      newUsersLast7,
      newUsersLast30,
      proUsers,
      freeTrialUsers: totalUsers - proUsers,
      conversionRate,
      onboardingRate,
      signupTrend,
    };
  }

  private async buildSignupTrend(since: Date) {
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const trend: Record<string, number> = {};
    // Pre-fill last 14 days with 0
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trend[d.toISOString().split('T')[0]] = 0;
    }
    for (const u of users) {
      const key = u.createdAt.toISOString().split('T')[0];
      if (key in trend) trend[key]++;
    }

    return Object.entries(trend).map(([date, count]) => ({ date, count }));
  }

  // ─── Revenue (Stripe) ─────────────────────────────────────────────────────

  async getRevenue() {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        status: 'active',
        limit: 100,
        expand: ['data.items.data.price'],
      });

      let mrr = 0;
      for (const sub of subscriptions.data) {
        for (const item of sub.items.data) {
          const price = item.price;
          if (price.unit_amount) {
            const amount = price.unit_amount / 100;
            if (price.recurring?.interval === 'year') {
              mrr += amount / 12;
            } else {
              mrr += amount;
            }
          }
        }
      }

      const recentCharges = await this.stripe.charges.list({ limit: 10 });
      const lastPayments = recentCharges.data.map((c) => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        status: c.status,
        date: new Date(c.created * 1000).toISOString(),
        description: c.description,
      }));

      return {
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(mrr * 12 * 100) / 100,
        activeSubscriptions: subscriptions.data.length,
        lastPayments,
      };
    } catch (err) {
      // Return zeros when Stripe key is placeholder/invalid
      console.error('Stripe revenue fetch failed:', err.message);
      return {
        mrr: 0,
        arr: 0,
        activeSubscriptions: 0,
        lastPayments: [],
        stripeError: 'Stripe not configured or unreachable',
      };
    }
  }

  // ─── Health ───────────────────────────────────────────────────────────────

  async getHealth() {
    const [users, customers, projects, invoices, payments, timeEntries] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.customer.count(),
        this.prisma.project.count(),
        this.prisma.invoice.count(),
        this.prisma.payment.count(),
        this.prisma.timeEntry.count(),
      ]);

    return {
      db: { users, customers, projects, invoices, payments, timeEntries },
      uptime: process.uptime(),
      uptimeFormatted: this.formatUptime(process.uptime()),
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }

  private formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  }
}
