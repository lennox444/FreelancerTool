'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center relative">
            {/* Animated Celebration Circles */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 bg-[#800040]/20 rounded-full"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              className="absolute inset-0 bg-[#800040]/10 rounded-full"
            />

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-16 h-16 bg-gradient-to-br from-[#800040] to-[#A00055] rounded-full flex items-center justify-center shadow-lg shadow-[#800040]/30 relative z-10"
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fast geschafft!</h2>
            <p className="text-slate-500 font-medium">
              Du bist bereit, mit FreelanceFlow durchzustarten
            </p>
          </motion.div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 space-y-4 relative overflow-hidden">
          <h3 className="text-lg font-bold text-slate-900 relative z-10">
            Was dich erwartet:
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {[
              'Kunden und Projekte verwalten',
              'Professionelle Rechnungen erstellen',
              'Zahlungen nachverfolgen',
              'Übersicht über dein Business behalten',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="mt-1 w-5 h-5 rounded-full bg-[#800040]/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-[#800040]" />
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <NavigationButtons
          onBack={handleBack}
          onSkip={handleSkip}
          onNext={handleComplete}
          nextDisabled={false}
          loading={loading}
        />
      </div>
    </OnboardingLayout>
  );
}
