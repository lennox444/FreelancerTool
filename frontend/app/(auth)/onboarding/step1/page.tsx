'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import { FreelancerVertical } from '@/lib/types';
import toast from 'react-hot-toast';

const verticalOptions = [
  { value: FreelancerVertical.DESIGNER, label: 'Designer', icon: '🎨' },
  { value: FreelancerVertical.DEVELOPER, label: 'Developer', icon: '💻' },
  { value: FreelancerVertical.CONSULTANT, label: 'Berater/Consultant', icon: '📊' },
  { value: FreelancerVertical.MARKETING_CONTENT, label: 'Marketing/Content', icon: '📝' },
  {
    value: FreelancerVertical.PHOTOGRAPHER_VIDEOGRAPHER,
    label: 'Fotograf/Videograf',
    icon: '📷',
  },
  { value: FreelancerVertical.OTHER, label: 'Andere', icon: '✨' },
];

export default function Step1Page() {
  const router = useRouter();
  const { profile, updateStep } = useOnboardingStore();
  const [selected, setSelected] = useState<FreelancerVertical | null>(
    profile?.vertical || null
  );
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.updateStep(1, {
        vertical: selected,
      });
      updateStep({ vertical: selected, currentStep: updatedProfile.currentStep });
      router.push('/onboarding/step2');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.skipStep(1);
      updateStep({ currentStep: updatedProfile.currentStep });
      router.push('/onboarding/step2');
    } catch (error) {
      toast.error('Fehler beim Überspringen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout currentStep={1}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Was ist deine Haupttätigkeit?
          </h2>
          <p className="text-gray-400">
            Hilf uns, dein Dashboard optimal anzupassen
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {verticalOptions.map((option) => (
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
          onBack={null}
          onSkip={handleSkip}
          onNext={handleNext}
          nextDisabled={!selected}
          loading={loading}
        />
      </div>
    </OnboardingLayout>
  );
}
