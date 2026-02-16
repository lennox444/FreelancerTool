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

const stageOptions = [
  {
    value: BusinessStage.JUST_STARTED,
    label: 'Gerade gestartet (0-6 Monate)',
    icon: '🌱',
  },
  {
    value: BusinessStage.GROWING,
    label: 'Wachsend (6-24 Monate)',
    icon: '🚀',
  },
  {
    value: BusinessStage.ESTABLISHED,
    label: 'Etabliert (2+ Jahre)',
    icon: '🏆',
  },
  {
    value: BusinessStage.SIDE_BUSINESS,
    label: 'Nebenberuflich',
    icon: '⚡',
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

  const handleSkip = async () => {
    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.skipStep(3);
      updateStep({ currentStep: updatedProfile.currentStep });
      router.push('/onboarding/step4');
    } catch (error) {
      toast.error('Fehler beim Überspringen');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step2');
  };

  return (
    <OnboardingLayout currentStep={3}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            In welcher Phase befindet sich dein Business?
          </h2>
          <p className="text-gray-400">
            Wir passen unsere Empfehlungen an deine Erfahrung an
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {stageOptions.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={option.label}
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
