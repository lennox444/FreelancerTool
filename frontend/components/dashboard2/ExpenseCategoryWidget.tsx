'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Receipt } from 'lucide-react';
import type { ExpenseSummary } from '@/lib/types';

const CATEGORY_COLORS: Record<string, string> = {
  SOFTWARE: '#800040',
  HARDWARE: '#be123c',
  TRAVEL: '#0f766e',
  MARKETING: '#c2410c',
  OFFICE: '#4338ca',
  TRAINING: '#0891b2',
  OTHER: '#94a3b8',
};

const CATEGORY_LABELS: Record<string, string> = {
  SOFTWARE: 'Software',
  HARDWARE: 'Hardware',
  TRAVEL: 'Reisekosten',
  MARKETING: 'Marketing',
  OFFICE: 'Büro',
  TRAINING: 'Weiterbildung',
  OTHER: 'Sonstiges',
};

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

interface ExpenseCategoryWidgetProps {
  summary?: ExpenseSummary;
  isLoading?: boolean;
}

export default function ExpenseCategoryWidget({ summary, isLoading }: ExpenseCategoryWidgetProps) {
  if (isLoading) {
    return <div className="h-64 animate-pulse bg-slate-50 rounded-[2rem]" />;
  }

  const rawByCategory = summary?.byCategory ?? {};
  const total = Object.values(rawByCategory).reduce((s, v) => s + (v as number), 0);

  const pieData = Object.entries(rawByCategory)
    .filter(([, v]) => (v as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([cat, amount]) => ({
      name: cat,
      label: CATEGORY_LABELS[cat] ?? cat,
      value: amount as number,
      color: CATEGORY_COLORS[cat] ?? '#94a3b8',
    }));

  if (pieData.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
          <Receipt className="w-6 h-6" />
        </div>
        Keine Ausgaben erfasst
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: any) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg border border-white/10 shadow-xl text-[11px] font-black uppercase tracking-widest">
                    {data.label}: {fmt(data.value)}
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gesamt</p>
          <p className="text-lg font-black text-slate-900 tracking-tighter">{fmt(total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0.5">
        {pieData.slice(0, 4).map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 p-1.5 rounded-lg transition-colors hover:bg-slate-50 group">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: entry.color }} />
            <span className="flex-1 text-[11px] font-bold text-slate-500 uppercase tracking-tight">{entry.label}</span>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-black text-slate-900 whitespace-nowrap">{fmt(entry.value)}</span>
              <span className="text-[10px] font-bold text-slate-400">
                {total > 0 ? `${Math.round((entry.value / total) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        ))}
        {pieData.length > 4 && (
          <p className="text-[11px] text-center text-slate-400 font-bold mt-1 uppercase tracking-widest">
            + {pieData.length - 4} weitere
          </p>
        )}
      </div>
    </div>
  );
}
