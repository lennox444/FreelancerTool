'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import { BusinessStage } from '@/lib/types';
import toast from 'react-hot-toast';

import { Sprout, Rocket, Trophy, Zap } from 'lucide-react';

const stageOptions = [
  {
    value: BusinessStage.JUST_STARTED,
    label: 'Neu',
    description: '0-6 Mon. / Start-Phase',
    icon: Sprout,
    color: 'emerald',
  },
  {
    value: BusinessStage.GROWING,
    label: 'Wachsend',
    description: '6-24 Mon. / Umsatzstabil',
    icon: Rocket,
    color: 'blue',
  },
  {
    value: BusinessStage.ESTABLISHED,
    label: 'Etabliert',
    description: '2+ Jahre / Fester Fokus',
    icon: Trophy,
    color: 'amber',
  },
  {
    value: BusinessStage.SIDE_BUSINESS,
    label: 'Nebenberuflich',
    description: 'Start neben dem Hauptjob',
    icon: Zap,
    color: 'indigo',
  },
];

export default function Step3Page() {
  const router = useRouter();
  const { profile, updateStep } = useOnboardingStore();
  const [selected, setSelected] = useState<BusinessStage | null>(
    profile?.businessStage || null
  );
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.updateStep(3, {
        businessStage: selected,
      });
      updateStep({
        businessStage: selected,
        currentStep: updatedProfile.currentStep,
      });
      router.push('/onboarding/step4');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/step4');
  };

  const handleBack = () => {
    router.push('/onboarding/step2');
  };

  return (
    <OnboardingLayout currentStep={3}>
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            In welcher Phase bist du?
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Deine Erfahrung hilft uns bei den Empfehlungen
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stageOptions.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={option.label}
              description={option.description}
              color={option.color}
              selected={selected === option.value}
              onClick={() => setSelected(option.value)}
            />
          ))}
        </div>

        <NavigationButtons
          onBack={handleBack}
          onSkip={handleSkip}
          onNext={handleNext}
          nextDisabled={!selected}
          loading={loading}
        />
      </div>
    </OnboardingLayout>
  );
}
