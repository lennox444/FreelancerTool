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

import { Palette, Code2, BarChart3, PenTool, Camera, Sparkles } from 'lucide-react';

const verticalOptions = [
  { value: 'DESIGNER' as FreelancerVertical, label: 'Designer', icon: Palette, color: 'indigo' },
  { value: 'DEVELOPER' as FreelancerVertical, label: 'Developer', icon: Code2, color: 'emerald' },
  { value: 'CONSULTANT' as FreelancerVertical, label: 'Berater', icon: BarChart3, color: 'amber' },
  { value: 'MARKETING_CONTENT' as FreelancerVertical, label: 'Marketing', icon: PenTool, color: 'rose' },
  {
    value: 'PHOTOGRAPHER_VIDEOGRAPHER' as FreelancerVertical,
    label: 'Fotograf',
    icon: Camera,
    color: 'cyan',
  },
  { value: 'OTHER' as FreelancerVertical, label: 'Andere', icon: Sparkles, color: 'slate' },
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
      const updatedProfile = await onboardingApi.updateStep(1, { vertical: selected });
      updateStep({ vertical: selected, currentStep: updatedProfile.currentStep });
      router.push('/onboarding/step2');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/step2');
  };

  return (
    <OnboardingLayout currentStep={1}>
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Was ist deine Haupttätigkeit?
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Hilf uns, dein Dashboard optimal anzupassen
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {verticalOptions.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={option.label}
              color={option.color}
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
