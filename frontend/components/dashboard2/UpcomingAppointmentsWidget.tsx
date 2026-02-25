'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';
import { Calendar, ArrowRight, Video, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Appointment } from '@/lib/types';

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

function isToday(d: string) {
  const date = new Date(d);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isTomorrow(d: string) {
  const date = new Date(d);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

function dayLabel(d: string) {
  if (isToday(d)) return 'Heute';
  if (isTomorrow(d)) return 'Morgen';
  return fmtDate(d);
}

export default function UpcomingAppointmentsWidget() {
  const now = new Date().toISOString();
  const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['dashboard2', 'appointments'],
    queryFn: () => appointmentsApi.getAll({ from: now, to: in30days }),
    staleTime: 5 * 60 * 1000,
  });

  const upcoming = (appointments ?? [])
    .filter((a: Appointment) => new Date(a.startTime) > new Date())
    .sort((a: Appointment, b: Appointment) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Einsatzplan</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Nächste 30 Tage</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-2xl" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Keine Einsätze</p>
            <Link href="/appointments/new" className="text-[11px] font-black text-[#800040] uppercase tracking-tighter hover:underline mt-1 block">
              Einsatz planen →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((appt: Appointment) => {
            const today = isToday(appt.startTime);
            return (
              <Link
                key={appt.id}
                href={`/appointments/${appt.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 group overflow-hidden relative",
                  today
                    ? "bg-white border-[#800040]/30 shadow-lg shadow-rose-900/5"
                    : "bg-slate-50/30 border-white hover:bg-white hover:border-slate-100 hover:shadow-md"
                )}
              >
                {/* Visual Accent */}
                {today && <div className="absolute top-0 left-0 w-1 h-full bg-[#800040]" />}

                <div className="flex flex-col items-center justify-center min-w-[45px] py-0.5 border-r border-slate-100 pr-3">
                  <p className={cn("text-[11px] font-black uppercase tracking-tighter", today ? 'text-[#800040]' : 'text-slate-400')}>
                    {dayLabel(appt.startTime)}
                  </p>
                  <p className="text-sm font-black text-slate-900 tabular-nums">{fmtTime(appt.startTime)}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate tracking-tight group-hover:text-[#800040] transition-colors uppercase italic">
                    {appt.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 opacity-60">
                    <p className="text-[10px] font-bold text-slate-500 truncate">{appt.contactName || 'Kein Kontakt'}</p>
                    {appt.meetingLink && (
                      <div className="flex items-center gap-1 text-[#800040]">
                        <Video className="w-2.5 h-2.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}

          <Link href="/appointments" className="flex items-center justify-center gap-2 py-3 mt-4 text-[11px] font-black text-slate-400 hover:text-[#800040] transition-all uppercase tracking-[0.2em] border-2 border-dashed border-slate-100 rounded-2xl hover:border-[#800040]/30 hover:bg-[#800040]/5">
            Zum Kalender <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
