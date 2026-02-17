'use client';

import { ReactNode } from 'react';
import { StepIndicator } from './StepIndicator';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 5,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen relative isolate flex items-center justify-center p-4">
      {/* Premium Background with PixelBlast */}
      <div className="fixed inset-0 -z-10 bg-slate-950">
        <div className="absolute inset-0 w-full h-full opacity-20">
          <PixelBlast
            variant="square"
            pixelSize={6}
            color="#800040"
            patternScale={4}
            patternDensity={0.5}
            speed={0.2}
            enableRipples
            transparent
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(128,0,64,0.1)_0%,transparent_70%)] pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative w-full max-w-2xl animate-in fade-in zoom-in duration-500">
        <SpotlightCard
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
          spotlightColor="rgba(128, 0, 64, 0.15)"
        >
          <div className="relative z-10">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
            <div className="mt-8 text-white">
              {children}
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
