'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import StarBorder from '@/components/ui/StarBorder';
import { cn } from '@/lib/utils';

interface NavigationButtonsProps {
  onBack?: (() => void) | null;
  onSkip?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  loading?: boolean;
  nextLabel?: string;
  skipLabel?: string;
  backLabel?: string;
}

export function NavigationButtons({
  onBack,
  onSkip,
  onNext,
  nextDisabled = false,
  loading = false,
  nextLabel = 'Weiter',
  skipLabel = 'Überspringen',
  backLabel = 'Zurück',
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
      {/* Back Button */}
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex items-center text-slate-400 hover:text-slate-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </button>
        )}
      </div>

      {/* Skip + Next Buttons */}
      <div className="flex items-center gap-3">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            {skipLabel}
          </button>
        )}

        <div className={cn("relative transition-opacity", nextDisabled && "opacity-50 pointer-events-none")}>
          <StarBorder
            as="button"
            className="rounded-xl group"
            color="#d946ef"
            speed="4s"
            onClick={onNext}
            disabled={nextDisabled || loading}
          >
            <div className="px-6 h-12 bg-[#800040] hover:bg-[#600030] text-white flex items-center justify-center rounded-xl transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 gap-2 min-w-[140px]">
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Speichern...</span>
                </>
              ) : (
                <>
                  <span>{nextLabel}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </StarBorder>
        </div>
      </div>
    </div>
  );
}
