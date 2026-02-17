'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`h-2 rounded-full transition-all duration-500 shadow-sm ${step === currentStep
              ? 'w-10 bg-[#800040]'
              : step < currentStep
                ? 'w-3 bg-[#800040]/60'
                : 'w-3 bg-white/10'
            }`}
        />
      ))}
    </div>
  );
}
