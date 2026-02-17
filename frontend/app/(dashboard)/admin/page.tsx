'use client';

import React from 'react';
import {
    Users,
    TrendingUp,
    ShieldCheck,
    Activity,
    Server,
    Database,
    BarChart3,
    Search,
    ArrowUpRight
} from 'lucide-react';
import SpotlightCard from '@/components/ui/SpotlightCard';
import PixelBlast from '@/components/landing/PixelBlast';
import { useAuthStore } from '@/lib/stores/authStore';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function AdminPortalPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    // Basic security check (should also be in layout/middleware)
    if (user && user.role !== UserRole.SUPER_ADMIN) {
        router.push('/dashboard');
        return null;
    }

    const stats = [
        { label: 'Gesamtbenutzer', value: '124', icon: Users, color: 'text-blue-500', trend: '+12% dieser Monat' },
        { label: 'Monatlicher Umsatz', value: '12.450 €', icon: TrendingUp, color: 'text-emerald-500', trend: '+5.4% vs. Vormonat' },
        { label: 'Aktive Projekte', value: '456', icon: Activity, color: 'text-orange-500', trend: 'Stabil' },
        { label: 'Systemstatus', value: '99.9%', icon: Server, color: 'text-emerald-500', trend: 'Optimal' },
    ];

    return (
        <div className="relative isolate min-h-full p-6">
            {/* Admin Background - Blue/Indigo Theme to differentiate from Red user theme */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
                <div className="absolute inset-0 w-full h-full opacity-20">
                    <PixelBlast
                        variant="square"
                        pixelSize={6}
                        color="#2563eb"
                        patternScale={4}
                        patternDensity={0.4}
                        speed={0.15}
                        transparent
                    />
                </div>
                <div className="absolute inset-0 bg-slate-950/90" />
            </div>

            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 border border-blue-400/20">
                            <ShieldCheck className="w-9 h-9 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Admin Portal</h1>
                            <p className="text-slate-400 font-medium mt-1">Plattform-Kontrolle & SaaS Metriken</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Benutzer suchen..."
                                className="w-full pl-11 pr-4 h-12 bg-white/5 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <SpotlightCard
                            key={idx}
                            className="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] relative overflow-hidden group"
                            spotlightColor="rgba(37, 99, 235, 0.15)"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</div>
                            </div>
                            <div className="text-3xl font-black text-white">{stat.value}</div>
                            <p className="text-sm font-medium text-slate-400 mt-1">{stat.label}</p>
                        </SpotlightCard>
                    ))}
                </div>

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Management Preview */}
                    <SpotlightCard
                        className="lg:col-span-2 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem]"
                        spotlightColor="rgba(37, 99, 235, 0.1)"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                Neueste Benutzer
                            </h2>
                            <button className="text-sm text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors">
                                Alle anzeigen <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                                            U{i}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">Demo User {i}</p>
                                            <p className="text-xs text-slate-500">user{i}@example.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:block text-right">
                                            <p className="text-xs font-bold text-white">Freelancer</p>
                                            <p className="text-[10px] text-slate-500">Registriert am 16.02.</p>
                                        </div>
                                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                            <BarChart3 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>

                    {/* Infrastructure / Health */}
                    <div className="space-y-6">
                        <SpotlightCard
                            className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem]"
                            spotlightColor="rgba(99, 102, 241, 0.2)"
                        >
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-400" />
                                Datenbank
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-400 uppercase">Speicherplatz</span>
                                        <span className="text-white">64%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="w-[64%] h-full bg-indigo-500 rounded-full" />
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Backup Status</p>
                                    <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Erfolgreich vor 12 Min.
                                    </p>
                                </div>
                            </div>
                        </SpotlightCard>

                        <SpotlightCard
                            className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] relative overflow-hidden"
                            spotlightColor="rgba(37, 99, 235, 0.1)"
                        >
                            <h2 className="text-lg font-bold text-white mb-4">Support Anfragen</h2>
                            <div className="text-4xl font-black text-white">0</div>
                            <p className="text-xs text-slate-500 font-medium mt-1">Keine offenen Tickets</p>
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
