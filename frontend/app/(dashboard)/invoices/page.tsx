'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInvoices, useCreateInvoice, useSendInvoice, useDeleteInvoice } from '@/lib/hooks/useInvoices';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useProjects } from '@/lib/hooks/useProjects';
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge';
import AddPaymentModal from '@/components/payments/AddPaymentModal';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import PixelBlast from '@/components/landing/PixelBlast';
import {
  Plus,
  Search,
  FileText,
  User,
  Calendar,
  DollarSign,
  Send,
  Trash2,
  PlusCircle,
  X,
  Loader2,
  ArrowUpRight,
  ChevronRight,
  Wallet,
  Folder
} from 'lucide-react';
import { InvoiceStatus } from '@/lib/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [paymentModal, setPaymentModal] = useState<{ invoiceId: string; amount: number; totalPaid: number; customerName: string } | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    projectId: '',
    amount: 0,
    description: '',
    dueDate: '',
  });

  // Init filter from URL
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && Object.values(InvoiceStatus).includes(statusParam as InvoiceStatus)) {
      setStatusFilter(statusParam as InvoiceStatus);
    }
  }, [searchParams]);

  const { data: invoices, isLoading } = useInvoices({
    customerId: customerFilter || undefined,
    status: statusFilter || undefined,
  });
  const { data: customers } = useCustomers();
  const { data: projects } = useProjects({
    customerId: customerFilter || formData.customerId || undefined
  });
  const createInvoice = useCreateInvoice();
  const sendInvoice = useSendInvoice();
  const deleteInvoice = useDeleteInvoice();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvoice.mutateAsync(formData);
      setShowForm(false);
      setFormData({ customerId: '', projectId: '', amount: 0, description: '', dueDate: '' });
      toast.success('Rechnung erfolgreich erstellt');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Erstellen der Rechnung');
    }
  };

  const handleSend = async (id: string) => {
    if (confirm('Diese Rechnung wirklich senden?')) {
      try {
        await sendInvoice.mutateAsync(id);
        toast.success('Rechnung erfolgreich gesendet');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Fehler beim Senden der Rechnung');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Diese Rechnung löschen? (Nur Entwürfe können gelöscht werden)')) {
      try {
        await deleteInvoice.mutateAsync(id);
        toast.success('Rechnung erfolgreich gelöscht');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Fehler beim Löschen der Rechnung');
      }
    }
  };

  const filteredInvoices = invoices?.filter(inv => {
    const matchesSearch = inv.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.description.toLowerCase().includes(search.toLowerCase());
    const matchesProject = !projectFilter || inv.projectId === projectFilter;
    return matchesSearch && matchesProject;
  });

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Rechnungen</h1>
          <div className="hidden md:block h-8 w-[2px] bg-slate-200 rounded-full"></div>
          <p className="text-slate-500 font-medium">
            Erstelle, verwalte und versende deine Rechnungen professionell.
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
              {showForm ? <X className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              <span>{showForm ? 'Abbrechen' : 'Neue Rechnung'}</span>
            </div>
          </StarBorder>
        </div>
      </div>

      {showForm && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <SpotlightCard className="bg-white/95 backdrop-blur-md border border-[#800040]/20 shadow-xl p-8 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Rechnung erstellen</h2>
              <button onClick={() => setShowForm(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Select */}
                <div>
                  <label className={labelClasses}>
                    <User className="w-4 h-4 text-slate-400" />
                    Kunde *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className={inputClasses}
                    >
                      <option value="">Wähle einen Kunden...</option>
                      {customers?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.company ? `(${c.company})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Project Select */}
                <div>
                  <label className={labelClasses}>
                    <Folder className="w-4 h-4 text-slate-400" />
                    Projekt (optional)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <Folder className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className={inputClasses}
                      disabled={!formData.customerId}
                    >
                      <option value="">{formData.customerId ? 'Wähle ein Projekt...' : 'Zuerst Kunden wählen'}</option>
                      {projects?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className={labelClasses}>
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    Betrag (€) *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <DollarSign className="w-4 h-4" />
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

                {/* Description */}
                <div className="md:col-span-2">
                  <label className={labelClasses}>
                    <FileText className="w-4 h-4 text-slate-400" />
                    Beschreibung *
                  </label>
                  <div className="relative group">
                    <div className="absolute top-3.5 left-3.5 text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      required
                      placeholder="z.B. Webdesign Projekt - Meilenstein 1"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={cn(inputClasses, "pl-10 h-24")}
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className={labelClasses}>
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Fälligkeitsdatum *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className={inputClasses}
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
                  disabled={createInvoice.isPending}
                  className="px-8 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {createInvoice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Rechnung erstellen
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
            placeholder="Rechnungen suchen nach Kunde oder Beschreibung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all text-slate-700 shadow-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
          className="px-6 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat pr-12 min-w-[200px]"
        >
          <option value="">Alle Status</option>
          <option value={InvoiceStatus.DRAFT}>Entwurf</option>
          <option value={InvoiceStatus.SENT}>Versendet</option>
          <option value={InvoiceStatus.PARTIALLY_PAID}>Teilweise bezahlt</option>
          <option value={InvoiceStatus.PAID}>Bezahlt</option>
          <option value={InvoiceStatus.OVERDUE}>Überfällig</option>
        </select>

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
            <p className="font-medium">Lade Rechnungen...</p>
          </div>
        ) : filteredInvoices && filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((inv) => (
              <SpotlightCard
                key={inv.id}
                className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm p-6 rounded-2xl hover:shadow-md transition-shadow group flex flex-col h-full"
                spotlightColor="rgba(128, 0, 64, 0.05)"
              >
                <div className="flex justify-between items-start mb-4">
                  <InvoiceStatusBadge status={inv.status} />
                  <div className="text-lg font-bold text-slate-900 group-hover:text-[#800040] transition-colors">
                    {inv.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{inv.customer?.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{inv.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>Fällig am</span>
                      </div>
                      <span className="font-medium text-slate-700">{new Date(inv.dueDate).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Wallet className="w-4 h-4" />
                        <span>Bezahlt</span>
                      </div>
                      <span className="font-bold text-emerald-600">
                        {inv.totalPaid.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 flex gap-2 border-t border-slate-50">
                  {inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.DRAFT && (
                    <button
                      onClick={() => setPaymentModal({
                        invoiceId: inv.id,
                        amount: inv.amount,
                        totalPaid: inv.totalPaid,
                        customerName: inv.customer?.name || 'Unbekannt',
                      })}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Zahlung
                    </button>
                  )}
                  {inv.status === InvoiceStatus.DRAFT && (
                    <button
                      onClick={() => handleSend(inv.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Senden
                    </button>
                  )}
                  {inv.status === InvoiceStatus.DRAFT && (
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Keine Rechnungen gefunden</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              Erstelle deine erste professionelle Rechnung per Klick auf "Neue Rechnung".
            </p>
          </div>
        )}
      </div>

      {paymentModal && (
        <AddPaymentModal
          invoiceId={paymentModal.invoiceId}
          invoiceAmount={paymentModal.amount}
          totalPaid={paymentModal.totalPaid}
          customerName={paymentModal.customerName}
          onClose={() => setPaymentModal(null)}
        />
      )}
    </div>
  );
}
