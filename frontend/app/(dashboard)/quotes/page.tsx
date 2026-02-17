'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api/quotes';
import { customersApi } from '@/lib/api/customers';
import { Quote, QuoteStatus } from '@/lib/types';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, Filter, FileText, Send, Trash2, ChevronRight,
  Download, Mail, RefreshCw, CheckCircle, XCircle, ClipboardList,
  ArrowRight, Clock, Euro, User
} from 'lucide-react';
import apiClient from '@/lib/api/client';

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Entwurf',
  SENT: 'Gesendet',
  ACCEPTED: 'Angenommen',
  REJECTED: 'Abgelehnt',
  CONVERTED: 'Konvertiert',
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  DRAFT: 'bg-slate-500/20 text-slate-400 border-slate-700',
  SENT: 'bg-blue-500/20 text-blue-400 border-blue-700',
  ACCEPTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-700',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-700',
  CONVERTED: 'bg-purple-500/20 text-purple-400 border-purple-700',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('de-DE').format(new Date(dateStr));
}

export default function QuotesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | ''>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editQuote, setEditQuote] = useState<Quote | null>(null);

  const { data: quotesResp, isLoading } = useQuery({
    queryKey: ['quotes', filterStatus],
    queryFn: () => quotesApi.getAll(filterStatus ? { status: filterStatus as QuoteStatus } : {}),
  });

  const { data: customersResp } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const customers = (customersResp as any)?.data ?? customersResp ?? [];
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
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-emerald-400" />
              Angebote
            </h1>
            <p className="text-slate-400 mt-1">Erstelle und verwalte deine Angebote</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Neues Angebot
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Gesamt', value: totalQuotes, color: 'text-white' },
            { label: 'Angenommen', value: totalAccepted, color: 'text-emerald-400' },
            { label: 'Gesamtwert', value: formatCurrency(totalValue), color: 'text-blue-400' },
            { label: 'Konversionsrate', value: `${conversionRate}%`, color: 'text-purple-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Suche nach Kunde, Beschreibung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as QuoteStatus | '')}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Alle Status</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Quotes List */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Lade Angebote...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Keine Angebote gefunden</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
          >
            Erstes Angebot erstellen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quote: Quote) => (
            <div
              key={quote.id}
              className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-white text-lg">
                      {quote.quoteNumber || `Angebot ${quote.id.slice(0, 8)}`}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[quote.status]}`}>
                      {STATUS_LABELS[quote.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {quote.customer?.company || quote.customer?.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Gültig bis {formatDate(quote.validUntil)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-1">{quote.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(Number(quote.amount))}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(quote.issueDate)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50 flex-wrap">
                <button
                  onClick={() => handleDownloadPdf(quote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
                <button
                  onClick={() => emailMutation.mutate(quote.id)}
                  disabled={emailMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-700/50 rounded-lg text-xs font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  E-Mail
                </button>
                {quote.status === QuoteStatus.DRAFT && (
                  <button
                    onClick={() => sendMutation.mutate(quote.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-700/50 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Als gesendet markieren
                  </button>
                )}
                {quote.status === QuoteStatus.SENT && (
                  <>
                    <button
                      onClick={() => statusMutation.mutate({ id: quote.id, status: QuoteStatus.ACCEPTED })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-700/50 rounded-lg text-xs font-medium transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Angenommen
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: quote.id, status: QuoteStatus.REJECTED })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-700/50 rounded-lg text-xs font-medium transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Abgelehnt
                    </button>
                  </>
                )}
                {(quote.status === QuoteStatus.ACCEPTED || quote.status === QuoteStatus.SENT) && !quote.convertedToInvoiceId && (
                  <button
                    onClick={() => convertMutation.mutate(quote.id)}
                    disabled={convertMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-700/50 rounded-lg text-xs font-medium transition-colors ml-auto"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Zu Rechnung konvertieren
                  </button>
                )}
                {quote.status !== QuoteStatus.CONVERTED && (
                  <button
                    onClick={() => {
                      if (confirm('Angebot wirklich löschen?')) deleteMutation.mutate(quote.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg text-xs font-medium transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Neues Angebot erstellen</h2>
            <CreateQuoteForm
              customers={customers}
              onSubmit={(data: any) => createMutation.mutate(data)}
              onCancel={() => setShowCreateForm(false)}
              isLoading={createMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CreateQuoteForm({ customers, onSubmit, onCancel, isLoading }: any) {
  const [form, setForm] = useState({
    customerId: '',
    amount: '',
    description: '',
    quoteNumber: '',
    validUntil: '',
    notes: '',
  });

  const validUntilDefault = new Date();
  validUntilDefault.setDate(validUntilDefault.getDate() + 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.amount || !form.description || !form.validUntil) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }
    onSubmit({
      customerId: form.customerId,
      amount: parseFloat(form.amount),
      description: form.description,
      quoteNumber: form.quoteNumber || undefined,
      validUntil: form.validUntil,
      notes: form.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Kunde *</label>
        <select
          value={form.customerId}
          onChange={(e) => setForm({ ...form, customerId: e.target.value })}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          required
        >
          <option value="">Kunde auswählen...</option>
          {customers.map((c: any) => (
            <option key={c.id} value={c.id}>{c.company ? `${c.company} (${c.name})` : c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Betrag (€) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            placeholder="0,00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Angebotsnummer</label>
          <input
            type="text"
            value={form.quoteNumber}
            onChange={(e) => setForm({ ...form, quoteNumber: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            placeholder="A-2026-001"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Gültig bis *</label>
        <input
          type="date"
          value={form.validUntil}
          onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Leistungsbeschreibung *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
          placeholder="Webentwicklung, Beratung, Design..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Hinweise</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
          placeholder="Optionale Hinweise..."
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
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Erstelle...' : 'Angebot erstellen'}
        </button>
      </div>
    </form>
  );
}
