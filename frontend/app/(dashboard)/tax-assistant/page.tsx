'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taxAssistantApi } from '@/lib/api/tax-assistant';
import { TaxAssistantResult } from '@/lib/types';
import { Calculator, AlertTriangle, TrendingUp, PiggyBank, Info, Percent, Euro, FileText, ChevronDown } from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex">
      <Info className="w-3.5 h-3.5 text-slate-500 cursor-help ml-1" />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-56 bg-slate-700 text-slate-200 text-xs rounded-lg p-2.5 shadow-xl z-10 hidden group-hover:block">
        {text}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color = 'bg-indigo-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
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
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calculator className="w-8 h-8 text-indigo-400" />
              Steuer-Assistent
            </h1>
            <p className="text-slate-400 mt-1">Steuerliche Orientierungshilfe auf Basis deiner Daten</p>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm">
            <strong>Wichtiger Hinweis:</strong> Diese Berechnung dient nur als Orientierungshilfe und ersetzt keine professionelle Steuerberatung. Die tatsächlichen Steuern können je nach individueller Situation abweichen. Konsultiere für verbindliche Angaben einen Steuerberater.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Berechne Steuern...</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="text-center py-16">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Fehler beim Laden der Daten</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Bruttoumsatz</span>
                <InfoTooltip text="Gesamtumsatz aller Rechnungen (inkl. 19% MwSt.)" />
              </div>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(result.revenue.gross)}</p>
              <p className="text-slate-400 text-xs mt-1">Aus {result.invoiceCount} Rechnungen</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Nettoumsatz</span>
                <InfoTooltip text="Umsatz ohne enthaltene MwSt. (Brutto / 1,19)" />
              </div>
              <p className="text-3xl font-bold text-blue-400">{formatCurrency(result.revenue.net)}</p>
              <p className="text-slate-400 text-xs mt-1">Umsatzsteuerpflichtiger Anteil</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm font-semibold uppercase tracking-wider">Ausgaben</span>
                <InfoTooltip text="Gesamte erfasste Betriebsausgaben im Jahr" />
              </div>
              <p className="text-3xl font-bold text-red-400">{formatCurrency(result.expenses.total)}</p>
              <p className="text-slate-400 text-xs mt-1">Aus {result.expenseCount} Ausgaben</p>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Gewinnrechnung
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Nettoumsatz</span>
                  <InfoTooltip text="Umsatz ohne MwSt." />
                </div>
                <span className="font-bold text-white">{formatCurrency(result.revenue.net)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">− Betriebsausgaben</span>
                  <InfoTooltip text="Abzugsfähige Betriebsausgaben" />
                </div>
                <span className="font-bold text-red-400">−{formatCurrency(result.expenses.total)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">Zu versteuerndes Einkommen</span>
                  <InfoTooltip text="Geschätzte Bemessungsgrundlage für die Einkommensteuer" />
                </div>
                <span className={`font-bold text-xl ${result.profit.taxable >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(result.profit.taxable)}
                </span>
              </div>
            </div>
          </div>

          {/* Tax Calculation */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-red-400" />
              Geschätzte Steuerbelastung {selectedYear}
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 text-sm">Umsatzsteuer (MwSt. 19%)</span>
                    <InfoTooltip text="Eingenommene MwSt. die du ans Finanzamt abführen musst. Nicht dein Geld!" />
                  </div>
                  <span className="font-bold text-red-400">{formatCurrency(result.taxes.vatCollected)}</span>
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
                    <span className="text-slate-300 text-sm">Einkommensteuer (geschätzt)</span>
                    <InfoTooltip text="Basiert auf dem deutschen Einkommensteuer-Grundtarif 2024 (Grundfreibetrag: 11.604€)" />
                  </div>
                  <span className="font-bold text-orange-400">{formatCurrency(result.taxes.incomeTax)}</span>
                </div>
                <ProgressBar
                  value={result.taxes.incomeTax}
                  max={result.profit.taxable}
                  color="bg-orange-500"
                />
              </div>

              {result.taxes.solidaritySurcharge > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 text-sm">Solidaritätszuschlag (5,5%)</span>
                    </div>
                    <span className="font-bold text-orange-300">{formatCurrency(result.taxes.solidaritySurcharge)}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">Gesamte Steuerbelastung</span>
                  <span className="font-bold text-xl text-red-400">{formatCurrency(result.taxes.total)}</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">
                  Effektiver Steuersatz: {result.taxes.effectiveRate}% auf das zu versteuernde Einkommen
                </p>
              </div>
            </div>
          </div>

          {/* Quarterly Prepayments */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Vierteljährige Vorauszahlungen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/40 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Umsatzsteuer-Vorauszahlung / Quartal</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(result.prepayments.quarterlyVat)}</p>
                <p className="text-slate-500 text-xs mt-1">Fällig: Jan, Apr, Jul, Okt</p>
              </div>
              <div className="bg-slate-700/40 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Einkommensteuer-Vorauszahlung / Quartal</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(result.prepayments.quarterlyIncomeTax)}</p>
                <p className="text-slate-500 text-xs mt-1">Fällig: Mär, Jun, Sep, Dez</p>
              </div>
            </div>
          </div>

          {/* Savings Recommendation */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-indigo-400" />
              Rücklagen-Empfehlung
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              Lege jeden Monat einen Teil deines Einkommens zurück, um die Steuern problemlos bezahlen zu können.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Konservativ</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(result.recommendations.conservative)}<span className="text-sm font-normal text-slate-400">/Monat</span></p>
                <p className="text-slate-500 text-xs mt-1">≈ 35% des Nettogewinns</p>
              </div>
              <div className="bg-indigo-600/20 rounded-xl p-4 border border-indigo-500/50">
                <p className="text-indigo-400 text-xs uppercase tracking-wider mb-1">Realistisch ✓</p>
                <p className="text-2xl font-bold text-indigo-300">{formatCurrency(result.recommendations.realistic)}<span className="text-sm font-normal text-slate-400">/Monat</span></p>
                <p className="text-slate-400 text-xs mt-1">≈ 30% des Nettogewinns</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Optimistisch</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(result.recommendations.optimistic)}<span className="text-sm font-normal text-slate-400">/Monat</span></p>
                <p className="text-slate-500 text-xs mt-1">≈ 25% des Nettogewinns</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-slate-800/60 rounded-xl">
              <p className="text-slate-300 text-sm">
                Geschätzter Anteil zurücklegen:{' '}
                <strong className="text-indigo-400">{result.recommendations.setAsidePercentage}%</strong>
                {' '}deines Nettogewinns — basierend auf der berechneten Gesamtsteuerbelastung.
              </p>
            </div>
          </div>

          {/* Data note */}
          <div className="text-center text-slate-500 text-xs pb-4">
            Basiert auf {result.invoiceCount} Rechnungen und {result.expenseCount} Ausgaben für das Jahr {selectedYear}.
            {selectedYear === currentYear && ` (${result.monthsElapsed} Monate erfasst)`}
          </div>
        </div>
      )}
    </div>
  );
}
