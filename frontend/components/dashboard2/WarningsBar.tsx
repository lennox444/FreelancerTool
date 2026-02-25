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
  } catch { }
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
          className="group flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-[1.5rem] bg-slate-900 shadow-xl shadow-slate-900/10 border border-white/5 relative overflow-hidden"
        >
          {/* Accent Glow */}
          <div className="absolute top-0 left-0 w-1 h-full bg-[#800040]" />

          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#800040]/20 flex items-center justify-center text-[#800040] shrink-0">
              <Info className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-[#E60045] uppercase tracking-widest leading-none mb-1">Intelligence Alert</p>
              <p className="text-xs font-bold text-white/90 leading-snug">
                {w.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-12 md:ml-0">
            {w.link && (
              <Link
                href={w.link}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Details
              </Link>
            )}
            <button
              onClick={() => dismiss(w.type)}
              className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/10 transition-all"
              aria-label="Verbergen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
