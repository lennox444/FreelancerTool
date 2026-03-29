'use client';

import Link from 'next/link';
import { FileText, Receipt, Users, Clock, Calendar, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  { href: '/invoices?new=1',  label: 'Rechnung',  icon: FileText,      primary: true },
  { href: '/quotes?new=1',    label: 'Angebot',   icon: ClipboardList, primary: false },
  { href: '/expenses?new=1',  label: 'Ausgabe',   icon: Receipt,       primary: false },
  { href: '/customers/new',   label: 'Kunde',     icon: Users,         primary: false },
  { href: '/time-tracking',   label: 'Zeit',      icon: Clock,         primary: false },
  { href: '/appointments?new=1', label: 'Termin', icon: Calendar,      primary: false },
];

export default function QuickActionsBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors',
              action.primary
                ? 'bg-[#800040] text-white hover:bg-[#6b0036]'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
