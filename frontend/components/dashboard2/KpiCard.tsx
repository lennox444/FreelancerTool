'use client';

import Link from 'next/link';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: { pct: number; positive: boolean; label: string };
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  href?: string;
  isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white/90 border-white/50 shadow-sm',
  danger: 'bg-rose-50/50 border-rose-100 shadow-rose-900/5',
  success: 'bg-emerald-50/50 border-emerald-100 shadow-emerald-900/5',
  warning: 'bg-amber-50/50 border-amber-100 shadow-amber-900/5',
};

const iconVariantStyles: Record<string, string> = {
  default: 'bg-slate-100/80 text-slate-600 shadow-inner',
  danger: 'bg-rose-100/80 text-rose-600 shadow-inner',
  success: 'bg-emerald-100/80 text-emerald-600 shadow-inner',
  warning: 'bg-amber-100/80 text-amber-600 shadow-inner',
};

export default function KpiCard({
  title,
  value,
  subValue,
  trend,
  icon: Icon,
  variant = 'default',
  href,
  isLoading,
}: KpiCardProps) {
  const content = (
    <div
      className={cn(
        'rounded-[1.8rem] border p-5 flex flex-col gap-4 transition-all duration-300 backdrop-blur-xl group relative overflow-hidden',
        variantStyles[variant],
        'shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]',
        href && 'hover:translate-y-[-2px] hover:shadow-xl hover:shadow-slate-200/40 hover:bg-white hover:border-[#800040]/10',
      )}
    >
      {/* Premium Glow Overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start justify-between">
        <div className={cn(
          'w-10 h-10 rounded-[1.2rem] flex items-center justify-center transition-transform group-hover:scale-105 duration-300',
          iconVariantStyles[variant]
        )}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg shadow-sm',
              trend.positive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white',
            )}
          >
            {trend.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {isFinite(trend.pct) ? `${trend.pct > 0 ? '+' : ''}${Math.round(trend.pct)}%` : '—'}
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-1.5 animate-pulse">
          <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-3 w-1/2 bg-slate-100 rounded-lg" />
        </div>
      ) : (
        <div className="space-y-0.5">
          <p className="text-xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">{value}</p>
          <div className="flex flex-col">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{title}</p>
            {subValue && (
              <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                {subValue}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full group">{content}</Link>;
  }
  return content;
}
