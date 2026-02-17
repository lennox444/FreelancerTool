'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from 'recharts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface RevenueData {
    date: string; // ISO string or formatted date string
    value: number;
}

interface DashboardChartProps {
    data: RevenueData[];
    type?: 'area' | 'bar';
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-xl p-3 text-sm">
                <p className="font-bold text-slate-800 mb-1">
                    {label}
                </p>
                <p className="text-[#800040] font-semibold">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardChart({ data, type = 'area' }: DashboardChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm font-medium">
                Keine Daten verfügbar
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
            <ResponsiveContainer>
                {type === 'area' ? (
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#800040" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#800040" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str: string) => str.split(' ')[0]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(num: number) => `${(num / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#800040"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#800040' }}
                        />
                    </AreaChart>
                ) : (
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str: string) => str.split(' ')[0]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(num: number) => `${(num / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12, fill: '#94a3b8' }}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={'#800040'} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
