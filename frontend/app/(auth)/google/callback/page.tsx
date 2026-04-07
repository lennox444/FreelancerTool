'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from '@/lib/stores/authStore';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const isNew = searchParams.get('isNew') === 'true';

    if (!token || !refreshToken) {
      router.replace('/login');
      return;
    }

    axios
      .get<{ data: User }>(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setAuth(data.data, token, refreshToken);
        router.replace(isNew ? '/onboarding/step1' : '/dashboard');
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 text-slate-600">
        <Loader2 className="h-10 w-10 animate-spin text-[#800040]" />
        <p className="text-sm font-medium">Anmeldung wird abgeschlossen...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-10 w-10 animate-spin text-[#800040]" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
