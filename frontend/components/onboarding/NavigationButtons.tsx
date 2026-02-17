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
    <div className="flex items-center justify-between gap-6 pt-10">
      {/* Back Button */}
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-4 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all font-bold disabled:opacity-20 text-sm group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Zurück
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
          className="px-8 py-4 rounded-full text-slate-500 hover:text-slate-300 transition-all font-bold disabled:opacity-20 text-sm"
        >
          Überspringen
        </button>

        {/* Next Button */}
        <StarBorder as="div" color="#FF3366" speed="3s" thickness={2} className="rounded-full overflow-hidden">
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || loading}
            className={cn(
              "px-10 h-14 rounded-full bg-[#800040] text-white font-black tracking-tight hover:bg-[#600030] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base shadow-xl shadow-pink-900/20 group",
              loading && "cursor-wait"
            )}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>Weiter</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </StarBorder>
      </div>
    </div>
  );
}
