'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueTrendPoint } from '@/lib/types';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const yTick = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl p-3 border border-white/10 shadow-2xl text-[10px]">
      <p className="font-black text-white mb-2 uppercase tracking-widest opacity-40">{label}</p>
      <div className="space-y-2">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-white/60 font-bold uppercase tracking-tight">{p.name}</span>
            </div>
            <span className="font-black text-white tabular-nums">{fmt(p.value)}</span>
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
      <div className="h-[250px] animate-pulse bg-slate-50/50 rounded-3xl" />
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#800040" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#800040" stopOpacity={0.15} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(0,0,0,0.02)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis
          tickFormatter={yTick}
          tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(0,0,0,0.01)', radius: 8 }}
        />
        <Bar
          dataKey="revenue"
          name="Umsatz"
          fill="url(#revenueGrad)"
          stroke="#800040"
          strokeWidth={0.5}
          radius={[6, 6, 2, 2]}
          maxBarSize={28}
          animationDuration={1500}
        />
        <Line
          dataKey="profit"
          name="Gewinn"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ r: 0 }}
          activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
          type="monotone"
          animationDuration={2000}
          style={{ filter: 'url(#glow)' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
