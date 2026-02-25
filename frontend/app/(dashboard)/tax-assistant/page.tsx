'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taxAssistantApi } from '@/lib/api/tax-assistant';
import { TaxAssistantResult } from '@/lib/types';
import {
  Calculator, AlertTriangle, TrendingUp, PiggyBank, Info, Percent, Euro,
  FileText, Calendar, Wallet, ExternalLink, CheckCircle2, ChevronDown,
  TrendingDown, Receipt, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { cn } from '@/lib/utils';

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 26, delay },
  };
}

// ─── InfoTooltip ──────────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <Info className="w-3.5 h-3.5 text-slate-400 cursor-help ml-1" />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-56 bg-slate-800 text-white text-xs rounded-xl p-2.5 shadow-xl z-20 hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
        {text}
      </div>
    </div>
  );
}

// ─── Animated ProgressBar ─────────────────────────────────────────────────────

function ProgressBar({ value, max, color = 'bg-indigo-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className={cn('h-full rounded-full', color)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  label, value, sub, icon: Icon, color, bg, border, delay = 0,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; bg: string; border: string; delay?: number;
}) {
  return (
    <motion.div {...fadeUp(delay)} className={cn('flex items-center gap-4 p-4 rounded-2xl border', bg, border)}>
      <div className={cn('p-2.5 rounded-xl bg-white/80 flex-shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={cn('text-lg font-black leading-tight', color)}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ─── Scenario card ────────────────────────────────────────────────────────────

function ScenarioCard({
  label, amount, pct, selected, recommended, monthlyProfit, onClick, delay = 0,
}: {
  label: string; amount: number; pct: number;
  selected: boolean; recommended: boolean; monthlyProfit: number;
  onClick: () => void; delay?: number;
}) {
  const ratio = monthlyProfit > 0 ? amount / monthlyProfit : 0;
  const trafficColor =
    ratio <= 0.5 ? { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' } :
    ratio <= 0.8 ? { bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50'   } :
                   { bar: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'     };

  return (
    <motion.div {...fadeUp(delay)}>
      <button
        onClick={onClick}
        className={cn(
          'relative p-5 rounded-[1.4rem] border-2 text-left transition-all w-full group',
          selected
            ? 'border-[#800040] bg-white shadow-xl shadow-rose-900/10'
            : 'border-slate-200 bg-white/80 hover:border-[#800040]/40 hover:shadow-md',
        )}
      >
        {recommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#800040] to-[#E60045] text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
            Empfohlen
          </div>
        )}
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3"
          >
            <CheckCircle2 className="w-4 h-4 text-[#800040]" />
          </motion.div>
        )}
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        <p className="text-2xl font-black text-slate-900 mb-0.5">
          {formatCurrency(amount)}<span className="text-sm font-normal text-slate-400">/Monat</span>
        </p>
        <p className="text-xs text-slate-400 mb-3">≈ {pct}% vom Gewinn</p>
        <div className="space-y-1">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', trafficColor.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ratio * 100)}%` }}
              transition={{ duration: 0.7, delay: delay + 0.2, ease: 'easeOut' }}
            />
          </div>
          <p className={cn('text-[10px] font-bold', trafficColor.text)}>
            {(ratio * 100).toFixed(0)}% deines Monatsgewinns
          </p>
        </div>
      </button>
    </motion.div>
  );
}

// ─── Quarterly Calendar ───────────────────────────────────────────────────────

function QuarterlyCalendar({
  year, vatAmount, incomeTaxAmount,
}: { year: number; vatAmount: number; incomeTaxAmount: number }) {
  const quarters = [
    { q: 'Q1', vatDue: `10.01.${year}`, itDue: `10.03.${year}`, month: 'Jan–Mär', isNext: false },
    { q: 'Q2', vatDue: `10.04.${year}`, itDue: `10.06.${year}`, month: 'Apr–Jun', isNext: false },
    { q: 'Q3', vatDue: `10.07.${year}`, itDue: `10.09.${year}`, month: 'Jul–Sep', isNext: false },
    { q: 'Q4', vatDue: `10.10.${year}`, itDue: `10.12.${year}`, month: 'Okt–Dez', isNext: false },
  ];
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3);
  if (now.getFullYear() === year && currentQuarter < 4) {
    quarters[currentQuarter].isNext = true;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {quarters.map(({ q, vatDue, itDue, month, isNext }, i) => (
        <motion.div
          key={q}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.06 }}
          className={cn(
            'rounded-2xl border p-4 relative transition-all',
            isNext
              ? 'border-[#800040]/40 bg-gradient-to-br from-[#800040]/5 to-[#800040]/10 shadow-md'
              : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:shadow-sm',
          )}
        >
          {isNext && (
            <div className="absolute -top-2.5 left-3 bg-[#800040] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
              Nächster Termin
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className={cn('text-sm font-black', isNext ? 'text-[#800040]' : 'text-slate-900')}>{q}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{month}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-wide">USt-Vorauszahlung</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{vatDue}</p>
              </div>
              <p className="text-sm font-black text-slate-900 whitespace-nowrap">{formatCurrency(vatAmount)}</p>
            </div>
            <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-wide">ESt-Vorauszahlung</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{itDue}</p>
              </div>
              <p className="text-sm font-black text-slate-900 whitespace-nowrap">{formatCurrency(incomeTaxAmount)}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TaxAssistantPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'realistic' | 'optimistic'>('realistic');
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const { data: resp, isLoading, isError } = useQuery({
    queryKey: ['tax-assistant', selectedYear],
    queryFn: () => taxAssistantApi.calculate(selectedYear),
  });

  const result = (resp as any)?.data as TaxAssistantResult | undefined;
  const monthlyProfit = result ? result.profit.net / Math.max(1, result.monthsElapsed) : 0;

  return (
    <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-6">

      {/* ── Background ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-8%] right-[-5%] w-[45%] h-[45%] bg-[#800040]/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-violet-500/4 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 w-full h-full opacity-[0.35]">
          <PixelBlast variant="square" pixelSize={6} color="#800040" patternScale={4}
            patternDensity={0.3} pixelSizeJitter={0.5} enableRipples rippleSpeed={0.2}
            rippleThickness={0.1} speed={0.1} transparent />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white/80 to-slate-50/50" />
      </div>

      {/* ── Header ── */}
      <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow-lg shadow-rose-900/10">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Calculator className="w-4 h-4 text-[#800040]" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Steuer-Assistent</h1>
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Berechnen · Planen · Rücklagen bilden
          </p>
        </div>

        {/* Year selector */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="pl-4 pr-10 h-11 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] shadow-sm hover:bg-slate-50 appearance-none cursor-pointer transition-all"
          >
            {years.map((y) => <option key={y} value={y}>Steuerjahr {y}</option>)}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* ── Disclaimer ── */}
      <motion.div {...fadeUp(0.05)}>
        <div className="flex items-start gap-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-[1.4rem] p-5 shadow-sm">
          <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-900 text-sm font-black mb-1">Kein Ersatz für Steuerberatung</p>
            <p className="text-amber-800 text-sm leading-relaxed font-medium">
              Diese Berechnung dient nur als Orientierungshilfe und kann von deiner tatsächlichen Steuerlast abweichen.
              Für verbindliche Angaben empfehlen wir einen Steuerberater.
            </p>
            <a
              href="https://www.steuerberater.de/suche"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-amber-700 text-xs font-black hover:text-amber-900 transition-colors uppercase tracking-wide"
            >
              Steuerberater finden <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* ── Loading ── */}
      {isLoading && (
        <motion.div {...fadeUp(0.1)} className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin" />
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Berechne Steuern...</p>
        </motion.div>
      )}

      {/* ── Error ── */}
      {isError && (
        <motion.div {...fadeUp(0.1)}
          className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-red-100 rounded-[1.8rem] bg-red-50/40"
        >
          <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-9 h-9 text-red-300" />
          </div>
          <h3 className="text-base font-black text-red-800 uppercase tracking-tight">Fehler beim Laden</h3>
          <p className="text-red-500 text-sm mt-1.5 font-medium">Bitte versuche es erneut.</p>
        </motion.div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="flex flex-col gap-6">

          {/* Revenue overview – stat tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatTile label="Bruttoumsatz" value={formatCurrency(result.revenue.gross)}
              sub={`Aus ${result.invoiceCount} Rechnungen`}
              icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" delay={0.1} />
            <StatTile label="Nettoumsatz" value={formatCurrency(result.revenue.net)}
              sub="Steuerpflichtig"
              icon={Euro} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" delay={0.15} />
            <StatTile label="Betriebsausgaben" value={formatCurrency(result.expenses.total)}
              sub={`Aus ${result.expenseCount} Belegen`}
              icon={TrendingDown} color="text-red-600" bg="bg-red-50" border="border-red-100" delay={0.2} />
          </div>

          {/* Profit + Tax side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Gewinnermittlung */}
            <motion.div {...fadeUp(0.25)}>
              <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm p-6 rounded-[1.8rem] h-full" spotlightColor="rgba(128,0,64,0.04)">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#800040]" /> Gewinnermittlung
                </h2>
                <div className="space-y-1">
                  <div className="flex justify-between items-center py-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 font-semibold text-sm">Nettoumsatz</span>
                      <InfoTooltip text="Umsatz ohne MwSt." />
                    </div>
                    <span className="font-black text-slate-900">{formatCurrency(result.revenue.net)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-600 font-semibold text-sm">− Betriebsausgaben</span>
                      <InfoTooltip text="Abzugsfähige Betriebsausgaben" />
                    </div>
                    <span className="font-black text-red-500">−{formatCurrency(result.expenses.total)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 pb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-900 font-black">Zu versteuerndes Einkommen</span>
                      <InfoTooltip text="Geschätzte Bemessungsgrundlage für die Einkommensteuer" />
                    </div>
                    <span className={cn('font-black text-xl', result.profit.taxable >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {formatCurrency(result.profit.taxable)}
                    </span>
                  </div>
                </div>

                {/* Net profit highlight */}
                <div className={cn(
                  'mt-4 rounded-2xl p-4 flex items-center justify-between',
                  result.profit.net >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100',
                )}>
                  <p className={cn('text-xs font-black uppercase tracking-widest', result.profit.net >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    Nettogewinn
                  </p>
                  <p className={cn('text-2xl font-black', result.profit.net >= 0 ? 'text-emerald-700' : 'text-red-700')}>
                    {formatCurrency(result.profit.net)}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>

            {/* Steuerlast */}
            <motion.div {...fadeUp(0.3)}>
              <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm p-6 rounded-[1.8rem] h-full" spotlightColor="rgba(128,0,64,0.04)">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-red-500" /> Geschätzte Steuerlast {selectedYear}
                </h2>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 text-sm font-semibold">Umsatzsteuer (19% MwSt.)</span>
                        <InfoTooltip text="Eingenommene MwSt. die du ans Finanzamt abführen musst." />
                      </div>
                      <span className="font-black text-red-500">{formatCurrency(result.taxes.vatCollected)}</span>
                    </div>
                    <ProgressBar value={result.taxes.vatCollected} max={result.revenue.gross} color="bg-red-500" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 text-sm font-semibold">Einkommensteuer (Est.)</span>
                        <InfoTooltip text="Basiert auf dem Grundtarif (Grundfreibetrag berücksichtigt)." />
                      </div>
                      <span className="font-black text-orange-500">{formatCurrency(result.taxes.incomeTax)}</span>
                    </div>
                    <ProgressBar value={result.taxes.incomeTax} max={result.profit.taxable} color="bg-orange-500" />
                  </div>
                  {result.taxes.solidaritySurcharge > 0 && (
                    <div className="flex justify-between items-center py-2 px-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-500 text-xs font-semibold">Solidaritätszuschlag (5,5%)</span>
                      <span className="font-black text-slate-700 text-sm">{formatCurrency(result.taxes.solidaritySurcharge)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Steuerlast Gesamt</p>
                        <p className="text-xs text-slate-400">Ø {result.taxes.effectiveRate}% effektiver Steuersatz</p>
                      </div>
                      <span className="font-black text-2xl text-slate-900">{formatCurrency(result.taxes.total)}</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* ── Rücklagen-Empfehlung ── */}
          <motion.div {...fadeUp(0.35)}>
            <SpotlightCard
              className="bg-white/95 backdrop-blur-xl border border-[#800040]/15 shadow-sm p-6 rounded-[1.8rem] relative overflow-hidden"
              spotlightColor="rgba(128,0,64,0.06)"
            >
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#800040]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow flex-shrink-0">
                  <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                    <PiggyBank className="w-3.5 h-3.5 text-[#800040]" />
                  </div>
                </div>
                <h2 className="text-[10px] font-black text-[#800040] uppercase tracking-[0.2em]">Rücklagen-Empfehlung</h2>
              </div>
              <p className="text-slate-500 text-sm mb-6 font-medium">
                Wähle dein Sparmodell. Wir empfehlen <strong className="text-[#800040] font-black">Realistisch</strong> für die meisten Freelancer.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <ScenarioCard
                  label="Konservativ" amount={result.recommendations.conservative}
                  pct={35} selected={selectedScenario === 'conservative'}
                  recommended={false} monthlyProfit={monthlyProfit}
                  onClick={() => setSelectedScenario('conservative')} delay={0.36} />
                <ScenarioCard
                  label="Realistisch" amount={result.recommendations.realistic}
                  pct={30} selected={selectedScenario === 'realistic'}
                  recommended={true} monthlyProfit={monthlyProfit}
                  onClick={() => setSelectedScenario('realistic')} delay={0.4} />
                <ScenarioCard
                  label="Optimistisch" amount={result.recommendations.optimistic}
                  pct={25} selected={selectedScenario === 'optimistic'}
                  recommended={false} monthlyProfit={monthlyProfit}
                  onClick={() => setSelectedScenario('optimistic')} delay={0.44} />
              </div>

              {/* Selected scenario summary */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedScenario}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="bg-gradient-to-br from-[#800040]/5 to-[#800040]/10 border border-[#800040]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-[10px] font-black text-[#800040] uppercase tracking-widest mb-1">
                      Gewähltes Szenario: {selectedScenario === 'conservative' ? 'Konservativ' : selectedScenario === 'realistic' ? 'Realistisch' : 'Optimistisch'}
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                      {formatCurrency(result.recommendations[selectedScenario])}
                      <span className="text-sm font-normal text-slate-400">/Monat zur Seite legen</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jahresrücklage</p>
                    <p className="text-2xl font-black text-[#800040]">{formatCurrency(result.recommendations[selectedScenario] * 12)}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </SpotlightCard>
          </motion.div>

          {/* ── Vorauszahlungs-Kalender ── */}
          <motion.div {...fadeUp(0.4)}>
            <SpotlightCard className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm p-6 rounded-[1.8rem]" spotlightColor="rgba(128,0,64,0.04)">
              <div className="mb-4">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#800040]" /> Vorauszahlungs-Kalender {selectedYear}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Alle 4 Quartale im Überblick – trage diese Termine in deinen Kalender ein.
                </p>
              </div>
              <QuarterlyCalendar
                year={selectedYear}
                vatAmount={result.prepayments.quarterlyVat}
                incomeTaxAmount={result.prepayments.quarterlyIncomeTax}
              />
              <div className="mt-4 flex items-center gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> USt-Vorauszahlung
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400" /> ESt-Vorauszahlung
                </span>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Data note */}
          <motion.div {...fadeUp(0.45)} className="text-center text-slate-400 text-[10px] font-medium pb-2">
            Berechnungsgrundlage: {result.invoiceCount} Rechnungen und {result.expenseCount} Ausgaben im Jahr {selectedYear}.
            {selectedYear === currentYear && ` (Laufendes Jahr: ${result.monthsElapsed} Monate)`}
          </motion.div>
        </div>
      )}
    </div>
  );
}
