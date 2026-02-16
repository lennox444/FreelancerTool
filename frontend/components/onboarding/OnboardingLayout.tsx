'use client';

import React from 'react';
import { StepIndicator } from './StepIndicator';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Willkommen bei FreelanceFlow</h1>
          <p className="text-muted-foreground">
            Lass uns dein Dashboard optimal für dich einrichten
          </p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <div className="bg-card border rounded-xl shadow-sm p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Deine Daten sind sicher und werden nur zur Verbesserung deiner Erfahrung verwendet.
        </div>
      </div>
    </div>
  );
}
