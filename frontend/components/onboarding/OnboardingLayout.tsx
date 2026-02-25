'use client';

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { StepIndicator } from './StepIndicator';
import PixelBlast from '@/components/landing/PixelBlast';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
}

const Confetti = () => {
  const colors = ['#800040', '#A00055', '#FF3366', '#500028', '#900048', '#FF6699', '#B00058'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {Array.from({ length: 140 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            top: '-10%',
            left: `${Math.random() * 100}%`,
            opacity: 1,
            scale: Math.random() * 0.5 + 0.5,
            rotate: 0,
          }}
          animate={{
            top: '110%',
            left: `${Math.random() * 100 + (Math.random() - 0.5) * 20}%`,
            opacity: 0,
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            ease: [0.23, 1, 0.32, 1],
            delay: Math.random() * 2,
          }}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: colors[i % colors.length] }}
        />
      ))}
    </div>
  );
};

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 5,
}: OnboardingLayoutProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="h-screen w-full relative isolate flex flex-col items-center justify-center p-4 md:p-6 bg-white overflow-hidden">
      {/* Confetti Trigger */}
      {currentStep === totalSteps && <Confetti />}

      {/* Interactive Background Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(128, 0, 64, 0.04), transparent 80%)`
          ),
        }}
      />

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-slate-50 overflow-hidden">
        {/* Animated Gradient Blobs - Increased vibrancy for "Bunt" feel */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#800040]/20 rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#800040]/20 rounded-full blur-[140px] animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[-5%] w-[45%] h-[45%] bg-[#FF3366]/15 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] animate-blob animation-delay-1000" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-amber-400/10 rounded-full blur-[90px] animate-blob animation-delay-3000" />

        <div className="absolute inset-0 w-full h-full opacity-40 contrast-125">
          <PixelBlast
            variant="square"
            pixelSize={5}
            color="#800040"
            patternScale={2.5}
            patternDensity={0.6}
            speed={0.2}
            enableRipples
            transparent
          />
        </div>
      </div>

      {/* Static Header / Logo */}
      <div className="absolute top-8 left-8 md:left-12 z-30">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="FreelanceFlow Logo"
            width={180}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Content Container - Compact & No Scroll */}
      <div className="relative w-full max-w-xl z-20 max-h-[90vh] flex flex-col">
        <SpotlightCard
          className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden flex-shrink"
          spotlightColor="rgba(128, 0, 64, 0.15)"
        >
          <div className="relative z-10">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut"
                }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </SpotlightCard>
      </div>

      {/* Footer minimal */}
      <div className="mt-8 text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase opacity-40">
        © {new Date().getFullYear()} FreelanceFlow Onboarding
      </div>
    </div>
  );
}
