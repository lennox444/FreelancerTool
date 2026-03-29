'use client';

import { useState } from 'react';
import {
  Receipt, BarChart2, TrendingUp,
  AlertCircle, Briefcase, Calculator, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { motion, AnimatePresence } from 'framer-motion';
import {
  useDashboardOverview,
  useCashflowForecast2,
  useExpenseSummary2,
  useActiveProjects2,
  useOverdueInvoices2,
  useTrialWarning,
} from '@/lib/hooks/useDashboard2';
import type { WarningSignal } from '@/lib/types';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    } as const,
  },
};

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

export default function DashboardPage() {
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-6 p-4 md:p-8"
    >
      {/* ─── WARNINGS & IMPORTANT ─────────────────────────────────────────── */}
      {allWarnings.length > 0 && (
        <motion.div variants={itemVariants} className="mb-0">
          <WarningsBar warnings={allWarnings} />
        </motion.div>
      )}

      {/* ─── KPI METRICS (High Depth) ─────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="-mt-1">
        <KpiStrip overview={overview} isLoading={overviewLoading} />
      </motion.div>

      {/* ─── MAIN COCKPIT GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

        {/* Linker Fokus: Performance & Finanzen */}
        <div className="lg:col-span-8 flex flex-col gap-3">

          <motion.div variants={itemVariants} className="flex-1">
            <SpotlightCard
              className="h-full bg-white/95 backdrop-blur-xl border border-white/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-5 rounded-[2rem] relative overflow-hidden group flex flex-col"
              spotlightColor="rgba(128, 0, 64, 0.05)"
            >
              {/* Reflektierender Akzent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#800040]/5 rounded-full blur-[50px] translate-x-1/2 -translate-y-1/2 group-hover:bg-[#800040]/8 transition-colors" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#800040]/10 text-[#800040]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-base">Umsatz & Gewinn</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">letzte 12 Monate</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#800040]" />
                    Umsatz
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Gewinn
                  </span>
                </div>
              </div>
              <div className="flex-1 min-h-[400px]">
                <RevenueChart12M data={overview?.revenueTrend ?? []} isLoading={overviewLoading} />
              </div>
            </SpotlightCard>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="h-full">
              <SpotlightCard
                className="h-full bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg p-5 rounded-[1.8rem] flex flex-col"
                spotlightColor="rgba(128, 0, 64, 0.03)"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-[#800040]/5 text-[#800040] shadow-sm border border-[#800040]/10">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Kosten-Verteilung</h3>
                </div>
                <div className="flex-1">
                  <ExpenseCategoryWidget summary={expenseSummary} isLoading={expenseLoading} />
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div variants={itemVariants} className="h-full">
              <SpotlightCard
                className="h-full bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg p-6 rounded-[1.8rem] flex flex-col"
                spotlightColor="rgba(128, 0, 64, 0.03)"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50">
                    <BarChart2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Jahresziele</h3>
                </div>
                <div className="flex-1">
                  {overviewLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-50 rounded-xl" />)}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {[
                        { label: 'Jahresumsatz', value: fmt(overview?.yearRevenue.amount ?? 0), href: '/invoices', cls: 'bg-slate-50 border-slate-100' },
                        { label: 'Kunden gesamt', value: String(overview?.totalCustomers ?? 0), href: '/customers', cls: 'bg-white border-slate-50' },
                        { label: 'Steuerrücklage', value: `${overview?.taxSavings.setAsidePercentage ?? 0}%`, href: '/tax-assistant', cls: 'bg-amber-50/40 border-amber-100/50 text-amber-600' },
                      ].map(({ label, value, href, cls }) => (
                        <a
                          key={label}
                          href={href}
                          className={cn(
                            "flex justify-between items-center px-4 py-3 rounded-xl border transition-all hover:translate-x-1",
                            cls
                          )}
                        >
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                          <span className="font-black text-slate-900 text-sm">{value}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </div>

        {/* Rechter Fokus: Operatives Geschäft & Geschwindigkeit */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          <motion.div variants={itemVariants} className="group min-h-[220px]">
            <SpotlightCard
              className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg p-5 rounded-[2rem] relative overflow-hidden h-full flex flex-col"
              spotlightColor="rgba(128, 0, 64, 0.03)"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#800040]/5 blur-[40px] group-hover:bg-[#800040]/10 transition-all" />
              <div className="flex-1">
                <TimeTrackerWidget />
              </div>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1 min-h-[280px]">
            <SpotlightCard
              className="h-full bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg p-5 rounded-[2.5rem] flex flex-col"
              spotlightColor="rgba(128, 0, 64, 0.03)"
            >
              <div className="flex-1">
                <UpcomingAppointmentsWidget />
              </div>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard
              className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg p-5 rounded-[1.8rem] h-full"
              spotlightColor="rgba(16, 185, 129, 0.05)"
            >
              <CashflowWidget data={cashflow} isLoading={cashflowLoading} />
            </SpotlightCard>
          </motion.div>

        </div>
      </div>

      {/* ─── UNTERER ABSCHNITT: INTELLIGENZ ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Überfällige Warnung (Dynamische Höhe) */}
        <AnimatePresence>
          {hasOverdue && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="lg:col-span-12"
            >
              <SpotlightCard
                className="bg-rose-50/40 backdrop-blur-xl border border-rose-100 shadow-md p-6 rounded-[1.8rem] relative overflow-hidden"
                spotlightColor="rgba(244, 63, 94, 0.05)"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200/20 blur-[60px] pointer-events-none" />
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white text-rose-600 shadow-sm border border-rose-100">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-rose-900 text-base uppercase tracking-tight">Handlungsbedarf</h3>
                      <p className="text-[11px] font-bold text-rose-500 uppercase tracking-widest">Überfällige Rechnungen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-rose-900/10">
                      {overdueInvoices?.length} Kritisch
                    </span>
                    <button
                      onClick={() => setOverdueDismissed(true)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
                <OverdueWidget invoices={overdueInvoices} isLoading={overdueLoading} />
              </SpotlightCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projekt-Radar */}
        <motion.div variants={itemVariants} className="lg:col-span-7 h-full">
          <SpotlightCard
            className="h-full bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg p-6 rounded-[2rem]"
            spotlightColor="rgba(139, 92, 246, 0.05)"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 shadow-sm border border-violet-100/50">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Projekt-Radar</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aktivität & Rentabilität</p>
                </div>
              </div>
              <a href="/projects?status=ACTIVE" className="text-[11px] font-black text-[#800040] hover:tracking-widest transition-all uppercase">Detailansicht →</a>
            </div>
            <ProjectProfitWidget projects={activeProjects} isLoading={projectsLoading} />
          </SpotlightCard>
        </motion.div>

        {/* Steuer-Prognose */}
        <motion.div variants={itemVariants} className="lg:col-span-5 h-full">
          <SpotlightCard
            className="h-full bg-white/95 backdrop-blur-xl border border-white/40 shadow-lg p-6 rounded-[2rem]"
            spotlightColor="rgba(20, 184, 166, 0.05)"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shadow-sm border border-teal-100/50">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Steuer-Intelligenz</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nächste Fristen</p>
                </div>
              </div>
              <a href="/tax-assistant" className="text-[11px] font-black text-[#800040] hover:tracking-widest transition-all uppercase">Verwalten →</a>
            </div>
            <TaxCalendarWidget taxSavings={overview?.taxSavings} isLoading={overviewLoading} />
          </SpotlightCard>
        </motion.div>
      </div>

      <div className="h-12" /> {/* Extra spacing at bottom */}
    </motion.div>
  );
}
