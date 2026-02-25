'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen relative isolate flex flex-col items-center justify-center p-4 md:p-6 bg-slate-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-slate-50">
        {/* Animated Gradient Blobs for "Wow" effect - increased vibrancy */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#800040]/15 rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#800040]/15 rounded-full blur-[140px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[-5%] w-[45%] h-[45%] bg-[#FF3366]/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px] animate-blob" />

        <div className="absolute inset-0 w-full h-full opacity-60">
          <PixelBlast
            variant="square"
            pixelSize={5}
            color="#800040"
            patternScale={2.5}
            patternDensity={0.7}
            speed={0.2}
            enableRipples
            transparent
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,rgba(240,244,248,0.6)_100%)] pointer-events-none" />
      </div>

      {/* Header / Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute top-8 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 z-20"
      >
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image
            src="/logo.svg"
            alt="FreelanceFlow Logo"
            width={180}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </motion.div>

      {/* Content Container */}
      <div className="relative w-full max-w-xl z-10">
        <SpotlightCard
          className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden"
          spotlightColor="rgba(128, 0, 64, 0.05)"
        >
          <div className="relative z-10">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 20, y: 5, opacity: 0, scale: 0.98, rotate: -0.5 }}
                animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                exit={{ x: -20, y: -5, opacity: 0, scale: 0.98, rotate: 0.5 }}
                transition={{
                  duration: 0.4,
                  ease: [0.23, 1, 0.32, 1] // Custom ease for a premium feel
                }}
                className="mt-2"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </SpotlightCard>
      </div>

      {/* Footer minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-xs text-slate-400 font-bold tracking-widest uppercase flex flex-col items-center gap-2"
      >
        <div className="w-8 h-px bg-slate-200" />
        <span>© {new Date().getFullYear()} FreelanceFlow Onboarding</span>
      </motion.div>
    </div>
  );
}
