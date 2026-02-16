'use client';

import { useDashboardOverdue } from '@/lib/hooks/useDashboard';
import {
    CheckCircle2,
    AlertTriangle,
    Clock,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function RecentActivityWidget() {
    const { data: overdue } = useDashboardOverdue();

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Letzte Aktivitäten</h3>
                <Link href="/invoices" className="text-xs font-semibold text-[#800040] hover:underline flex items-center gap-1">
                    Alle anzeigen <ArrowUpRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {overdue && overdue.length > 0 ? (
                    overdue.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900 truncate max-w-[120px]">{item.customer.name}</div>
                                    <div className="text-xs text-slate-500">Überfällig: ${item.amount}</div>
                                </div>
                            </div>
                            <div className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full whitespace-nowrap">
                                {new Date(item.dueDate).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Alles erledigt!</p>
                        <p className="text-xs text-slate-500 mt-1">Keine überfälligen Aufgaben</p>
                    </div>
                )}

                {/* Mock other activities if empty or just add some for demo */}
                {(!overdue || overdue.length < 3) && (
                    <>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">Design Sprint</div>
                                    <div className="text-xs text-slate-500">In Bearbeitung</div>
                                </div>
                            </div>
                            <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Coming Soon</div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">FreelancerTool V1</div>
                                    <div className="text-xs text-slate-500">Abgeschlossen</div>
                                </div>
                            </div>
                            <div className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Erledigt</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
