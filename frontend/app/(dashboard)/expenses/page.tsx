'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { Expense, ExpenseCategory, ExpenseSummary, RecurringInterval } from '@/lib/types';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, Trash2, Edit2, Receipt, BarChart3,
  Package, Monitor, Car, Megaphone, Building, GraduationCap, HelpCircle,
  RefreshCw, ChevronLeft, ChevronRight, Clock, AlertTriangle, Download, Loader2,
} from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  SOFTWARE: 'Software', HARDWARE: 'Hardware', TRAVEL: 'Reise',
  MARKETING: 'Marketing', OFFICE: 'Büromaterial', TRAINING: 'Fortbildung', OTHER: 'Sonstiges',
};

const CATEGORY_ICONS: Record<ExpenseCategory, any> = {
  SOFTWARE: Monitor, HARDWARE: Package, TRAVEL: Car,
  MARKETING: Megaphone, OFFICE: Building, TRAINING: GraduationCap, OTHER: HelpCircle,
};

const CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  SOFTWARE: 'bg-blue-50 text-blue-600 border-blue-100',
  HARDWARE: 'bg-purple-50 text-purple-600 border-purple-100',
  TRAVEL: 'bg-amber-50 text-amber-600 border-amber-100',
  MARKETING: 'bg-pink-50 text-pink-600 border-pink-100',
  OFFICE: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  TRAINING: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  OTHER: 'bg-slate-50 text-slate-600 border-slate-200',
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

/** Returns the renewal Date if the subscription renews in the given month, else null */
function getRenewalInMonth(sub: Expense, year: number, month: number): Date | null {
  if (!sub.recurringStartDate || !sub.recurringInterval) return null;
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);
  if (sub.recurringEndDate && new Date(sub.recurringEndDate) < monthStart) return null;
  const start = new Date(sub.recurringStartDate);
  if (start > monthEnd) return null;
  let current = new Date(start);
  while (current < monthStart) {
    current = addInterval(current, sub.recurringInterval as RecurringInterval);
  }
  return current <= monthEnd ? current : null;
}

// ─── Small shared components ──────────────────────────────────────────────────

function StatCard({ label, value, sub, colorClass }: { label: string; value: string; sub?: string; colorClass: string }) {
  return (
    <SpotlightCard className={`p-5 rounded-2xl border bg-white/80 backdrop-blur-sm ${colorClass}`} spotlightColor="rgba(128,0,64,0.04)">
      <p className="text-xs uppercase font-bold tracking-wider opacity-60 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
    </SpotlightCard>
  );
}

function MonthNav({ year, month, onPrev, onNext }: { year: number; month: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-2xl px-2 py-1.5 shadow-sm w-fit">
      <button onClick={onPrev} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-base font-bold text-slate-900 min-w-[160px] text-center select-none capitalize">
        {formatMonthYear(year, month)}
      </span>
      <button onClick={onNext} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const today = new Date();

  // ── Shared state ──
  const [activeTab, setActiveTab] = useState<'ausgaben' | 'abonnements'>('ausgaben');
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1–12

  // ── Ausgaben state ──
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  // ── Abonnements state ──
  const [showSubForm, setShowSubForm] = useState(false);
  const [editSub, setEditSub] = useState<Expense | null>(null);

  // ── Month math ──
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

  // ── Queries ──
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

  // ── Derived data ──
  const expenses: Expense[] = (expensesResp as any)?.data ?? expensesResp ?? [];
  const summary = (summaryResp as any)?.data as ExpenseSummary | undefined;
  const subscriptions: Expense[] = (subsResp as any)?.data ?? subsResp ?? [];

  // Subscription computations
  const activeSubs = subscriptions.filter(
    (s) => !s.recurringEndDate || new Date(s.recurringEndDate) >= new Date(selectedYear, selectedMonth - 1, 1)
  );
  const renewalsThisMonth = subscriptions
    .map((s) => ({ sub: s, date: getRenewalInMonth(s, selectedYear, selectedMonth) }))
    .filter((x) => x.date !== null) as { sub: Expense; date: Date }[];
  const renewalsThisMonthTotal = renewalsThisMonth.reduce((sum, x) => sum + Number(x.sub.amount), 0);
  const totalMonthly = activeSubs.reduce((sum, s) => s.recurringInterval ? sum + normalizeMonthly(Number(s.amount), s.recurringInterval) : sum, 0);
  const totalYearly = activeSubs.reduce((sum, s) => s.recurringInterval ? sum + normalizeYearly(Number(s.amount), s.recurringInterval) : sum, 0);

  // Projected expenses: subscription renewals in this month that have no real entry yet
  // (cron hasn't fired yet, or month is in the future)
  const projectedExpenses: Expense[] = renewalsThisMonth
    .filter(({ sub }) => !expenses.some((e) => e.parentExpenseId === sub.id))
    .map(({ sub, date }) => ({
      ...sub,
      id: `projected-${sub.id}`,
      date: date!.toISOString(),
      isRecurring: false,
      parentExpenseId: sub.id, // marks it as subscription-linked
    }));
  const projectedIds = new Set(projectedExpenses.map((e) => e.id));
  const projectedTotal = projectedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Merged list: real + projected, sorted by date desc
  const allExpenses = [...expenses, ...projectedExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Adjusted totals (add projections that aren't in the backend yet)
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

  // ── Mutations ──
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-6">

      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
        <div className="absolute inset-0 w-full h-full opacity-30">
          <PixelBlast variant="square" pixelSize={6} color="#800040" patternScale={4} patternDensity={0.5}
            pixelSizeJitter={0.5} enableRipples rippleSpeed={0.3} rippleThickness={0.1} speed={0.2} transparent />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)]" />
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#800040]/10 rounded-xl">
            <Receipt className="w-8 h-8 text-[#800040]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ausgaben</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDatevExport}
            disabled={datevExporting}
            title={`DATEV-Export ${new Date().getFullYear()}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 font-semibold text-sm hover:border-[#800040]/40 hover:text-[#800040] transition-all shadow-sm disabled:opacity-50"
          >
            {datevExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            DATEV {new Date().getFullYear()}
          </button>
          <button
            onClick={() => activeTab === 'abonnements' ? setShowSubForm(true) : setShowCreateForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full font-semibold transition-all shadow-lg shadow-pink-900/20"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'abonnements' ? 'Abonnement hinzufügen' : 'Ausgabe erfassen'}
          </button>
        </div>
      </div>

      {/* ── Month Navigation ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <MonthNav year={selectedYear} month={selectedMonth} onPrev={prevMonth} onNext={nextMonth} />

        {/* Tab navigation */}
        <div className="flex gap-2 bg-slate-100 rounded-2xl p-1.5">
          <button
            onClick={() => setActiveTab('ausgaben')}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === 'ausgaben' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Ausgaben
          </button>
          <button
            onClick={() => setActiveTab('abonnements')}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'abonnements' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <RefreshCw className="w-4 h-4" />
            Abonnements
            {subscriptions.length > 0 && (
              <span className="bg-[#800040] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight">
                {subscriptions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* AUSGABEN TAB                                           */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'ausgaben' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Einnahmen"
              value={summary ? formatCurrency(summary.totalRevenue) : '—'}
              sub="Bezahlte Rechnungen"
              colorClass="text-emerald-700 border-emerald-100"
            />
            <StatCard
              label="Ausgaben"
              value={summary ? formatCurrency(adjustedTotalExpenses) : '—'}
              sub={projectedTotal > 0 ? `inkl. ${formatCurrency(projectedTotal)} geplant` : 'inkl. Abo-Buchungen'}
              colorClass="text-red-600 border-red-100"
            />
            <StatCard
              label="Gewinn"
              value={summary ? formatCurrency(adjustedNetProfit) : '—'}
              colorClass={!summary || adjustedNetProfit >= 0 ? 'text-blue-700 border-blue-100' : 'text-amber-600 border-amber-100'}
            />
            <StatCard
              label="Buchungen"
              value={filtered.length.toString()}
              sub={projectedTotal > 0 ? `${projectedExpenses.length} noch ausstehend` : 'in diesem Monat'}
              colorClass="text-slate-600 border-slate-200"
            />
          </div>

          {/* Category breakdown */}
          {Object.keys(adjustedByCategory).length > 0 && (
            <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-5 rounded-3xl" spotlightColor="rgba(128,0,64,0.04)">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Nach Kategorien
              </h3>
              <div className="space-y-3">
                {Object.entries(adjustedByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => {
                    const Icon = CATEGORY_ICONS[cat as ExpenseCategory] || HelpCircle;
                    const style = CATEGORY_STYLES[cat as ExpenseCategory];
                    const pct = adjustedTotalExpenses > 0 ? (amount / adjustedTotalExpenses) * 100 : 0;
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg border ${style}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-700">{CATEGORY_LABELS[cat as ExpenseCategory]}</span>
                            <span className="text-sm font-bold text-slate-900">{formatCurrency(amount)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#800040]/70 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 w-10 text-right">{Math.round(pct)}%</span>
                      </div>
                    );
                  })}
              </div>
            </SpotlightCard>
          )}

          {/* Expense list */}
          <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128,0,64,0.04)">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Suche..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | '')}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
              >
                <option value="">Alle Kategorien</option>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>

            {expensesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800040]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Keine Ausgaben im {formatMonthYear(selectedYear, selectedMonth)}
                </h3>
                <button onClick={() => setShowCreateForm(true)} className="mt-4 px-5 py-2.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full font-medium transition-colors shadow-sm">
                  Ausgabe erfassen
                </button>
              </div>
            ) : (
              <>
              {projectedTotal > 0 && (
                <div className="mb-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span><strong>{projectedExpenses.length} geplante Abo-Abbuchung{projectedExpenses.length !== 1 ? 'en' : ''}</strong> ({formatCurrency(projectedTotal)}) sind noch nicht abgebucht und werden zur Planung angezeigt.</span>
                </div>
              )}
              <div className="space-y-2">
                {filtered.map((expense) => {
                  const Icon = CATEGORY_ICONS[expense.category] || HelpCircle;
                  const style = CATEGORY_STYLES[expense.category];
                  const isProjected = projectedIds.has(expense.id);
                  const isSubEntry = !!expense.parentExpenseId;
                  return (
                    <div
                      key={expense.id}
                      className={`group rounded-2xl p-4 flex items-center gap-4 transition-all ${
                        isProjected
                          ? 'border-2 border-dashed border-amber-300 bg-amber-50/40 hover:border-amber-400'
                          : 'bg-white border border-slate-100 hover:border-[#800040]/20 hover:shadow-sm'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border ${style} ${isProjected ? 'opacity-70' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold truncate ${isProjected ? 'text-slate-600' : 'text-slate-900'}`}>
                            {expense.description}
                          </p>
                          {isProjected && (
                            <span className="flex-shrink-0 text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> Geplant
                            </span>
                          )}
                          {!isProjected && isSubEntry && (
                            <span className="flex-shrink-0 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
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
                      <p className={`text-base font-black tabular-nums ${isProjected ? 'text-slate-500' : 'text-slate-800'}`}>
                        {formatCurrency(Number(expense.amount))}
                      </p>
                      {!isProjected && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditExpense(expense)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-[#800040]">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm('Ausgabe löschen?')) deleteMutation.mutate(expense.id); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              </>
            )}
          </SpotlightCard>
        </>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ABONNEMENTS TAB                                        */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'abonnements' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={`Abo-Kosten ${new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(new Date(selectedYear, selectedMonth - 1, 1))}`}
              value={formatCurrency(renewalsThisMonthTotal)}
              sub={`${renewalsThisMonth.length} Verlängerung${renewalsThisMonth.length !== 1 ? 'en' : ''}`}
              colorClass="text-red-600 border-red-100"
            />
            <StatCard
              label="Monatliche Kosten"
              value={formatCurrency(totalMonthly)}
              sub="Normalisiert"
              colorClass="text-orange-600 border-orange-100"
            />
            <StatCard
              label="Jährliche Kosten"
              value={formatCurrency(totalYearly)}
              sub="Normalisiert"
              colorClass="text-amber-600 border-amber-100"
            />
            <StatCard
              label="Aktive Abos"
              value={activeSubs.length.toString()}
              sub="Abonnements"
              colorClass="text-slate-600 border-slate-200"
            />
          </div>

          {/* Renewals this month */}
          {renewalsThisMonth.length > 0 && (
            <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-5 rounded-3xl" spotlightColor="rgba(128,0,64,0.04)">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Verlängerungen im {formatMonthYear(selectedYear, selectedMonth)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {renewalsThisMonth.map(({ sub, date }) => {
                  const Icon = CATEGORY_ICONS[sub.category] || HelpCircle;
                  const style = CATEGORY_STYLES[sub.category];
                  const dateStr = date.toLocaleDateString('de-DE');
                  return (
                    <div key={sub.id} className={`border rounded-2xl p-4 flex items-center gap-3 ${style}`}>
                      <div className={`p-2 rounded-xl border ${style}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{sub.description}</p>
                        <p className="text-xs mt-0.5 opacity-70">{dateStr}</p>
                      </div>
                      <p className="text-base font-black tabular-nums">{formatCurrency(Number(sub.amount))}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm text-slate-500">Gesamt im {new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date(selectedYear, selectedMonth - 1, 1))}</span>
                <span className="text-lg font-black text-slate-900">{formatCurrency(renewalsThisMonthTotal)}</span>
              </div>
            </SpotlightCard>
          )}

          {/* No renewals message */}
          {renewalsThisMonth.length === 0 && subscriptions.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-700 text-sm font-medium flex items-center gap-2">
              <span className="text-lg">✓</span>
              Keine Abonnement-Verlängerungen im {formatMonthYear(selectedYear, selectedMonth)}.
            </div>
          )}

          {/* All subscriptions */}
          <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128,0,64,0.04)">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Alle Abonnements</h3>

            {subsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800040]" />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <RefreshCw className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Keine Abonnements</h3>
                <p className="text-slate-500 text-sm mb-4">Füge SaaS-Tools, Lizenzen und andere Abo-Kosten hinzu</p>
                <button onClick={() => setShowSubForm(true)} className="px-5 py-2.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full font-medium transition-colors shadow-sm">
                  Erstes Abonnement hinzufügen
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {subscriptions.map((sub) => {
                  const Icon = CATEGORY_ICONS[sub.category] || HelpCircle;
                  const style = CATEGORY_STYLES[sub.category];
                  const renewsNow = renewalsThisMonth.some((r) => r.sub.id === sub.id);
                  const isExpired = sub.recurringEndDate && new Date(sub.recurringEndDate) < new Date(selectedYear, selectedMonth - 1, 1);
                  return (
                    <div key={sub.id} className={`group border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all ${isExpired ? 'opacity-50 border-slate-200' : renewsNow ? 'border-amber-200 bg-amber-50/40' : 'border-slate-100 bg-white hover:border-[#800040]/20'}`}>
                      <div className={`p-2.5 rounded-xl border ${style}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900">{sub.description}</p>
                          {renewsNow && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Diesen Monat</span>}
                          {isExpired && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Abgelaufen</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span className="font-medium text-slate-600">
                            {formatCurrency(Number(sub.amount))} {sub.recurringInterval ? INTERVAL_SHORT[sub.recurringInterval] : ''}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{CATEGORY_LABELS[sub.category]}</span>
                          {sub.recurringEndDate && (
                            <><span className="w-1 h-1 rounded-full bg-slate-300" /><span>bis {formatDate(sub.recurringEndDate)}</span></>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
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
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditSub(sub)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-[#800040]">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm('Abonnement löschen?')) deleteMutation.mutate(sub.id); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SpotlightCard>
        </>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* MODALS                                                  */}
      {/* ══════════════════════════════════════════════════════ */}

      {(showCreateForm || editExpense) && (
        <Modal onClose={() => { setShowCreateForm(false); setEditExpense(null); }}>
          <h2 className="text-xl font-bold text-slate-900 mb-5">{editExpense ? 'Ausgabe bearbeiten' : 'Ausgabe erfassen'}</h2>
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

      {(showSubForm || editSub) && (
        <Modal onClose={() => { setShowSubForm(false); setEditSub(null); }}>
          <h2 className="text-xl font-bold text-slate-900 mb-5">{editSub ? 'Abonnement bearbeiten' : 'Abonnement hinzufügen'}</h2>
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
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <SpotlightCard className="bg-white border border-slate-200 rounded-3xl p-7 w-full max-w-md shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto" spotlightColor="rgba(128,0,64,0.05)">
        {children}
      </SpotlightCard>
    </div>
  );
}

// ─── Expense form (one-time) ──────────────────────────────────────────────────

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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Betrag (€) *</label>
          <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all" required autoFocus />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Datum *</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Beschreibung *</label>
        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
          placeholder="Adobe Creative Cloud, Laptop, Zugticket..." required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategorie *</label>
        <div className="relative">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all appearance-none">
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notizen</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all resize-none" placeholder="Optional..." />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors">Abbrechen</button>
        <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-xl font-bold transition-colors disabled:opacity-50">
          {isLoading ? 'Speichern...' : 'Speichern'}
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
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Betrag (€) *</label>
          <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all" required autoFocus />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Intervall *</label>
          <div className="relative">
            <select value={form.recurringInterval} onChange={(e) => setForm({ ...form, recurringInterval: e.target.value as RecurringInterval })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all appearance-none">
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
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Beschreibung *</label>
        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
          placeholder="Adobe Creative Cloud, Figma, GitHub..." required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategorie *</label>
        <div className="relative">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all appearance-none">
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Startdatum *</label>
          <input type="date" value={form.recurringStartDate} onChange={(e) => setForm({ ...form, recurringStartDate: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all" required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Enddatum <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
          <input type="date" value={form.recurringEndDate} onChange={(e) => setForm({ ...form, recurringEndDate: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all" />
        </div>
      </div>

      {/* Cost preview */}
      {amt > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>Monatlich:</span>
            <span className="font-bold text-slate-900">{formatCurrency(normalizeMonthly(amt, form.recurringInterval))}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Jährlich:</span>
            <span className="font-bold text-slate-900">{formatCurrency(normalizeYearly(amt, form.recurringInterval))}</span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notizen</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all resize-none" placeholder="Optional..." />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors">Abbrechen</button>
        <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-full font-bold transition-colors disabled:opacity-50">
          {isLoading ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
