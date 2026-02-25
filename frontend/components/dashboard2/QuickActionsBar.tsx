'use client';

import Link from 'next/link';
import StarBorder from '@/components/ui/StarBorder';
import { Plus, FileText, Folder, Users, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 text-[11px] font-black uppercase tracking-widest group",
              action.primary
                ? "bg-[#800040] text-white shadow-xl shadow-rose-900/10 hover:shadow-2xl hover:-translate-y-0.5"
                : "bg-white/80 backdrop-blur-md border border-white/40 text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-lg shadow-sm"
            )}
          >
            <Icon className={cn(
              "w-3.5 h-3.5 transition-transform group-hover:scale-110",
              action.primary ? "text-white" : "text-slate-400 group-hover:text-[#800040]"
            )} />
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
