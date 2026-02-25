'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { Expense, ExpenseCategory, ExpenseSummary, RecurringInterval } from '@/lib/types';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, Trash2, Edit2, Receipt, BarChart3,
  Package, Monitor, Car, Megaphone, Building, GraduationCap, HelpCircle,
  RefreshCw, ChevronLeft, ChevronRight, Clock, AlertTriangle, Download, Loader2,
  TrendingDown, TrendingUp, Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  SOFTWARE: 'Software', HARDWARE: 'Hardware', TRAVEL: 'Reise',
  MARKETING: 'Marketing', OFFICE: 'Büromaterial', TRAINING: 'Fortbildung', OTHER: 'Sonstiges',
};

const CATEGORY_ICONS: Record<ExpenseCategory, any> = {
  SOFTWARE: Monitor, HARDWARE: Package, TRAVEL: Car,
  MARKETING: Megaphone, OFFICE: Building, TRAINING: GraduationCap, OTHER: HelpCircle,
};

const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; border: string; bar: string }> = {
  SOFTWARE:  { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100',    bar: 'bg-blue-500' },
  HARDWARE:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100',  bar: 'bg-purple-500' },
  TRAVEL:    { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100',   bar: 'bg-amber-500' },
  MARKETING: { bg: 'bg-pink-50',    text: 'text-pink-600',    border: 'border-pink-100',    bar: 'bg-pink-500' },
  OFFICE:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-100',    bar: 'bg-cyan-500' },
  TRAINING:  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', bar: 'bg-emerald-500' },
  OTHER:     { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   bar: 'bg-slate-400' },
};

const INTERVAL_SHORT: Record<RecurringInterval, string> = {
  MONTHLY: '/ Monat', QUARTERLY: '/ Quartal', YEARLY: '/ Jahr',
};

// ─── Utils ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}
function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('de-DE').format(new Date(dateStr));
}
function formatMonthYear(year: number, month: number) {
  return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, 1));
}
function normalizeMonthly(amount: number, interval: RecurringInterval): number {
  if (interval === RecurringInterval.MONTHLY) return amount;
  if (interval === RecurringInterval.QUARTERLY) return amount / 3;
  return amount / 12;
}
function normalizeYearly(amount: number, interval: RecurringInterval): number {
  if (interval === RecurringInterval.MONTHLY) return amount * 12;
  if (interval === RecurringInterval.QUARTERLY) return amount * 4;
  return amount;
}
function addInterval(date: Date, interval: RecurringInterval): Date {
  const next = new Date(date);
  if (interval === RecurringInterval.MONTHLY) next.setMonth(next.getMonth() + 1);
  else if (interval === RecurringInterval.QUARTERLY) next.setMonth(next.getMonth() + 3);
  else next.setFullYear(next.getFullYear() + 1);
  return next;
}
function getRenewalInMonth(sub: Expense, year: number, month: number): Date | null {
  if (!sub.recurringStartDate || !sub.recurringInterval) return null;
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);
  if (sub.recurringEndDate && new Date(sub.recurringEndDate) < monthStart) return null;
  const start = new Date(sub.recurringStartDate);
  if (start > monthEnd) return null;
  let current = new Date(start);
  while (current < monthStart) current = addInterval(current, sub.recurringInterval as RecurringInterval);
  return current <= monthEnd ? current : null;
}

// ─── Shared animation helper ─────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 26, delay },
  };
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

const fieldClass = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all';
const labelClass = 'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const today = new Date();

  const [activeTab, setActiveTab] = useState<'ausgaben' | 'abonnements'>('ausgaben');
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowCreateForm(true);
  }, [searchParams]);

  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [datevExporting, setDatevExporting] = useState(false);

  const handleDatevExport = async () => {
    setDatevExporting(true);
    try {
      await expensesApi.downloadDATEV(new Date().getFullYear());
      toast.success('DATEV-Export heruntergeladen');
    } catch {
      toast.error('Fehler beim DATEV-Export');
    } finally {
      setDatevExporting(false);
    }
  };

  const [showSubForm, setShowSubForm] = useState(false);
  const [editSub, setEditSub] = useState<Expense | null>(null);

  function prevMonth() {
    if (selectedMonth === 1) { setSelectedYear(y => y - 1); setSelectedMonth(12); }
    else setSelectedMonth(m => m - 1);
  }
  function nextMonth() {
    if (selectedMonth === 12) { setSelectedYear(y => y + 1); setSelectedMonth(1); }
    else setSelectedMonth(m => m + 1);
  }

  const monthFrom = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
  const monthTo = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999).toISOString();

  const { data: expensesResp, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', filterCategory, selectedYear, selectedMonth],
    queryFn: () => expensesApi.getAll({
      category: filterCategory as ExpenseCategory || undefined,
      from: monthFrom,
      to: monthTo,
    }),
  });
  const { data: summaryResp } = useQuery({
    queryKey: ['expenses-summary', selectedYear, selectedMonth],
    queryFn: () => expensesApi.getSummary(selectedYear, selectedMonth),
  });
  const { data: subsResp, isLoading: subsLoading } = useQuery({
    queryKey: ['expenses-subscriptions'],
    queryFn: () => expensesApi.getSubscriptions(),
  });

  const expenses: Expense[] = (expensesResp as any)?.data ?? expensesResp ?? [];
  const summary = (summaryResp as any)?.data as ExpenseSummary | undefined;
  const subscriptions: Expense[] = (subsResp as any)?.data ?? subsResp ?? [];

  const activeSubs = subscriptions.filter(
    (s) => !s.recurringEndDate || new Date(s.recurringEndDate) >= new Date(selectedYear, selectedMonth - 1, 1)
  );
  const renewalsThisMonth = subscriptions
    .map((s) => ({ sub: s, date: getRenewalInMonth(s, selectedYear, selectedMonth) }))
    .filter((x) => x.date !== null) as { sub: Expense; date: Date }[];
  const renewalsThisMonthTotal = renewalsThisMonth.reduce((sum, x) => sum + Number(x.sub.amount), 0);
  const totalMonthly = activeSubs.reduce((sum, s) => s.recurringInterval ? sum + normalizeMonthly(Number(s.amount), s.recurringInterval) : sum, 0);
  const totalYearly = activeSubs.reduce((sum, s) => s.recurringInterval ? sum + normalizeYearly(Number(s.amount), s.recurringInterval) : sum, 0);

  const projectedExpenses: Expense[] = renewalsThisMonth
    .filter(({ sub }) => !expenses.some((e) => e.parentExpenseId === sub.id))
    .map(({ sub, date }) => ({
      ...sub,
      id: `projected-${sub.id}`,
      date: date!.toISOString(),
      isRecurring: false,
      parentExpenseId: sub.id,
    }));
  const projectedIds = new Set(projectedExpenses.map((e) => e.id));
  const projectedTotal = projectedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const allExpenses = [...expenses, ...projectedExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const adjustedTotalExpenses = (summary?.totalExpenses ?? 0) + projectedTotal;
  const adjustedNetProfit = (summary?.totalRevenue ?? 0) - adjustedTotalExpenses;
  const adjustedByCategory: Record<string, number> = { ...(summary?.byCategory ?? {}) };
  for (const e of projectedExpenses) {
    adjustedByCategory[e.category] = (adjustedByCategory[e.category] ?? 0) + Number(e.amount);
  }

  const filtered = allExpenses.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return e.description.toLowerCase().includes(s) || CATEGORY_LABELS[e.category].toLowerCase().includes(s);
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
    queryClient.invalidateQueries({ queryKey: ['expenses-subscriptions'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => expensesApi.create(data),
    onSuccess: () => { invalidate(); setShowCreateForm(false); setShowSubForm(false); toast.success('Gespeichert'); },
    onError: () => toast.error('Fehler beim Speichern'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => expensesApi.update(id, data),
    onSuccess: () => { invalidate(); setEditExpense(null); setEditSub(null); toast.success('Aktualisiert'); },
    onError: () => toast.error('Fehler beim Speichern'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => { invalidate(); toast.success('Gelöscht'); },
  });

  // ─── Stat tiles data ─────────────────────────────────────────────────────────

  const ausgabenTiles = [
    {
      label: 'Einnahmen', value: summary ? formatCurrency(summary.totalRevenue) : '—',
      sub: 'Bezahlte Rechnungen', icon: TrendingUp,
      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
    },
    {
      label: 'Ausgaben', value: summary ? formatCurrency(adjustedTotalExpenses) : '—',
      sub: projectedTotal > 0 ? `inkl. ${formatCurrency(projectedTotal)} geplant` : 'inkl. Abo-Buchungen',
      icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100',
    },
    {
      label: 'Gewinn', value: summary ? formatCurrency(adjustedNetProfit) : '—',
      sub: !summary ? undefined : adjustedNetProfit >= 0 ? 'Positiv' : 'Im Minus',
      icon: Wallet,
      color: !summary || adjustedNetProfit >= 0 ? 'text-blue-600' : 'text-amber-600',
      bg: !summary || adjustedNetProfit >= 0 ? 'bg-blue-50' : 'bg-amber-50',
      border: !summary || adjustedNetProfit >= 0 ? 'border-blue-100' : 'border-amber-100',
    },
    {
      label: 'Buchungen', value: filtered.length.toString(),
      sub: projectedTotal > 0 ? `${projectedExpenses.length} ausstehend` : 'in diesem Monat',
      icon: Receipt, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200',
    },
  ];

  const aboTiles = [
    {
      label: `Kosten ${new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(new Date(selectedYear, selectedMonth - 1, 1))}`,
      value: formatCurrency(renewalsThisMonthTotal),
      sub: `${renewalsThisMonth.length} Verlängerung${renewalsThisMonth.length !== 1 ? 'en' : ''}`,
      icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100',
    },
    {
      label: 'Monatliche Kosten', value: formatCurrency(totalMonthly), sub: 'Normalisiert',
      icon: RefreshCw, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
    },
    {
      label: 'Jährliche Kosten', value: formatCurrency(totalYearly), sub: 'Normalisiert',
      icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
    },
    {
      label: 'Aktive Abos', value: activeSubs.length.toString(), sub: 'Abonnements',
      icon: Receipt, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-6">

      {/* ── Background ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-8%] right-[-5%] w-[45%] h-[45%] bg-[#800040]/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-500/4 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 w-full h-full opacity-[0.35]">
          <PixelBlast variant="square" pixelSize={6} color="#800040" patternScale={4}
            patternDensity={0.3} pixelSizeJitter={0.5} enableRipples rippleSpeed={0.2}
            rippleThickness={0.1} speed={0.1} transparent />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white/80 to-slate-50/50" />
      </div>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow-lg shadow-rose-900/10">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Receipt className="w-4 h-4 text-[#800040]" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Ausgaben</h1>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Erfassen · Analysieren · Exportieren
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDatevExport}
            disabled={datevExporting}
            className="flex items-center gap-2 px-4 h-11 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-slate-600 font-semibold text-sm hover:border-[#800040]/40 hover:text-[#800040] transition-all shadow-sm disabled:opacity-50"
          >
            {datevExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            DATEV {new Date().getFullYear()}
          </button>
          <StarBorder
            onClick={() => activeTab === 'abonnements' ? setShowSubForm(true) : setShowCreateForm(true)}
            className="rounded-full" color="#ff3366" speed="4s" thickness={3}
          >
            <div className="px-6 h-11 flex items-center justify-center rounded-full font-black text-[11px] uppercase tracking-widest gap-2 bg-[#800040] hover:bg-[#600030] text-white transition-colors">
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'abonnements' ? 'Abonnement' : 'Ausgabe erfassen'}</span>
            </div>
          </StarBorder>
        </div>
      </motion.div>

      {/* ── Month Nav + Tabs ── */}
      <motion.div {...fadeUp(0.05)} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl px-2 py-1.5 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-900 min-w-[155px] text-center select-none capitalize px-1">
            {formatMonthYear(selectedYear, selectedMonth)}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex gap-1 bg-slate-100/80 backdrop-blur-sm rounded-2xl p-1.5">
          {(['ausgaben', 'abonnements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative px-5 py-2 rounded-xl font-semibold text-sm transition-colors z-10 flex items-center gap-2',
                activeTab === tab ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="expense-tab-bg"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              {tab === 'abonnements' && <RefreshCw className="w-4 h-4" />}
              {tab === 'ausgaben' ? 'Ausgaben' : 'Abonnements'}
              {tab === 'abonnements' && subscriptions.length > 0 && (
                <span className="bg-[#800040] text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight font-black">
                  {subscriptions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* AUSGABEN TAB                                           */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'ausgaben' && (
        <div className="flex flex-col gap-6">

          {/* Stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ausgabenTiles.map(({ label, value, sub, icon: Icon, color, bg, border }, i) => (
              <motion.div key={label} {...fadeUp(i * 0.05)}
                className={cn('flex items-center gap-4 p-4 rounded-2xl border', bg, border)}
              >
                <div className={cn('p-2.5 rounded-xl bg-white/80 flex-shrink-0', color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                  <p className={cn('text-lg font-black leading-tight', color)}>{value}</p>
                  {sub && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{sub}</p>}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Category breakdown */}
          {Object.keys(adjustedByCategory).length > 0 && (
            <motion.div {...fadeUp(0.2)}>
              <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm p-5 rounded-[1.8rem]" spotlightColor="rgba(128,0,64,0.04)">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Nach Kategorien
                </h3>
                <div className="space-y-3.5">
                  {Object.entries(adjustedByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amount], i) => {
                      const Icon = CATEGORY_ICONS[cat as ExpenseCategory] || HelpCircle;
                      const colors = CATEGORY_COLORS[cat as ExpenseCategory] || CATEGORY_COLORS.OTHER;
                      const pct = adjustedTotalExpenses > 0 ? (amount / adjustedTotalExpenses) * 100 : 0;
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div className={cn('p-1.5 rounded-lg border flex-shrink-0', colors.bg, colors.text, colors.border)}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-sm font-semibold text-slate-700">{CATEGORY_LABELS[cat as ExpenseCategory]}</span>
                              <span className="text-sm font-black text-slate-900">{formatCurrency(amount)}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className={cn('h-full rounded-full', colors.bar)}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right font-bold">{Math.round(pct)}%</span>
                        </div>
                      );
                    })}
                </div>
              </SpotlightCard>
            </motion.div>
          )}

          {/* Expense list */}
          <motion.div {...fadeUp(0.25)}>
            <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm p-6 rounded-[1.8rem]" spotlightColor="rgba(128,0,64,0.04)">
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
                  <input
                    type="text"
                    placeholder="Suche nach Beschreibung oder Kategorie…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 h-11 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | '')}
                  className="px-4 h-11 bg-white border border-slate-200 rounded-2xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm min-w-[170px]"
                >
                  <option value="">Alle Kategorien</option>
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {expensesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Ausgaben laden...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/40">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                    <Receipt className="w-9 h-9 text-slate-200" />
                  </div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                    Keine Ausgaben im {formatMonthYear(selectedYear, selectedMonth)}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1.5 mb-6 max-w-xs mx-auto font-medium">
                    {search || filterCategory ? 'Passe deine Filter an.' : 'Erfasse deine erste Ausgabe für diesen Monat.'}
                  </p>
                  {!search && !filterCategory && (
                    <button onClick={() => setShowCreateForm(true)}
                      className="px-6 h-11 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-900/25">
                      Ausgabe erfassen
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {projectedTotal > 0 && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        <strong>{projectedExpenses.length} geplante Abo-Abbuchung{projectedExpenses.length !== 1 ? 'en' : ''}</strong>
                        {' '}({formatCurrency(projectedTotal)}) noch nicht abgebucht – zur Planung angezeigt.
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {filtered.map((expense, i) => {
                      const Icon = CATEGORY_ICONS[expense.category] || HelpCircle;
                      const colors = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.OTHER;
                      const isProjected = projectedIds.has(expense.id);
                      const isSubEntry = !!expense.parentExpenseId;
                      return (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.3) }}
                          className={cn(
                            'group rounded-2xl p-4 flex items-center gap-4 transition-all',
                            isProjected
                              ? 'border-2 border-dashed border-amber-300 bg-amber-50/40 hover:border-amber-400'
                              : 'bg-white border border-slate-100 hover:border-[#800040]/20 hover:shadow-sm',
                          )}
                        >
                          <div className={cn('p-2.5 rounded-xl border flex-shrink-0', colors.bg, colors.text, colors.border, isProjected && 'opacity-70')}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={cn('font-semibold truncate', isProjected ? 'text-slate-600' : 'text-slate-900')}>
                                {expense.description}
                              </p>
                              {isProjected && (
                                <span className="flex-shrink-0 text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                  <Clock className="w-2.5 h-2.5" /> Geplant
                                </span>
                              )}
                              {!isProjected && isSubEntry && (
                                <span className="flex-shrink-0 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                  <RefreshCw className="w-2.5 h-2.5" /> Abo
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span>{CATEGORY_LABELS[expense.category]}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{formatDate(expense.date)}</span>
                            </p>
                          </div>
                          <p className={cn('text-base font-black tabular-nums flex-shrink-0', isProjected ? 'text-slate-500' : 'text-slate-800')}>
                            {formatCurrency(Number(expense.amount))}
                          </p>
                          {!isProjected && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button onClick={() => setEditExpense(expense)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-[#800040]">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => { if (confirm('Ausgabe löschen?')) deleteMutation.mutate(expense.id); }}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </SpotlightCard>
          </motion.div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ABONNEMENTS TAB                                        */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'abonnements' && (
        <div className="flex flex-col gap-6">

          {/* Stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {aboTiles.map(({ label, value, sub, icon: Icon, color, bg, border }, i) => (
              <motion.div key={label} {...fadeUp(i * 0.05)}
                className={cn('flex items-center gap-4 p-4 rounded-2xl border', bg, border)}
              >
                <div className={cn('p-2.5 rounded-xl bg-white/80 flex-shrink-0', color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
                  <p className={cn('text-lg font-black leading-tight', color)}>{value}</p>
                  {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Renewals this month */}
          {renewalsThisMonth.length > 0 && (
            <motion.div {...fadeUp(0.2)}>
              <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-amber-200/60 shadow-sm p-5 rounded-[1.8rem]" spotlightColor="rgba(245,158,11,0.04)">
                <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Verlängerungen im {formatMonthYear(selectedYear, selectedMonth)}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {renewalsThisMonth.map(({ sub, date }, i) => {
                    const Icon = CATEGORY_ICONS[sub.category] || HelpCircle;
                    const colors = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.OTHER;
                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className={cn('flex items-center gap-3 p-4 rounded-2xl border', colors.bg, colors.border)}
                      >
                        <div className={cn('p-2 rounded-xl border flex-shrink-0', colors.bg, colors.text, colors.border)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-bold text-sm truncate', colors.text)}>{sub.description}</p>
                          <p className="text-xs mt-0.5 opacity-70">{date.toLocaleDateString('de-DE')}</p>
                        </div>
                        <p className={cn('text-base font-black tabular-nums flex-shrink-0', colors.text)}>
                          {formatCurrency(Number(sub.amount))}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    Gesamt im {new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date(selectedYear, selectedMonth - 1, 1))}
                  </span>
                  <span className="text-lg font-black text-slate-900">{formatCurrency(renewalsThisMonthTotal)}</span>
                </div>
              </SpotlightCard>
            </motion.div>
          )}

          {/* No renewals */}
          {renewalsThisMonth.length === 0 && subscriptions.length > 0 && (
            <motion.div {...fadeUp(0.2)}
              className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-700 text-sm font-semibold flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-base">✓</span>
              </div>
              Keine Abonnement-Verlängerungen im {formatMonthYear(selectedYear, selectedMonth)}.
            </motion.div>
          )}

          {/* All subscriptions */}
          <motion.div {...fadeUp(renewalsThisMonth.length > 0 ? 0.25 : 0.2)}>
            <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm p-6 rounded-[1.8rem]" spotlightColor="rgba(128,0,64,0.04)">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Alle Abonnements</h3>

              {subsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin" />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Laden...</p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/40">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                    <RefreshCw className="w-9 h-9 text-slate-200" />
                  </div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Keine Abonnements</h3>
                  <p className="text-slate-400 text-sm mt-1.5 mb-6 max-w-xs mx-auto font-medium">
                    Füge SaaS-Tools, Lizenzen und andere Abo-Kosten hinzu.
                  </p>
                  <button onClick={() => setShowSubForm(true)}
                    className="px-6 h-11 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-900/25">
                    Erstes Abonnement hinzufügen
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map((sub, i) => {
                    const Icon = CATEGORY_ICONS[sub.category] || HelpCircle;
                    const colors = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.OTHER;
                    const renewsNow = renewalsThisMonth.some((r) => r.sub.id === sub.id);
                    const isExpiredSub = sub.recurringEndDate && new Date(sub.recurringEndDate) < new Date(selectedYear, selectedMonth - 1, 1);
                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.3) }}
                        className={cn(
                          'group border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all',
                          isExpiredSub ? 'opacity-50 border-slate-200 bg-white'
                            : renewsNow ? 'border-amber-200 bg-amber-50/40'
                              : 'border-slate-100 bg-white hover:border-[#800040]/20',
                        )}
                      >
                        <div className={cn('p-2.5 rounded-xl border flex-shrink-0', colors.bg, colors.text, colors.border)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-900">{sub.description}</p>
                            {renewsNow && (
                              <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                Diesen Monat
                              </span>
                            )}
                            {isExpiredSub && (
                              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                Abgelaufen
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span className="font-medium text-slate-600">
                              {formatCurrency(Number(sub.amount))} {sub.recurringInterval ? INTERVAL_SHORT[sub.recurringInterval] : ''}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{CATEGORY_LABELS[sub.category]}</span>
                            {sub.recurringEndDate && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span>bis {formatDate(sub.recurringEndDate)}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {sub.nextExpenseDate && (
                            <p className="text-xs text-slate-400 flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(sub.nextExpenseDate)}
                            </p>
                          )}
                          {sub.recurringInterval && (
                            <p className="text-sm font-bold text-slate-700 tabular-nums">
                              {formatCurrency(normalizeMonthly(Number(sub.amount), sub.recurringInterval))}/Mo
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => setEditSub(sub)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-[#800040]">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm('Abonnement löschen?')) deleteMutation.mutate(sub.id); }}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </SpotlightCard>
          </motion.div>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {(showCreateForm || editExpense) && (
          <Modal onClose={() => { setShowCreateForm(false); setEditExpense(null); }}>
            <h2 className="text-xl font-black text-slate-900 mb-5 uppercase tracking-tight">
              {editExpense ? 'Ausgabe bearbeiten' : 'Ausgabe erfassen'}
            </h2>
            <ExpenseForm
              initial={editExpense || undefined}
              onSubmit={(data: any) => {
                if (editExpense) updateMutation.mutate({ id: editExpense.id, data });
                else createMutation.mutate(data);
              }}
              onCancel={() => { setShowCreateForm(false); setEditExpense(null); }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showSubForm || editSub) && (
          <Modal onClose={() => { setShowSubForm(false); setEditSub(null); }}>
            <h2 className="text-xl font-black text-slate-900 mb-5 uppercase tracking-tight">
              {editSub ? 'Abonnement bearbeiten' : 'Abonnement hinzufügen'}
            </h2>
            <SubscriptionForm
              initial={editSub || undefined}
              onSubmit={(data: any) => {
                if (editSub) updateMutation.mutate({ id: editSub.id, data });
                else createMutation.mutate({ ...data, isRecurring: true });
              }}
              onCancel={() => { setShowSubForm(false); setEditSub(null); }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <SpotlightCard className="bg-white border border-slate-200/80 rounded-[1.8rem] p-7 shadow-2xl" spotlightColor="rgba(128,0,64,0.05)">
          {children}
        </SpotlightCard>
      </motion.div>
    </div>
  );
}

// ─── Expense form ─────────────────────────────────────────────────────────────

function ExpenseForm({ initial, onSubmit, onCancel, isLoading }: any) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    amount: initial?.amount?.toString() || '',
    description: initial?.description || '',
    category: initial?.category || ExpenseCategory.OTHER,
    date: initial?.date ? initial.date.split('T')[0] : today,
    notes: initial?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) { toast.error('Betrag und Beschreibung sind Pflichtfelder'); return; }
    onSubmit({ amount: parseFloat(form.amount), description: form.description, category: form.category, date: form.date, notes: form.notes || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Betrag (€) *</label>
          <input type="number" min="0.01" step="0.01" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className={fieldClass} required autoFocus />
        </div>
        <div>
          <label className={labelClass}>Datum *</label>
          <input type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={fieldClass} required />
        </div>
      </div>
      <div>
        <label className={labelClass}>Beschreibung *</label>
        <input type="text" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={fieldClass} placeholder="Adobe Creative Cloud, Laptop, Zugticket..." required />
      </div>
      <div>
        <label className={labelClass}>Kategorie *</label>
        <div className="relative">
          <select value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            className={cn(fieldClass, 'appearance-none')}>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>
      </div>
      <div>
        <label className={labelClass}>Notizen</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
          className={cn(fieldClass, 'resize-none')} placeholder="Optional..." />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors">
          Abbrechen
        </button>
        <button type="submit" disabled={isLoading}
          className="flex-1 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-xl font-black text-sm transition-colors disabled:opacity-50 shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2">
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Speichern...</> : 'Speichern'}
        </button>
      </div>
    </form>
  );
}

// ─── Subscription form ────────────────────────────────────────────────────────

function SubscriptionForm({ initial, onSubmit, onCancel, isLoading }: any) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    amount: initial?.amount?.toString() || '',
    description: initial?.description || '',
    category: initial?.category || ExpenseCategory.SOFTWARE,
    recurringInterval: initial?.recurringInterval || RecurringInterval.MONTHLY,
    recurringStartDate: initial?.recurringStartDate ? initial.recurringStartDate.split('T')[0] : today,
    recurringEndDate: initial?.recurringEndDate ? initial.recurringEndDate.split('T')[0] : '',
    notes: initial?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) { toast.error('Betrag und Beschreibung sind Pflichtfelder'); return; }
    onSubmit({
      amount: parseFloat(form.amount),
      description: form.description,
      category: form.category,
      recurringInterval: form.recurringInterval,
      recurringStartDate: form.recurringStartDate,
      recurringEndDate: form.recurringEndDate || undefined,
      date: form.recurringStartDate,
      notes: form.notes || undefined,
    });
  };

  const amt = parseFloat(form.amount);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Betrag (€) *</label>
          <input type="number" min="0.01" step="0.01" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className={fieldClass} required autoFocus />
        </div>
        <div>
          <label className={labelClass}>Intervall *</label>
          <div className="relative">
            <select value={form.recurringInterval}
              onChange={(e) => setForm({ ...form, recurringInterval: e.target.value as RecurringInterval })}
              className={cn(fieldClass, 'appearance-none')}>
              <option value={RecurringInterval.MONTHLY}>Monatlich</option>
              <option value={RecurringInterval.QUARTERLY}>Vierteljährlich</option>
              <option value={RecurringInterval.YEARLY}>Jährlich</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>
        </div>
      </div>
      <div>
        <label className={labelClass}>Beschreibung *</label>
        <input type="text" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={fieldClass} placeholder="Adobe Creative Cloud, Figma, GitHub..." required />
      </div>
      <div>
        <label className={labelClass}>Kategorie *</label>
        <div className="relative">
          <select value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            className={cn(fieldClass, 'appearance-none')}>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Startdatum *</label>
          <input type="date" value={form.recurringStartDate}
            onChange={(e) => setForm({ ...form, recurringStartDate: e.target.value })}
            className={fieldClass} required />
        </div>
        <div>
          <label className={labelClass}>Enddatum <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
          <input type="date" value={form.recurringEndDate}
            onChange={(e) => setForm({ ...form, recurringEndDate: e.target.value })}
            className={fieldClass} />
        </div>
      </div>

      <AnimatePresence>
        {amt > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-[#800040]/5 to-[#800040]/10 border border-[#800040]/15 rounded-2xl p-4">
              <p className="text-[10px] font-black text-[#800040] uppercase tracking-widest mb-2">Kosten-Vorschau</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Monatlich:</span>
                  <span className="font-black text-slate-900">{formatCurrency(normalizeMonthly(amt, form.recurringInterval))}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Jährlich:</span>
                  <span className="font-black text-slate-900">{formatCurrency(normalizeYearly(amt, form.recurringInterval))}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <label className={labelClass}>Notizen</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
          className={cn(fieldClass, 'resize-none')} placeholder="Optional..." />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors">
          Abbrechen
        </button>
        <button type="submit" disabled={isLoading}
          className="flex-1 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-xl font-black text-sm transition-colors disabled:opacity-50 shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2">
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Speichern...</> : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
