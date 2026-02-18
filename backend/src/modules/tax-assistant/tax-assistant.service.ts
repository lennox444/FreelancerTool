import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class TaxAssistantService {
  constructor(private prisma: PrismaService) {}

  async calculate(ownerId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01`);
    const endDate = new Date(`${targetYear}-12-31T23:59:59`);
    const now = new Date();

    // Fetch all paid/partially paid invoices for the year
    const invoices = await this.prisma.invoice.findMany({
      where: {
        ownerId,
        status: { in: ['PAID', 'PARTIALLY_PAID', 'SENT', 'OVERDUE'] },
        issueDate: { gte: startDate, lte: endDate },
      },
    });

    // Fetch expenses for the year
    const expenses = await this.prisma.expense.findMany({
      where: {
        ownerId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const grossRevenue = invoices.reduce((sum, inv) => {
      // Use totalPaid for paid invoices, amount for others (expected)
      return sum + Number(inv.totalPaid || inv.amount);
    }, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // German tax calculations
    // Assumption: Regelbesteuerung (regular VAT, 19%)
    const vatRate = 0.19;
    const netRevenue = grossRevenue / (1 + vatRate); // Net amount excl. VAT
    const vatCollected = grossRevenue - netRevenue;   // VAT to pay to Finanzamt

    // Income tax estimate (simplified)
    const netProfit = netRevenue - totalExpenses;
    const taxableIncome = Math.max(0, netProfit);

    // Simplified German income tax brackets (Einkommensteuer 2024)
    const incomeTax = this.calculateGermanIncomeTax(taxableIncome);
    const solidaritySurcharge = incomeTax > 0 ? incomeTax * 0.055 : 0; // Soli (if applicable)

    // Total tax burden
    const totalTaxBurden = vatCollected + incomeTax + solidaritySurcharge;

    // Monthly savings recommendation
    const monthsElapsed = targetYear === now.getFullYear()
      ? Math.max(1, now.getMonth() + 1)
      : 12;
    const remainingMonths = targetYear === now.getFullYear()
      ? Math.max(1, 12 - now.getMonth())
      : 0;

    const monthlySavingsRecommendation = remainingMonths > 0
      ? Math.ceil(totalTaxBurden / 12)
      : 0;

    // Quarterly VAT prepayment
    const quarterlyVatPrepayment = vatCollected / 4;

    // Advance income tax payment (Vorauszahlung)
    const quarterlyIncomeTaxPrepayment = (incomeTax + solidaritySurcharge) / 4;

    return {
      year: targetYear,
      disclaimer: 'Diese Berechnung ist nur eine Orientierungshilfe und ersetzt keine professionelle Steuerberatung.',

      revenue: {
        gross: Math.round(grossRevenue * 100) / 100,
        net: Math.round(netRevenue * 100) / 100,
        vat: Math.round(vatCollected * 100) / 100,
      },

      expenses: {
        total: Math.round(totalExpenses * 100) / 100,
      },

      profit: {
        gross: Math.round(netRevenue * 100) / 100,
        net: Math.round(netProfit * 100) / 100,
        taxable: Math.round(taxableIncome * 100) / 100,
      },

      taxes: {
        incomeTax: Math.round(incomeTax * 100) / 100,
        solidaritySurcharge: Math.round(solidaritySurcharge * 100) / 100,
        vatCollected: Math.round(vatCollected * 100) / 100,
        total: Math.round(totalTaxBurden * 100) / 100,
        effectiveRate: netProfit > 0
          ? Math.round(((incomeTax + solidaritySurcharge) / netProfit) * 100)
          : 0,
      },

      prepayments: {
        quarterlyVat: Math.round(quarterlyVatPrepayment * 100) / 100,
        quarterlyIncomeTax: Math.round(quarterlyIncomeTaxPrepayment * 100) / 100,
      },

      recommendations: {
        monthlySavings: monthlySavingsRecommendation,
        setAsidePercentage: netProfit > 0
          ? Math.round((totalTaxBurden / netProfit) * 100)
          : 0,
        conservative: Math.ceil(netProfit * 0.35 / 12),
        realistic: Math.ceil(netProfit * 0.30 / 12),
        optimistic: Math.ceil(netProfit * 0.25 / 12),
      },

      invoiceCount: invoices.length,
      expenseCount: expenses.length,
      monthsElapsed,
    };
  }

  /**
   * Returns the effective income-tax rate (ESt + Soli) as a decimal fraction (e.g. 0.27).
   * Falls back to 0.30 when there is insufficient data for the requested year.
   * Designed to be called by other services (e.g. ProjectProfitabilityService).
   */
  async getEffectiveRate(ownerId: string, year?: number): Promise<number> {
    const FALLBACK = 0.3;
    try {
      const result = await this.calculate(ownerId, year);
      // effectiveRate is stored as integer percentage (e.g. 27)
      const rate = result.taxes.effectiveRate / 100;
      // Guard against degenerate values
      if (!isFinite(rate) || rate <= 0 || rate > 0.6) return FALLBACK;
      return rate;
    } catch {
      return FALLBACK;
    }
  }

  /**
   * Simplified German income tax (Einkommensteuer) calculation for 2024
   * Grundtarif (single, no splitting)
   */
  private calculateGermanIncomeTax(taxableIncome: number): number {
    if (taxableIncome <= 11604) return 0; // Grundfreibetrag 2024

    if (taxableIncome <= 17005) {
      const y = (taxableIncome - 11604) / 10000;
      return Math.round((979.18 * y + 1400) * y);
    }

    if (taxableIncome <= 66760) {
      const z = (taxableIncome - 17005) / 10000;
      return Math.round((192.59 * z + 2397) * z + 966.53);
    }

    if (taxableIncome <= 277825) {
      return Math.round(taxableIncome * 0.42 - 10602.13);
    }

    return Math.round(taxableIncome * 0.45 - 18936.88);
  }
}
