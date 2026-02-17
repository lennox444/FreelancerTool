'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Folder,
  Download,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { bankAccountsApi } from '@/lib/api/bank-accounts';
import { invoicesApi } from '@/lib/api/invoices';
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
  const [timeEntriesModal, setTimeEntriesModal] = useState<{ invoiceId: string; projectId: string; invoiceNumber?: string } | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    projectId: '',
    amount: 0,
    description: '',
    dueDate: '',
    bankAccountId: '',
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
  const { data: bankAccounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: bankAccountsApi.getAll
  });
  const createInvoice = useCreateInvoice();
  const sendInvoice = useSendInvoice();
  const deleteInvoice = useDeleteInvoice();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvoice.mutateAsync(formData);
      setShowForm(false);
      setFormData({ customerId: '', projectId: '', amount: 0, description: '', dueDate: '', bankAccountId: '' });
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

  const handleDownloadPdf = async (inv: any) => {
    try {
      const response = await invoicesApi.downloadPdf(inv.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rechnung-${inv.invoiceNumber || inv.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('PDF-Download fehlgeschlagen');
    }
  };

  const handleSendEmail = async (id: string) => {
    try {
      const result = await invoicesApi.sendEmail(id);
      toast.success((result as any).message || 'E-Mail gesendet');
    } catch {
      toast.error('E-Mail-Versand fehlgeschlagen. SMTP konfiguriert?');
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

                {/* Bank Account Select */}
                <div>
                  <label className={labelClasses}>
                    <Wallet className="w-4 h-4 text-slate-400" />
                    Bankverbindung (optional)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="relative">
                      <select
                        value={formData.bankAccountId}
                        onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
                        className={inputClasses}
                      >
                        <option value="">Standard verwenden</option>
                        {Array.isArray(bankAccounts) && bankAccounts.map((acc: any) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.bankName || (acc.isPaypal ? 'PayPal' : '')})
                          </option>
                        ))}
                      </select>
                    </div>
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
      )
      }

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
                  <button
                    onClick={() => handleDownloadPdf(inv)}
                    className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                    title="PDF herunterladen"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendEmail(inv.id)}
                    className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
                    title="Per E-Mail versenden"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  {inv.publicToken && (
                    <ClientPortalButtons publicToken={inv.publicToken} />
                  )}
                  {inv.project?.id && (
                    <button
                      onClick={() => setTimeEntriesModal({ invoiceId: inv.id, projectId: inv.project!.id, invoiceNumber: inv.invoiceNumber || undefined })}
                      className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-all border border-slate-100"
                      title="Zeiteinträge verknüpfen"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  )}
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

      {
        paymentModal && (
          <AddPaymentModal
            invoiceId={paymentModal.invoiceId}
            invoiceAmount={paymentModal.amount}
            totalPaid={paymentModal.totalPaid}
            customerName={paymentModal.customerName}
            onClose={() => setPaymentModal(null)}
          />
        )
      }

      {
        timeEntriesModal && (
          <TimeEntriesModal
            invoiceId={timeEntriesModal.invoiceId}
            invoiceNumber={timeEntriesModal.invoiceNumber}
            onClose={() => setTimeEntriesModal(null)}
          />
        )
      }
    </div >
  );
}

function ClientPortalButtons({ publicToken }: { publicToken: string }) {
  const [copied, setCopied] = useState(false);
  const portalUrl = `${window.location.origin}/invoice/${publicToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <a
        href={`/invoice/${publicToken}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-purple-50 hover:text-purple-600 transition-all border border-slate-100"
        title="Kunden-Portal öffnen"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
      <button
        onClick={handleCopy}
        className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100"
        title="Portal-Link kopieren"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} Min.`;
  if (m === 0) return `${h} Std.`;
  return `${h} Std. ${m} Min.`;
}



function TimeEntriesModal({ invoiceId, invoiceNumber, onClose }: {
  invoiceId: string;
  invoiceNumber?: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['invoice-time-entries', invoiceId],
    queryFn: () => invoicesApi.getTimeEntries(invoiceId),
  });

  // Pre-select already linked entries
  useEffect(() => {
    if (!initialized && entries.length > 0) {
      const alreadyLinked = new Set<string>(
        entries.filter((e: any) => e.invoiceId === invoiceId).map((e: any) => e.id)
      );
      setSelected(alreadyLinked);
      setInitialized(true);
    }
  }, [entries, invoiceId, initialized]);

  const saveMutation = useMutation({
    mutationFn: () => invoicesApi.setTimeEntries(invoiceId, Array.from(selected)),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-time-entries', invoiceId] });
      toast.success(`${result.linked} Zeiteinträge verknüpft`);
      onClose();
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalSeconds = entries
    .filter((e: any) => selected.has(e.id))
    .reduce((sum: number, e: any) => sum + (e.duration || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Zeiteinträge verknüpfen</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {invoiceNumber ? `Rechnung ${invoiceNumber}` : 'Rechnung'} · Wähle welche Einträge der Kunde sehen soll
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#800040]" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Keine Zeiteinträge für dieses Projekt</p>
              <p className="text-sm mt-1">Buche Zeiten auf das Projekt im Zeiterfassungs-Modul.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry: any) => {
                const isSelected = selected.has(entry.id);
                const date = new Date(entry.startTime).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                return (
                  <label
                    key={entry.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(entry.id)}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">
                        {entry.description || 'Kein Titel'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{date}</span>
                        <span className="font-semibold text-slate-700">{formatDuration(entry.duration)}</span>
                        {entry.invoiceId && entry.invoiceId !== invoiceId && (
                          <span className="text-amber-600 font-medium">Bereits verrechnet</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-slate-500">Ausgewählt: </span>
              <span className="font-bold text-slate-800">{selected.size} Einträge</span>
              {totalSeconds > 0 && (
                <span className="text-slate-500 ml-2">· {formatDuration(totalSeconds)} gesamt</span>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Abbrechen
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="px-4 py-2 text-sm bg-[#800040] hover:bg-[#600030] text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Speichere...' : 'Speichern'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
