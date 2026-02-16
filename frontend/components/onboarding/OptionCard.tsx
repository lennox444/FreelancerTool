'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface OptionCardProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function OptionCard({
  icon,
  label,
  description,
  selected,
  onClick,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full p-4 lg:p-6 rounded-xl border text-left transition-all duration-200 group flex items-center gap-4 hover:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-[#800040] focus:ring-offset-2',
        selected
          ? 'border-[#800040] bg-[#800040]/5 shadow-md shadow-[#800040]/10'
          : 'border-slate-200 bg-white hover:border-[#800040]/30 hover:bg-slate-50',
        className
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
        selected ? "bg-[#800040]/10 text-[#800040]" : "bg-slate-100 text-slate-500 group-hover:bg-[#800040]/5 group-hover:text-[#800040]"
      )}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn("font-semibold text-base mb-1", selected ? "text-[#800040]" : "text-slate-900")}>
          {label}
        </div>
        {description && (
          <div className="text-sm text-slate-500 line-clamp-2">{description}</div>
        )}
      </div>

      <div className={cn(
        "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all",
        selected ? "bg-[#800040] border-[#800040]" : "border-slate-300 bg-transparent group-hover:border-[#800040]/50"
      )}>
        {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
