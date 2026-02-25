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
  default: 'bg-white border-slate-200',
  danger: 'bg-rose-50 border-rose-200',
  success: 'bg-emerald-50 border-emerald-200',
  warning: 'bg-amber-50 border-amber-200',
};

const iconVariantStyles: Record<string, string> = {
  default: 'bg-slate-100 text-slate-600',
  danger: 'bg-rose-100 text-rose-600',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
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
        'rounded-2xl border p-4 flex flex-col gap-3 transition-shadow hover:shadow-md',
        variantStyles[variant],
        href && 'cursor-pointer',
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', iconVariantStyles[variant])}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
              trend.positive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
            )}
          >
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isFinite(trend.pct) ? `${trend.pct > 0 ? '+' : ''}${Math.round(trend.pct)}%` : '—'}
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-7 w-3/4 bg-slate-200 rounded" />
          <div className="h-3 w-1/2 bg-slate-100 rounded" />
        </div>
      ) : (
        <div>
          <p className="text-xl font-bold text-slate-900 leading-tight">{value}</p>
          {subValue && <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>}
          {trend?.label && <p className="text-xs text-slate-400 mt-0.5">{trend.label}</p>}
          <p className="text-xs font-medium text-slate-500 mt-1">{title}</p>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
