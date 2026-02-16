'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { LayoutDashboard, Users, FileText, CreditCard, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { href: '/customers', label: 'Kunden', icon: Users },
    { href: '/invoices', label: 'Rechnungen', icon: FileText },
    { href: '/payments', label: 'Zahlungen', icon: CreditCard },
  ];

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
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
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
