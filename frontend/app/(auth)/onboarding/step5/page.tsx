'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';

export default function Step5Page() {
  const router = useRouter();
  const { markCompleted } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onboardingApi.complete();
      markCompleted();
      toast.success('Willkommen bei FreelanceFlow!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Fehler beim Abschließen');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await onboardingApi.skipStep(5);
      await onboardingApi.complete();
      markCompleted();
      router.push('/dashboard');
    } catch (error) {
      toast.error('Fehler beim Überspringen');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step4');
  };

  return (
    <OnboardingLayout currentStep={5}>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">Fast geschafft!</h2>
          <p className="text-gray-400 text-lg">
            Du bist bereit, mit FreelanceFlow durchzustarten
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">
            Was dich erwartet:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">
                Kunden und Projekte verwalten
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">
                Professionelle Rechnungen erstellen
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">
                Zahlungen nachverfolgen
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">
                Übersicht über dein Business behalten
              </span>
            </li>
          </ul>
        </div>

        <NavigationButtons
          onBack={handleBack}
          onSkip={handleSkip}
          onNext={handleComplete}
          nextDisabled={false}
          loading={loading}
        />
      </div>
    </OnboardingLayout>
  );
}
