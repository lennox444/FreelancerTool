'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api/quotes';
import { customersApi } from '@/lib/api/customers';
import { projectsApi } from '@/lib/api/projects';
import { Quote, QuoteStatus } from '@/lib/types';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, Filter, FileText, Send, Trash2, ChevronRight,
  Download, Mail, CheckCircle, XCircle, ClipboardList,
  ArrowRight, Clock, Euro, User, ArrowUpRight, Ban
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Entwurf',
  SENT: 'Gesendet',
  ACCEPTED: 'Angenommen',
  REJECTED: 'Abgelehnt',
  CONVERTED: 'Konvertiert',
};

const STATUS_STYLES: Record<QuoteStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  SENT: 'bg-blue-50 text-blue-600 border-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  CONVERTED: 'bg-purple-50 text-purple-600 border-purple-200',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('de-DE').format(new Date(dateStr));
}

function QuoteStatCard({
  label,
  value,
  icon: Icon,
  colorClass
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <SpotlightCard
      className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl flex flex-col justify-between group hover:shadow-md transition-all h-full"
      spotlightColor="rgba(128, 0, 64, 0.05)"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl transition-colors ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{value}</div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </SpotlightCard>
  );
}

export default function QuotesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: quotesResp, isLoading } = useQuery({
    queryKey: ['quotes', filterStatus],
    queryFn: () => quotesApi.getAll(filterStatus ? { status: filterStatus as QuoteStatus } : {}),
  });

  const { data: customersResp } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const customers = Array.isArray(customersResp) ? customersResp : [];
  const quotes = (quotesResp as any)?.data ?? quotesResp ?? [];

  const filtered = (quotes as Quote[]).filter((q: Quote) => {
    const searchLower = search.toLowerCase();
    return (
      !search ||
      q.customer?.name.toLowerCase().includes(searchLower) ||
      q.description.toLowerCase().includes(searchLower) ||
      q.quoteNumber?.toLowerCase().includes(searchLower)
    );
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => quotesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setShowCreateForm(false);
      toast.success('Angebot erstellt');
    },
    onError: () => toast.error('Fehler beim Erstellen'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quotesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Angebot gelöscht');
    },
    onError: () => toast.error('Fehler beim Löschen'),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => quotesApi.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Status auf "Gesendet" gesetzt');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) =>
      quotesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Status aktualisiert');
    },
  });

  const emailMutation = useMutation({
    mutationFn: (id: string) => quotesApi.sendEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Angebot per E-Mail versendet');
    },
    onError: () => toast.error('E-Mail-Versand fehlgeschlagen. SMTP konfiguriert?'),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => quotesApi.convertToInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Angebot in Rechnung konvertiert!');
    },
    onError: () => toast.error('Konvertierung fehlgeschlagen'),
  });

  const handleDownloadPdf = async (quote: Quote) => {
    try {
      const response = await apiClient.get(`/quotes/${quote.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Angebot-${quote.quoteNumber || quote.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('PDF-Download fehlgeschlagen');
    }
  };

  const totalQuotes = filtered.length;
  const totalAccepted = (quotes as Quote[]).filter((q: Quote) => q.status === QuoteStatus.ACCEPTED).length;
  const totalValue = (quotes as Quote[]).reduce((sum: number, q: Quote) => sum + Number(q.amount), 0);
  const conversionRate = totalQuotes > 0 ? Math.round((totalAccepted / totalQuotes) * 100) : 0;

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
              <ClipboardList className="w-8 h-8 text-[#800040]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Angebote</h1>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-300"></div>
          <p className="text-slate-500 font-medium">Erstelle und verwalte deine Angebote</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full font-semibold transition-all shadow-lg shadow-pink-900/20"
        >
          <Plus className="w-5 h-5" />
          Neues Angebot
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <QuoteStatCard
          label="Angebote Gesamt"
          value={totalQuotes}
          icon={FileText}
          colorClass="bg-blue-50 text-blue-600"
        />
        <QuoteStatCard
          label="Angenommen"
          value={totalAccepted}
          icon={CheckCircle}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <QuoteStatCard
          label="Gesamtwert"
          value={formatCurrency(totalValue)}
          icon={Euro}
          colorClass="bg-[#800040]/10 text-[#800040]"
        />
        <QuoteStatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={ArrowUpRight}
          colorClass="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Main Content Area */}
      <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl flex flex-col gap-6" spotlightColor="rgba(128, 0, 64, 0.05)">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Suche nach Kunde, Beschreibung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
            />
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as QuoteStatus | '')}
              className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all cursor-pointer hover:bg-slate-100"
            >
              <option value="">Alle Status</option>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quotes List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800040]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Keine Angebote gefunden</h3>
            <p className="text-slate-500 mb-6 max-w-sm">Erstelle dein erstes Angebot, um neue Aufträge zu gewinnen.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full font-medium transition-colors shadow-lg shadow-pink-900/10"
            >
              Erstes Angebot erstellen
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((quote: Quote) => (
              <div
                key={quote.id}
                className="group bg-white border border-slate-100 rounded-2xl p-5 hover:border-[#800040]/30 hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#800040] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-lg group-hover:text-[#800040] transition-colors">
                        {quote.quoteNumber || `Angebot ${quote.id.slice(0, 8)}`}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${STATUS_STYLES[quote.status]}`}>
                        {STATUS_LABELS[quote.status]}
                      </span>
                    </div>

                    <p className="text-slate-600 font-medium mb-3 line-clamp-1 pr-4">{quote.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <User className="w-3.5 h-3.5" />
                        {quote.customer?.company || quote.customer?.name}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        Gültig bis {formatDate(quote.validUntil)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        Erstellt: {formatDate(quote.issueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-1 pl-4 md:border-l border-slate-100">
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-800">{formatCurrency(Number(quote.amount))}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gesamtbetrag</p>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap justify-end">
                  <button
                    onClick={() => handleDownloadPdf(quote)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF Download
                  </button>

                  <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block"></div>

                  <button
                    onClick={() => emailMutation.mutate(quote.id)}
                    disabled={emailMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    E-Mail senden
                  </button>

                  {quote.status === QuoteStatus.DRAFT && (
                    <button
                      onClick={() => sendMutation.mutate(quote.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors border border-emerald-100"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Als gesendet markieren
                    </button>
                  )}

                  {quote.status === QuoteStatus.SENT && (
                    <>
                      <button
                        onClick={() => statusMutation.mutate({ id: quote.id, status: QuoteStatus.ACCEPTED })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors border border-emerald-100"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Angenommen
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: quote.id, status: QuoteStatus.REJECTED })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors border border-red-100"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Abgelehnt
                      </button>
                    </>
                  )}

                  {(quote.status === QuoteStatus.ACCEPTED || quote.status === QuoteStatus.SENT) && !quote.convertedToInvoiceId && (
                    <button
                      onClick={() => convertMutation.mutate(quote.id)}
                      disabled={convertMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors border border-purple-100 ml-auto md:ml-0"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      In Rechnung umwandeln
                    </button>
                  )}

                  {quote.status !== QuoteStatus.CONVERTED && (
                    <button
                      onClick={() => {
                        if (confirm('Angebot wirklich löschen?')) deleteMutation.mutate(quote.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors ml-auto md:ml-2"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SpotlightCard>

      {/* Create Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCreateForm(false)} />
          <SpotlightCard className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative z-10" spotlightColor="rgba(128, 0, 64, 0.05)">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Neues Angebot erstellen</h2>
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

function CreateQuoteForm({ customers, onSubmit, onCancel, isLoading }: any) {
  const [form, setForm] = useState({
    customerId: '',
    projectId: '',
    amount: '',
    description: '',
    quoteNumber: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const { data: projects = [], isFetching: loadingProjects } = useQuery({
    queryKey: ['projects', { customerId: form.customerId }],
    queryFn: () => projectsApi.getAll({ customerId: form.customerId }),
    enabled: !!form.customerId,
  });

  const handleCustomerChange = (customerId: string) => {
    setForm({ ...form, customerId, projectId: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.amount || !form.description || !form.validUntil) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
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

  const selectClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all appearance-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Kunde */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Kunde <span className="text-[#800040]">*</span>
        </label>
        <div className="relative">
          <select
            value={form.customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className={selectClass}
            required
          >
            <option value="">
              {customers.length === 0 ? 'Keine Kunden vorhanden' : 'Kunde auswählen...'}
            </option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.company ? `${c.company} (${c.name})` : c.name}
              </option>
            ))}
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
        </div>
      </div>

      {/* Projekt (optional, nur wenn Kunde gewählt) */}
      {form.customerId && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Projekt <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <select
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className={selectClass}
              disabled={loadingProjects}
            >
              <option value="">
                {loadingProjects ? 'Lade Projekte...' : projects.length === 0 ? 'Keine Projekte für diesen Kunden' : 'Projekt auswählen...'}
              </option>
              {(projects as any[]).map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Betrag (€) <span className="text-[#800040]">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
            placeholder="0,00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Angebotsnummer</label>
          <input
            type="text"
            value={form.quoteNumber}
            onChange={(e) => setForm({ ...form, quoteNumber: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
            placeholder="A-2026-001"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Gültig bis <span className="text-[#800040]">*</span>
        </label>
        <input
          type="date"
          value={form.validUntil}
          onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Leistungsbeschreibung <span className="text-[#800040]">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all resize-none"
          placeholder="Webentwicklung, Beratung, Design..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hinweise</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all resize-none"
          placeholder="Optionale Hinweise..."
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
          {isLoading ? 'Erstelle...' : 'Angebot erstellen'}
        </button>
      </div>
    </form>
  );
}
