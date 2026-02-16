'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <div className="flex min-h-screen bg-gray-50 flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* Using Next.js Image for optimization, mimicking Sidebar logo style */}
          <img
            src="/logo.svg"
            alt="FreelanceFlow Logo"
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <Sidebar
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onLinkClick={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden pt-6">
        {children}
      </main>
    </div>
  );
}
