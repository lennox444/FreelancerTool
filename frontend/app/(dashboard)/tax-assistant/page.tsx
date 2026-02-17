'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taxAssistantApi } from '@/lib/api/tax-assistant';
import { TaxAssistantResult } from '@/lib/types';
import { Calculator, AlertTriangle, TrendingUp, PiggyBank, Info, Percent, Euro, FileText, ChevronDown, Calendar, Wallet } from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <Info className="w-3.5 h-3.5 text-slate-400 cursor-help ml-1" />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-56 bg-slate-800 text-white text-xs rounded-lg p-2.5 shadow-xl z-20 hidden group-hover:block transition-all opacity-0 group-hover:opacity-100">
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
        {text}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color = 'bg-indigo-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
      <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TaxStatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  colorClass: string; // e.g. "bg-emerald-50 text-emerald-600"
}) {
  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between h-full bg-white/50 backdrop-blur-sm ${colorClass.replace('bg-', 'border-').replace('text-', 'border-opacity-20 ')}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-xs uppercase font-bold tracking-wider text-slate-500">{label}</p>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs font-medium text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function TaxAssistantPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const { data: resp, isLoading, isError } = useQuery({
    queryKey: ['tax-assistant', selectedYear],
    queryFn: () => taxAssistantApi.calculate(selectedYear),
  });

  const result = (resp as any)?.data as TaxAssistantResult | undefined;

  return (
    <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-8">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
        <div className="absolute inset-0 w-full h-full opacity-30">
          <PixelBlast
            variant="square"
            pixelSize={6}
            color="#800040"
            patternScale={4}
            patternDensity={0.5}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            speed={0.2}
            transparent
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#800040]/10 rounded-xl">
              <Calculator className="w-8 h-8 text-[#800040]" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Steuer-Assistent</h1>
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-300"></div>
          <p className="text-slate-500 font-medium">Steuerliche Orientierungshilfe auf Basis deiner Daten</p>
        </div>

        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#800040]/20 shadow-sm hover:bg-slate-50 appearance-none cursor-pointer"
          >
            {years.map((y) => <option key={y} value={y}>Steuerjahr {y}</option>)}
          </select>
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 shadow-sm">
        <div className="p-2 bg-amber-100 rounded-lg shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-amber-800 text-sm font-medium leading-relaxed">
            <strong>Wichtiger Hinweis:</strong> Diese Berechnung dient nur als Orientierungshilfe und ersetzt keine professionelle Steuerberatung. Die tatsächlichen Steuern können je nach individueller Situation abweichen. Konsultiere für verbindliche Angaben einen Steuerberater.
          </p>
        </div>
      </div>


      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#800040]/20 border-t-[#800040] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Berechne Steuern...</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-700 font-semibold">Fehler beim Laden der Daten</p>
        </div>
      )}

      {result && (
        <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl flex flex-col gap-8" spotlightColor="rgba(128, 0, 64, 0.05)">

          {/* Revenue Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TaxStatCard
              label="Bruttoumsatz"
              value={formatCurrency(result.revenue.gross)}
              sub={`Aus ${result.invoiceCount} Rechnungen`}
              icon={TrendingUp}
              colorClass="bg-emerald-50 text-emerald-600"
            />
            <TaxStatCard
              label="Nettoumsatz"
              value={formatCurrency(result.revenue.net)}
              sub="Steuerpflichtig"
              icon={Euro}
              colorClass="bg-blue-50 text-blue-600"
            />
            <TaxStatCard
              label="Ausgaben"
              value={formatCurrency(result.expenses.total)}
              sub={`Aus ${result.expenseCount} Belegen`}
              icon={FileText}
              colorClass="bg-red-50 text-red-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profit Wrapper */}
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#800040]" />
                Gewinnermittlung
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">Nettoumsatz</span>
                    <InfoTooltip text="Umsatz ohne MwSt." />
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(result.revenue.net)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">− Betriebsausgaben</span>
                    <InfoTooltip text="Abzugsfähige Betriebsausgaben" />
                  </div>
                  <span className="font-bold text-red-500">−{formatCurrency(result.expenses.total)}</span>
                </div>
                <div className="flex justify-between items-center py-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-black text-lg">Zu versteuerndes Einkommen</span>
                    <InfoTooltip text="Geschätzte Bemessungsgrundlage für die Einkommensteuer" />
                  </div>
                  <span className={`font-black text-xl ${result.profit.taxable >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatCurrency(result.profit.taxable)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tax Calculation */}
            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Percent className="w-5 h-5 text-red-500" />
                Geschätzte Steuerlast {selectedYear}
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-sm font-semibold">Umsatzsteuer (19% MwSt.)</span>
                      <InfoTooltip text="Eingenommene MwSt. die du ans Finanzamt abführen musst." />
                    </div>
                    <span className="font-bold text-red-500">{formatCurrency(result.taxes.vatCollected)}</span>
                  </div>
                  <ProgressBar
                    value={result.taxes.vatCollected}
                    max={result.revenue.gross}
                    color="bg-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-sm font-semibold">Einkommensteuer (Est.)</span>
                      <InfoTooltip text="Basiert auf dem Grundtarif (Grundfreibetrag berücksichtigt)." />
                    </div>
                    <span className="font-bold text-orange-500">{formatCurrency(result.taxes.incomeTax)}</span>
                  </div>
                  <ProgressBar
                    value={result.taxes.incomeTax}
                    max={result.profit.taxable}
                    color="bg-orange-500" // Updated to solid color for custom progressbar
                  />
                </div>

                {result.taxes.solidaritySurcharge > 0 && (
                  <div className="flex justify-between items-center py-2 px-3 bg-slate-100 rounded-lg">
                    <span className="text-slate-500 text-xs font-semibold">Solidaritätszuschlag (5,5%)</span>
                    <span className="font-bold text-slate-700 text-sm">{formatCurrency(result.taxes.solidaritySurcharge)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4 mt-2">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-900 font-bold text-lg">Steuerlast Gesamt</span>
                    <div className="text-right">
                      <span className="block font-black text-2xl text-slate-900">{formatCurrency(result.taxes.total)}</span>
                      <p className="text-slate-400 text-xs font-medium mt-1">
                        Ø {result.taxes.effectiveRate}% Steuersatz
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quarterly Prepayments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Umsatzsteuer-Vorauszahlung</p>
              <p className="text-3xl font-black text-slate-900 mb-1">{formatCurrency(result.prepayments.quarterlyVat)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-semibold text-slate-500">PRO QUARTAL</span>
                <span className="text-xs text-slate-400">Jan, Apr, Jul, Okt</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Einkommensteuer-Vorauszahlung</p>
              <p className="text-3xl font-black text-slate-900 mb-1">{formatCurrency(result.prepayments.quarterlyIncomeTax)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-semibold text-slate-500">PRO QUARTAL</span>
                <span className="text-xs text-slate-400">Mär, Jun, Sep, Dez</span>
              </div>
            </div>
          </div>


          {/* Savings Recommendation */}
          <div className="bg-[#800040]/5 border border-[#800040]/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-[#800040] mb-2 flex items-center gap-2">
                <PiggyBank className="w-6 h-6" />
                Rücklagen-Empfehlung
              </h2>
              <p className="text-slate-600 max-w-2xl mb-8">
                Empfohlene monatliche Rücklage, um Steuernachzahlungen stressfrei zu begleichen.
                Wir empfehlen das <strong className="text-[#800040]">Realistische Szenario</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Konservativ</p>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(result.recommendations.conservative)}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                    <p className="text-slate-400 text-xs mt-1">≈ 35% vom Gewinn</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border-2 border-[#800040] shadow-xl relative scale-105 transform origin-center flex flex-col justify-between h-32">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#800040] text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm">Empfohlen</div>
                  <p className="text-[#800040] text-xs font-bold uppercase tracking-wider">Realistisch</p>
                  <div>
                    <p className="text-3xl font-black text-slate-900">{formatCurrency(result.recommendations.realistic)}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                    <p className="text-slate-500 text-xs mt-1">≈ 30% vom Gewinn</p>
                  </div>
                </div>

                <div className="bg-white/80 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Optimistisch</p>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(result.recommendations.optimistic)}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                    <p className="text-slate-400 text-xs mt-1">≈ 25% vom Gewinn</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#800040]/10 text-center">
                <p className="text-slate-500 text-sm">
                  Basierend auf {result.recommendations.setAsidePercentage}% deines Nettogewinns.
                </p>
              </div>
            </div>
          </div>

          {/* Data note */}
          <div className="text-center text-slate-400 text-[10px]">
            Berechnungsgrundlage: {result.invoiceCount} Rechnungen und {result.expenseCount} Ausgaben im Jahr {selectedYear}.
            {selectedYear === currentYear && ` (Laufendes Jahr: ${result.monthsElapsed} Monate)`}
          </div>

        </SpotlightCard>
      )}
    </div>
  );
}
