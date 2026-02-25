'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { LayoutDashboard, Users, Folder, FileText, CreditCard, LogOut, Settings, Clock, ShieldCheck, Calendar, Zap, Sparkles, ClipboardList, Receipt, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  className?: string; // Allow overriding classes for mobile
  onLinkClick?: () => void; // For closing mobile menu
}

export default function Sidebar({ className, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
    if (onLinkClick) onLinkClick();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/appointments', label: 'Termine', icon: Calendar },
    { href: '/customers', label: 'Kunden', icon: Users },
    { href: '/projects', label: 'Projekte', icon: Folder },
    { href: '/time-tracking', label: 'Zeiterfassung', icon: Clock },
    { href: '/invoices', label: 'Rechnungen', icon: FileText },
    { href: '/quotes', label: 'Angebote', icon: ClipboardList },
    { href: '/payments', label: 'Zahlungen', icon: CreditCard },
    { href: '/expenses', label: 'Ausgaben', icon: Receipt },
    { href: '/tax-assistant', label: 'Steuer-Assistent', icon: Calculator },
  ];

  const isAdmin = user?.role === UserRole.SUPER_ADMIN;

  return (
    <aside className={cn("w-64 bg-slate-900 text-white min-h-screen flex-col border-r border-slate-800 shadow-xl z-20 sticky top-0 h-screen transition-all duration-300 hidden md:flex", className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-center">
        <Link href="/dashboard" className="hover:opacity-80 transition-opacity" onClick={onLinkClick}>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="FreelanceFlow Logo"
              width={150}
              height={40}
              className="h-8 w-auto brightness-0 invert"
              priority
            />
          </div>
        </Link>
      </div>

      {/* User Info Minimal */}
      <div className="px-6 py-4 border-b border-slate-800/50">
        <p className="text-sm font-medium text-slate-200 truncate">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {user?.email}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-[#800040] text-white shadow-lg shadow-pink-900/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "scale-110")} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <div className="mt-8">
            <p className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Admin</p>
            <Link
              href="/admin"
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden mx-4",
                pathname.startsWith('/admin')
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 border border-blue-900/30"
              )}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold">Admin Portal</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Subscription Status */}
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {(user?.subscriptionPlan === 'FREE_TRIAL' || !user?.subscriptionPlan) ? 'Testversion' : 'Dein Plan'}
          </span>
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            user?.subscriptionStatus === 'ACTIVE' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
          )}>
            {user?.subscriptionStatus === 'ACTIVE' ? 'AKTIV' : 'TRIAL'}
          </span>
        </div>

        {/* Show Trial/Upgrade UI if FREE_TRIAL or NO PLAN (Legacy User Fallback) */}
        {(user?.subscriptionPlan === 'FREE_TRIAL' || !user?.subscriptionPlan) && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Verbleibend</span>
              <span className="font-bold text-white">
                {user?.trialEndsAt
                  ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                  : 14} Tage
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                style={{
                  width: `${user?.trialEndsAt
                    ? Math.min(100, Math.max(0, (Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) / 14) * 100))
                    : 100}%`
                }}
              />
            </div>

            <Link href="/settings/billing" className="group relative flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#800040] to-[#600030] hover:from-[#900048] hover:to-[#700038] text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-pink-900/20 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="relative">Upgrade auf Pro</span>
            </Link>
          </div>
        )}

        {user?.subscriptionPlan === 'PRO' && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-white">Pro Plan</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-1">
        <Link
          href="/settings"
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
            pathname.startsWith('/settings')
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">Einstellungen</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Abmelden</span>
        </button>
      </div>
    </aside>
  );
}
