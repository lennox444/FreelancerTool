'use client';

import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import StarBorder from '@/components/ui/StarBorder';

interface NavigationButtonsProps {
  onBack: (() => void) | null;
  onSkip: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function NavigationButtons({
  onBack,
  onSkip,
  onNext,
  nextDisabled = false,
  loading = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-6">
      {/* Back Button */}
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-semibold disabled:opacity-20 text-sm group border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Zurück</span>
        </button>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-4">
        {/* Skip Button */}
        <button
          type="button"
          onClick={onSkip}
          disabled={loading}
          className="px-6 py-3 rounded-xl text-slate-400 hover:text-slate-600 transition-all font-semibold disabled:opacity-20 text-sm"
        >
          Überspringen
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className={cn(
            "px-8 h-12 rounded-xl bg-[#800040] text-white font-bold tracking-tight hover:bg-[#600030] transition-all disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#800040]/20 group",
            loading && "cursor-wait"
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Weiter</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
