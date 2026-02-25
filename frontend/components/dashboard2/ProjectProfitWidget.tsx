'use client';

import { useQueries } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import type { Project, RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const fmtHours = (h: number) => `${h.toFixed(1)} Std.`;

const riskDot: Record<RiskLevel, string> = {
  GREEN: 'bg-emerald-500',
  YELLOW: 'bg-amber-400',
  RED: 'bg-rose-500',
};

const scoreBadge = (score: number) => {
  if (score >= 75) return 'bg-emerald-100 text-emerald-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
};

interface ProjectProfitWidgetProps {
  projects?: Project[];
  isLoading?: boolean;
}

export default function ProjectProfitWidget({ projects = [], isLoading }: ProjectProfitWidgetProps) {
  const profitabilityQueries = useQueries({
    queries: projects.map((p) => ({
      queryKey: ['project-profitability', p.id],
      queryFn: () => projectsApi.getProfitability(p.id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  if (isLoading) {
    return <div className="h-48 animate-pulse bg-slate-50 rounded-[2.5rem]" />;
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs gap-3 opacity-60 italic">
        Bereit für neue Projekte
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project, idx) => {
        const q = profitabilityQueries[idx];
        const prof = q?.data;

        return (
          <div
            key={project.id}
            className="group flex items-center gap-4 py-3 px-4 rounded-2xl bg-slate-50/50 border border-white hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            {/* Health Indicator */}
            <div className="relative shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shadow-sm transition-transform group-hover:scale-105 duration-300",
                prof ? scoreBadge(prof.profitabilityScore) : 'bg-slate-100 text-slate-400'
              )}>
                {q?.isLoading ? '...' : prof?.profitabilityScore ?? '—'}
              </div>
              {prof && (
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                  riskDot[prof.riskLevel]
                )} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{project.name}</h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {project.customer?.company || project.customer?.name || 'Kein Kunde'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5" >Aufwand</span>
                <span className="text-xs font-bold text-slate-600 tabular-nums">
                  {q?.isLoading ? '...' : prof ? fmtHours(prof.totalHours) : '—'}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-[#800040] uppercase tracking-widest mb-0.5">Umsatz</span>
                <span className="text-sm font-black text-slate-900 tabular-nums">
                  {q?.isLoading ? '...' : prof ? fmt(prof.totalRevenue) : '—'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
