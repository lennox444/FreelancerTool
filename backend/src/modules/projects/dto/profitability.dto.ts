export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export class ProjectProfitabilityDto {
  /** User's configured target rate (or 80 € default) */
  targetHourlyRate: number;

  /** Effective income-tax rate in % (e.g. 27) sourced from TaxAssistant */
  effectiveTaxRate: number;

  totalRevenue: number;
  totalPaid: number;
  totalHours: number;
  billableHours: number;
  unbilledHours: number;
  projectExpenses: number;
  estimatedTax: number;
  hourlyRateReal: number;
  profitabilityScore: number;
  riskLevel: RiskLevel;
}

export class ProjectProfitabilityHistoryItem {
  year: number;
  month: number;
  label: string;   // e.g. "Jan 26"
  revenue: number;
  hours: number;
  hourlyRate: number;
}
