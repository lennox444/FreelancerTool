'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { isCompleted, setProfile } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Auth check
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Onboarding check
    const checkOnboarding = async () => {
      try {
        const profile = await onboardingApi.getStatus();
        setProfile(profile);

        // Redirect to onboarding if not completed
        if (!profile.onboardingCompleted) {
          router.push(`/onboarding/step${profile.currentStep}`);
        }
      } catch (error) {
        console.error('Onboarding check failed:', error);
      } finally {
        setChecking(false);
      }
    };

    checkOnboarding();
  }, [mounted, isAuthenticated, router, setProfile]);

  if (!mounted || !isAuthenticated || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
