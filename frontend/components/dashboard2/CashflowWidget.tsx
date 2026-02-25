'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const fmtDate = (d: string | Date) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.`;
};

interface CashflowWidgetProps {
  data?: any;
  isLoading?: boolean;
}

export default function CashflowWidget({ data, isLoading }: CashflowWidgetProps) {
  const weekly: any[] = (data?.weekly ?? []).slice(0, 5);
  const totalExpected = data?.summary?.totalExpected ?? 0;
  const invoiceCount = data?.summary?.invoiceCount ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Cashflow (90 Tage)</h3>
          <p className="text-xs text-slate-400">{invoiceCount} offene Rechnungen</p>
        </div>
        <Link href="/invoices?status=SENT" className="text-xs text-[#800040] hover:underline flex items-center gap-1">
          Alle <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : weekly.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Keine fälligen Rechnungen</p>
      ) : (
        <div className="space-y-1.5">
          {weekly.map((w: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm">
              <span className="text-slate-500 text-xs">
                {fmtDate(w.weekStart)} – {fmtDate(w.weekEnd)}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{w.invoices} Rg.</span>
                <span className="font-semibold text-slate-900">{fmt(w.expected)}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 px-1 border-t border-slate-100 mt-1">
            <span className="text-xs text-slate-400">Gesamt erwartet</span>
            <span className="text-sm font-bold text-slate-900">{fmt(totalExpected)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
