'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

function daysBadge(daysOverdue: number) {
  if (daysOverdue <= 14) return { label: `${daysOverdue}d überfällig`, cls: 'bg-amber-100 text-amber-700' };
  if (daysOverdue <= 30) return { label: `${daysOverdue}d überfällig`, cls: 'bg-orange-100 text-orange-700' };
  return { label: `${daysOverdue}d überfällig`, cls: 'bg-rose-100 text-rose-700' };
}

interface OverdueWidgetProps {
  invoices?: any[];
  isLoading?: boolean;
}

export default function OverdueWidget({ invoices = [], isLoading }: OverdueWidgetProps) {
  if (isLoading) {
    return <div className="h-24 animate-pulse bg-slate-100 rounded-xl" />;
  }

  if (invoices.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-400 border-b border-slate-100">
            <th className="text-left py-2 pr-4 font-medium">Kunde</th>
            <th className="text-right py-2 pr-4 font-medium">Betrag</th>
            <th className="text-right py-2 pr-4 font-medium hidden sm:table-cell">Fällig am</th>
            <th className="text-right py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {invoices.map((inv: any) => {
            const daysOverdue = Math.floor(
              (Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24),
            );
            const badge = daysBadge(Math.max(0, daysOverdue));
            return (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 pr-4">
                  <Link href={`/invoices/${inv.id}`} className="font-medium text-slate-900 hover:text-[#800040]">
                    {inv.customer?.company || inv.customer?.name || '—'}
                  </Link>
                  {inv.invoiceNumber && (
                    <span className="block text-xs text-slate-400">{inv.invoiceNumber}</span>
                  )}
                </td>
                <td className="py-2.5 pr-4 text-right font-semibold text-slate-900">
                  {fmt(Number(inv.amount))}
                </td>
                <td className="py-2.5 pr-4 text-right text-slate-500 hidden sm:table-cell">
                  {fmtDate(inv.dueDate)}
                </td>
                <td className="py-2.5 text-right">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', badge.cls)}>
                    {badge.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
