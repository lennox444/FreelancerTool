'use client';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              isActive ? "w-8 bg-[#800040]" : isCompleted ? "w-2 bg-[#800040]/30" : "w-2 bg-slate-200"
            )}
          />
        );
      })}
    </div>
  );
}
