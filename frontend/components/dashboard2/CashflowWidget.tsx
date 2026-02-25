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
  const weekly: any[] = (data?.weekly ?? []).slice(0, 4);
  const totalExpected = data?.summary?.totalExpected ?? 0;
  const invoiceCount = data?.summary?.invoiceCount ?? 0;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Liquidität</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{invoiceCount} offene Forderungen</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-50 rounded-xl" />
          ))}
        </div>
      ) : weekly.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-40">
          <div className="p-3 rounded-full bg-slate-50 border border-slate-100 italic font-medium text-slate-400 text-[10px]">Alles ausgeglichen</div>
        </div>
      ) : (
        <div className="space-y-1.5">
          {weekly.map((w: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 border border-white hover:border-[#800040]/10 hover:bg-white hover:shadow-sm transition-all group overflow-hidden relative">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  Woche {i + 1}
                </span>
                <span className="text-[9px] font-bold text-slate-500">
                  {fmtDate(w.weekStart)} – {fmtDate(w.weekEnd)}
                </span>
              </div>
              <div className="flex flex-col items-end relative z-10">
                <span className="text-[10px] font-black text-slate-900 tabular-nums">{fmt(w.expected)}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Pipeline</span>
              </div>
            </div>
          ))}

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between px-1">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5" >Volumen</span>
              <span className="text-base font-black text-emerald-600 tracking-tighter leading-none tabular-nums" >{fmt(totalExpected)}</span>
            </div>
            <Link href="/invoices?status=SENT" className="p-1.5 rounded-lg bg-[#800040] text-white shadow-lg shadow-rose-900/10 hover:scale-110 active:scale-95 transition-all">
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
