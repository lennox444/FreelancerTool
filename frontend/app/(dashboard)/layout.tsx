'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { onboardingApi } from '@/lib/api/onboarding';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { UserRole } from '@/lib/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { isCompleted, setProfile } = useOnboardingStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored === 'true') setIsCollapsed(true);
  }, []);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && typeof window !== 'undefined') {
      const isTrialExpired =
        user.subscriptionPlan === 'FREE_TRIAL' &&
        user.trialEndsAt &&
        new Date(user.trialEndsAt) < new Date();

      const currentPath = window.location.pathname;
      const isBillingPage = currentPath.includes('/settings/billing');
      const isExpiredPage = currentPath.includes('/subscription-expired');

      if (isTrialExpired && !isBillingPage && !isExpiredPage) {
        console.log('[Trial Check] Trial expired. Redirecting to /subscription-expired');
        router.push('/subscription-expired');
        return;
      }
    }

    if (user?.role === UserRole.SUPER_ADMIN) {
      setChecking(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const profile = await onboardingApi.getStatus();
        setProfile(profile);

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
  }, [mounted, isAuthenticated, router, setProfile, user?.role, user?.subscriptionPlan, user?.trialEndsAt]);

  if (!mounted || !isAuthenticated || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-2 border-[#800040]/30 border-t-[#800040] rounded-full animate-spin" />
      </div>
    );
  }

  const isTrialExpired =
    user?.subscriptionPlan === 'FREE_TRIAL' &&
    user?.trialEndsAt &&
    new Date(user.trialEndsAt) < new Date();

  if (isTrialExpired && typeof window !== 'undefined' && window.location.pathname.includes('/settings/billing')) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar
        className="hidden md:flex"
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
      />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="FreelanceFlow Logo"
            className="h-7 w-auto brightness-0 invert"
          />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
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

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <div className="hidden md:block">
          <Topbar />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
