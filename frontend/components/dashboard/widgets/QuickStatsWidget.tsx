'use client';

import { useDashboardStats } from '@/lib/hooks/useDashboard';
import {
    TrendingUp,
    FileText,
    AlertTriangle,
    ArrowUpRight,
    TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuickStatsWidget() {
    const { data: stats } = useDashboardStats();

    const statsData = [
        {
            label: 'Monatsumsatz',
            value: `$${stats?.monthRevenue?.amount || 0}`,
            change: '+12%',
            trend: 'up',
            icon: TrendingUp,
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
        },
        {
            label: 'Offene Rechnungen',
            value: `$${stats?.openInvoices?.amount || 0}`,
            count: `${stats?.openInvoices?.count || 0}`,
            icon: FileText,
            bg: 'bg-blue-50',
            text: 'text-blue-600',
        },
        {
            label: 'Überfällig',
            value: `$${stats?.overdueInvoices?.amount || 0}`,
            count: `${stats?.overdueInvoices?.count || 0}`,
            icon: AlertTriangle,
            bg: 'bg-red-50',
            text: 'text-red-600',
        },
        {
            label: 'Ausgaben',
            value: '$1,200',
            change: '-5%',
            trend: 'down',
            icon: TrendingDown,
            bg: 'bg-orange-50',
            text: 'text-orange-600',
        }
    ];

    return (
        <div className="p-6 h-full flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4 h-full">
                {statsData.map((stat, index) => (
                    <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <div className={cn("p-2 rounded-lg", stat.bg, stat.text)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            {stat.change && (
                                <div className={cn("text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                                    stat.trend === 'up' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                )}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                            <div className="text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
