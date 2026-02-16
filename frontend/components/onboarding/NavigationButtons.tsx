'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

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
    <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t">
      {/* Back Button */}
      <div>
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Button>
        )}
      </div>

      {/* Skip + Next Buttons */}
      <div className="flex gap-3">
        {onSkip && (
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={loading}
          >
            {skipLabel}
          </Button>
        )}

        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              {nextLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
