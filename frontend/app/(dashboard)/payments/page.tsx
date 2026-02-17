'use client';

import { useState } from 'react';
import { usePayments, useCreatePayment, useDeletePayment } from '@/lib/hooks/usePayments';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useProjects } from '@/lib/hooks/useProjects';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import PixelBlast from '@/components/landing/PixelBlast';
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
  ArrowUpRight,
  TrendingDown,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);
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

  const inputClasses = "mt-1 block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400";
  const labelClasses = "flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1 ml-1";

  return (
    <div className="relative isolate min-h-full p-4 md:p-6">
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

      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Zahlungen</h1>
          <div className="hidden md:block h-8 w-[2px] bg-slate-200 rounded-full"></div>
          <p className="text-slate-500 font-medium">
            Behalte deine Zahlungseingänge und Einnahmen im Überblick.
          </p>
        </div>

        <div className="flex gap-3">
          <StarBorder onClick={() => setShowForm(!showForm)} className="rounded-full group" color={showForm ? "#94a3b8" : "#ff3366"} speed="4s" thickness={3}>
            <div className={cn(
              "px-6 h-12 flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg gap-2",
              showForm
                ? "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-slate-200/20"
                : "bg-[#800040] hover:bg-[#600030] text-white shadow-pink-900/20"
            )}>
              {showForm ? <X className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
              <span>{showForm ? 'Abbrechen' : 'Zahlung erfassen'}</span>
            </div>
          </StarBorder>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <SpotlightCard className="bg-white/95 backdrop-blur-md border border-[#800040]/20 shadow-xl p-8 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Zahlung manuell erfassen</h2>
              <button onClick={() => setShowForm(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>
                    <FileText className="w-4 h-4 text-slate-400" />
                    Rechnung auswählen *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <select
                      required
                      value={formData.invoiceId}
                      onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                      className={inputClasses}
                    >
                      <option value="">Wähle eine offene Rechnung...</option>
                      {unpaidInvoices?.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.customer?.name} - {inv.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} (Offen: {(inv.amount - inv.totalPaid).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>
                    <TrendingDown className="w-4 h-4 text-slate-400" />
                    Zahlbetrag (€) *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Zahlungsdatum *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClasses}>
                    <Info className="w-4 h-4 text-slate-400" />
                    Notiz (optional)
                  </label>
                  <div className="relative group">
                    <div className="absolute top-3.5 left-3.5 text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <Info className="w-4 h-4" />
                    </div>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Verwendungszweck, Provider, etc."
                      className={cn(inputClasses, "pl-10 h-20")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full transition-all font-semibold text-sm"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={createPayment.isPending}
                  className="px-8 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {createPayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Zahlung buchen
                </button>
              </div>
            </form>
          </SpotlightCard>
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Zahlungen durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all text-slate-700 shadow-sm"
          />
        </div>

        <select
          value={customerFilter}
          onChange={(e) => {
            setCustomerFilter(e.target.value);
            setProjectFilter(''); // Reset project when customer changes
          }}
          className="px-6 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat pr-12 min-w-[200px]"
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
          className="px-6 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat pr-12 min-w-[200px]"
        >
          <option value="">{customerFilter ? 'Alle Projekte' : 'Kunde wählen...'}</option>
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#800040] mb-3" />
            <p className="font-medium">Lade Zahlungen...</p>
          </div>
        ) : filteredPayments && filteredPayments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map((payment) => (
              <SpotlightCard
                key={payment.id}
                className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm p-6 rounded-2xl hover:shadow-md transition-shadow group flex flex-col"
                spotlightColor="rgba(128, 0, 64, 0.05)"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      +{payment.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{payment.invoice?.customer?.name || 'Unbekannt'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 space-y-2.5">
                    <div className="flex items-center gap-3 text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm truncate">{payment.invoice?.description || 'Rechnung'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{new Date(payment.paymentDate).toLocaleDateString('de-DE')}</span>
                    </div>
                    {payment.note && (
                      <div className="flex items-center gap-3 text-slate-500 italic">
                        <Info className="w-4 h-4 text-slate-300" />
                        <span className="text-xs">{payment.note}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">Rechnungs-Info</div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600">
                      Gesamt: {payment.invoice?.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                      {payment.invoice?.status}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <Wallet className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Keine Zahlungen gefunden</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              Erfasse deinen ersten Zahlungseingang, um deine Einnahmen zu verfolgen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
