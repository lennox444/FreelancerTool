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
  {
    value: AcquisitionChannel.LINKEDIN,
    label: 'LinkedIn',
    icon: '💼',
    description: 'Über LinkedIn entdeckt',
  },
  {
    value: AcquisitionChannel.REDDIT,
    label: 'Reddit',
    icon: '🤖',
    description: 'Über Reddit-Community',
  },
  {
    value: AcquisitionChannel.FACEBOOK_GROUP,
    label: 'Facebook Gruppe',
    icon: '👥',
    description: 'In einer Facebook-Gruppe',
  },
  {
    value: AcquisitionChannel.REFERRAL,
    label: 'Empfehlung',
    icon: '🤝',
    description: 'Von Freunden/Kollegen empfohlen',
  },
  {
    value: AcquisitionChannel.GOOGLE_SEARCH,
    label: 'Google Suche',
    icon: '🔍',
    description: 'Über Google gefunden',
  },
  {
    value: AcquisitionChannel.OTHER,
    label: 'Andere',
    icon: '✨',
    description: 'Andere Quelle',
  },
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
      updateStep(updatedProfile);
      router.push('/onboarding/step5');
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
      const updatedProfile = await onboardingApi.skipStep(4);
      updateStep(updatedProfile);
      router.push('/onboarding/step5');
    } catch (error) {
      console.error('Error skipping step:', error);
      toast.error('Fehler beim Überspringen. Bitte versuche es erneut.');
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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Wie hast du von FreelanceFlow erfahren?
          </h2>
          <p className="text-muted-foreground">
            Hilf uns zu verstehen, wo wir dich erreicht haben
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channelOptions.map((option) => (
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
