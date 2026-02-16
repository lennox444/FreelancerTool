'use client';

import React from 'react';
import { StepIndicator } from './StepIndicator';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';
import Image from 'next/image';
import Link from 'next/link';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps?: number;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 5,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden isolate py-12 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 w-full h-full opacity-40">
          <PixelBlast
            variant="square"
            pixelSize={6}
            color="#800040"
            patternScale={4}
            patternDensity={0.5}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            speed={0.2}
            transparent
          />
        </div>
        {/* Soft Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)] pointer-events-none" />
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center relative z-10">
        <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="FreelanceFlow Logo"
              width={180}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
        </Link>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <SpotlightCard
          className="w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-6 md:p-10"
          spotlightColor="rgba(128, 0, 64, 0.15)"
        >
          {children}
        </SpotlightCard>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} FreelanceFlow
        </div>
      </div>
    </div>
  );
}
