'use client';

import { Calendar, Clock, MapPin, Video, ArrowRight } from 'lucide-react';
import { useAppointments } from '@/lib/hooks/useAppointments';
import { format, isToday, isTomorrow, parseISO, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

export default function DashboardAppointmentsWidget() {
    // Fetch appointments from start of today onwards
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: appointments, isLoading } = useAppointments({
        from: today.toISOString(),
    });

    // Filter appointments from today (start of day) onwards
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const upcomingAppointments = appointments
        ?.filter(apt => new Date(apt.startTime) >= startOfToday)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 3); // Take top 3

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-16 bg-slate-100 rounded-xl"></div>
            <div className="h-16 bg-slate-100 rounded-xl"></div>
            <div className="h-16 bg-slate-100 rounded-xl"></div>
        </div>;
    }

    if (!upcomingAppointments || upcomingAppointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">Keine anstehenden Termine</p>
                <Link href="/appointments" className="mt-2 text-sm text-[#800040] hover:underline font-semibold">
                    Termin vereinbaren
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {upcomingAppointments.map((apt) => {
                const startDate = parseISO(apt.startTime);
                let dateLabel = format(startDate, 'EEEE, d. MMM', { locale: de });
                if (isToday(startDate)) dateLabel = 'Heute';
                else if (isTomorrow(startDate)) dateLabel = 'Morgen';

                return (
                    <Link
                        key={apt.id}
                        href={`/appointments?date=${startDate.toISOString()}&id=${apt.id}`}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100 block"
                    >
                        <div className="flex flex-col items-center justify-center min-w-[50px] bg-white border border-slate-100 shadow-sm rounded-xl p-2 h-14">
                            <span className="text-xs font-bold text-slate-400 uppercase leading-none mb-1">
                                {format(startDate, 'MMM', { locale: de })}
                            </span>
                            <span className="text-lg font-bold text-[#800040] leading-none">
                                {format(startDate, 'd')}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-900 truncate pr-2 group-hover:text-[#800040] transition-colors">
                                    {apt.title}
                                </h4>
                                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {format(startDate, 'HH:mm')}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 min-w-0">
                                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                                    {apt.customer?.company || apt.customer?.name || 'Intern'}
                                </p>
                                {apt.meetingLink && (
                                    <Video className="w-3 h-3 text-blue-400" />
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
            <Link href="/appointments" className="block text-center text-xs font-semibold text-slate-400 hover:text-[#800040] mt-4 flex items-center justify-center gap-1 transition-colors">
                Alle Termine anzeigen <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    );
}
