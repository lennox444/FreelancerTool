'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api/quotes';
import { customersApi } from '@/lib/api/customers';
import { projectsApi } from '@/lib/api/projects';
import { Quote, QuoteStatus } from '@/lib/types';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, FileText, Send, Trash2, Download, Mail,
  CheckCircle, XCircle, ClipboardList, ArrowRight, Clock,
  Euro, User, ArrowUpRight, Ban, Edit2, X, Loader2, Copy,
  Check, Hash, Folder, AlertTriangle, TrendingUp, ChevronRight, ChevronDown,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import { cn } from '@/lib/utils';

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}
function fmtDate(s: string) {
  return new Intl.DateTimeFormat('de-DE').format(new Date(s));
}
function isExpired(q: Quote) {
  return (q.status === QuoteStatus.DRAFT || q.status === QuoteStatus.SENT) &&
    new Date(q.validUntil) < new Date();
}
function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ─── Status config ────────────────────────────────────────────────────────────

const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; dot: string; Icon: any }> = {
  [QuoteStatus.DRAFT]:     { label: 'Entwurf',     color: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   Icon: FileText    },
  [QuoteStatus.SENT]:      { label: 'Gesendet',    color: 'bg-blue-50 text-blue-700 border-blue-200',           dot: 'bg-blue-500',    Icon: Send        },
  [QuoteStatus.ACCEPTED]:  { label: 'Angenommen',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200',  dot: 'bg-emerald-500', Icon: CheckCircle },
  [QuoteStatus.REJECTED]:  { label: 'Abgelehnt',   color: 'bg-red-50 text-red-700 border-red-200',              dot: 'bg-red-500',     Icon: XCircle     },
  [QuoteStatus.CONVERTED]: { label: 'Konvertiert', color: 'bg-purple-50 text-purple-700 border-purple-200',     dot: 'bg-purple-500',  Icon: ArrowRight  },
};

function QuoteStatusPicker({ status, onSelect, loading }: {
  status: QuoteStatus;
  onSelect: (s: QuoteStatus) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isLocked = status === QuoteStatus.CONVERTED;

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const cfg = QUOTE_STATUS_CONFIG[status];

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => !isLocked && setOpen(v => !v)}
        disabled={loading || isLocked}
        title={isLocked ? 'Konvertiert – Status kann nicht geändert werden' : 'Status ändern'}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide transition-all',
          cfg.color,
          !isLocked && 'hover:opacity-80 hover:shadow-sm',
          loading && 'opacity-50 cursor-wait',
        )}
      >
        <cfg.Icon className="w-3 h-3" />
        {cfg.label}
        {!isLocked && <ChevronDown className={cn('w-2.5 h-2.5 transition-transform', open && 'rotate-180')} />}
      </button>
      {open && !isLocked && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[160px]">
          {(Object.entries(QUOTE_STATUS_CONFIG) as [QuoteStatus, typeof QUOTE_STATUS_CONFIG[QuoteStatus]][])
            .filter(([val]) => val !== QuoteStatus.CONVERTED)
            .map(([val, c]) => (
              <button key={val} onClick={() => { onSelect(val); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors text-left',
                  val === status ? 'bg-slate-50 text-slate-400 cursor-default' : 'text-slate-700 hover:bg-slate-50',
                )}>
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', c.dot)} />
                {c.label}
                {val === status && <span className="ml-auto text-[10px] text-slate-400">Aktuell</span>}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Entwurf', SENT: 'Gesendet', ACCEPTED: 'Angenommen',
  REJECTED: 'Abgelehnt', CONVERTED: 'Konvertiert',
};
const STATUS_STYLES: Record<QuoteStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  SENT: 'bg-blue-50 text-blue-600 border-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  CONVERTED: 'bg-purple-50 text-purple-600 border-purple-200',
};

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ quotes }: { quotes: Quote[] }) {
  const total = quotes.length;
  const accepted = quotes.filter(q => q.status === QuoteStatus.ACCEPTED).length;
  const open = quotes.filter(q => [QuoteStatus.DRAFT, QuoteStatus.SENT].includes(q.status)).length;
  const totalValue = quotes.reduce((s, q) => s + Number(q.amount), 0);
  const convRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

  const tiles = [
    { label: 'Gesamt',        value: `${total} Angebote`,  icon: ClipboardList, color: 'text-blue-600',      bg: 'bg-blue-50',         border: 'border-blue-100' },
    { label: 'Offen',         value: `${open} aktiv`,      icon: Clock,         color: 'text-amber-600',     bg: 'bg-amber-50',        border: 'border-amber-100' },
    { label: 'Gesamtwert',    value: fmt(totalValue),       icon: Euro,          color: 'text-[#800040]',     bg: 'bg-[#800040]/5',     border: 'border-[#800040]/10' },
    { label: 'Conversion',    value: `${convRate}%`,        icon: TrendingUp,    color: 'text-emerald-600',   bg: 'bg-emerald-50',      border: 'border-emerald-100' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {tiles.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div key={label} className={cn('flex items-center gap-4 p-4 rounded-2xl border', bg, border)}>
          <div className={cn('p-2.5 rounded-xl bg-white/80', color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={cn('text-lg font-bold', color)}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuotesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | ''>('');
  const [filterProjectId, setFilterProjectId] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    const p = searchParams.get('projectId');
    if (p) setFilterProjectId(p);
    if (searchParams.get('new') === '1') setShowCreateForm(true);
  }, [searchParams]);

  const { data: quotesResp, isLoading } = useQuery({
    queryKey: ['quotes', filterStatus],
    queryFn: () => quotesApi.getAll(filterStatus ? { status: filterStatus as QuoteStatus } : {}),
  });
  const { data: customersResp } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const customers = Array.isArray(customersResp) ? customersResp : [];
  const allQuotes: Quote[] = (quotesResp as any)?.data ?? quotesResp ?? [];

  const filtered = useMemo(() => allQuotes.filter(q => {
    const s = search.toLowerCase();
    const matchSearch = !search ||
      q.customer?.name.toLowerCase().includes(s) ||
      q.description.toLowerCase().includes(s) ||
      (q.quoteNumber ?? '').toLowerCase().includes(s);
    const matchProject = !filterProjectId || (q as any).projectId === filterProjectId;
    return matchSearch && matchProject;
  }), [allQuotes, search, filterProjectId]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (data: any) => quotesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotes'] }); setShowCreateForm(false); toast.success('Angebot erstellt'); },
    onError: () => toast.error('Fehler beim Erstellen'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => quotesApi.update(id, data),
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      const updated = (resp as any)?.data ?? resp;
      setSelectedQuote(updated);
      setDrawerMode('view');
      toast.success('Angebot gespeichert');
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['quotes'] }); toast.success('Angebot gelöscht'); setSelectedQuote(null); },
    onError: () => toast.error('Fehler beim Löschen'),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => quotesApi.send(id),
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      const updated = (resp as any)?.data ?? resp;
      if (selectedQuote?.id === updated?.id) setSelectedQuote(updated);
      toast.success('Als gesendet markiert');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) => quotesApi.updateStatus(id, status),
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      const updated = (resp as any)?.data ?? resp;
      if (selectedQuote?.id === updated?.id) setSelectedQuote(updated);
      toast.success('Status aktualisiert');
    },
  });

  const emailMutation = useMutation({
    mutationFn: (id: string) => quotesApi.sendEmail(id),
    onSuccess: () => toast.success('E-Mail versendet'),
    onError: () => toast.error('E-Mail fehlgeschlagen. SMTP konfiguriert?'),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => quotesApi.convertToInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('In Rechnung konvertiert!');
      setSelectedQuote(null);
    },
    onError: () => toast.error('Konvertierung fehlgeschlagen'),
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleDownloadPdf = async (q: Quote) => {
    try {
      const r = await apiClient.get(`/quotes/${q.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Angebot-${q.quoteNumber || q.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('PDF-Download fehlgeschlagen'); }
  };

  const handleDuplicate = async (q: Quote) => {
    try {
      await createMutation.mutateAsync({
        customerId: q.customerId,
        projectId: (q as any).projectId || undefined,
        amount: q.amount,
        description: q.description,
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: q.notes,
      });
      toast.success('Angebot dupliziert (neuer Entwurf)');
    } catch { /* handled by mutation */ }
  };

  const handleDelete = (q: Quote) => {
    if (!confirm(`Angebot ${q.quoteNumber ?? ''} wirklich löschen?`)) return;
    deleteMutation.mutate(q.id);
  };

  const openDrawer = (q: Quote) => { setSelectedQuote(q); setDrawerMode('view'); };
  const closeDrawer = () => { setSelectedQuote(null); setDrawerMode('view'); };

  const startEdit = (q: Quote) => {
    setEditData({
      quoteNumber: q.quoteNumber ?? '',
      amount: q.amount,
      description: q.description,
      validUntil: q.validUntil?.split('T')[0] ?? '',
      notes: q.notes ?? '',
      status: q.status,
    });
    setDrawerMode('edit');
  };

  const handleSaveEdit = () => {
    if (!selectedQuote) return;
    updateMutation.mutate({ id: selectedQuote.id, data: editData });
  };

  return (
    <div className="relative isolate min-h-full p-4 md:p-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
        <div className="absolute inset-0 w-full h-full opacity-30">
          <PixelBlast variant="square" pixelSize={6} color="#800040" patternScale={4}
            patternDensity={0.5} pixelSizeJitter={0.5} enableRipples rippleSpeed={0.3}
            rippleThickness={0.1} speed={0.2} transparent />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)]" />
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#800040]/10 rounded-xl">
              <ClipboardList className="w-7 h-7 text-[#800040]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Angebote</h1>
          </div>
          <div className="hidden md:block h-8 w-[2px] bg-slate-200 rounded-full" />
          <p className="text-slate-500 font-medium">Erstelle und verwalte deine Angebote professionell.</p>
          {filterProjectId && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#800040]/10 text-[#800040] rounded-full text-sm font-semibold border border-[#800040]/20">
              Projektfilter aktiv
              <button onClick={() => setFilterProjectId('')} className="hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
        </div>
        <StarBorder onClick={() => setShowCreateForm(true)} className="rounded-full group" color="#ff3366" speed="4s" thickness={3}>
          <div className="px-6 h-12 flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg gap-2 bg-[#800040] hover:bg-[#600030] text-white shadow-pink-900/20">
            <Plus className="w-5 h-5" /><span>Neues Angebot</span>
          </div>
        </StarBorder>
      </div>

      {/* Stats */}
      {allQuotes.length > 0 && <StatsBar quotes={allQuotes} />}

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#800040] transition-colors" />
          <input type="text" placeholder="Nach Kunde, Beschreibung, Angebotsnr. suchen…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all text-slate-700 shadow-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="px-6 h-12 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800040]/10 focus:border-[#800040] transition-all shadow-sm appearance-none min-w-[180px]">
          <option value="">Alle Status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Angebote werden geladen…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <ClipboardList className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Keine Angebote gefunden</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            {search || filterStatus || filterProjectId ? 'Passe deine Filter an.' : 'Erstelle dein erstes Angebot, um neue Aufträge zu gewinnen.'}
          </p>
          {!search && !filterStatus && (
            <button onClick={() => setShowCreateForm(true)}
              className="px-8 h-12 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20">
              Erstes Angebot erstellen
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(q => {
            const expired = isExpired(q);
            const days = daysUntil(q.validUntil);
            const expiringSoon = !expired && days <= 7 && [QuoteStatus.DRAFT, QuoteStatus.SENT].includes(q.status);
            return (
              <SpotlightCard
                key={q.id}
                onClick={() => openDrawer(q)}
                className={cn(
                  'bg-white/90 backdrop-blur-md border shadow-sm p-6 rounded-2xl hover:shadow-md transition-all group flex flex-col cursor-pointer',
                  selectedQuote?.id === q.id ? 'border-[#800040]/40 ring-2 ring-[#800040]/10'
                    : expired ? 'border-red-200'
                    : expiringSoon ? 'border-amber-200'
                    : 'border-slate-100',
                )}
                spotlightColor="rgba(128,0,64,0.05)"
              >
                {/* Top row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1.5">
                    <QuoteStatusPicker
                      status={q.status}
                      onSelect={s => statusMutation.mutate({ id: q.id, status: s })}
                      loading={statusMutation.isPending}
                    />
                    {q.quoteNumber && (
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                        <Hash className="w-3 h-3" />{q.quoteNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn('text-xl font-bold transition-colors', expired ? 'text-red-600' : 'text-slate-900 group-hover:text-[#800040]')}>
                      {fmt(Number(q.amount))}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(q); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Angebot löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{q.customer?.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{q.description}</p>
                  </div>
                  {(q as any).project && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Folder className="w-3.5 h-3.5" />
                      <span className="truncate">{(q as any).project.name}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn('flex items-center gap-1.5', expired ? 'text-red-500 font-semibold' : expiringSoon ? 'text-amber-500 font-semibold' : 'text-slate-500')}>
                        <Clock className="w-3.5 h-3.5" />
                        {expired ? 'Abgelaufen' : expiringSoon ? `Läuft ab in ${days}d` : 'Gültig bis'}
                      </span>
                      <span className={cn('font-semibold text-sm', expired ? 'text-red-600' : expiringSoon ? 'text-amber-600' : 'text-slate-700')}>
                        {fmtDate(q.validUntil)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action row */}
                <div className="mt-4 pt-4 flex gap-2 border-t border-slate-50 flex-wrap" onClick={e => e.stopPropagation()}>
                  {q.status === QuoteStatus.DRAFT && (
                    <button onClick={() => sendMutation.mutate(q.id)} disabled={sendMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold border border-blue-100">
                      <Send className="w-3.5 h-3.5" /> Senden
                    </button>
                  )}
                  {q.status === QuoteStatus.SENT && (
                    <>
                      <button onClick={() => statusMutation.mutate({ id: q.id, status: QuoteStatus.ACCEPTED })}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5" /> Angenommen
                      </button>
                      <button onClick={() => statusMutation.mutate({ id: q.id, status: QuoteStatus.REJECTED })}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-xs font-bold border border-red-100">
                        <Ban className="w-3.5 h-3.5" /> Abgelehnt
                      </button>
                    </>
                  )}
                  {(q.status === QuoteStatus.ACCEPTED || q.status === QuoteStatus.SENT) && !q.convertedToInvoiceId && (
                    <button onClick={() => convertMutation.mutate(q.id)} disabled={convertMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all text-xs font-bold border border-purple-100">
                      <ArrowRight className="w-3.5 h-3.5" /> → Rechnung
                    </button>
                  )}
                  <button onClick={() => handleDownloadPdf(q)}
                    className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100" title="PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => emailMutation.mutate(q.id)}
                    className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100" title="E-Mail">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* ─── Detail / Edit Drawer ──────────────────────────────────────────── */}
      {selectedQuote && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={closeDrawer} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-[#800040]/10 rounded-xl flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-[#800040]" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-lg leading-tight truncate">
                    {selectedQuote.quoteNumber ?? 'Angebot'}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{selectedQuote.customer?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {drawerMode === 'view' && selectedQuote.status !== QuoteStatus.CONVERTED && (
                  <button onClick={() => startEdit(selectedQuote)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#800040] hover:bg-[#600030] text-white rounded-full text-sm font-semibold transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Bearbeiten
                  </button>
                )}
                {drawerMode === 'edit' && (
                  <button onClick={() => setDrawerMode('view')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors">
                    <X className="w-3.5 h-3.5" /> Abbrechen
                  </button>
                )}
                <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {drawerMode === 'view' ? (
                <QuoteDrawerView
                  q={selectedQuote}
                  onSend={() => sendMutation.mutate(selectedQuote.id)}
                  onAccept={() => statusMutation.mutate({ id: selectedQuote.id, status: QuoteStatus.ACCEPTED })}
                  onReject={() => statusMutation.mutate({ id: selectedQuote.id, status: QuoteStatus.REJECTED })}
                  onConvert={() => convertMutation.mutate(selectedQuote.id)}
                  onDownload={() => handleDownloadPdf(selectedQuote)}
                  onEmail={() => emailMutation.mutate(selectedQuote.id)}
                  onDuplicate={() => handleDuplicate(selectedQuote)}
                  onDelete={() => handleDelete(selectedQuote)}
                  onNavigate={router.push}
                  onStatusChange={(s) => statusMutation.mutate({ id: selectedQuote.id, status: s })}
                  pending={{
                    send: sendMutation.isPending,
                    status: statusMutation.isPending,
                    convert: convertMutation.isPending,
                    email: emailMutation.isPending,
                  }}
                />
              ) : (
                <QuoteDrawerEdit
                  q={selectedQuote}
                  data={editData}
                  onChange={setEditData}
                  onSave={handleSaveEdit}
                  onCancel={() => setDrawerMode('view')}
                  pending={updateMutation.isPending}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Create Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCreateForm(false)} />
          <SpotlightCard className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto" spotlightColor="rgba(128,0,64,0.05)">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Neues Angebot</h2>
              <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <CreateQuoteForm
              customers={customers}
              onSubmit={(data: any) => createMutation.mutate(data)}
              onCancel={() => setShowCreateForm(false)}
              isLoading={createMutation.isPending}
            />
          </SpotlightCard>
        </div>
      )}
    </div>
  );
}

// ─── Drawer — View Mode ───────────────────────────────────────────────────────

function QuoteDrawerView({ q, onSend, onAccept, onReject, onConvert, onDownload, onEmail, onDuplicate, onDelete, onNavigate, onStatusChange, pending }: {
  q: Quote;
  onSend: () => void; onAccept: () => void; onReject: () => void;
  onConvert: () => void; onDownload: () => void; onEmail: () => void;
  onDuplicate: () => void; onDelete: () => void;
  onNavigate: (url: string) => void;
  onStatusChange: (status: QuoteStatus) => void;
  pending: { send: boolean; status: boolean; convert: boolean; email: boolean };
}) {
  const expired = isExpired(q);
  const days = daysUntil(q.validUntil);
  const expiringSoon = !expired && days <= 7 && [QuoteStatus.DRAFT, QuoteStatus.SENT].includes(q.status);

  return (
    <div className="space-y-6">
      {/* Amount + status hero */}
      <div className={cn('rounded-2xl p-5 border', expired ? 'bg-red-50 border-red-100' : expiringSoon ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100')}>
        <div className="flex items-center justify-between mb-3">
          <QuoteStatusPicker status={q.status} onSelect={onStatusChange} loading={pending.status} />
          {q.quoteNumber && (
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Hash className="w-3 h-3" />{q.quoteNumber}
            </span>
          )}
        </div>
        <p className={cn('text-4xl font-black tracking-tight', expired ? 'text-red-700' : 'text-slate-900')}>
          {fmt(Number(q.amount))}
        </p>
        {(expired || expiringSoon) && (
          <p className={cn('text-sm font-semibold mt-2 flex items-center gap-1.5', expired ? 'text-red-600' : 'text-amber-600')}>
            <AlertTriangle className="w-4 h-4" />
            {expired ? `Abgelaufen seit ${fmtDate(q.validUntil)}` : `Läuft ab in ${days} Tag${days !== 1 ? 'en' : ''}`}
          </p>
        )}
      </div>

      {/* Info tiles */}
      <div className="grid grid-cols-2 gap-3">
        {q.customer && (
          <button onClick={() => onNavigate(`/customers?id=${q.customer!.id}`)}
            className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-left hover:border-[#800040]/30 hover:bg-[#800040]/5 transition-all group">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Kunde <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">{q.customer.name}</p>
            {q.customer.company && <p className="text-xs text-slate-500 truncate">{q.customer.company}</p>}
          </button>
        )}
        {(q as any).project && (
          <button onClick={() => onNavigate(`/projects?id=${(q as any).project.id}`)}
            className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-left hover:border-[#800040]/30 hover:bg-[#800040]/5 transition-all group">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Folder className="w-3 h-3" /> Projekt <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">{(q as any).project.name}</p>
          </button>
        )}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Erstellt</p>
          <p className="text-sm font-bold text-slate-900">{fmtDate(q.issueDate)}</p>
        </div>
        <div className={cn('border rounded-xl p-3.5', expired ? 'bg-red-50 border-red-100' : expiringSoon ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100')}>
          <p className={cn('text-xs font-semibold uppercase tracking-wide mb-1 flex items-center gap-1', expired ? 'text-red-400' : expiringSoon ? 'text-amber-400' : 'text-slate-400')}>
            <Clock className="w-3 h-3" /> Gültig bis
          </p>
          <p className={cn('text-sm font-bold', expired ? 'text-red-700' : expiringSoon ? 'text-amber-700' : 'text-slate-900')}>{fmtDate(q.validUntil)}</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
          <FileText className="w-3 h-3" /> Leistungsbeschreibung
        </p>
        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">{q.description}</p>
      </div>

      {/* Notes */}
      {q.notes && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Hinweise</p>
          <p className="text-sm text-slate-600 bg-amber-50/50 border border-amber-100 rounded-xl p-4 whitespace-pre-wrap leading-relaxed">{q.notes}</p>
        </div>
      )}

      {/* Converted to invoice link */}
      {q.convertedToInvoiceId && (
        <button onClick={() => onNavigate('/invoices')}
          className="w-full flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-100 transition-colors group">
          <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" /> In Rechnung umgewandelt
          </div>
          <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:text-purple-700 transition-colors" />
        </button>
      )}

      {/* Actions */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Aktionen</p>
        <div className="grid grid-cols-2 gap-2">
          {q.status === QuoteStatus.DRAFT && (
            <button onClick={onSend} disabled={pending.send}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-sm font-semibold border border-blue-100 disabled:opacity-50">
              <Send className="w-4 h-4" /> Als gesendet markieren
            </button>
          )}
          {q.status === QuoteStatus.SENT && (
            <>
              <button onClick={onAccept} disabled={pending.status}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all text-sm font-semibold border border-emerald-100 disabled:opacity-50">
                <CheckCircle className="w-4 h-4" /> Angenommen
              </button>
              <button onClick={onReject} disabled={pending.status}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-sm font-semibold border border-red-100 disabled:opacity-50">
                <XCircle className="w-4 h-4" /> Abgelehnt
              </button>
            </>
          )}
          {(q.status === QuoteStatus.ACCEPTED || q.status === QuoteStatus.SENT) && !q.convertedToInvoiceId && (
            <button onClick={onConvert} disabled={pending.convert}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all text-sm font-semibold border border-purple-100 disabled:opacity-50 col-span-2">
              <ArrowRight className="w-4 h-4" /> In Rechnung umwandeln
            </button>
          )}
          <button onClick={onDownload}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm font-semibold border border-slate-100">
            <Download className="w-4 h-4" /> PDF herunterladen
          </button>
          <button onClick={onEmail} disabled={pending.email}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-sm font-semibold border border-slate-100 disabled:opacity-50">
            <Mail className="w-4 h-4" /> Per E-Mail senden
          </button>
          <button onClick={onDuplicate}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all text-sm font-semibold border border-slate-100">
            <Copy className="w-4 h-4" /> Duplizieren
          </button>
          {q.status !== QuoteStatus.CONVERTED && (
            <button onClick={onDelete}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-sm font-semibold border border-red-100">
              <Trash2 className="w-4 h-4" /> Löschen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Drawer — Edit Mode ───────────────────────────────────────────────────────

function QuoteDrawerEdit({ q, data, onChange, onSave, onCancel, pending }: {
  q: Quote; data: any; onChange: (d: any) => void;
  onSave: () => void; onCancel: () => void; pending: boolean;
}) {
  const canEditAmount = q.status === QuoteStatus.DRAFT;
  const ic = "block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] focus:bg-white transition-all text-slate-700";

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700 font-medium flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        {q.status === QuoteStatus.DRAFT
          ? 'Entwurf – alle Felder bearbeitbar.'
          : 'Bereits versendet – Betrag kann nicht mehr geändert werden.'}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-slate-400" />Status</label>
        <select value={data.status ?? q.status} onChange={e => onChange({ ...data, status: e.target.value })} className={ic}>
          {(Object.entries(QUOTE_STATUS_CONFIG) as [QuoteStatus, typeof QUOTE_STATUS_CONFIG[QuoteStatus]][])
            .filter(([val]) => val !== QuoteStatus.CONVERTED)
            .map(([val, c]) => <option key={val} value={val}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><Hash className="w-4 h-4 text-slate-400" />Angebotsnummer</label>
        <input type="text" value={data.quoteNumber ?? ''} onChange={e => onChange({ ...data, quoteNumber: e.target.value })}
          placeholder="A-2026-001" className={ic} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><Euro className="w-4 h-4 text-slate-400" />Betrag (€)</label>
        <input type="number" step="0.01" value={data.amount ?? ''} onChange={e => onChange({ ...data, amount: parseFloat(e.target.value) })}
          disabled={!canEditAmount} className={cn(ic, !canEditAmount && 'opacity-50 cursor-not-allowed')} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" />Leistungsbeschreibung</label>
        <textarea rows={4} value={data.description ?? ''} onChange={e => onChange({ ...data, description: e.target.value })} className={cn(ic, 'resize-none')} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />Gültig bis</label>
        <input type="date" value={data.validUntil ?? ''} onChange={e => onChange({ ...data, validUntil: e.target.value })} className={ic} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hinweise <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea rows={3} value={data.notes ?? ''} onChange={e => onChange({ ...data, notes: e.target.value })}
          placeholder="Optionale Hinweise..." className={cn(ic, 'resize-none')} />
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <button onClick={onCancel} className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-sm font-semibold transition-all">
          Abbrechen
        </button>
        <button onClick={onSave} disabled={pending}
          className="flex-1 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-full text-sm font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Speichern
        </button>
      </div>
    </div>
  );
}

// ─── Create Form ──────────────────────────────────────────────────────────────

function CreateQuoteForm({ customers, onSubmit, onCancel, isLoading }: any) {
  const [form, setForm] = useState({
    customerId: '', projectId: '', amount: '', description: '',
    quoteNumber: '',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const { data: projects = [], isFetching: loadingProjects } = useQuery({
    queryKey: ['projects', { customerId: form.customerId }],
    queryFn: () => projectsApi.getAll({ customerId: form.customerId }),
    enabled: !!form.customerId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.amount || !form.description || !form.validUntil) {
      toast.error('Bitte alle Pflichtfelder ausfüllen'); return;
    }
    onSubmit({
      customerId: form.customerId,
      projectId: form.projectId || undefined,
      amount: parseFloat(form.amount),
      description: form.description,
      quoteNumber: form.quoteNumber || undefined,
      validUntil: form.validUntil,
      notes: form.notes || undefined,
    });
  };

  const sc = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kunde <span className="text-[#800040]">*</span></label>
        <div className="relative">
          <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value, projectId: '' })} className={sc} required>
            <option value="">{customers.length === 0 ? 'Keine Kunden vorhanden' : 'Kunde auswählen…'}</option>
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.company ? `${c.company} (${c.name})` : c.name}</option>)}
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
        </div>
      </div>

      {form.customerId && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Projekt <span className="text-slate-400 font-normal">(optional)</span></label>
          <div className="relative">
            <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} className={sc} disabled={loadingProjects}>
              <option value="">{loadingProjects ? 'Lade…' : (projects as any[]).length === 0 ? 'Keine Projekte' : 'Projekt auswählen…'}</option>
              {(projects as any[]).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Betrag (€) <span className="text-[#800040]">*</span></label>
          <input type="number" min="0.01" step="0.01" value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            className={sc} placeholder="0,00" required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Angebotsnummer</label>
          <input type="text" value={form.quoteNumber} onChange={e => setForm({ ...form, quoteNumber: e.target.value })}
            className={sc} placeholder="A-2026-001" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gültig bis <span className="text-[#800040]">*</span></label>
        <input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className={sc} required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Leistungsbeschreibung <span className="text-[#800040]">*</span></label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3} className={cn(sc, 'resize-none')} placeholder="Webentwicklung, Beratung, Design…" required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hinweise <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
          rows={2} className={cn(sc, 'resize-none')} placeholder="Optionale Hinweise…" />
      </div>

      <div className="flex gap-4 pt-4">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors">
          Abbrechen
        </button>
        <button type="submit" disabled={isLoading}
          className="flex-1 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-xl font-bold transition-colors disabled:opacity-50 shadow-lg shadow-pink-900/10">
          {isLoading ? 'Erstelle…' : 'Angebot erstellen'}
        </button>
      </div>
    </form>
  );
}
