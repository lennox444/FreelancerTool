'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { NavigationButtons } from '@/components/onboarding/NavigationButtons';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { PartyPopper, LayoutDashboard } from 'lucide-react';

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
        // Redirect to customer creation
        router.push('/customers/new');
      } else {
        // Redirect to dashboard
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
      <div className="space-y-8">
        <div className="text-center mb-8">
          <div className="mb-4">
            <PartyPopper className="w-16 h-16 mx-auto text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Fast geschafft!</h2>
          <p className="text-muted-foreground text-lg">
            Wie möchtest du starten?
          </p>
        </div>

        <div className="space-y-4">
          {/* Option 1: Create First Customer */}
          <button
            type="button"
            onClick={() => handleComplete(true)}
            disabled={loading}
            className="w-full p-6 rounded-lg border-2 border-primary bg-primary/5 text-left transition-all hover:shadow-md hover:border-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">
                  Ersten Kunden anlegen
                </h3>
                <p className="text-muted-foreground">
                  Starte direkt mit deinem ersten Kunden und erstelle deine
                  erste Rechnung
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Go to Dashboard */}
          <button
            type="button"
            onClick={() => handleComplete(false)}
            disabled={loading}
            className="w-full p-6 rounded-lg border-2 border-border bg-card text-left transition-all hover:shadow-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">
                  Dashboard erkunden
                </h3>
                <p className="text-muted-foreground">
                  Erst mal umschauen und das Dashboard kennenlernen
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={loading}
          >
            Zurück
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
