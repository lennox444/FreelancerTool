import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface DashboardStatsCardProps {
    title: string;
    value: string;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    icon: React.ElementType;
    iconColor?: string;
    description?: string;
    href?: string;
}

export default function DashboardStatsCard({
    title,
    value,
    trend,
    icon: Icon,
    iconColor = "text-slate-600",
    description,
    href,
}: DashboardStatsCardProps) {
    const CardContent = (
        <SpotlightCard
            className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl flex flex-col justify-between h-full hover:shadow-md transition-all group cursor-pointer"
            spotlightColor="rgba(128, 0, 64, 0.05)"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl bg-slate-50 group-hover:bg-pink-50 transition-colors", iconColor)}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full",
                        trend.positive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                    )}>
                        {trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{value}</h3>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                {description && (
                    <p className="text-xs text-slate-400 font-medium">{description}</p>
                )}
            </div>
        </SpotlightCard>
    );

    if (href) {
        return <Link href={href} className="block h-full">{CardContent}</Link>;
    }

    return CardContent;
}
