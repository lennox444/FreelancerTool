'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`h-2 rounded-full transition-all duration-300 ${
            step === currentStep
              ? 'w-8 bg-gradient-to-r from-purple-600 to-pink-600'
              : step < currentStep
              ? 'w-2 bg-purple-500'
              : 'w-2 bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}
