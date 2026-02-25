'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import toast from 'react-hot-toast';
import { CheckCircle2, Users, CreditCard, TrendingUp, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Step5Page() {
  const router = useRouter();
  const { markCompleted } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onboardingApi.complete();
      markCompleted();
      toast.success('Willkommen bei FreelanceFlow!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Fehler beim Abschließen');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await onboardingApi.skipStep(5);
      await onboardingApi.complete();
      markCompleted();
      router.push('/dashboard');
    } catch (error) {
      toast.error('Fehler beim Überspringen');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step4');
  };

  return (
    <OnboardingLayout currentStep={5}>
      <div className="space-y-6 relative py-2">
        <div className="text-center space-y-4 relative">
          <div className="flex justify-center relative scale-110 mb-4 mt-2">
            {/* Massive Success Rings - Wine Red Theme */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2 + i * 0.5, opacity: 0 }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut",
                }}
                className="absolute inset-0 bg-[#800040] rounded-full opacity-20 blur-[30px]"
              />
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-[#800040] rounded-2xl flex items-center justify-center shadow-[0_10px_40px_rgba(128,0,64,0.3)] relative z-20 border border-white/20"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
              <span className="text-[#800040]">
                Weltklasse!
              </span>
            </h2>
            <p className="text-slate-500 font-bold text-base">
              Dein Workspace ist nun vollständig bereit.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {[
            { label: 'Smart CRM', desc: 'Kunden im Griff', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
            { label: 'Pro Invoicing', desc: 'Bezahlt werden', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'Growth Tracking', desc: 'Erfolg messen', icon: TrendingUp, color: 'text-[#800040]', bg: 'bg-[#800040]/10' },
            { label: 'Auto-Workflows', desc: 'Zeit sparen', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm group/item"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover/item:scale-110 shadow-sm border border-black/5", item.bg, item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 leading-none mb-1">{item.label}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">{item.desc}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="relative pt-4"
        >
          {/* Decorative aura behind button */}
          <div className="absolute inset-0 bg-[#800040]/10 blur-[50px] rounded-full scale-75 -z-10 animate-pulse" />

          <NavigationButtons
            onBack={handleBack}
            onSkip={handleSkip}
            onNext={handleComplete}
            nextDisabled={false}
            loading={loading}
          />
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
