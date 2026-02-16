'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import { CurrentWorkflow } from '@/lib/types';
import toast from 'react-hot-toast';

const workflowOptions = [
  {
    value: CurrentWorkflow.EXCEL_SHEETS,
    label: 'Excel/Google Sheets',
    icon: '📊',
  },
  {
    value: CurrentWorkflow.WORD_DOCUMENTS,
    label: 'Word/PDF Dokumente',
    icon: '📄',
  },
  {
    value: CurrentWorkflow.OTHER_SOFTWARE,
    label: 'Andere Software',
    icon: '💼',
  },
  {
    value: CurrentWorkflow.UNORGANIZED,
    label: 'Noch unorganisiert',
    icon: '🔄',
  },
];

export default function Step2Page() {
  const router = useRouter();
  const { profile, updateStep } = useOnboardingStore();
  const [selected, setSelected] = useState<CurrentWorkflow | null>(
    profile?.currentWorkflow || null
  );
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.updateStep(2, {
        currentWorkflow: selected,
      });
      updateStep({
        currentWorkflow: selected,
        currentStep: updatedProfile.currentStep,
      });
      router.push('/onboarding/step3');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.skipStep(2);
      updateStep({ currentStep: updatedProfile.currentStep });
      router.push('/onboarding/step3');
    } catch (error) {
      toast.error('Fehler beim Überspringen');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step1');
  };

  return (
    <OnboardingLayout currentStep={2}>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Wie organisierst du aktuell deine Rechnungen?
          </h2>
          <p className="text-gray-400">
            Das hilft uns, den Import-Prozess zu optimieren
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {workflowOptions.map((option) => (
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
