'use client';

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepIndicator({ currentStep, totalSteps = 5 }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <div className="text-sm text-muted-foreground">
        Schritt {currentStep} von {totalSteps}
      </div>
      <div className="flex gap-1.5 ml-4">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${
              i + 1 <= currentStep
                ? 'bg-primary'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
