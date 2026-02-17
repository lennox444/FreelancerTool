'use client';

import { useEffect, useState } from 'react';
import { FileText, User, Calendar, CheckCircle, Clock, AlertTriangle, Building, Timer, ArrowRight, Download } from 'lucide-react';
import axios from 'axios';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Entwurf', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock },
  SENT: { label: 'Offen', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock },
  PARTIALLY_PAID: { label: 'Teilweise bezahlt', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock },
  PAID: { label: 'Bezahlt', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle },
  OVERDUE: { label: 'Überfällig', color: 'bg-red-50 text-red-600 border-red-200', icon: AlertTriangle },
};

interface TimeEntry {
  id: string;
  description?: string;
  duration: number;
  startTime: string;
  endTime?: string;
}

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
  timeEntries?: TimeEntry[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} Min.`;
  if (m === 0) return `${h} Std.`;
  return `${h} Std. ${m} Min.`;
}

export default function ClientPortalContent({ token }: { token: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`/api/public/invoices/${token}`)
      .then((r) => setInvoice(r.data.data))
      .catch(() => setError('Rechnung nicht gefunden oder Link ungültig.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-slate-50">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <PixelBlast variant="square" color="#800040" patternScale={4} transparent />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#800040]/20 border-t-[#800040] rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Lade Rechnung...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-50">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <PixelBlast variant="square" color="#800040" patternScale={4} transparent />
        </div>
        <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl p-8 rounded-3xl max-w-md w-full text-center" spotlightColor="rgba(128, 0, 64, 0.05)">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Rechnung nicht gefunden</h1>
          <p className="text-slate-500">{error || 'Der Link ist ungültig oder abgelaufen.'}</p>
        </SpotlightCard>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.SENT;
  const StatusIcon = statusConfig.icon;
  const remaining = Number(invoice.amount) - Number(invoice.totalPaid);
  const isOverdue = invoice.status === 'OVERDUE';

  return (
    <div className="min-h-screen relative isolate bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
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

      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#800040]/10 rounded-xl">
              <FileText className="w-5 h-5 text-[#800040]" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rechnung von</p>
              <p className="text-slate-900 font-bold">{invoice.owner.firstName} {invoice.owner.lastName}</p>
            </div>
          </div>
          <span className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border shadow-sm ${statusConfig.color}`}>
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Invoice Header */}
        <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl p-8 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                {invoice.invoiceNumber ? `Rechnung ${invoice.invoiceNumber}` : 'Rechnung'}
              </h1>
              <p className="text-slate-500 font-medium">Ausgestellt am {formatDate(invoice.issueDate)}</p>
            </div>
            <div className="text-left md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-3xl font-black text-[#800040]">{formatCurrency(Number(invoice.amount))}</p>
              {Number(invoice.totalPaid) > 0 && Number(invoice.totalPaid) < Number(invoice.amount) && (
                <p className="text-slate-500 text-sm mt-1 font-medium">Noch offen: {formatCurrency(remaining)}</p>
              )}
              {Number(invoice.totalPaid) >= Number(invoice.amount) && (
                <p className="text-emerald-600 text-sm mt-1 font-bold flex items-center gap-1 md:justify-end">
                  <CheckCircle className="w-3 h-3" /> Vollständig bezahlt
                </p>
              )}
            </div>
          </div>

          {/* Due Date Banner */}
          <div className={`rounded-xl p-4 border flex items-start gap-4 mb-8 ${isOverdue
              ? 'bg-red-50 border-red-200'
              : invoice.status === 'PAID'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
            <div className={`p-2 rounded-lg bg-white bg-opacity-60 ${isOverdue ? 'text-red-600' : invoice.status === 'PAID' ? 'text-emerald-600' : 'text-blue-600'}`}>
              <Calendar className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <p className={`font-bold ${isOverdue ? 'text-red-700' : invoice.status === 'PAID' ? 'text-emerald-700' : 'text-blue-700'}`}>
                {invoice.status === 'PAID'
                  ? 'Vielen Dank! Diese Rechnung wurde vollständig bezahlt.'
                  : isOverdue
                    ? `Zahlung überfällig seit ${formatDate(invoice.dueDate)}`
                    : `Zahlbar bis zum ${formatDate(invoice.dueDate)}`}
              </p>
              {invoice.status !== 'PAID' && (
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  Bitte überweisen Sie den offenen Betrag unter Angabe der Rechnungsnummer auf das unten angegebene Konto.
                </p>
              )}
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-bold flex items-center gap-2">
                <User className="w-3 h-3" /> Aussteller
              </p>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-lg">{invoice.owner.firstName} {invoice.owner.lastName}</p>
                <p className="text-slate-500">{invoice.owner.email}</p>
              </div>
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3 font-bold flex items-center gap-2">
                <Building className="w-3 h-3" /> Empfänger
              </p>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-lg">{invoice.customer.company || invoice.customer.name}</p>
                {invoice.customer.company && <p className="text-slate-600 font-medium">{invoice.customer.name}</p>}
                <p className="text-slate-500">{invoice.customer.email}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details Container */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#800040]" />
                Leistungsübersicht
              </h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2 pb-2">
                <p className="text-slate-900 text-lg leading-relaxed font-medium">{invoice.description}</p>
              </div>
            </div>
            <div className="bg-slate-50/50 p-6 space-y-3 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Netto</span>
                <span>{formatCurrency(Number(invoice.amount) / 1.19)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Umsatzsteuer (19%)</span>
                <span>{formatCurrency(Number(invoice.amount) - Number(invoice.amount) / 1.19)}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-slate-200 mt-2">
                <span className="font-bold text-slate-900">Gesamtbetrag</span>
                <span className="font-black text-2xl text-[#800040]">{formatCurrency(Number(invoice.amount))}</span>
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Time Entries */}
        {invoice.timeEntries && invoice.timeEntries.length > 0 && (
          <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-3xl overflow-hidden" spotlightColor="rgba(128, 0, 64, 0.05)">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-500" />
                Leistungsnachweis
              </h3>
              <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                {formatDuration(invoice.timeEntries.reduce((s, e) => s + e.duration, 0))} Total
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {invoice.timeEntries.map((entry) => (
                <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-slate-900 font-medium text-sm">{entry.description || 'Arbeitszeit'}</p>
                      <p className="text-slate-400 text-xs">
                        {new Date(entry.startTime).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-600 text-sm bg-slate-50 px-2 py-1 rounded">{formatDuration(entry.duration)}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        )}

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-3xl overflow-hidden" spotlightColor="rgba(128, 0, 64, 0.05)">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Zahlungseingänge
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {invoice.payments.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold">{formatCurrency(Number(p.amount))}</p>
                      {p.note && <p className="text-slate-500 text-xs">{p.note}</p>}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{formatDate(p.paymentDate)}</p>
                </div>
              ))}
            </div>
          </SpotlightCard>
        )}

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-slate-400 text-sm font-medium">Sicher bereitgestellt von FreelancerTool</p>
        </div>

      </div>
    </div>
  );
}
