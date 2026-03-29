'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueTrendPoint } from '@/lib/types';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const yTick = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 shadow-xl shadow-zinc-900/10 min-w-[160px]">
      <p className="text-xs font-semibold text-zinc-400 mb-2.5 uppercase tracking-wider">{label}</p>
      <div className="space-y-1.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-zinc-500">{p.name}</span>
            </div>
            <span className="text-xs font-bold text-zinc-900 tabular-nums">{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface RevenueChart12MProps {
  data: RevenueTrendPoint[];
  isLoading?: boolean;
}

export default function RevenueChart12M({ data, isLoading }: RevenueChart12MProps) {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-3 animate-pulse">
        <div className="flex gap-6 mb-2">
          <div className="h-4 w-24 bg-zinc-100 rounded-md" />
          <div className="h-4 w-20 bg-zinc-100 rounded-md" />
        </div>
        <div className="flex-1 bg-zinc-50 rounded-2xl" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-zinc-400">Noch keine Daten vorhanden</p>
      </div>
    );
  }

  // Summary: last point vs previous
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const revDiff = prev ? ((last.revenue - prev.revenue) / (prev.revenue || 1)) * 100 : 0;
  const isUp = revDiff >= 0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Mini summary */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Letzter Monat</p>
          <p className="text-base font-bold text-zinc-900">{fmt(last.revenue)}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-zinc-400 mb-0.5">Gewinn</p>
          <p className="text-base font-bold text-emerald-600">{fmt(last.profit)}</p>
        </div>
        <div className={`ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          <span>{isUp ? '↑' : '↓'}</span>
          <span>{Math.abs(revDiff).toFixed(1)}% ggü. Vormonat</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#800040" stopOpacity={0.18} />
                <stop offset="85%" stopColor="#800040" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.14} />
                <stop offset="85%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="0"
              vertical={false}
              stroke="#f4f4f5"
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={yTick}
              tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={44}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#e4e4e7', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              name="Umsatz"
              stroke="#800040"
              strokeWidth={2}
              fill="url(#gradRevenue)"
              dot={false}
              activeDot={{ r: 4, fill: '#800040', strokeWidth: 2, stroke: '#fff' }}
              animationDuration={900}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Gewinn"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradProfit)"
              dot={false}
              activeDot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1100}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
