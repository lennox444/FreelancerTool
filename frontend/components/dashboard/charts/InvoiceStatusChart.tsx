'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface InvoiceStatusData {
    name: string;
    value: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Green, Yellow, Red

const mockData: InvoiceStatusData[] = [
    { name: 'Bezahlt', value: 400 },
    { name: 'Offen', value: 300 },
    { name: 'Überfällig', value: 100 },
];

export default function InvoiceStatusChart({ data = mockData, className }: { data?: any[]; className?: string }) {
    return (
        <div className={`w-full h-[300px] ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#800040"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`${value}`, 'Anzahl']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    />
                    <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        wrapperStyle={{ paddingLeft: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
