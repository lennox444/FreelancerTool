'use client';

import { useQueries } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';
import type { Project, RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

const fmt = (v: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const fmtHours = (h: number) => `${h.toFixed(1)} h`;

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
    return <div className="h-32 animate-pulse bg-slate-100 rounded-xl" />;
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-slate-400 text-sm">
        Keine aktiven Projekte
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-400 border-b border-slate-100">
            <th className="text-left py-2 pr-4 font-medium">Projekt</th>
            <th className="text-right py-2 pr-4 font-medium hidden sm:table-cell">Stunden</th>
            <th className="text-right py-2 pr-4 font-medium">Umsatz</th>
            <th className="text-right py-2 pr-2 font-medium">Score</th>
            <th className="text-center py-2 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {projects.map((project, idx) => {
            const q = profitabilityQueries[idx];
            const prof = q?.data;
            return (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 pr-4">
                  <span className="font-medium text-slate-900">{project.name}</span>
                  {project.customer && (
                    <span className="block text-xs text-slate-400">
                      {project.customer.company || project.customer.name}
                    </span>
                  )}
                </td>
                <td className="py-2.5 pr-4 text-right text-slate-500 hidden sm:table-cell">
                  {q?.isLoading ? (
                    <div className="inline-block h-3 w-10 bg-slate-100 rounded animate-pulse" />
                  ) : prof ? (
                    fmtHours(prof.totalHours)
                  ) : '—'}
                </td>
                <td className="py-2.5 pr-4 text-right font-semibold text-slate-900">
                  {q?.isLoading ? (
                    <div className="inline-block h-3 w-16 bg-slate-100 rounded animate-pulse" />
                  ) : prof ? (
                    fmt(prof.totalRevenue)
                  ) : '—'}
                </td>
                <td className="py-2.5 pr-2 text-right">
                  {q?.isLoading ? (
                    <div className="inline-block h-5 w-10 bg-slate-100 rounded-full animate-pulse" />
                  ) : prof ? (
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', scoreBadge(prof.profitabilityScore))}>
                      {prof.profitabilityScore}
                    </span>
                  ) : '—'}
                </td>
                <td className="py-2.5 text-center">
                  {q?.isLoading ? (
                    <div className="inline-block w-3 h-3 rounded-full bg-slate-100 animate-pulse" />
                  ) : prof ? (
                    <span className={cn('inline-block w-3 h-3 rounded-full', riskDot[prof.riskLevel])} />
                  ) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
