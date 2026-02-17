'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ icon, label, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative p-8 rounded-[2rem] border-2 transition-all duration-300 group overflow-hidden",
        selected
          ? "border-[#800040] bg-[#800040]/10 shadow-xl shadow-pink-900/10 scale-105"
          : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
      )}
    >
      <div className="flex flex-col items-center gap-4 relative z-10">
        <span className="text-5xl transition-transform group-hover:scale-110 duration-500">{icon}</span>
        <span
          className={cn(
            "text-sm font-bold tracking-tight transition-colors",
            selected ? "text-[#FF3366]" : "text-slate-300"
          )}
        >
          {label}
        </span>
      </div>

      {selected && (
        <div className="absolute top-4 right-4 w-7 h-7 bg-[#800040] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}
