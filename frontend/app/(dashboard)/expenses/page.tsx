'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { Expense, ExpenseCategory, ExpenseSummary } from '@/lib/types';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, Trash2, Edit2, Receipt, TrendingUp, TrendingDown,
  BarChart3, Package, Monitor, Car, Megaphone, Building, GraduationCap, HelpCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  SOFTWARE: 'bg-blue-500/20 text-blue-400 border-blue-700',
  HARDWARE: 'bg-purple-500/20 text-purple-400 border-purple-700',
  TRAVEL: 'bg-amber-500/20 text-amber-400 border-amber-700',
  MARKETING: 'bg-pink-500/20 text-pink-400 border-pink-700',
  OFFICE: 'bg-cyan-500/20 text-cyan-400 border-cyan-700',
  TRAINING: 'bg-emerald-500/20 text-emerald-400 border-emerald-700',
  OTHER: 'bg-slate-500/20 text-slate-400 border-slate-700',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('de-DE').format(new Date(dateStr));
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
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Receipt className="w-8 h-8 text-amber-400" />
              Ausgaben
            </h1>
            <p className="text-slate-400 mt-1">Betriebsausgaben tracken & auswerten</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ausgabe erfassen
          </button>
        </div>

        {/* Overview Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-emerald-400 text-xs uppercase tracking-wider">Einnahmen {selectedYear}</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-xs uppercase tracking-wider">Ausgaben {selectedYear}</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(summary.totalExpenses)}</p>
            </div>
            <div className={`border rounded-xl p-4 ${summary.netProfit >= 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <p className={`text-xs uppercase tracking-wider ${summary.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                Realer Gewinn {selectedYear}
              </p>
              <p className={`text-2xl font-bold mt-1 ${summary.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(summary.netProfit)}
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider">Ausgaben dieser Periode</p>
              <p className="text-2xl font-bold text-white mt-1">{filtered.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Chart */}
      {summary && summary.monthlyData && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Einnahmen vs. Ausgaben
            </h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={summary.monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="monthName" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
              />
              <Legend />
              <Bar dataKey="revenue" name="Einnahmen" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Ausgaben" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Ausgaben nach Kategorie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(summary.byCategory).map(([cat, amount]) => {
              const Icon = CATEGORY_ICONS[cat as ExpenseCategory] || HelpCircle;
              return (
                <div key={cat} className={`border rounded-xl p-3 ${CATEGORY_COLORS[cat as ExpenseCategory]}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{CATEGORY_LABELS[cat as ExpenseCategory] || cat}</span>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Suche nach Beschreibung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | '')}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
        >
          <option value="">Alle Kategorien</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Expenses List */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Lade Ausgaben...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Keine Ausgaben gefunden</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors"
          >
            Erste Ausgabe erfassen
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((expense: Expense) => {
            const Icon = CATEGORY_ICONS[expense.category] || HelpCircle;
            return (
              <div
                key={expense.id}
                className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 hover:border-amber-500/30 transition-all"
              >
                <div className={`p-2.5 rounded-xl border ${CATEGORY_COLORS[expense.category]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{expense.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-400">{formatCurrency(Number(expense.amount))}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditExpense(expense)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Ausgabe löschen?')) deleteMutation.mutate(expense.id);
                    }}
                    className="p-2 hover:bg-red-900/20 rounded-lg transition-colors text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(showCreateForm || editExpense) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">
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
          </div>
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Betrag (€) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Datum *</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Beschreibung *</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
          placeholder="Adobe Creative Cloud, Laptop, Zugticket..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Kategorie *</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
        >
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Notizen</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none"
          placeholder="Optional..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
