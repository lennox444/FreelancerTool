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
import { FileSpreadsheet, FileText, AppWindow, FileQuestion } from 'lucide-react';

const workflowOptions = [
  {
    value: CurrentWorkflow.EXCEL_SHEETS,
    label: 'Excel/Google Sheets',
    icon: <FileSpreadsheet className="w-6 h-6" />,
    description: 'Tabellen und Formeln',
  },
  {
    value: CurrentWorkflow.WORD_DOCUMENTS,
    label: 'Word/Google Docs',
    icon: <FileText className="w-6 h-6" />,
    description: 'Textdokumente und Vorlagen',
  },
  {
    value: CurrentWorkflow.OTHER_SOFTWARE,
    label: 'Andere Software',
    icon: <AppWindow className="w-6 h-6" />,
    description: 'Andere Tools oder Apps',
  },
  {
    value: CurrentWorkflow.UNORGANIZED,
    label: 'Unorganisiert',
    icon: <FileQuestion className="w-6 h-6" />,
    description: 'Noch kein festes System',
  },
];

export default function Step2Page() {
  const router = useRouter();
  const { profile, updateStep } = useOnboardingStore();
  const [selected, setSelected] = useState<CurrentWorkflow | null>(
    profile?.currentWorkflow as CurrentWorkflow || null
  );
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      const updatedProfile = await onboardingApi.updateStep(2, {
        currentWorkflow: selected,
      });
      updateStep(updatedProfile);
      router.push('/onboarding/step3');
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
      const updatedProfile = await onboardingApi.skipStep(2);
      updateStep(updatedProfile);
      router.push('/onboarding/step3');
    } catch (error) {
      console.error('Error skipping step:', error);
      toast.error('Fehler beim Überspringen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step1');
  };

  return (
    <OnboardingLayout currentStep={2}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-3">
            Wie verwaltest du aktuell deine Rechnungen?
          </h2>
          <p className="text-slate-500 text-lg">
            Wir helfen dir, von deinem bisherigen System zu migrieren
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflowOptions.map((option) => (
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
          nextLabel="Weiter zu Schritt 3"
        />
      </div>
    </OnboardingLayout>
  );
}
