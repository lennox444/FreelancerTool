'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';
import { Calendar, ArrowRight, Video, MapPin } from 'lucide-react';
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
    .slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex w-6 h-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Calendar className="w-3.5 h-3.5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">Nächste Termine</h3>
            <p className="text-xs text-slate-400">Kommende 30 Tage</p>
          </div>
        </div>
        <Link href="/appointments" className="text-xs text-[#800040] hover:underline flex items-center gap-1 shrink-0">
          Alle <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
          <Calendar className="w-8 h-8 opacity-30" />
          <p className="text-sm">Keine Termine geplant</p>
          <Link href="/appointments/new" className="text-xs text-[#800040] hover:underline">
            Termin anlegen →
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {upcoming.map((appt: Appointment) => (
            <Link
              key={appt.id}
              href={`/appointments/${appt.id}`}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#800040] shrink-0 mt-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#800040] transition-colors">
                  {appt.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-500">
                    {dayLabel(appt.startTime)}, {fmtTime(appt.startTime)}
                  </span>
                  {appt.meetingLink && <Video className="w-3 h-3 text-slate-400" />}
                  {appt.contactName && (
                    <span className="text-xs text-slate-400 truncate">{appt.contactName}</span>
                  )}
                </div>
              </div>
              {isToday(appt.startTime) && (
                <span className="shrink-0 text-[10px] font-bold bg-[#800040] text-white px-1.5 py-0.5 rounded-full">
                  HEUTE
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
