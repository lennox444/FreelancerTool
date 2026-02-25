'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useInvoices, useCreateInvoice, useSendInvoice,
  useDeleteInvoice, useUpdateInvoice,
} from '@/lib/hooks/useInvoices';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useProjects } from '@/lib/hooks/useProjects';
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge';
import AddPaymentModal from '@/components/payments/AddPaymentModal';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import PixelBlast from '@/components/landing/PixelBlast';
import {
  Plus, Search, FileText, User, Calendar, DollarSign, Send, Trash2,
  PlusCircle, X, Loader2, Wallet, Folder, Download, Mail, ExternalLink,
  Copy, Check, Clock, Edit2, AlertTriangle, CheckCircle2, TrendingUp,
  Euro, Hash, Link2, ArrowUpRight, Receipt, ChevronDown, CreditCard, Zap,
} from 'lucide-react';
import { bankAccountsApi } from '@/lib/api/bank-accounts';
import { invoicesApi } from '@/lib/api/invoices';
import { Invoice, InvoiceStatus } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number | string) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(n));
}
function fmtDate(s: string) {
  return new Intl.DateTimeFormat('de-DE').format(new Date(s));
}
function isOverdue(inv: Invoice) {
  return inv.status !== InvoiceStatus.PAID && new Date(inv.dueDate) < new Date();
}
function isThisMonth(d: Date) {
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 26, delay },
  };
}

// ─── Status config ────────────────────────────────────────────────────────────

const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; dot: string; Icon: any }> = {
  [InvoiceStatus.DRAFT]: { label: 'Entwurf', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', Icon: FileText },
  [InvoiceStatus.SENT]: { label: 'Versendet', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', Icon: Send },
  [InvoiceStatus.PARTIALLY_PAID]: { label: 'Teilw. bezahlt', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', Icon: Wallet },
  [InvoiceStatus.PAID]: { label: 'Bezahlt', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', Icon: CheckCircle2 },
  [InvoiceStatus.OVERDUE]: { label: 'Überfällig', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', Icon: AlertTriangle },
};

function InvoiceStatusPicker({ status, onSelect, loading }: {
  status: InvoiceStatus;
  onSelect: (s: InvoiceStatus) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const cfg = INVOICE_STATUS_CONFIG[status];

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        title="Status ändern"
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide transition-all',
          cfg.color,
          'hover:opacity-80 hover:shadow-sm',
          loading && 'opacity-50 cursor-wait',
        )}
      >
        <cfg.Icon className="w-3 h-3" />
        {cfg.label}
        <ChevronDown className={cn('w-2.5 h-2.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[170px]">
          {(Object.entries(INVOICE_STATUS_CONFIG) as [InvoiceStatus, typeof INVOICE_STATUS_CONFIG[InvoiceStatus]][]).map(([val, c]) => (
            <button key={val} onClick={() => { onSelect(val); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors text-left',
                val === status ? 'bg-slate-50 text-slate-400 cursor-default' : 'text-slate-700 hover:bg-slate-50',
              )}>
              <span className={cn('w-2 h-2 rounded-full shrink-0', c.dot)} />
              {c.label}
              {val === status && <span className="ml-auto text-[10px] text-slate-400">Aktuell</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [datevExporting, setDatevExporting] = useState(false);

  const handleDatevExport = async () => {
    setDatevExporting(true);
    try {
      await invoicesApi.downloadDATEV(new Date().getFullYear());
      toast.success('DATEV-Export heruntergeladen');
    } catch {
      toast.error('Fehler beim DATEV-Export');
    } finally {
      setDatevExporting(false);
    }
  };

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');
  const [editData, setEditData] = useState<any>({});

  const [paymentModal, setPaymentModal] = useState<{ invoiceId: string; amount: number; totalPaid: number; customerName: string } | null>(null);
  const [timeEntriesModal, setTimeEntriesModal] = useState<{ invoiceId: string; projectId: string; invoiceNumber?: string } | null>(null);

  const [formData, setFormData] = useState({
    customerId: '', projectId: '', amount: 0,
    description: '', dueDate: '', bankAccountId: '',
    onlinePaymentEnabled: false,
  });

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && Object.values(InvoiceStatus).includes(statusParam as InvoiceStatus))
      setStatusFilter(statusParam as InvoiceStatus);
    const projectParam = searchParams.get('projectId');
    if (projectParam) setProjectFilter(projectParam);
    if (searchParams.get('new') === '1') setShowForm(true);
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
    queryFn: bankAccountsApi.getAll,
  });

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const sendInvoice = useSendInvoice();
  const deleteInvoice = useDeleteInvoice();

  const filteredInvoices = useMemo(() => invoices?.filter(inv => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      inv.customer?.name.toLowerCase().includes(q) ||
      inv.description.toLowerCase().includes(q) ||
      (inv.invoiceNumber ?? '').toLowerCase().includes(q);
    const matchesProject = !projectFilter || inv.projectId === projectFilter;
    return matchesSearch && matchesProject;
  }) ?? [], [invoices, search, projectFilter]);

  // ─── Computed stats ──────────────────────────────────────────────────────────

  const totalOpen = (invoices ?? [])
    .filter(i => i.status !== InvoiceStatus.PAID)
    .reduce((s, i) => s + (Number(i.amount) - Number(i.totalPaid ?? 0)), 0);
  const overdueCount = (invoices ?? []).filter(i => isOverdue(i)).length;
  const paidThisMonth = (invoices ?? [])
    .filter(i => i.status === InvoiceStatus.PAID && isThisMonth(new Date(i.updatedAt ?? i.dueDate)))
    .reduce((s, i) => s + Number(i.amount), 0);
  const totalAll = (invoices ?? []).reduce((s, i) => s + Number(i.amount), 0);

  const statTiles = [
    { label: 'Offen', value: fmt(totalOpen), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Überfällig', value: `${overdueCount} Rechnung${overdueCount !== 1 ? 'en' : ''}`, icon: AlertTriangle, color: overdueCount > 0 ? 'text-red-600' : 'text-slate-400', bg: overdueCount > 0 ? 'bg-red-50' : 'bg-slate-50', border: overdueCount > 0 ? 'border-red-100' : 'border-slate-100' },
    { label: 'Bezahlt diesen Monat', value: fmt(paidThisMonth), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Gesamtvolumen', value: fmt(totalAll), icon: TrendingUp, color: 'text-[#800040]', bg: 'bg-[#800040]/5', border: 'border-[#800040]/10' },
  ];

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvoice.mutateAsync(formData);
      setShowForm(false);
      setFormData({ customerId: '', projectId: '', amount: 0, description: '', dueDate: '', bankAccountId: '', onlinePaymentEnabled: false });
      toast.success('Rechnung erstellt');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler beim Erstellen');
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Diese Rechnung als gesendet markieren?')) return;
    try {
      await sendInvoice.mutateAsync(id);
      toast.success('Rechnung gesendet');
      if (selectedInvoice?.id === id)
        setSelectedInvoice(prev => prev ? { ...prev, status: InvoiceStatus.SENT } : prev);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler');
    }
  };

  const handleMarkPaid = async (inv: Invoice) => {
    if (!confirm(`Rechnung ${inv.invoiceNumber ?? ''} vollständig als bezahlt markieren?`)) return;
    try {
      const updated = await updateInvoice.mutateAsync({ id: inv.id, data: { status: InvoiceStatus.PAID } as any });
      toast.success('Als bezahlt markiert');
      if (selectedInvoice?.id === inv.id) setSelectedInvoice(updated);
    } catch {
      toast.error('Fehler');
    }
  };

  const handleDelete = async (inv: Invoice) => {
    const extra = inv.status !== InvoiceStatus.DRAFT
      ? '\n\nAchtung: Diese Rechnung wurde bereits versendet!' : '';
    if (!confirm(`Rechnung ${inv.invoiceNumber ?? ''} wirklich löschen?${extra}`)) return;
    try {
      await deleteInvoice.mutateAsync(inv.id);
      toast.success('Rechnung gelöscht');
      if (selectedInvoice?.id === inv.id) setSelectedInvoice(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler beim Löschen');
    }
  };

  const handleDuplicate = async (inv: Invoice) => {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      await createInvoice.mutateAsync({
        customerId: inv.customerId,
        projectId: inv.projectId ?? undefined,
        amount: inv.amount,
        description: inv.description,
        dueDate: dueDate.toISOString().split('T')[0],
      });
      toast.success('Rechnung dupliziert (neuer Entwurf)');
    } catch { toast.error('Fehler beim Duplizieren'); }
  };

  const handleStatusChange = async (inv: Invoice, newStatus: InvoiceStatus) => {
    try {
      const updated = await updateInvoice.mutateAsync({ id: inv.id, data: { status: newStatus } as any });
      if (selectedInvoice?.id === inv.id) setSelectedInvoice(updated);
      toast.success('Status geändert');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler');
    }
  };

  const handleDownloadPdf = async (inv: Invoice) => {
    try {
      const response = await invoicesApi.downloadPdf(inv.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rechnung-${inv.invoiceNumber || inv.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('PDF-Download fehlgeschlagen'); }
  };

  const handleSendEmail = async (id: string) => {
    try {
      const r = await invoicesApi.sendEmail(id);
      toast.success((r as any).message || 'E-Mail gesendet');
    } catch { toast.error('E-Mail-Versand fehlgeschlagen. SMTP konfiguriert?'); }
  };

  const openDrawer = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setDrawerMode('view');
  };
  const closeDrawer = () => { setSelectedInvoice(null); setDrawerMode('view'); };

  const startEdit = (inv: Invoice) => {
    setEditData({
      description: inv.description,
      amount: inv.amount,
      dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
      invoiceNumber: inv.invoiceNumber ?? '',
      status: inv.status,
    });
    setDrawerMode('edit');
  };

  const handleSaveEdit = async () => {
    if (!selectedInvoice) return;
    try {
      const updated = await updateInvoice.mutateAsync({ id: selectedInvoice.id, data: editData });
      setSelectedInvoice(updated);
      setDrawerMode('view');
      toast.success('Rechnung gespeichert');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler beim Speichern');
    }
  };

  const inputClasses = "mt-1 block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400";
  const labelClasses = "flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1 ml-1";

  return (
    <div className="relative isolate min-h-full p-4 md:p-6 space-y-6">

      {/* Fixed full-page background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#800040]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/4 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-20">
          <PixelBlast variant="square" pixelSize={5} color="#800040" patternScale={5} patternDensity={0.4} pixelSizeJitter={0.5} enableRipples rippleSpeed={0.2} rippleThickness={0.08} speed={0.15} transparent />
        </div>
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white/80 to-slate-50/50" />
      </div>

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow-lg shadow-rose-900/10">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Receipt className="w-4 h-4 text-[#800040]" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">RECHNUNGEN</h1>
            {projectFilter && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#800040]/10 text-[#800040] rounded-full text-xs font-black uppercase tracking-widest border border-[#800040]/20">
                Projektfilter aktiv
                <button onClick={() => setProjectFilter('')} className="hover:opacity-70"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Erstelle, verwalte und versende deine Rechnungen.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDatevExport}
            disabled={datevExporting}
            title={`DATEV-Export ${new Date().getFullYear()}`}
            className="h-11 px-4 flex items-center gap-2 bg-white/80 border border-slate-200 rounded-full text-slate-600 font-black text-[11px] uppercase tracking-widest hover:border-[#800040]/40 hover:text-[#800040] transition-all shadow-sm disabled:opacity-50"
          >
            {datevExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            DATEV {new Date().getFullYear()}
          </button>
          <StarBorder onClick={() => setShowForm(!showForm)} color={showForm ? '#94a3b8' : '#ff3366'} speed="4s" thickness={2}>
            <div className={cn('px-5 h-11 flex items-center gap-2 rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg',
              showForm ? 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200' : 'bg-[#800040] hover:bg-[#600030] text-white shadow-rose-900/20')}>
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showForm ? 'Abbrechen' : 'Neue Rechnung'}</span>
            </div>
          </StarBorder>
        </div>
      </motion.div>

      {/* Stats tiles */}
      {invoices && invoices.length > 0 && (
        <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statTiles.map((tile, i) => (
            <motion.div key={tile.label} {...fadeUp(i * 0.04)} className={cn('flex items-center gap-3 p-4 rounded-2xl border', tile.bg, tile.border)}>
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
      )}

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-8 shadow-xl" spotlightColor="rgba(128,0,64,0.05)">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Rechnung erstellen</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Fülle alle Pflichtfelder aus</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}><User className="w-4 h-4 text-slate-400" />Kunde *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400"><User className="w-4 h-4" /></div>
                      <select required value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value, projectId: '' })} className={inputClasses}>
                        <option value="">Wähle einen Kunden...</option>
                        {customers?.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}><Folder className="w-4 h-4 text-slate-400" />Projekt (optional)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400"><Folder className="w-4 h-4" /></div>
                      <select value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} className={inputClasses} disabled={!formData.customerId}>
                        <option value="">{formData.customerId ? 'Wähle ein Projekt...' : 'Zuerst Kunden wählen'}</option>
                        {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}><Wallet className="w-4 h-4 text-slate-400" />Bankverbindung (optional)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400"><Wallet className="w-4 h-4" /></div>
                      <select value={formData.bankAccountId} onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })} className={inputClasses}>
                        <option value="">Standard verwenden</option>
                        {Array.isArray(bankAccounts) && bankAccounts.map((acc: any) => (
                          <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName || (acc.isPaypal ? 'PayPal' : '')})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}><Euro className="w-4 h-4 text-slate-400" />Betrag (€) *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400"><Euro className="w-4 h-4" /></div>
                      <input type="number" required step="0.01" placeholder="0,00" value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className={inputClasses} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClasses}><FileText className="w-4 h-4 text-slate-400" />Beschreibung *</label>
                    <div className="relative group">
                      <div className="absolute top-3.5 left-3.5 text-slate-400"><FileText className="w-4 h-4" /></div>
                      <textarea required placeholder="z.B. Webdesign – Meilenstein 1" value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={cn(inputClasses, 'pl-10 h-24')} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}><Calendar className="w-4 h-4 text-slate-400" />Fälligkeitsdatum *</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400"><Calendar className="w-4 h-4" /></div>
                      <input type="date" required value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className={inputClasses} />
                    </div>
                  </div>
                </div>

                {/* Online Payment Toggle */}
                <div className={cn(
                  'rounded-2xl p-4 border',
                  user?.stripeConnectEnabled
                    ? 'border-violet-200 bg-violet-50'
                    : 'border-slate-200 bg-slate-50 opacity-60',
                )}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Zap className={cn('w-5 h-5 mt-0.5 shrink-0', user?.stripeConnectEnabled ? 'text-violet-600' : 'text-slate-400')} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Online-Zahlung anbieten</p>
                        {user?.stripeConnectEnabled ? (
                          <p className="text-xs text-slate-500 mt-0.5">Kunden können direkt per Kreditkarte/SEPA zahlen</p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Verbinde deinen Stripe-Account unter{' '}
                            <a href="/settings" className="underline text-slate-600 hover:text-slate-900">Einstellungen</a>
                            {' '}um Online-Zahlung anzubieten
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!user?.stripeConnectEnabled}
                      onClick={() => setFormData({ ...formData, onlinePaymentEnabled: !formData.onlinePaymentEnabled })}
                      className={cn(
                        'relative shrink-0 w-12 h-6 rounded-full transition-colors disabled:cursor-not-allowed',
                        formData.onlinePaymentEnabled && user?.stripeConnectEnabled ? 'bg-violet-500' : 'bg-slate-300',
                      )}
                    >
                      <span className={cn(
                        'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                        formData.onlinePaymentEnabled && user?.stripeConnectEnabled ? 'translate-x-6' : '',
                      )} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full transition-all font-black text-[11px] uppercase tracking-widest">Abbrechen</button>
                  <button type="submit" disabled={createInvoice.isPending}
                    className="px-8 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-900/20 disabled:opacity-50 flex items-center gap-2">
                    {createInvoice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Rechnung erstellen
                  </button>
                </div>
              </form>
            </SpotlightCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div {...fadeUp(0.1)} className="flex flex-col md:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors"><Search className="w-4 h-4" /></div>
          <input type="text" placeholder="Nach Kunde, Beschreibung, Re-Nr. suchen…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all text-slate-700 shadow-sm text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
          className="px-5 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none min-w-[160px]">
          <option value="">Alle Status</option>
          <option value={InvoiceStatus.DRAFT}>Entwurf</option>
          <option value={InvoiceStatus.SENT}>Versendet</option>
          <option value={InvoiceStatus.PARTIALLY_PAID}>Teilweise bezahlt</option>
          <option value={InvoiceStatus.PAID}>Bezahlt</option>
          <option value={InvoiceStatus.OVERDUE}>Überfällig</option>
        </select>
        <select value={customerFilter} onChange={(e) => { setCustomerFilter(e.target.value); setProjectFilter(''); }}
          className="px-5 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none min-w-[160px]">
          <option value="">Alle Kunden</option>
          {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </motion.div>

      {/* Invoice grid */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-[#800040] mb-3" />
            <p className="font-medium">Lade Rechnungen…</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((inv, index) => {
              const overdue = isOverdue(inv);
              const paid = inv.totalPaid ?? 0;
              const pct = inv.amount > 0 ? Math.min(100, Math.round((paid / inv.amount) * 100)) : 0;
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.2 }}
                >
                  <SpotlightCard
                    onClick={() => openDrawer(inv)}
                    className={cn(
                      'bg-white/95 backdrop-blur-xl border shadow-sm p-6 rounded-[1.8rem] hover:shadow-md transition-all group flex flex-col h-full cursor-pointer',
                      selectedInvoice?.id === inv.id ? 'border-[#800040]/40 ring-2 ring-[#800040]/10' : overdue ? 'border-red-200' : 'border-slate-200/80',
                    )}
                    spotlightColor="rgba(128,0,64,0.05)"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1.5">
                        <InvoiceStatusPicker
                          status={inv.status}
                          onSelect={s => handleStatusChange(inv, s)}
                          loading={updateInvoice.isPending}
                        />
                        {inv.invoiceNumber && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-black uppercase tracking-widest">
                            <Hash className="w-3 h-3" />{inv.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn('text-xl font-black tabular-nums', overdue ? 'text-red-600' : 'text-slate-900 group-hover:text-[#800040]', 'transition-colors')}>
                          {fmt(inv.amount)}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(inv); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Rechnung löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-base font-black text-slate-900 line-clamp-1 tracking-tight">{inv.customer?.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{inv.description}</p>
                      </div>
                      {inv.project && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <Folder className="w-3 h-3" />
                          <span className="truncate">{inv.project.name}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={cn('flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest', overdue ? 'text-red-500' : 'text-slate-400')}>
                            <Calendar className="w-3 h-3" />
                            {overdue ? 'Überfällig seit' : 'Fällig am'}
                          </span>
                          <span className={cn('font-black text-sm tabular-nums', overdue ? 'text-red-600' : 'text-slate-700')}>
                            {fmtDate(inv.dueDate)}
                          </span>
                        </div>
                        {/* Payment progress */}
                        {inv.status !== InvoiceStatus.DRAFT && paid > 0 && (
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-black uppercase tracking-widest">
                              <span>{fmt(paid)} bezahlt</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={cn('h-full rounded-full transition-all', pct >= 100 ? 'bg-emerald-400' : 'bg-[#800040]/60')} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action row */}
                    <div className="mt-4 pt-4 flex gap-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                      {inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.DRAFT && (
                        <button onClick={() => setPaymentModal({ invoiceId: inv.id, amount: inv.amount, totalPaid: paid, customerName: inv.customer?.name || '' })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                          title="Zahlung hinzufügen">
                          <PlusCircle className="w-3.5 h-3.5" /> Zahlung
                        </button>
                      )}
                      {inv.status === InvoiceStatus.DRAFT && (
                        <button onClick={() => handleSend(inv.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                          <Send className="w-3.5 h-3.5" /> Senden
                        </button>
                      )}
                      {inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.DRAFT && (
                        <button onClick={() => handleMarkPaid(inv)}
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                          title="Als bezahlt markieren">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDownloadPdf(inv)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100" title="PDF herunterladen">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleSendEmail(inv.id)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100" title="Per E-Mail senden">
                        <Mail className="w-4 h-4" />
                      </button>
                      {inv.publicToken && <ClientPortalButtons publicToken={inv.publicToken} />}
                      {inv.project?.id && (
                        <button onClick={() => setTimeEntriesModal({ invoiceId: inv.id, projectId: inv.project!.id, invoiceNumber: inv.invoiceNumber || undefined })}
                          className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-all border border-slate-100" title="Zeiteinträge verknüpfen">
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-5 border-2 border-dashed border-slate-200">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Keine Rechnungen gefunden</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
              {search || statusFilter || projectFilter ? 'Passe deine Filter an.' : 'Erstelle deine erste Rechnung mit "Neue Rechnung".'}
            </p>
          </div>
        )}
      </div>

      {/* ─── Detail / Edit Drawer ─────────────────────────────────────────── */}
      {selectedInvoice && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow-lg shadow-rose-900/10 shrink-0">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-[#800040]" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 text-base leading-tight truncate tracking-tight uppercase italic">
                    {selectedInvoice.invoiceNumber ?? 'Rechnung'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{selectedInvoice.customer?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {drawerMode === 'view' && selectedInvoice.status !== InvoiceStatus.PAID && (
                  <button onClick={() => startEdit(selectedInvoice)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#800040] hover:bg-[#600030] text-white rounded-full text-xs font-black uppercase tracking-widest transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Bearbeiten
                  </button>
                )}
                {drawerMode === 'edit' && (
                  <button onClick={() => setDrawerMode('view')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-black uppercase tracking-widest transition-colors">
                    <X className="w-3.5 h-3.5" /> Abbrechen
                  </button>
                )}
                <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerMode === 'view' ? (
                <InvoiceDrawerView
                  inv={selectedInvoice}
                  onSend={() => handleSend(selectedInvoice.id)}
                  onMarkPaid={() => handleMarkPaid(selectedInvoice)}
                  onDownload={() => handleDownloadPdf(selectedInvoice)}
                  onEmail={() => handleSendEmail(selectedInvoice.id)}
                  onDuplicate={() => handleDuplicate(selectedInvoice)}
                  onDelete={() => handleDelete(selectedInvoice)}
                  onPayment={() => setPaymentModal({ invoiceId: selectedInvoice.id, amount: selectedInvoice.amount, totalPaid: selectedInvoice.totalPaid ?? 0, customerName: selectedInvoice.customer?.name || '' })}
                  onTimeEntries={() => selectedInvoice.project?.id && setTimeEntriesModal({ invoiceId: selectedInvoice.id, projectId: selectedInvoice.project.id, invoiceNumber: selectedInvoice.invoiceNumber || undefined })}
                  onNavigate={router.push}
                  onStatusChange={(s) => handleStatusChange(selectedInvoice, s)}
                  sendingPending={sendInvoice.isPending}
                  updatingPending={updateInvoice.isPending}
                />
              ) : (
                <InvoiceDrawerEdit
                  inv={selectedInvoice}
                  data={editData}
                  onChange={setEditData}
                  onSave={handleSaveEdit}
                  onCancel={() => setDrawerMode('view')}
                  pending={updateInvoice.isPending}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {paymentModal && (
        <AddPaymentModal
          invoiceId={paymentModal.invoiceId}
          invoiceAmount={paymentModal.amount}
          totalPaid={paymentModal.totalPaid}
          customerName={paymentModal.customerName}
          onClose={() => setPaymentModal(null)}
        />
      )}
      {timeEntriesModal && (
        <TimeEntriesModal
          invoiceId={timeEntriesModal.invoiceId}
          invoiceNumber={timeEntriesModal.invoiceNumber}
          onClose={() => setTimeEntriesModal(null)}
        />
      )}
    </div>
  );
}

// ─── Drawer — View Mode ───────────────────────────────────────────────────────

function InvoiceDrawerView({ inv, onSend, onMarkPaid, onDownload, onEmail, onDuplicate, onDelete, onPayment, onTimeEntries, onNavigate, onStatusChange, sendingPending, updatingPending }: {
  inv: Invoice;
  onSend: () => void; onMarkPaid: () => void; onDownload: () => void;
  onEmail: () => void; onDuplicate: () => void; onDelete: () => void;
  onPayment: () => void; onTimeEntries: () => void;
  onNavigate: (url: string) => void;
  onStatusChange: (status: InvoiceStatus) => void;
  sendingPending: boolean; updatingPending: boolean;
}) {
  const paid = inv.totalPaid ?? 0;
  const remaining = inv.amount - paid;
  const pct = inv.amount > 0 ? Math.min(100, Math.round((paid / inv.amount) * 100)) : 0;
  const overdue = isOverdue(inv);

  return (
    <div className="space-y-6">
      {/* Amount + status */}
      <div className={cn('rounded-2xl p-5 border', overdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100')}>
        <div className="flex items-center justify-between mb-3">
          <InvoiceStatusPicker status={inv.status} onSelect={onStatusChange} loading={updatingPending} />
          {inv.invoiceNumber && (
            <span className="text-[10px] font-black font-mono text-slate-400 flex items-center gap-1 uppercase tracking-widest">
              <Hash className="w-3 h-3" />{inv.invoiceNumber}
            </span>
          )}
        </div>
        <p className={cn('text-4xl font-black tracking-tighter tabular-nums', overdue ? 'text-red-700' : 'text-slate-900')}>
          {fmt(inv.amount)}
        </p>
        {inv.status !== InvoiceStatus.DRAFT && paid > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 font-black uppercase tracking-widest">
              <span>{fmt(paid)} bezahlt</span>
              <span>{fmt(remaining)} ausstehend</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', pct >= 100 ? 'bg-emerald-400' : 'bg-[#800040]')} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Info tiles */}
      <div className="grid grid-cols-2 gap-3">
        {inv.customer && (
          <button onClick={() => onNavigate(`/customers?id=${inv.customer!.id}`)}
            className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-left hover:border-[#800040]/30 hover:bg-[#800040]/5 transition-all group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Kunde <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </p>
            <p className="text-sm font-black text-slate-900 truncate">{inv.customer.name}</p>
          </button>
        )}
        {inv.project && (
          <button onClick={() => onNavigate(`/projects?id=${inv.project!.id}`)}
            className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-left hover:border-[#800040]/30 hover:bg-[#800040]/5 transition-all group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Folder className="w-3 h-3" /> Projekt <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </p>
            <p className="text-sm font-black text-slate-900 truncate">{inv.project.name}</p>
          </button>
        )}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Ausgestellt</p>
          <p className="text-sm font-black text-slate-900">{inv.issueDate ? fmtDate(inv.issueDate) : '—'}</p>
        </div>
        <div className={cn('border rounded-xl p-3.5', overdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100')}>
          <p className={cn('text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1', overdue ? 'text-red-400' : 'text-slate-400')}>
            <Calendar className="w-3 h-3" /> {overdue ? 'Überfällig seit' : 'Fällig am'}
          </p>
          <p className={cn('text-sm font-black', overdue ? 'text-red-700' : 'text-slate-900')}>{fmtDate(inv.dueDate)}</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
          <FileText className="w-3 h-3" /> Beschreibung
        </p>
        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">{inv.description}</p>
      </div>

      {/* Actions */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Aktionen</p>
        <div className="grid grid-cols-2 gap-2">
          {inv.status === InvoiceStatus.DRAFT && (
            <button onClick={onSend} disabled={sendingPending}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-blue-100 disabled:opacity-50">
              <Send className="w-4 h-4" /> Als gesendet
            </button>
          )}
          {inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.DRAFT && (
            <>
              <button onClick={onPayment}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-emerald-100">
                <PlusCircle className="w-4 h-4" /> Teilzahlung
              </button>
              <button onClick={onMarkPaid} disabled={updatingPending}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-emerald-200 disabled:opacity-50">
                <CheckCircle2 className="w-4 h-4" /> Vollständig
              </button>
            </>
          )}
          <button onClick={onDownload}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs font-black uppercase tracking-widest border border-slate-100">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={onEmail}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs font-black uppercase tracking-widest border border-slate-100">
            <Mail className="w-4 h-4" /> E-Mail
          </button>
          <button onClick={onDuplicate}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all text-xs font-black uppercase tracking-widest border border-slate-100">
            <Copy className="w-4 h-4" /> Duplizieren
          </button>
          {inv.project?.id && (
            <button onClick={onTimeEntries}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all text-xs font-black uppercase tracking-widest border border-slate-100">
              <Clock className="w-4 h-4" /> Zeiteinträge
            </button>
          )}
          {inv.publicToken && (
            <>
              <a href={`/invoice/${inv.publicToken}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-all text-xs font-black uppercase tracking-widest border border-slate-100">
                <ExternalLink className="w-4 h-4" /> Portal
              </a>
              <CopyLinkButton token={inv.publicToken} />
            </>
          )}
          <button onClick={onDelete}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-red-100 col-span-2">
            <Trash2 className="w-4 h-4" /> Rechnung löschen
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Drawer — Edit Mode ───────────────────────────────────────────────────────

function InvoiceDrawerEdit({ inv, data, onChange, onSave, onCancel, pending }: {
  inv: Invoice;
  data: any; onChange: (d: any) => void;
  onSave: () => void; onCancel: () => void;
  pending: boolean;
}) {
  const canEditAmount = inv.status === InvoiceStatus.DRAFT;

  const field = (label: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1 ml-1">
        {icon}{label}
      </label>
      {children}
    </div>
  );

  const inputCls = "block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] focus:bg-white transition-all text-slate-700";

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700 font-medium flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        {inv.status === InvoiceStatus.DRAFT
          ? 'Entwurf – alle Felder bearbeitbar.'
          : 'Bereits versendet – Betrag kann nicht mehr geändert werden.'}
      </div>

      {field('Status', <AlertTriangle className="w-4 h-4 text-slate-400" />,
        <select value={data.status ?? inv.status} onChange={e => onChange({ ...data, status: e.target.value })} className={inputCls}>
          {(Object.entries(INVOICE_STATUS_CONFIG) as [InvoiceStatus, typeof INVOICE_STATUS_CONFIG[InvoiceStatus]][]).map(([val, c]) => (
            <option key={val} value={val}>{c.label}</option>
          ))}
        </select>
      )}
      {field('Rechnungsnummer', <Hash className="w-4 h-4 text-slate-400" />,
        <input type="text" value={data.invoiceNumber ?? ''} onChange={e => onChange({ ...data, invoiceNumber: e.target.value })}
          placeholder="z.B. RE-2024-001" className={inputCls} />
      )}
      {field('Betrag (€)', <Euro className="w-4 h-4 text-slate-400" />,
        <input type="number" step="0.01" value={data.amount ?? ''} onChange={e => onChange({ ...data, amount: parseFloat(e.target.value) })}
          disabled={!canEditAmount} className={cn(inputCls, !canEditAmount && 'opacity-50 cursor-not-allowed')} />
      )}
      {field('Beschreibung', <FileText className="w-4 h-4 text-slate-400" />,
        <textarea rows={4} value={data.description ?? ''} onChange={e => onChange({ ...data, description: e.target.value })}
          className={cn(inputCls, 'resize-none')} />
      )}
      {field('Fälligkeitsdatum', <Calendar className="w-4 h-4 text-slate-400" />,
        <input type="date" value={data.dueDate ?? ''} onChange={e => onChange({ ...data, dueDate: e.target.value })}
          className={inputCls} />
      )}

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <button onClick={onCancel} className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-xs font-black uppercase tracking-widest transition-all">
          Abbrechen
        </button>
        <button onClick={onSave} disabled={pending}
          className="flex-1 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-900/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Speichern
        </button>
      </div>
    </div>
  );
}

// ─── Copy link button ─────────────────────────────────────────────────────────

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/invoice/${token}`;
  return (
    <button onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all text-xs font-black uppercase tracking-widest border border-slate-100">
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      Link kopieren
    </button>
  );
}

function ClientPortalButtons({ publicToken }: { publicToken: string }) {
  const [copied, setCopied] = useState(false);
  const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invoice/${publicToken}`;
  return (
    <>
      <a href={`/invoice/${publicToken}`} target="_blank" rel="noopener noreferrer"
        className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-purple-50 hover:text-purple-600 transition-all border border-slate-100" title="Kunden-Portal">
        <ExternalLink className="w-4 h-4" />
      </a>
      <button onClick={() => { navigator.clipboard.writeText(portalUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100" title="Link kopieren">
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </>
  );
}

// ─── formatDuration ───────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} Min.`;
  if (m === 0) return `${h} Std.`;
  return `${h} Std. ${m} Min.`;
}

// ─── TimeEntriesModal ─────────────────────────────────────────────────────────

function TimeEntriesModal({ invoiceId, invoiceNumber, onClose }: {
  invoiceId: string; invoiceNumber?: string; onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['invoice-time-entries', invoiceId],
    queryFn: () => invoicesApi.getTimeEntries(invoiceId),
  });

  useEffect(() => {
    if (!initialized && entries.length > 0) {
      setSelected(new Set(entries.filter((e: any) => e.invoiceId === invoiceId).map((e: any) => e.id)));
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

  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const totalSeconds = entries.filter((e: any) => selected.has(e.id)).reduce((s: number, e: any) => s + (e.duration || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase italic tracking-tight">Zeiteinträge verknüpfen</h2>
            <p className="text-sm text-slate-500 mt-0.5">{invoiceNumber ? `Rechnung ${invoiceNumber}` : 'Rechnung'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#800040]" /></div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Keine Zeiteinträge für dieses Projekt</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry: any) => {
                const sel = selected.has(entry.id);
                const date = new Date(entry.startTime).toLocaleDateString('de-DE');
                return (
                  <label key={entry.id} className={cn('flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all', sel ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200')}>
                    <input type="checkbox" checked={sel} onChange={() => toggle(entry.id)} className="mt-0.5 accent-amber-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{entry.description || 'Kein Titel'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{date}</span>
                        <span className="font-semibold text-slate-700">{formatDuration(entry.duration)}</span>
                        {entry.invoiceId && entry.invoiceId !== invoiceId && <span className="text-amber-600 font-medium">Bereits verrechnet</span>}
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
              <span className="font-bold text-slate-800">{selected.size}</span>
              {totalSeconds > 0 && <span className="text-slate-500 ml-2">· {formatDuration(totalSeconds)}</span>}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Abbrechen</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                className="px-4 py-2 text-xs bg-[#800040] hover:bg-[#600030] text-white rounded-lg font-black uppercase tracking-widest transition-colors disabled:opacity-50">
                {saveMutation.isPending ? 'Speichere…' : 'Speichern'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
