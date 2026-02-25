'use client';

import { cn } from '@/lib/utils';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

interface TaxSavings {
  monthlySavings: number;
  setAsidePercentage: number;
  quarterlyVat: number;
  quarterlyIncomeTax: number;
}

interface TaxCalendarWidgetProps {
  taxSavings?: TaxSavings;
  isLoading?: boolean;
}

const quarters = [
  { label: 'Q1', deadline: (year: number) => new Date(year, 2, 10), name: '10. März' },
  { label: 'Q2', deadline: (year: number) => new Date(year, 5, 10), name: '10. Juni' },
  { label: 'Q3', deadline: (year: number) => new Date(year, 8, 10), name: '10. Sep.' },
  { label: 'Q4', deadline: (year: number) => new Date(year, 11, 10), name: '10. Dez.' },
];

function getStatus(deadline: Date): { label: string; cls: string } {
  const now = new Date();
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { label: 'BEZAHLT', cls: 'bg-slate-100 text-slate-500' };
  if (daysUntil <= 30) return { label: 'BALD FÄLLIG', cls: 'bg-amber-100 text-amber-700' };
  return { label: 'OFFEN', cls: 'bg-blue-100 text-blue-600' };
}

export default function TaxCalendarWidget({ taxSavings, isLoading }: TaxCalendarWidgetProps) {
  const year = new Date().getFullYear();

  if (isLoading) {
    return <div className="h-32 animate-pulse bg-slate-100 rounded-xl" />;
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {quarters.map((q) => {
        const deadline = q.deadline(year);
        const status = getStatus(deadline);
        return (
          <div key={q.label} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{q.label}</span>
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', status.cls)}>
                {status.label}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">{q.name}</p>
            {taxSavings && (
              <div className="space-y-0.5">
                {taxSavings.quarterlyVat > 0 && (
                  <p className="text-[10px] text-slate-500">
                    USt: <span className="font-semibold text-slate-700">{fmt(taxSavings.quarterlyVat)}</span>
                  </p>
                )}
                {taxSavings.quarterlyIncomeTax > 0 && (
                  <p className="text-[10px] text-slate-500">
                    ESt: <span className="font-semibold text-slate-700">{fmt(taxSavings.quarterlyIncomeTax)}</span>
                  </p>
                )}
                {taxSavings.quarterlyVat === 0 && taxSavings.quarterlyIncomeTax === 0 && (
                  <p className="text-[10px] text-slate-400">Keine Daten</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
