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
  {
    value: FreelancerVertical.DESIGNER,
    label: 'Designer',
    icon: '🎨',
    description: 'UI/UX, Grafik, Webdesign',
  },
  {
    value: FreelancerVertical.DEVELOPER,
    label: 'Developer',
    icon: '💻',
    description: 'Web, App, Software-Entwicklung',
  },
  {
    value: FreelancerVertical.CONSULTANT,
    label: 'Berater/Consultant',
    icon: '📊',
    description: 'Unternehmensberatung, Coaching',
  },
  {
    value: FreelancerVertical.MARKETING_CONTENT,
    label: 'Marketing/Content',
    icon: '📝',
    description: 'Content Creation, Social Media',
  },
  {
    value: FreelancerVertical.PHOTOGRAPHER_VIDEOGRAPHER,
    label: 'Fotograf/Videograf',
    icon: '📷',
    description: 'Fotografie, Videoproduktion',
  },
  {
    value: FreelancerVertical.OTHER,
    label: 'Andere',
    icon: '✨',
    description: 'Andere freiberufliche Tätigkeit',
  },
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
      updateStep(updatedProfile);
      router.push('/onboarding/step2');
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
      const updatedProfile = await onboardingApi.skipStep(1);
      updateStep(updatedProfile);
      router.push('/onboarding/step2');
    } catch (error) {
      console.error('Error skipping step:', error);
      toast.error('Fehler beim Überspringen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout currentStep={1}>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Was ist deine Haupttätigkeit?
          </h2>
          <p className="text-muted-foreground">
            Hilf uns, dein Dashboard optimal anzupassen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verticalOptions.map((option) => (
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
