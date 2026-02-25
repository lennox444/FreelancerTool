'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
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
    return <div className="h-48 animate-pulse bg-slate-100 rounded-xl" />;
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
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        Keine Ausgaben dieses Jahr
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, _name: any, props: any) => [fmt(Number(value)), props.payload?.label ?? String(_name)]}
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: 12,
              border: '1px solid #f1f5f9',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-1.5">
        {pieData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="flex-1 text-slate-600">{entry.label}</span>
            <span className="font-semibold text-slate-900">{fmt(entry.value)}</span>
            <span className="text-slate-400 w-10 text-right">
              {total > 0 ? `${Math.round((entry.value / total) * 100)}%` : '0%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
