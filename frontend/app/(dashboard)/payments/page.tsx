'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePayments, useCreatePayment, useDeletePayment } from '@/lib/hooks/usePayments';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useProjects } from '@/lib/hooks/useProjects';
import SpotlightCard from '@/components/ui/SpotlightCard';
import PixelBlast from '@/components/landing/PixelBlast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Wallet,
  User,
  FileText,
  Calendar,
  Trash2,
  Check,
  X,
  Loader2,
  TrendingDown,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ─── Animation helper ─────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 26, delay },
  };
}

// ─── Form field styles ────────────────────────────────────────────────────────

const fieldClass = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all';
const labelClass = 'block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true);
  }, [searchParams]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    note: '',
  });

  const [customerFilter, setCustomerFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const { data: payments, isLoading } = usePayments();
  const { data: invoices } = useInvoices();
  const { data: customers } = useCustomers();
  const { data: projects } = useProjects({
    customerId: customerFilter || undefined
  });
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment.mutateAsync(formData);
      setShowForm(false);
      setFormData({ invoiceId: '', amount: 0, paymentDate: new Date().toISOString().split('T')[0], note: '' });
      toast.success('Zahlung erfolgreich erfasst');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Erfassen der Zahlung');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Diese Zahlung wirklich löschen? Der Rechnungsstatus wird neu berechnet.')) {
      try {
        await deletePayment.mutateAsync(id);
        toast.success('Zahlung erfolgreich gelöscht');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Fehler beim Löschen der Zahlung');
      }
    }
  };

  const filteredPayments = payments?.filter(p => {
    const matchesSearch = p.invoice?.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice?.description.toLowerCase().includes(search.toLowerCase()) ||
      p.note?.toLowerCase().includes(search.toLowerCase());

    const matchesCustomer = !customerFilter || p.invoice?.customerId === customerFilter;
    const matchesProject = !projectFilter || p.invoice?.projectId === projectFilter;

    return matchesSearch && matchesCustomer && matchesProject;
  });

  // Filter invoices that are not fully paid
  const unpaidInvoices = invoices?.filter(
    (inv) => inv.totalPaid < inv.amount
  ) || [];

  // ─── Computed stats ──────────────────────────────────────────────────────────

  const totalReceived = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalCount = payments?.length ?? 0;
  const filteredCount = filteredPayments?.length ?? 0;
  const avgPayment = totalCount > 0 ? totalReceived / totalCount : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

  const statTiles = [
    {
      label: 'Einnahmen gesamt',
      value: formatCurrency(totalReceived),
      icon: ArrowUpRight,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      color: 'text-emerald-600',
    },
    {
      label: 'Zahlungen',
      value: totalCount.toString(),
      icon: Wallet,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      color: 'text-blue-600',
    },
    {
      label: 'Ø Zahlung',
      value: formatCurrency(avgPayment),
      icon: TrendingDown,
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      color: 'text-violet-600',
    },
    {
      label: 'Gefiltert',
      value: filteredCount.toString(),
      icon: Search,
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      color: 'text-slate-600',
    },
  ];

  return (
    <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-6">

      {/* ── Background ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#800040]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/4 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-20">
          <PixelBlast
            variant="square"
            pixelSize={5}
            color="#800040"
            patternScale={5}
            patternDensity={0.4}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.2}
            rippleThickness={0.08}
            speed={0.15}
            transparent
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white/80 to-slate-50/50" />
      </div>

      {/* ── Stat Tiles ── */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statTiles.map((tile, i) => (
          <motion.div
            key={tile.label}
            {...fadeUp(i * 0.04)}
            className={cn('flex items-center gap-3 p-4 rounded-2xl border', tile.bg, tile.border)}
          >
            <div className={cn('p-2 rounded-xl bg-white/80 shrink-0', tile.color)}>
              <tile.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{tile.label}</p>
              <p className="font-black text-slate-900 tabular-nums truncate">{tile.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Create Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            <SpotlightCard
              className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-8 shadow-xl"
              spotlightColor="rgba(128, 0, 64, 0.04)"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px]">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-[#800040]" />
                  </div>
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Zahlung manuell erfassen</h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> Rechnung auswählen *</span>
                    </label>
                    <div className="relative group">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#800040] transition-colors pointer-events-none" />
                      <select
                        required
                        value={formData.invoiceId}
                        onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                        className={cn(fieldClass, 'pl-10')}
                      >
                        <option value="">Wähle eine offene Rechnung...</option>
                        {unpaidInvoices?.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.customer?.name} — {inv.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} (Offen: {(inv.amount - inv.totalPaid).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5"><TrendingDown className="w-3 h-3" /> Zahlbetrag (€) *</span>
                    </label>
                    <div className="relative group">
                      <TrendingDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#800040] transition-colors pointer-events-none" />
                      <input
                        type="number"
                        required
                        step="0.01"
                        placeholder="0,00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        className={cn(fieldClass, 'pl-10')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Zahlungsdatum *</span>
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#800040] transition-colors pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                        className={cn(fieldClass, 'pl-10')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5"><Info className="w-3 h-3" /> Notiz (optional)</span>
                    </label>
                    <div className="relative group">
                      <Info className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-[#800040] transition-colors pointer-events-none" />
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        placeholder="Verwendungszweck, Provider, etc."
                        rows={3}
                        className={cn(fieldClass, 'pl-10 resize-none')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 h-11 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full transition-all font-black text-[11px] uppercase tracking-widest"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={createPayment.isPending}
                    className="px-6 h-11 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-900/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {createPayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Zahlung buchen
                  </button>
                </div>
              </form>
            </SpotlightCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search & Filter ── */}
      <motion.div {...fadeUp(0.1)} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#800040] transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Zahlungen durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-11 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm"
          />
        </div>

        <select
          value={customerFilter}
          onChange={(e) => {
            setCustomerFilter(e.target.value);
            setProjectFilter('');
          }}
          className="px-4 h-11 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm min-w-[180px]"
        >
          <option value="">Alle Kunden</option>
          {customers?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          disabled={!customerFilter}
          className="px-4 h-11 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm min-w-[180px] disabled:opacity-50"
        >
          <option value="">{customerFilter ? 'Alle Projekte' : 'Kunde wählen...'}</option>
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </motion.div>

      {/* ── Payments List ── */}
      <div className="min-h-100">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin" />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Lade Zahlungen...</p>
          </div>
        ) : filteredPayments && filteredPayments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.2 }}
              >
                <SpotlightCard
                  className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-6 flex flex-col h-full hover:shadow-lg transition-shadow group"
                  spotlightColor="rgba(128, 0, 64, 0.04)"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eingang</p>
                        <p className="text-lg font-black text-emerald-600 tabular-nums leading-tight">
                          +{payment.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-2.5 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-sm font-semibold truncate">{payment.invoice?.customer?.name || 'Unbekannt'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-sm truncate">{payment.invoice?.description || 'Rechnung'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-sm tabular-nums">{new Date(payment.paymentDate).toLocaleDateString('de-DE')}</span>
                    </div>
                    {payment.note && (
                      <div className="flex items-start gap-2.5 text-slate-500">
                        <Info className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                        <span className="text-xs italic line-clamp-2">{payment.note}</span>
                      </div>
                    )}
                  </div>

                  {/* Invoice Info Footer */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Rechnungs-Info</p>
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">
                        Gesamt: {payment.invoice?.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full uppercase tracking-wide">
                        {payment.invoice?.status}
                      </span>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-5 border-2 border-dashed border-slate-200">
              <Wallet className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Keine Zahlungen gefunden</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
              Erfasse deinen ersten Zahlungseingang, um deine Einnahmen zu verfolgen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
