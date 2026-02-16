'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { PartyPopper, LayoutDashboard, Rocket, ArrowLeft } from 'lucide-react';
import StarBorder from '@/components/ui/StarBorder';

export default function Step5Page() {
  const router = useRouter();
  const { markCompleted } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const handleComplete = async (createCustomer: boolean) => {
    setLoading(true);
    try {
      await onboardingApi.complete();
      markCompleted();

      if (createCustomer) {
        router.push('/customers/new');
      } else {
        router.push('/dashboard');
      }

      toast.success('Willkommen bei FreelanceFlow! 🎉');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Fehler beim Abschließen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step4');
  };

  return (
    <OnboardingLayout currentStep={5}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#800040]/10 text-[#800040]">
            <PartyPopper className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-3">
            Fast geschafft!
          </h2>
          <p className="text-slate-500 text-lg">
            Wie möchtest du starten?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Option 1: Create First Customer */}
          <button
            type="button"
            onClick={() => handleComplete(true)}
            disabled={loading}
            className="group relative w-full p-6 text-left transition-all hover:-translate-y-1 focus:outline-none"
          >
            <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:border-[#800040]/30 transition-all duration-300"></div>
            <div className="relative flex items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-[#800040]/10 flex items-center justify-center text-[#800040] group-hover:bg-[#800040] group-hover:text-white transition-colors duration-300">
                <Rocket className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#800040] transition-colors">Ersten Kunden anlegen</h3>
                <p className="text-slate-500 group-hover:text-slate-700 transition-colors">
                  Starte direkt durch und erstelle deine erste Rechnung für einen Kunden.
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Go to Dashboard */}
          <button
            type="button"
            onClick={() => handleComplete(false)}
            disabled={loading}
            className="group relative w-full p-6 text-left transition-all hover:-translate-y-1 focus:outline-none"
          >
            <div className="absolute inset-0 bg-white rounded-2xl border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:border-slate-300 transition-all duration-300"></div>
            <div className="relative flex items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">Dashboard erkunden</h3>
                <p className="text-slate-500 group-hover:text-slate-700 transition-colors">
                  Schau dich erst einmal um und lerne die Funktionen kennen.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-center">
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="flex items-center text-slate-400 hover:text-slate-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
