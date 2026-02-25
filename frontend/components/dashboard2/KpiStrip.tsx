'use client';

import { TrendingUp, FileText, Wallet, PiggyBank, AlertTriangle } from 'lucide-react';
import KpiCard from './KpiCard';
import type { DashboardOverview } from '@/lib/types';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

interface KpiStripProps {
  overview?: DashboardOverview;
  isLoading: boolean;
}

export default function KpiStrip({ overview, isLoading }: KpiStripProps) {
  const monthAmt = overview?.monthRevenue.amount ?? 0;
  const prevAmt = overview?.prevMonthRevenue.amount ?? 0;
  const trendPct = prevAmt > 0 ? ((monthAmt - prevAmt) / prevAmt) * 100 : NaN;

  const netProfit = overview?.netProfitMTD ?? 0;
  const marginPct = monthAmt > 0 ? (netProfit / monthAmt) * 100 : NaN;

  const overdueAmt = overview?.overdueInvoices.amount ?? 0;
  const overdueCount = overview?.overdueInvoices.count ?? 0;

  const taxSavings = overview?.taxSavings.monthlySavings ?? 0;
  const setAsidePct = overview?.taxSavings.setAsidePercentage ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <KpiCard
        title="Monatsumsatz"
        value={isLoading ? '...' : fmt(monthAmt)}
        subValue={isLoading ? undefined : `${overview?.monthRevenue.count ?? 0} Zahlungen`}
        trend={!isLoading && isFinite(trendPct) ? { pct: trendPct, positive: trendPct >= 0, label: 'vs. Vormonat' } : undefined}
        icon={TrendingUp}
        variant="default"
        href="/payments"
        isLoading={isLoading}
      />
      <KpiCard
        title="Netto-Gewinn (MTD)"
        value={isLoading ? '...' : fmt(netProfit)}
        subValue={isLoading ? undefined : isFinite(marginPct) ? `${Math.round(marginPct)}% Marge` : undefined}
        icon={Wallet}
        variant={netProfit >= 0 ? 'success' : 'danger'}
        href="/expenses"
        isLoading={isLoading}
      />
      <KpiCard
        title="Offene Rechnungen"
        value={isLoading ? '...' : fmt(overview?.openInvoices.amount ?? 0)}
        subValue={isLoading ? undefined : `${overview?.openInvoices.count ?? 0} ausstehend`}
        icon={FileText}
        variant="default"
        href="/invoices?status=SENT"
        isLoading={isLoading}
      />
      <KpiCard
        title="Steuer-Rücklage/Monat"
        value={isLoading ? '...' : fmt(taxSavings)}
        subValue={isLoading ? undefined : setAsidePct > 0 ? `${setAsidePct}% zurücklegen` : 'Nicht konfiguriert'}
        icon={PiggyBank}
        variant="warning"
        href="/tax-assistant"
        isLoading={isLoading}
      />
      <KpiCard
        title="Überfällig"
        value={isLoading ? '...' : fmt(overdueAmt)}
        subValue={isLoading ? undefined : `${overdueCount} Rechnung(en)`}
        icon={AlertTriangle}
        variant={overdueCount > 0 ? 'danger' : 'default'}
        href="/invoices?status=OVERDUE"
        isLoading={isLoading}
      />
    </div>
  );
}
