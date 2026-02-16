'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import { AcquisitionChannel } from '@/lib/types';
import toast from 'react-hot-toast';

const channelOptions = [
  { value: AcquisitionChannel.LINKEDIN, label: 'LinkedIn', icon: '💼' },
  { value: AcquisitionChannel.REDDIT, label: 'Reddit', icon: '🤖' },
  {
    value: AcquisitionChannel.FACEBOOK_GROUP,
    label: 'Facebook Gruppe',
    icon: '👥',
  },
  { value: AcquisitionChannel.REFERRAL, label: 'Empfehlung', icon: '🤝' },
  {
    value: AcquisitionChannel.GOOGLE_SEARCH,
    label: 'Google Suche',
    icon: '🔍',
  },
  { value: AcquisitionChannel.OTHER, label: 'Andere', icon: '✨' },
];

export default function Step4Page() {
  const router = useRouter();
  const { profile, updateStep } = useOnboardingStore();
  const [selected, setSelected] = useState<AcquisitionChannel | null>(
    profile?.acquisitionChannel || null
  );
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.updateStep(4, {
        acquisitionChannel: selected,
      });
      updateStep({
        acquisitionChannel: selected,
        currentStep: updatedProfile.currentStep,
      });
      router.push('/onboarding/step5');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.skipStep(4);
      updateStep({ currentStep: updatedProfile.currentStep });
      router.push('/onboarding/step5');
    } catch (error) {
      toast.error('Fehler beim Überspringen');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step3');
  };

  return (
    <OnboardingLayout currentStep={4}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Wie hast du von FreelanceFlow erfahren?
          </h2>
          <p className="text-gray-400">
            Hilf uns zu verstehen, wo unsere Community ist
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {channelOptions.map((option) => (
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
