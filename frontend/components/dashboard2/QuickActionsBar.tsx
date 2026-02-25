'use client';

import Link from 'next/link';
import StarBorder from '@/components/ui/StarBorder';
import { Plus, FileText, Folder, Users, Clock, Calendar } from 'lucide-react';

const actions = [
  { href: '/invoices?new=1', label: 'Rechnung', icon: FileText, primary: true },
  { href: '/quotes?new=1', label: 'Angebot', icon: Plus, primary: false },
  { href: '/expenses?new=1', label: 'Ausgabe', icon: Folder, primary: false },
  { href: '/customers/new', label: 'Kunde', icon: Users, primary: false },
  { href: '/time-tracking', label: 'Zeit', icon: Clock, primary: false },
  { href: '/appointments?new=1', label: 'Termin', icon: Calendar, primary: false },
];

export default function QuickActionsBar() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        if (action.primary) {
          return (
            <StarBorder key={action.href} as={Link} href={action.href} className="rounded-full" color="#ff3366" speed="3s" thickness={3}>
              <div className="px-4 h-9 bg-[#800040] hover:bg-[#600030] text-white flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                <span>{action.label}</span>
              </div>
            </StarBorder>
          );
        }
        return (
          <StarBorder key={action.href} as={Link} href={action.href} className="rounded-full" color="#cbd5e1" speed="6s">
            <div className="px-4 h-9 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center rounded-full transition-all font-medium text-sm gap-1.5 shadow-sm">
              <Icon className="w-3.5 h-3.5" />
              <span>{action.label}</span>
            </div>
          </StarBorder>
        );
      })}
    </div>
  );
}
