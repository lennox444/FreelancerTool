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
import { Sprout, TrendingUp, Trophy, Zap } from 'lucide-react';

const stageOptions = [
  {
    value: BusinessStage.JUST_STARTED,
    label: 'Gerade gestartet',
    icon: <Sprout className="w-6 h-6" />,
    description: '0-6 Monate selbstständig',
  },
  {
    value: BusinessStage.GROWING,
    label: 'Wachsend',
    icon: <TrendingUp className="w-6 h-6" />,
    description: '6-24 Monate, erste Erfolge',
  },
  {
    value: BusinessStage.ESTABLISHED,
    label: 'Etabliert',
    icon: <Trophy className="w-6 h-6" />,
    description: '2+ Jahre, stabiles Geschäft',
  },
  {
    value: BusinessStage.SIDE_BUSINESS,
    label: 'Nebentätigkeit',
    icon: <Zap className="w-6 h-6" />,
    description: 'Neben Hauptberuf',
  },
];

export default function Step3Page() {
  const router = useRouter();
  const { profile, updateStep } = useOnboardingStore();
  const [selected, setSelected] = useState<BusinessStage | null>(
    profile?.businessStage as BusinessStage || null
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-3">
            Wie lange bist du schon selbstständig?
          </h2>
          <p className="text-slate-500 text-lg">
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
          nextLabel="Weiter zu Schritt 4"
        />
      </div>
    </OnboardingLayout>
  );
}
