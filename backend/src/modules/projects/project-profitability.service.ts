import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { TaxAssistantService } from '../tax-assistant/tax-assistant.service';
import { ProjectProfitabilityDto, ProjectProfitabilityHistoryItem, RiskLevel } from './dto/profitability.dto';

/** Fallback when the user has not set a target rate */
const DEFAULT_TARGET_RATE = 80; // EUR / h

@Injectable()
export class ProjectProfitabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taxAssistant: TaxAssistantService,
  ) {}

  // ────────────────────────────────────────────────────────────────────────────
  // Primary calculation
  // ────────────────────────────────────────────────────────────────────────────

  async calculate(
    projectId: string,
    ownerId: string,
  ): Promise<ProjectProfitabilityDto> {
    // ── 0. Ownership guard ──────────────────────────────────────────────────
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    // ── 1. User settings (target rate + real tax rate) ──────────────────────
    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { targetHourlyRate: true },
    });
    const targetHourlyRate = user?.targetHourlyRate
      ? Number(user.targetHourlyRate)
      : DEFAULT_TARGET_RATE;

    // Real effective rate from TaxAssistant (current year); falls back to 30 %
    const effectiveTaxRate = await this.taxAssistant.getEffectiveRate(ownerId);

    // ── 2. Revenue ──────────────────────────────────────────────────────────
    const invoices = await this.prisma.invoice.findMany({
      where: {
        projectId,
        ownerId,
        status: {
          in: [
            InvoiceStatus.SENT,
            InvoiceStatus.PARTIALLY_PAID,
            InvoiceStatus.PAID,
            InvoiceStatus.OVERDUE,
          ],
        },
      },
      select: { id: true, amount: true },
    });

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0,
    );
    const invoiceIds = invoices.map((i) => i.id);

    // ── 3. Payments ─────────────────────────────────────────────────────────
    let totalPaid = 0;
    if (invoiceIds.length > 0) {
      const agg = await this.prisma.payment.aggregate({
        where: { invoiceId: { in: invoiceIds }, ownerId },
        _sum: { amount: true },
      });
      totalPaid = Number(agg._sum.amount ?? 0);
    }

    // ── 4. Time entries ─────────────────────────────────────────────────────
    const timeEntries = await this.prisma.timeEntry.findMany({
      where: { projectId, ownerId },
      select: { duration: true, pauseDuration: true, invoiceId: true },
    });

    const totalSeconds = timeEntries.reduce(
      (sum, t) => sum + Math.max(0, t.duration - t.pauseDuration),
      0,
    );
    const billableSeconds = timeEntries
      .filter((t) => t.invoiceId !== null)
      .reduce((sum, t) => sum + Math.max(0, t.duration - t.pauseDuration), 0);

    const totalHours = totalSeconds / 3600;
    const billableHours = billableSeconds / 3600;
    const unbilledHours = totalHours - billableHours;

    // ── 5. Project expenses ─────────────────────────────────────────────────
    const expAgg = await this.prisma.expense.aggregate({
      where: { projectId, ownerId, isRecurring: false },
      _sum: { amount: true },
    });
    const projectExpenses = Number(expAgg._sum.amount ?? 0);

    // ── 6. Tax + net profit ─────────────────────────────────────────────────
    const taxableBase = Math.max(0, totalRevenue - projectExpenses);
    const estimatedTax = taxableBase * effectiveTaxRate;
    const netProfit = totalRevenue - projectExpenses - estimatedTax;

    // ── 7. Real hourly rate (gross: revenue / hours worked) ─────────────────
    // Gross rate is the intuitive metric: "how much did I earn per hour billed?"
    // Net profit is shown separately in the breakdown, not used for the score.
    const hourlyRateReal = totalHours > 0 ? totalRevenue / totalHours : 0;

    // ── 8. Score + risk ─────────────────────────────────────────────────────
    const { profitabilityScore, riskLevel } = this.scoreAndRisk(
      hourlyRateReal,
      targetHourlyRate,
    );

    return {
      targetHourlyRate: round(targetHourlyRate),
      effectiveTaxRate: round(effectiveTaxRate * 100), // return as % for display
      totalRevenue: round(totalRevenue),
      totalPaid: round(totalPaid),
      totalHours: roundHours(totalHours),
      billableHours: roundHours(billableHours),
      unbilledHours: roundHours(unbilledHours),
      projectExpenses: round(projectExpenses),
      estimatedTax: round(estimatedTax),
      hourlyRateReal: round(hourlyRateReal),
      profitabilityScore,
      riskLevel,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Monthly history (last N months)
  // ────────────────────────────────────────────────────────────────────────────

  async getHistory(
    projectId: string,
    ownerId: string,
    months = 6,
  ): Promise<ProjectProfitabilityHistoryItem[]> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId },
      select: { id: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Fetch all billable invoices + time entries for this project
    const [invoices, timeEntries] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          projectId,
          ownerId,
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID, InvoiceStatus.OVERDUE] },
        },
        select: { amount: true, issueDate: true },
      }),
      this.prisma.timeEntry.findMany({
        where: { projectId, ownerId, isActive: false },
        select: { duration: true, pauseDuration: true, startTime: true },
      }),
    ]);

    // Build month buckets for the last N months
    const now = new Date();
    const result: ProjectProfitabilityHistoryItem[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

      const revenue = invoices
        .filter((inv) => {
          const dt = new Date(inv.issueDate);
          return dt >= monthStart && dt <= monthEnd;
        })
        .reduce((sum, inv) => sum + Number(inv.amount), 0);

      const secondsInMonth = timeEntries
        .filter((te) => {
          const dt = new Date(te.startTime);
          return dt >= monthStart && dt <= monthEnd;
        })
        .reduce((sum, te) => sum + Math.max(0, te.duration - te.pauseDuration), 0);

      const hours = secondsInMonth / 3600;
      const hourlyRate = hours > 0 ? revenue / hours : 0;

      result.push({
        year,
        month,
        label: d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
        revenue: round(revenue),
        hours: roundHours(hours),
        hourlyRate: round(hourlyRate),
      });
    }

    return result;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────────

  private scoreAndRisk(
    hourlyRateReal: number,
    targetRate: number,
  ): { profitabilityScore: number; riskLevel: RiskLevel } {
    if (targetRate <= 0) return { profitabilityScore: 50, riskLevel: 'GREEN' };

    const ratio = hourlyRateReal / targetRate;
    let profitabilityScore: number;
    let riskLevel: RiskLevel;

    if (ratio >= 1) {
      profitabilityScore = Math.min(100, 90 + Math.round((ratio - 1) * 50));
      riskLevel = 'GREEN';
    } else if (ratio >= 0.8) {
      profitabilityScore = Math.round(60 + ((ratio - 0.8) / 0.2) * 20);
      riskLevel = 'YELLOW';
    } else {
      profitabilityScore = Math.round(Math.max(0, (ratio / 0.8) * 50));
      riskLevel = 'RED';
    }

    return { profitabilityScore, riskLevel };
  }
}

function round(n: number) { return Math.round(n * 100) / 100; }
function roundHours(n: number) { return Math.round(n * 100) / 100; }
