'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Info, X } from 'lucide-react';
import type { WarningSignal } from '@/lib/types';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'dashboard2:dismissed_warnings';

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveDismissed(keys: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {}
}

interface WarningsBarProps {
  warnings: WarningSignal[];
}

export default function WarningsBar({ warnings }: WarningsBarProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDismissed(getDismissed());
    setMounted(true);
  }, []);

  // Wait until mounted to avoid hydration mismatch
  if (!mounted) return null;

  const visible = warnings.filter((w) => !dismissed.includes(w.type));
  if (visible.length === 0) return null;

  const dismiss = (type: string) => {
    const next = [...dismissed, type];
    setDismissed(next);
    saveDismissed(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {visible.map((w) => (
        <div
          key={w.type}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-50 border border-blue-200 text-blue-800"
        >
          <Info className="w-4 h-4 shrink-0 text-blue-500" />
          <span className="flex-1">
            {w.message}
            {w.link && (
              <Link href={w.link} className="ml-2 underline underline-offset-2 hover:opacity-80">
                Jetzt ansehen →
              </Link>
            )}
          </span>
          <button
            onClick={() => dismiss(w.type)}
            className="shrink-0 ml-1 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
