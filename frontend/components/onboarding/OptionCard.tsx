'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  icon: string;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative p-6 rounded-lg border-2 text-left transition-all hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base mb-1">{label}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
        {selected && (
          <div className="flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg
                className="w-3 h-3 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
