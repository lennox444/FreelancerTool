'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

function daysBadge(daysOverdue: number) {
  const label = `${daysOverdue} ${daysOverdue === 1 ? 'Tag' : 'Tage'} überfällig`;
  if (daysOverdue <= 14) return { label, cls: 'bg-amber-100 text-amber-700' };
  if (daysOverdue <= 30) return { label, cls: 'bg-orange-100 text-orange-700' };
  return { label, cls: 'bg-rose-100 text-rose-700' };
}

interface OverdueWidgetProps {
  invoices?: any[];
  isLoading?: boolean;
}

export default function OverdueWidget({ invoices = [], isLoading }: OverdueWidgetProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-xl" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) return null;

  return (
    <div className="space-y-2">
      {invoices.map((inv: any) => {
        const daysOverdue = Math.floor(
          (Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24),
        );
        const badge = daysBadge(Math.max(0, daysOverdue));
        return (
          <div
            key={inv.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-[#800040]/30 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex-1 min-w-0">
              <Link href={`/invoices/${inv.id}`} className="block">
                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight group-hover:text-[#800040] transition-colors">
                  {inv.customer?.company || inv.customer?.name || 'Unbekannt'}
                </p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {inv.invoiceNumber ? `Rechnung ${inv.invoiceNumber}` : 'Keine Nr.'} • Fällig: {fmtDate(inv.dueDate)}
                </p>
              </Link>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-black text-slate-900 tabular-nums">
                {fmt(Number(inv.amount))}
              </span>
              <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest', badge.cls)}>
                {badge.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
