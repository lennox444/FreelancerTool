'use client';

import React, { useState } from 'react';
import {
  TrendingUp, Receipt, BarChart2,
  Banknote, AlertCircle, Briefcase, Calculator, X,
} from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';
import QuickActionsBar from '@/components/dashboard2/QuickActionsBar';
import WarningsBar from '@/components/dashboard2/WarningsBar';
import KpiStrip from '@/components/dashboard2/KpiStrip';
import RevenueChart12M from '@/components/dashboard2/RevenueChart12M';
import CashflowWidget from '@/components/dashboard2/CashflowWidget';
import ExpenseCategoryWidget from '@/components/dashboard2/ExpenseCategoryWidget';
import OverdueWidget from '@/components/dashboard2/OverdueWidget';
import ProjectProfitWidget from '@/components/dashboard2/ProjectProfitWidget';
import TaxCalendarWidget from '@/components/dashboard2/TaxCalendarWidget';
import UpcomingAppointmentsWidget from '@/components/dashboard2/UpcomingAppointmentsWidget';
import TimeTrackerWidget from '@/components/dashboard2/TimeTrackerWidget';
import {
  useDashboardOverview,
  useCashflowForecast2,
  useExpenseSummary2,
  useActiveProjects2,
  useOverdueInvoices2,
  useTrialWarning,
} from '@/lib/hooks/useDashboard2';
import type { WarningSignal } from '@/lib/types';

function SectionIcon({ icon: Icon, color }: { icon: React.ElementType; color: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${color}`}>
      <Icon className="w-3.5 h-3.5" />
    </span>
  );
}

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export default function Dashboard2Page() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: cashflow, isLoading: cashflowLoading } = useCashflowForecast2();
  const { data: expenseSummary, isLoading: expenseLoading } = useExpenseSummary2();
  const { data: activeProjects, isLoading: projectsLoading } = useActiveProjects2();
  const { data: overdueInvoices, isLoading: overdueLoading } = useOverdueInvoices2();
  const trialWarning = useTrialWarning();
  const [overdueDismissed, setOverdueDismissed] = useState(false);

  const allWarnings: WarningSignal[] = [
    ...(trialWarning ? [trialWarning] : []),
    ...(overview?.warnings ?? []).filter((w) => w.type !== 'overdue'),
  ];

  const hasOverdue = (overdueInvoices?.length ?? 0) > 0 && !overdueDismissed;

  return (
    <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
        <div className="absolute inset-0 w-full h-full opacity-30">
          <PixelBlast
            variant="square"
            pixelSize={6}
            color="#800040"
            patternScale={4}
            patternDensity={0.5}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            speed={0.2}
            transparent
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)]" />
      </div>

      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Cockpit</h1>
          <div className="hidden md:block w-px h-8 bg-slate-300" />
          <p className="text-slate-500 font-medium">
            {new Date().toLocaleDateString('de-DE', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <QuickActionsBar />
      </div>

      {/* ─── WARNINGS ───────────────────────────────────────────────── */}
      {allWarnings.length > 0 && <WarningsBar warnings={allWarnings} />}

      {/* ─── KPI STRIP ──────────────────────────────────────────────── */}
      <KpiStrip overview={overview} isLoading={overviewLoading} />

      {/* ─── MAIN GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <SpotlightCard
          className="lg:col-span-2 bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl"
          spotlightColor="rgba(128, 0, 64, 0.05)"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <SectionIcon icon={TrendingUp} color="bg-[#800040]/10 text-[#800040]" />
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">Umsatz & Gewinn</h3>
                <p className="text-xs text-slate-500">12-Monats-Übersicht</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-[#800040] opacity-75" />
                <span className="text-slate-500">Umsatz</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Gewinn</span>
              </span>
            </div>
          </div>
          <RevenueChart12M data={overview?.revenueTrend ?? []} isLoading={overviewLoading} />
        </SpotlightCard>

        {/* Right column: Time Tracker + Appointments */}
        <div className="flex flex-col gap-4">
          <SpotlightCard
            className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-5 rounded-3xl"
            spotlightColor="rgba(128, 0, 64, 0.05)"
          >
            <TimeTrackerWidget />
          </SpotlightCard>

          <SpotlightCard
            className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-5 rounded-3xl flex-1"
            spotlightColor="rgba(128, 0, 64, 0.05)"
          >
            <UpcomingAppointmentsWidget />
          </SpotlightCard>
        </div>
      </div>

      {/* ─── SECONDARY GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Expense Donut */}
        <SpotlightCard
          className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl"
          spotlightColor="rgba(128, 0, 64, 0.05)"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <SectionIcon icon={Receipt} color="bg-orange-50 text-orange-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">Ausgaben</h3>
              <p className="text-xs text-slate-500">nach Kategorie</p>
            </div>
          </div>
          <ExpenseCategoryWidget summary={expenseSummary} isLoading={expenseLoading} />
        </SpotlightCard>

        {/* Year Overview */}
        <SpotlightCard
          className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl"
          spotlightColor="rgba(128, 0, 64, 0.05)"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <SectionIcon icon={BarChart2} color="bg-indigo-50 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">Jahresüberblick</h3>
              <p className="text-xs text-slate-500">{new Date().getFullYear()}</p>
            </div>
          </div>
          {overviewLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(4)].map((_, i) => <div key={i} className="h-5 bg-slate-100 rounded" />)}
            </div>
          ) : (
            <div className="text-sm divide-y divide-slate-50">
              {[
                { label: 'Jahresumsatz', value: fmt(overview?.yearRevenue.amount ?? 0), href: '/invoices', cls: '' },
                { label: 'Ausgaben (MTD)', value: fmt(overview?.expensesMTD ?? 0), href: '/expenses', cls: '' },
                { label: 'Kunden gesamt', value: String(overview?.totalCustomers ?? 0), href: '/customers', cls: '' },
                {
                  label: 'Steuer zurücklegen',
                  value: `${overview?.taxSavings.setAsidePercentage ?? 0}%`,
                  href: '/tax-assistant',
                  cls: 'text-amber-600',
                },
              ].map(({ label, value, href, cls }) => (
                <a
                  key={label}
                  href={href}
                  className="flex justify-between items-center py-2.5 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold text-slate-900 ${cls}`}>{value}</span>
                </a>
              ))}
            </div>
          )}
        </SpotlightCard>

        {/* Cashflow compact */}
        <SpotlightCard
          className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl"
          spotlightColor="rgba(128, 0, 64, 0.05)"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <SectionIcon icon={Banknote} color="bg-emerald-50 text-emerald-600" />
          </div>
          <CashflowWidget data={cashflow} isLoading={cashflowLoading} />
        </SpotlightCard>
      </div>

      {/* ─── OVERDUE (soft red, dismissable) ────────────────────────── */}
      {hasOverdue && (
        <SpotlightCard
          className="bg-rose-50/70 backdrop-blur-md border border-rose-200 shadow-sm p-6 rounded-3xl"
          spotlightColor="rgba(244, 63, 94, 0.04)"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <SectionIcon icon={AlertCircle} color="bg-rose-100 text-rose-600" />
              <div>
                <h3 className="font-bold text-rose-800 text-base leading-tight">Überfällige Rechnungen</h3>
                <p className="text-xs text-rose-500">Bitte zeitnah nachfassen</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {overdueInvoices?.length} ausstehend
              </span>
              <button
                onClick={() => setOverdueDismissed(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-rose-300 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                aria-label="Ausblenden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <OverdueWidget invoices={overdueInvoices} isLoading={overdueLoading} />
        </SpotlightCard>
      )}

      {/* ─── BOTTOM GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpotlightCard
          className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl"
          spotlightColor="rgba(128, 0, 64, 0.05)"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <SectionIcon icon={Briefcase} color="bg-violet-50 text-violet-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">Projekt-Rentabilität</h3>
                <p className="text-xs text-slate-500">Aktive Projekte</p>
              </div>
            </div>
            <a href="/projects?status=ACTIVE" className="text-xs text-[#800040] hover:underline">Alle →</a>
          </div>
          <ProjectProfitWidget projects={activeProjects} isLoading={projectsLoading} />
        </SpotlightCard>

        <SpotlightCard
          className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl"
          spotlightColor="rgba(128, 0, 64, 0.05)"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <SectionIcon icon={Calculator} color="bg-teal-50 text-teal-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  Steuer-Kalender {new Date().getFullYear()}
                </h3>
                <p className="text-xs text-slate-500">Quartalszahlungen</p>
              </div>
            </div>
            <a href="/tax-assistant" className="text-xs text-[#800040] hover:underline">Assistent →</a>
          </div>
          <TaxCalendarWidget taxSavings={overview?.taxSavings} isLoading={overviewLoading} />
        </SpotlightCard>
      </div>
    </div>
  );
}
