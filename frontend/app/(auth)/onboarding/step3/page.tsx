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
    label: 'Gerade gestartet',
    icon: '🌱',
    description: '0-6 Monate selbstständig',
  },
  {
    value: BusinessStage.GROWING,
    label: 'Wachsend',
    icon: '📈',
    description: '6-24 Monate, erste Erfolge',
  },
  {
    value: BusinessStage.ESTABLISHED,
    label: 'Etabliert',
    icon: '🏆',
    description: '2+ Jahre, stabiles Geschäft',
  },
  {
    value: BusinessStage.SIDE_BUSINESS,
    label: 'Nebentätigkeit',
    icon: '⚡',
    description: 'Neben Hauptberuf',
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
      updateStep(updatedProfile);
      router.push('/onboarding/step4');
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.skipStep(3);
      updateStep(updatedProfile);
      router.push('/onboarding/step4');
    } catch (error) {
      console.error('Error skipping step:', error);
      toast.error('Fehler beim Überspringen. Bitte versuche es erneut.');
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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Wie lange bist du schon selbstständig?
          </h2>
          <p className="text-muted-foreground">
            Hilft uns, passende Tipps und Features anzubieten
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stageOptions.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={option.label}
              description={option.description}
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
