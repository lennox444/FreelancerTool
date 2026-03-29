'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  LayoutDashboard, Users, Folder, FileText, CreditCard, LogOut, Settings,
  Clock, ShieldCheck, Calendar, Zap, ClipboardList, Receipt, Calculator,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  className?: string;
  onLinkClick?: () => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/appointments', label: 'Kalender', icon: Calendar },
  { href: '/customers', label: 'Kunden', icon: Users },
  { href: '/projects', label: 'Projekte', icon: Folder },
  { href: '/time-tracking', label: 'Zeiterfassung', icon: Clock },
  { href: '/invoices', label: 'Rechnungen', icon: FileText },
  { href: '/quotes', label: 'Angebote', icon: ClipboardList },
  { href: '/payments', label: 'Zahlungen', icon: CreditCard },
  { href: '/expenses', label: 'Ausgaben', icon: Receipt },
  { href: '/tax-assistant', label: 'Steuer-Assistent', icon: Calculator },
];

// Shared label fade style
const labelCls = (collapsed: boolean) =>
  cn(
    'overflow-hidden whitespace-nowrap transition-[opacity,max-width] ease-in-out',
    collapsed
      ? 'opacity-0 max-w-0 duration-150'
      : 'opacity-100 max-w-[180px] duration-250'
  );

export default function Sidebar({ className, onLinkClick, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
    if (onLinkClick) onLinkClick();
  };

  const isAdmin = user?.role === UserRole.SUPER_ADMIN;

  const trialDays = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : 14;
  const trialPct = Math.min(100, Math.max(0, (trialDays / 14) * 100));
  const isTrial = user?.subscriptionPlan === 'FREE_TRIAL' || !user?.subscriptionPlan;

  return (
    <aside
      className={cn(
        'bg-slate-900 text-white flex-col border-r border-slate-800 z-20 sticky top-0 h-screen',
        'transition-[width] duration-300 ease-in-out',
        'hidden md:flex overflow-hidden',
        isCollapsed ? 'w-14' : 'w-64',
        className
      )}
    >
      {/* ── Header ── */}
      <div className="border-b border-slate-800 flex items-center h-14 shrink-0 px-3">
        {/* Logo fades out smoothly */}
        <Link
          href="/dashboard"
          onClick={onLinkClick}
          className={cn(
            'flex-1 min-w-0 transition-[opacity,max-width] ease-in-out',
            isCollapsed ? 'opacity-0 max-w-0 pointer-events-none duration-150' : 'opacity-100 max-w-full duration-250'
          )}
        >
          <Image
            src="/logo.svg"
            alt="FreelanceFlow"
            width={130}
            height={32}
            className="h-7 w-auto brightness-0 invert"
            priority
          />
        </Link>

        {onToggle && (
          <div className={cn('shrink-0', isCollapsed ? 'w-full flex justify-center' : '')}>
            <button
              onClick={onToggle}
              className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title={isCollapsed ? 'Ausklappen' : 'Einklappen'}
            >
              {isCollapsed
                ? <PanelLeftOpen className="w-4 h-4" />
                : <PanelLeftClose className="w-4 h-4" />
              }
            </button>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href} className="relative group/nav">
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center py-2.5 rounded-lg relative',
                    'transition-[background-color,color,padding] duration-150',
                    isCollapsed ? 'justify-center px-0 mx-1 gap-0' : 'px-3 gap-3',
                    isActive
                      ? 'bg-[#800040]/90 text-white'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className={cn('font-medium text-sm', labelCls(isCollapsed))}>
                    {item.label}
                  </span>
                </Link>

                {/* Tooltip – only in collapsed mode */}
                <div className={cn(
                  'absolute left-full top-1/2 -translate-y-1/2 ml-3',
                  'px-2.5 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg',
                  'whitespace-nowrap pointer-events-none shadow-lg border border-zinc-700 z-50',
                  'opacity-0 transition-opacity duration-150',
                  isCollapsed ? 'group-hover/nav:opacity-100' : 'group-hover/nav:opacity-0'
                )}>
                  {item.label}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Admin */}
        {isAdmin && (
          <div className="mt-6">
            <p className={cn(
              'text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1',
              labelCls(isCollapsed)
            )}>
              Platform Admin
            </p>
            <div className="relative group/nav">
              <Link
                href="/admin"
                onClick={onLinkClick}
                className={cn(
                  'flex items-center py-2.5 rounded-lg',
                  'transition-[background-color,color,padding] duration-150',
                  isCollapsed ? 'justify-center px-0 mx-1 gap-0' : 'px-3 gap-3',
                  pathname.startsWith('/admin')
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300'
                )}
              >
                <ShieldCheck className="w-[18px] h-[18px] shrink-0" />
                <span className={cn('font-semibold text-sm', labelCls(isCollapsed))}>
                  Admin Portal
                </span>
              </Link>
              <div className={cn(
                'absolute left-full top-1/2 -translate-y-1/2 ml-3',
                'px-2.5 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg',
                'whitespace-nowrap pointer-events-none shadow-lg border border-zinc-700 z-50',
                'opacity-0 transition-opacity duration-150',
                isCollapsed ? 'group-hover/nav:opacity-100' : 'group-hover/nav:opacity-0'
              )}>
                Admin Portal
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Subscription Card ── */}
      <div className={cn(
        'transition-[margin,padding,opacity] duration-300 ease-in-out shrink-0',
        isCollapsed
          ? 'flex justify-center py-3 border-t border-slate-800/50 opacity-70'
          : 'mx-3 mb-3 p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40 opacity-100'
      )}>
        {isCollapsed ? (
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${isTrial ? 'bg-amber-400' : 'bg-emerald-500'}`}
            title={isTrial ? 'Testversion' : 'Pro Plan'}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {isTrial ? 'Testversion' : 'Dein Plan'}
              </span>
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                user?.subscriptionStatus === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              )}>
                {user?.subscriptionStatus === 'ACTIVE' ? 'AKTIV' : 'TRIAL'}
              </span>
            </div>

            {isTrial && (
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Verbleibend</span>
                  <span className="font-bold text-white">{trialDays} Tage</span>
                </div>
                <div className="h-1 w-full bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#800040] to-rose-500 rounded-full transition-all"
                    style={{ width: `${trialPct}%` }}
                  />
                </div>
                <Link
                  href="/settings/billing"
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#800040] hover:bg-[#900048] text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  Upgrade auf Pro
                </Link>
              </div>
            )}

            {user?.subscriptionPlan === 'PRO' && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-white">Pro Plan</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-slate-800 p-2 space-y-0.5 shrink-0">
        {/* Settings */}
        <div className="relative group/nav">
          <Link
            href="/settings"
            onClick={onLinkClick}
            className={cn(
              'flex items-center py-2.5 rounded-lg',
              'transition-[background-color,color,padding] duration-150',
              isCollapsed ? 'justify-center px-0 mx-1 gap-0' : 'px-3 gap-3',
              pathname.startsWith('/settings')
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            )}
          >
            <Settings className="w-[18px] h-[18px] shrink-0 group-hover:rotate-90 transition-transform duration-300" />
            <span className={cn('font-medium text-sm', labelCls(isCollapsed))}>
              Einstellungen
            </span>
          </Link>
          <div className={cn(
            'absolute left-full top-1/2 -translate-y-1/2 ml-3',
            'px-2.5 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg',
            'whitespace-nowrap pointer-events-none shadow-lg border border-zinc-700 z-50',
            'opacity-0 transition-opacity duration-150',
            isCollapsed ? 'group-hover/nav:opacity-100' : 'group-hover/nav:opacity-0'
          )}>
            Einstellungen
          </div>
        </div>

        {/* Logout */}
        <div className="relative group/nav">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center w-full py-2.5 rounded-lg',
              'transition-[background-color,color,padding] duration-150',
              'text-slate-400 hover:bg-slate-800/60 hover:text-white',
              isCollapsed ? 'justify-center px-0 mx-1 gap-0' : 'px-3 gap-3'
            )}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span className={cn('font-medium text-sm', labelCls(isCollapsed))}>
              Abmelden
            </span>
          </button>
          <div className={cn(
            'absolute left-full top-1/2 -translate-y-1/2 ml-3',
            'px-2.5 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-lg',
            'whitespace-nowrap pointer-events-none shadow-lg border border-zinc-700 z-50',
            'opacity-0 transition-opacity duration-150',
            isCollapsed ? 'group-hover/nav:opacity-100' : 'group-hover/nav:opacity-0'
          )}>
            Abmelden
          </div>
        </div>
      </div>
    </aside>
  );
}
