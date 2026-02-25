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

import { FileSpreadsheet, FileText, Monitor, HelpCircle } from 'lucide-react';

const workflowOptions = [
  {
    value: CurrentWorkflow.EXCEL_SHEETS,
    label: 'Excel/Sheets',
    icon: FileSpreadsheet,
    color: 'green',
  },
  {
    value: CurrentWorkflow.WORD_DOCUMENTS,
    label: 'Word/PDF',
    icon: FileText,
    color: 'blue',
  },
  {
    value: CurrentWorkflow.OTHER_SOFTWARE,
    label: 'Andere Software',
    icon: Monitor,
    color: 'purple',
  },
  {
    value: CurrentWorkflow.UNORGANIZED,
    label: 'Noch unorganisiert',
    icon: HelpCircle,
    color: 'slate',
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

  const handleSkip = () => {
    router.push('/onboarding/step3');
  };

  const handleBack = () => {
    router.push('/onboarding/step1');
  };

  return (
    <OnboardingLayout currentStep={2}>
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Wie organisierst du dich aktuell?
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Hilf uns den Import-Prozess zu optimieren
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {workflowOptions.map((option) => (
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
