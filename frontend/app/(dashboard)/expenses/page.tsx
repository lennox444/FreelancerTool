'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { Expense, ExpenseCategory, ExpenseSummary } from '@/lib/types';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, Trash2, Edit2, Receipt, TrendingUp, TrendingDown,
  BarChart3, Package, Monitor, Car, Megaphone, Building, GraduationCap, HelpCircle,
  FileText, Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  SOFTWARE: 'Software',
  HARDWARE: 'Hardware',
  TRAVEL: 'Reise',
  MARKETING: 'Marketing',
  OFFICE: 'Büromaterial',
  TRAINING: 'Fortbildung',
  OTHER: 'Sonstiges',
};

const CATEGORY_ICONS: Record<ExpenseCategory, any> = {
  SOFTWARE: Monitor,
  HARDWARE: Package,
  TRAVEL: Car,
  MARKETING: Megaphone,
  OFFICE: Building,
  TRAINING: GraduationCap,
  OTHER: HelpCircle,
};

const CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  SOFTWARE: 'bg-blue-50 text-blue-600',
  HARDWARE: 'bg-purple-50 text-purple-600',
  TRAVEL: 'bg-amber-50 text-amber-600',
  MARKETING: 'bg-pink-50 text-pink-600',
  OFFICE: 'bg-cyan-50 text-cyan-600',
  TRAINING: 'bg-emerald-50 text-emerald-600',
  OTHER: 'bg-slate-50 text-slate-600',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('de-DE').format(new Date(dateStr));
}

function ExpenseStatCard({
  label,
  value,
  sub,
  colorClass
}: {
  label: string;
  value: string;
  sub?: string;
  colorClass: string;
}) {
  return (
    <div className={`p-4 rounded-2xl border ${colorClass} bg-white/50 backdrop-blur-sm`}>
      <p className="text-xs uppercase font-bold tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  )
}


export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: expensesResp, isLoading } = useQuery({
    queryKey: ['expenses', filterCategory],
    queryFn: () =>
      expensesApi.getAll(filterCategory ? { category: filterCategory as ExpenseCategory } : {}),
  });

  const { data: summaryResp } = useQuery({
    queryKey: ['expenses-summary', selectedYear],
    queryFn: () => expensesApi.getSummary(selectedYear),
  });

  const expenses = (expensesResp as any)?.data ?? expensesResp ?? [];
  const summary = (summaryResp as any)?.data as ExpenseSummary | undefined;

  const filtered = (expenses as Expense[]).filter((e: Expense) => {
    const searchLower = search.toLowerCase();
    return (
      !search ||
      e.description.toLowerCase().includes(searchLower) ||
      CATEGORY_LABELS[e.category].toLowerCase().includes(searchLower)
    );
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => expensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      setShowCreateForm(false);
      toast.success('Ausgabe erfasst');
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => expensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      setEditExpense(null);
      toast.success('Ausgabe aktualisiert');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
      toast.success('Ausgabe gelöscht');
    },
  });

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-8">
      {/* Background Elements */}
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

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#800040]/10 rounded-xl">
              <Receipt className="w-8 h-8 text-[#800040]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ausgaben</h1>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-300"></div>
          <p className="text-slate-500 font-medium">Betriebsausgaben tracken & auswerten</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full font-semibold transition-all shadow-lg shadow-pink-900/20"
        >
          <Plus className="w-5 h-5" />
          Ausgabe erfassen
        </button>
      </div>

      {/* Overview Cards */}
      {summary && (
        <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#800040]" />
              Finanzübersicht {selectedYear}
            </h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#800040]/20"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ExpenseStatCard
              label="Einnahmen"
              value={formatCurrency(summary.totalRevenue)}
              colorClass="text-emerald-600 border-emerald-100 bg-emerald-50/50"
            />
            <ExpenseStatCard
              label="Ausgaben"
              value={formatCurrency(summary.totalExpenses)}
              colorClass="text-red-600 border-red-100 bg-red-50/50"
            />
            <ExpenseStatCard
              label="Realer Gewinn"
              value={formatCurrency(summary.netProfit)}
              colorClass={summary.netProfit >= 0 ? "text-blue-600 border-blue-100 bg-blue-50/50" : "text-amber-600 border-amber-100 bg-amber-50/50"}
            />
            <ExpenseStatCard
              label="Einträge"
              value={filtered.length.toString()}
              sub="Ausgaben in Periode"
              colorClass="text-slate-600 border-slate-200 bg-slate-50/50"
            />
          </div>
        </SpotlightCard>
      )}

      {/* Monthly Chart */}
      {summary && summary.monthlyData && (
        <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="monthName"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(v) => `${v}€`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Einnahmen" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                <Bar dataKey="expenses" name="Ausgaben" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      )}

      {/* Main Content Area */}
      <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">

        {/* Category Breakdown (Mini) */}
        {summary && Object.keys(summary.byCategory).length > 0 && (
          <div className="mb-8 overflow-x-auto pb-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Nach Kategorien</h3>
            <div className="flex gap-4">
              {Object.entries(summary.byCategory).map(([cat, amount]) => {
                const Icon = CATEGORY_ICONS[cat as ExpenseCategory] || HelpCircle;
                return (
                  <div key={cat} className={`flex-shrink-0 border rounded-2xl p-4 min-w-[140px] flex flex-col items-start gap-3 ${CATEGORY_STYLES[cat as ExpenseCategory].replace('bg-', 'bg-opacity-10 border-opacity-20 ')} bg-opacity-5 border`}>
                    <div className={`p-2 rounded-lg ${CATEGORY_STYLES[cat as ExpenseCategory]} bg-opacity-20`}>
                      <Icon className={`w-4 h-4 ${CATEGORY_STYLES[cat as ExpenseCategory].split(' ')[1]}`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(amount)}</p>
                      <p className="text-xs font-medium text-slate-500">{CATEGORY_LABELS[cat as ExpenseCategory]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 pt-6 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Suche nach Beschreibung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | '')}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all cursor-pointer hover:bg-slate-100"
          >
            <option value="">Alle Kategorien</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Expenses List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800040]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Keine Ausgaben gefunden</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-5 py-2.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full font-medium transition-colors shadow-sm"
            >
              Erste Ausgabe erfassen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((expense: Expense) => {
              const Icon = CATEGORY_ICONS[expense.category] || HelpCircle;
              const style = CATEGORY_STYLES[expense.category];
              // parsing style to get bg and text color parts roughly
              return (
                <div
                  key={expense.id}
                  className="group bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-[#800040]/30 hover:shadow-md transition-all"
                >
                  <div className={`p-3 rounded-xl ${style} bg-opacity-10 md:bg-opacity-20`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{expense.description}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-medium">{CATEGORY_LABELS[expense.category]}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{formatDate(expense.date)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-800">{formatCurrency(Number(expense.amount))}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditExpense(expense)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-[#800040]"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Ausgabe löschen?')) deleteMutation.mutate(expense.id);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SpotlightCard>

      {/* Create / Edit Modal */}
      {(showCreateForm || editExpense) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setShowCreateForm(false); setEditExpense(null); }} />
          <SpotlightCard className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10" spotlightColor="rgba(128, 0, 64, 0.05)">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editExpense ? 'Ausgabe bearbeiten' : 'Ausgabe erfassen'}
            </h2>
            <ExpenseForm
              initial={editExpense || undefined}
              onSubmit={(data: any) => {
                if (editExpense) {
                  updateMutation.mutate({ id: editExpense.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => { setShowCreateForm(false); setEditExpense(null); }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </SpotlightCard>
        </div>
      )}
    </div>
  );
}

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
    if (!form.amount || !form.description) {
      toast.error('Betrag und Beschreibung sind Pflichtfelder');
      return;
    }
    onSubmit({
      amount: parseFloat(form.amount),
      description: form.description,
      category: form.category,
      date: form.date,
      notes: form.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Betrag (€) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Datum *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Beschreibung *</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
          placeholder="Adobe Creative Cloud, Laptop, Zugticket..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategorie *</label>
        <div className="relative">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all appearance-none"
          >
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {/* Simple chevron hack */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notizen</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all resize-none"
          placeholder="Optional..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-xl font-bold transition-colors disabled:opacity-50 shadow-lg shadow-pink-900/10"
        >
          {isLoading ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
