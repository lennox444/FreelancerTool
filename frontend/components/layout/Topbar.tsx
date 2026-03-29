'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Bell, Settings, LogOut, ChevronDown, LayoutDashboard, Calendar, Users, Folder, Clock, FileText, ClipboardList, CreditCard, Receipt, Calculator, ShieldCheck, Plus } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { cn } from '@/lib/utils';
import GlobalSearch from '@/components/search/GlobalSearch';
import QuickActionsBar from '@/components/dashboard2/QuickActionsBar';

interface RouteMeta {
  title: string;
  icon: React.ElementType;
  desc: string;
  action?: { label: string; href: string };
}

const routeMeta: Record<string, RouteMeta> = {
  '/dashboard':    { title: 'Übersicht',       icon: LayoutDashboard, desc: 'Dein tägliches Cockpit' },
  '/appointments': { title: 'Kalender',         icon: Calendar,        desc: 'Termine & Meetings',              action: { label: 'Neuer Termin',     href: '/appointments?new=1' } },
  '/customers':    { title: 'Kunden',           icon: Users,           desc: 'Kontakte & Geschäftsbeziehungen', action: { label: 'Neuer Kunde',      href: '/customers?new=1' } },
  '/projects':     { title: 'Projekte',         icon: Folder,          desc: 'Aufträge & Fortschritt',          action: { label: 'Neues Projekt',    href: '/projects?new=1' } },
  '/time-tracking':{ title: 'Zeiterfassung',    icon: Clock,           desc: 'Stunden & Produktivität',         action: { label: 'Zeit erfassen',    href: '/time-tracking?new=1' } },
  '/invoices':     { title: 'Rechnungen',       icon: FileText,        desc: 'Erstellen & versenden',           action: { label: 'Neue Rechnung',    href: '/invoices?new=1' } },
  '/quotes':       { title: 'Angebote',         icon: ClipboardList,   desc: 'Angebote & Konversionen',         action: { label: 'Neues Angebot',    href: '/quotes?new=1' } },
  '/payments':     { title: 'Zahlungen',        icon: CreditCard,      desc: 'Einnahmen verwalten',             action: { label: 'Zahlung erfassen', href: '/payments?new=1' } },
  '/expenses':     { title: 'Ausgaben',         icon: Receipt,         desc: 'Kosten & Abonnements',            action: { label: 'Ausgabe erfassen', href: '/expenses?new=1' } },
  '/tax-assistant':{ title: 'Steuer-Assistent', icon: Calculator,      desc: 'Planen & Rücklagen bilden' },
  '/settings':     { title: 'Einstellungen',    icon: Settings,        desc: 'Account & Präferenzen' },
  '/admin':        { title: 'Admin Portal',     icon: ShieldCheck,     desc: 'Nutzerverwaltung' },
};

const TAX_YEARS = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const meta = Object.entries(routeMeta).find(([route]) => pathname.startsWith(route))?.[1];
  const title = meta?.title ?? 'FreelanceFlow';
  const TitleIcon = meta?.icon ?? null;
  const action = meta?.action ?? null;

  const isDashboard = pathname === '/dashboard';
  const isTaxAssistant = pathname.startsWith('/tax-assistant');
  const selectedTaxYear = parseInt(searchParams?.get('year') ?? String(new Date().getFullYear()));

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean).join('').toUpperCase() || 'U';

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <header className="h-14 bg-white/90 backdrop-blur-sm border-b border-zinc-100 flex items-center px-4 gap-4 shrink-0 z-10 sticky top-0">

      {/* Left: Icon + Page title + desc */}
      <div className="items-center gap-2 shrink-0 hidden md:flex">
        {TitleIcon && <TitleIcon className="w-4 h-4 text-zinc-400 shrink-0" />}
        <h2 className="text-sm font-semibold text-zinc-800 whitespace-nowrap">{title}</h2>
        {meta?.desc && (
          <>
            <span className="w-px h-3.5 bg-zinc-200 shrink-0" />
            <span className="text-xs text-zinc-400 whitespace-nowrap hidden lg:block">{meta.desc}</span>
          </>
        )}
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 flex justify-center">
        <GlobalSearch />
      </div>

      {/* Right: Context actions + Bell + User */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Dashboard: all quick-action links */}
        {isDashboard && <QuickActionsBar />}

        {/* Tax-assistant: year selector */}
        {isTaxAssistant && (
          <div className="relative">
            <select
              value={selectedTaxYear}
              onChange={e => router.replace(`/tax-assistant?year=${e.target.value}`)}
              className="h-8 pl-3 pr-7 rounded-lg border border-zinc-200 bg-white text-zinc-700 text-xs font-medium appearance-none cursor-pointer hover:bg-zinc-50 focus:outline-none focus:border-zinc-300 transition-colors"
            >
              {TAX_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>
        )}

        {/* Module primary action (all except dashboard) */}
        {!isDashboard && action && (
          <Link
            href={action.href}
            className="h-8 px-3 rounded-lg bg-[#800040] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#6b0036] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{action.label}</span>
          </Link>
        )}

        <button
          title="Benachrichtigungen"
          className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#800040] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-zinc-700 hidden lg:block max-w-[100px] truncate">
              {user?.firstName}
            </span>
            <ChevronDown className={cn('w-3.5 h-3.5 text-zinc-400 transition-transform hidden lg:block', dropdownOpen && 'rotate-180')} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-900/10 py-1 z-50">
              <div className="px-3 py-2.5 border-b border-zinc-100">
                <p className="text-sm font-semibold text-zinc-900 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                <Settings className="w-4 h-4 text-zinc-400" />
                Einstellungen
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
