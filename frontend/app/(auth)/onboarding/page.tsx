'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step 1
    router.push('/onboarding/step1');
  }, [router]);

  return null;
}
