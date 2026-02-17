'use client';

import { useEffect, useState } from 'react';
import { FileText, User, Calendar, Euro, CheckCircle, Clock, AlertTriangle, Building } from 'lucide-react';
import axios from 'axios';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Entwurf', color: 'bg-slate-500/20 text-slate-400 border-slate-600', icon: Clock },
  SENT: { label: 'Offen', color: 'bg-blue-500/20 text-blue-400 border-blue-600', icon: Clock },
  PARTIALLY_PAID: { label: 'Teilweise bezahlt', color: 'bg-amber-500/20 text-amber-400 border-amber-600', icon: Clock },
  PAID: { label: 'Bezahlt', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-600', icon: CheckCircle },
  OVERDUE: { label: 'Überfällig', color: 'bg-red-500/20 text-red-400 border-red-600', icon: AlertTriangle },
};

interface Invoice {
  id: string;
  invoiceNumber?: string;
  amount: number;
  description: string;
  status: keyof typeof STATUS_CONFIG;
  totalPaid: number;
  issueDate: string;
  dueDate: string;
  owner: { firstName: string; lastName: string; email: string };
  customer: { name: string; company?: string; email: string };
  payments?: { id: string; amount: number; paymentDate: string; note?: string }[];
}

export default function ClientPortalContent({ token }: { token: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/public/invoices/${token}`)
      .then((r) => setInvoice(r.data.data))
      .catch(() => setError('Rechnung nicht gefunden oder Link ungültig.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Rechnung nicht gefunden</h1>
          <p className="text-slate-400">{error || 'Der Link ist ungültig oder abgelaufen.'}</p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.SENT;
  const StatusIcon = statusConfig.icon;
  const remaining = Number(invoice.amount) - Number(invoice.totalPaid);
  const isOverdue = invoice.status === 'OVERDUE';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 border-b border-indigo-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-indigo-300 text-xs font-medium">Rechnung von</p>
              <p className="text-white font-bold">{invoice.owner.firstName} {invoice.owner.lastName}</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${statusConfig.color}`}>
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Invoice Header */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {invoice.invoiceNumber ? `Rechnung ${invoice.invoiceNumber}` : 'Rechnung'}
              </h1>
              <p className="text-slate-400 mt-1">Ausgestellt am {formatDate(invoice.issueDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-indigo-400">{formatCurrency(Number(invoice.amount))}</p>
              {Number(invoice.totalPaid) > 0 && Number(invoice.totalPaid) < Number(invoice.amount) && (
                <p className="text-slate-400 text-sm mt-1">Noch offen: {formatCurrency(remaining)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Due Date Banner */}
        <div className={`rounded-2xl p-4 border flex items-center gap-4 ${
          isOverdue
            ? 'bg-red-500/10 border-red-500/30'
            : invoice.status === 'PAID'
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-blue-500/10 border-blue-500/30'
        }`}>
          <Calendar className={`w-6 h-6 flex-shrink-0 ${isOverdue ? 'text-red-400' : invoice.status === 'PAID' ? 'text-emerald-400' : 'text-blue-400'}`} />
          <div>
            <p className={`font-semibold ${isOverdue ? 'text-red-300' : invoice.status === 'PAID' ? 'text-emerald-300' : 'text-blue-300'}`}>
              {invoice.status === 'PAID'
                ? 'Diese Rechnung wurde vollständig bezahlt.'
                : isOverdue
                ? `Überfällig seit ${formatDate(invoice.dueDate)}`
                : `Zahlungsfrist: ${formatDate(invoice.dueDate)}`}
            </p>
            {invoice.status !== 'PAID' && (
              <p className="text-slate-400 text-sm mt-0.5">
                Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer.
              </p>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 font-semibold">Von</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600/30 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-white">{invoice.owner.firstName} {invoice.owner.lastName}</p>
                <p className="text-slate-400 text-sm">{invoice.owner.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 font-semibold">An</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-white">{invoice.customer.company || invoice.customer.name}</p>
                {invoice.customer.company && (
                  <p className="text-slate-400 text-sm">{invoice.customer.name}</p>
                )}
                <p className="text-slate-400 text-sm">{invoice.customer.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description / Line Items */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-700/50 px-6 py-3">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold col-span-2">Leistungsbeschreibung</p>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold text-right">Betrag</p>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-3">
              <p className="text-white col-span-2 leading-relaxed">{invoice.description}</p>
              <p className="text-indigo-400 font-bold text-right">{formatCurrency(Number(invoice.amount))}</p>
            </div>
          </div>
          <div className="border-t border-slate-700 px-6 py-4 flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">Netto (excl. MwSt.): {formatCurrency(Number(invoice.amount) / 1.19)}</p>
              <p className="text-slate-400 text-sm">MwSt. 19%: {formatCurrency(Number(invoice.amount) - Number(invoice.amount) / 1.19)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Gesamtbetrag</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(Number(invoice.amount))}</p>
            </div>
          </div>
        </div>

        {/* Payments */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Zahlungshistorie
            </h2>
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
                  <div>
                    <p className="text-white font-medium">{formatCurrency(Number(p.amount))}</p>
                    {p.note && <p className="text-slate-400 text-sm">{p.note}</p>}
                  </div>
                  <p className="text-slate-400 text-sm">{formatDate(p.paymentDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-slate-600 text-sm pb-6">
          <p>Powered by FreelancerTool</p>
        </div>
      </div>
    </div>
  );
}
