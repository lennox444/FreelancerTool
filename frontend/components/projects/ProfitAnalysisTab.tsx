'use client';

import { useState } from 'react';
import { useProjectProfitability, useProjectProfitabilityHistory } from '@/lib/hooks/useProjects';
import type { ProjectProfitabilityHistoryItem, RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  TrendingUp, Clock, Euro, AlertTriangle, CheckCircle2,
  AlertCircle, BarChart2, Receipt, Minus, Equal, Target,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}
function fmtH(n: number) { return `${n.toFixed(1)} Std`; }
function fmtPct(n: number) { return `${n.toFixed(1)} %`; }

// ─── Risk config ──────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<RiskLevel, { label: string; bg: string; text: string; border: string; Icon: any }> = {
  GREEN:  { label: 'Auf Kurs',         bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', Icon: CheckCircle2 },
  YELLOW: { label: 'Leicht unter Ziel', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   Icon: AlertTriangle },
  RED:    { label: 'Unter Ziel',        bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     Icon: AlertCircle  },
};

// ─── Score arc ────────────────────────────────────────────────────────────────

function ScoreArc({ score, riskLevel }: { score: number; riskLevel: RiskLevel }) {
  const color = riskLevel === 'GREEN' ? '#10b981' : riskLevel === 'YELLOW' ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="56" viewBox="0 0 100 56">
        <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
        <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 132} 132`} />
      </svg>
      <p className="text-2xl font-black text-slate-900 -mt-8">{score}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</p>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, highlight }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={cn('rounded-xl p-3.5 border', highlight ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100')}>
      <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn('text-base font-bold', highlight ? 'text-amber-900' : 'text-slate-900')}>{value}</p>
      {sub && <p className={cn('text-xs mt-0.5', highlight ? 'text-amber-600' : 'text-slate-500')}>{sub}</p>}
    </div>
  );
}

// ─── Breakdown Row ────────────────────────────────────────────────────────────

function BreakdownRow({ icon, label, value, variant = 'neutral' }: {
  icon: React.ReactNode; label: string; value: string;
  variant?: 'neutral' | 'subtract' | 'result';
}) {
  return (
    <div className={cn('flex items-center justify-between py-2', variant === 'result' && 'border-t border-slate-200 mt-1 pt-3')}>
      <div className="flex items-center gap-2 text-slate-500">
        <span className="w-3.5 flex-shrink-0">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={cn('text-sm font-bold tabular-nums',
        variant === 'subtract' ? 'text-red-600' :
        variant === 'result' ? 'text-emerald-700 font-black text-base' : 'text-slate-900'
      )}>
        {value}
      </span>
    </div>
  );
}

// ─── History Bar Chart ────────────────────────────────────────────────────────

type HistoryMetric = 'revenue' | 'hourlyRate';

function HistoryChart({ items, targetRate }: { items: ProjectProfitabilityHistoryItem[]; targetRate: number }) {
  const [metric, setMetric] = useState<HistoryMetric>('hourlyRate');

  const values = items.map((i) => (metric === 'revenue' ? i.revenue : i.hourlyRate));
  const max = Math.max(...values, metric === 'hourlyRate' ? targetRate * 1.2 : 1);

  return (
    <div>
      {/* Metric toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setMetric('hourlyRate')}
          className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
            metric === 'hourlyRate' ? 'bg-[#800040] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          )}
        >
          Stundensatz
        </button>
        <button
          onClick={() => setMetric('revenue')}
          className={cn('text-xs font-semibold px-2.5 py-1 rounded-full transition-colors',
            metric === 'revenue' ? 'bg-[#800040] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          )}
        >
          Umsatz
        </button>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2 h-28">
        {items.map((item, i) => {
          const val = metric === 'revenue' ? item.revenue : item.hourlyRate;
          const pct = max > 0 ? (val / max) * 100 : 0;
          const isAboveTarget = metric === 'hourlyRate' && item.hourlyRate >= targetRate;
          const isEmpty = item.hours === 0 && item.revenue === 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {metric === 'revenue' ? fmt(val) : `${fmt(val)}/Std`}
              </div>
              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={cn('w-full rounded-t-md transition-all',
                    isEmpty ? 'bg-slate-100' :
                    isAboveTarget ? 'bg-emerald-400' :
                    metric === 'hourlyRate' ? 'bg-amber-400' : 'bg-[#800040]/70'
                  )}
                  style={{ height: isEmpty ? '4px' : `${Math.max(4, pct)}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 font-medium leading-none">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Target line label */}
      {metric === 'hourlyRate' && (
        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-emerald-400 rounded" />
          Grün = über Ziel ({fmt(targetRate)}/Std)
          <span className="inline-block w-3 h-0.5 bg-amber-400 rounded ml-2" />
          Amber = unter Ziel
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfitAnalysisTab({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = useProjectProfitability(projectId);
  const { data: history } = useProjectProfitabilityHistory(projectId, 6);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#800040]/20 border-t-[#800040] rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Analyse konnte nicht geladen werden.</p>
      </div>
    );
  }

  const risk = RISK_CONFIG[data.riskLevel];
  const netProfit = data.totalRevenue - data.projectExpenses - data.estimatedTax;

  return (
    <div className="p-6 space-y-7">

      {/* ── Section 1: Score + Risk ──────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <ScoreArc score={data.profitabilityScore} riskLevel={data.riskLevel} />
        <div className="flex-1">
          <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold mb-2', risk.bg, risk.text, risk.border)}>
            <risk.Icon className="w-4 h-4" /> {risk.label}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">
              Ziel: <span className="font-bold text-slate-700">{fmt(data.targetHourlyRate)}/Std</span>
            </p>
            <p className="text-xs text-slate-500">
              Eff. Rate: <span className="font-bold text-slate-700">{fmt(data.hourlyRateReal)}/Std</span>
            </p>
            <p className="text-xs text-slate-400">
              Steuerschätzung: {fmtPct(data.effectiveTaxRate)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 2: KPI Cards ─────────────────────────────────────────── */}
      <div>
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          <BarChart2 className="w-3.5 h-3.5" /> Kennzahlen
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            icon={<Euro className="w-3.5 h-3.5" />}
            label="Real. Stundensatz"
            value={`${fmt(data.hourlyRateReal)}/Std`}
            sub={`Ziel: ${fmt(data.targetHourlyRate)}/Std`}
          />
          <KpiCard
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="Gesamtumsatz"
            value={fmt(data.totalRevenue)}
            sub={data.totalPaid < data.totalRevenue
              ? `${fmt(data.totalPaid)} eingegangen`
              : 'vollständig bezahlt'}
          />
          <KpiCard
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Gearbeitete Zeit"
            value={fmtH(data.totalHours)}
            sub={`${fmtH(data.billableHours)} fakturiert`}
          />
          <KpiCard
            icon={<Clock className="w-3.5 h-3.5" />}
            label="Nicht fakturiert"
            value={fmtH(data.unbilledHours)}
            sub={data.unbilledHours > 0 ? 'noch nicht abgerechnet' : 'alles fakturiert'}
            highlight={data.unbilledHours > 0}
          />
        </div>
      </div>

      {/* ── Section 3: Profit Breakdown ──────────────────────────────────── */}
      <div>
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <Receipt className="w-3.5 h-3.5" /> Profit-Aufschlüsselung
        </h4>
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-1">
          <BreakdownRow icon={<TrendingUp className="w-3 h-3" />} label="Umsatz" value={fmt(data.totalRevenue)} />
          <BreakdownRow icon={<Minus className="w-3 h-3" />} label="Projektausgaben" value={`− ${fmt(data.projectExpenses)}`} variant="subtract" />
          <BreakdownRow
            icon={<Minus className="w-3 h-3" />}
            label={`Steuerschätzung (${fmtPct(data.effectiveTaxRate)})`}
            value={`− ${fmt(data.estimatedTax)}`}
            variant="subtract"
          />
          <BreakdownRow icon={<Equal className="w-3 h-3" />} label="Netto-Profit" value={fmt(netProfit)} variant="result" />
        </div>
      </div>

      {/* ── Section 4: Trend history ─────────────────────────────────────── */}
      {history && history.length > 0 && (
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            <Target className="w-3.5 h-3.5" /> Verlauf (letzte 6 Monate)
          </h4>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <HistoryChart items={history} targetRate={data.targetHourlyRate} />
          </div>
        </div>
      )}

      {/* ── Section 5: Hinweise ──────────────────────────────────────────── */}
      {(data.unbilledHours > 0 || data.riskLevel === 'RED') && (
        <div className="space-y-2">
          {data.unbilledHours > 0 && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <span className="font-bold">{fmtH(data.unbilledHours)}</span> sind noch nicht fakturiert.
                Erstelle eine Rechnung, um diesen Umsatz zu sichern.
              </p>
            </div>
          )}
          {data.riskLevel === 'RED' && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                Dieses Projekt liegt deutlich unter deinem Ziel-Stundensatz von{' '}
                <span className="font-bold">{fmt(data.targetHourlyRate)}/Std</span>.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
