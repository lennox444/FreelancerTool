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
    return (
      <div className="grid grid-cols-4 gap-2 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-50 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {quarters.map((q) => {
        const deadline = q.deadline(year);
        const status = getStatus(deadline);
        return (
          <div key={q.label} className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-slate-50/50 border border-white hover:border-[#800040]/20 hover:bg-white hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{q.label}</span>
              <div className={cn('w-1.5 h-1.5 rounded-full', status.cls.split(' ')[0])} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.name}</p>
            {taxSavings && (
              <div className="space-y-0.5 mt-1">
                {(taxSavings.quarterlyVat > 0 || taxSavings.quarterlyIncomeTax > 0) ? (
                  <>
                    <p className="text-[11px] font-black text-slate-900 tabular-nums">
                      {fmt(taxSavings.quarterlyVat + taxSavings.quarterlyIncomeTax)}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Forderung
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] font-bold text-slate-300 italic">Keine Daten</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
