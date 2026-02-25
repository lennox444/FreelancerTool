'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useActiveTimeEntry,
  useStartTimer,
  usePauseTimer,
  useResumeTimer,
  useStopTimer,
} from '@/lib/hooks/useTimeEntries';
import { useProjects } from '@/lib/hooks/useProjects';
import { Play, Pause, Square, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, TimeEntry } from '@/lib/types';

/** Exact same logic as time-tracking/page.tsx */
function computeDisplayTime(entry: TimeEntry): { workSeconds: number; pauseSeconds: number } {
  const now = Date.now();
  const startMs = new Date(entry.startTime).getTime();
  const totalElapsed = Math.floor((now - startMs) / 1000);
  const currentPauseSession = entry.pauseStartedAt
    ? Math.floor((now - new Date(entry.pauseStartedAt).getTime()) / 1000)
    : 0;

  // Work time = Total elapsed since start - (already saved pause duration + current active pause session)
  const workSeconds = Math.max(0, totalElapsed - entry.pauseDuration - currentPauseSession);

  // Pause time = already saved pause duration + current active pause session
  const totalPauseSeconds = entry.pauseDuration + currentPauseSession;

  return { workSeconds, pauseSeconds: totalPauseSeconds };
}

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function TimeTrackerWidget() {
  const { data: activeEntry, isLoading } = useActiveTimeEntry();
  const { data: projects } = useProjects({ status: 'ACTIVE' as any });
  const startTimer = useStartTimer();
  const pauseTimer = usePauseTimer();
  const resumeTimer = useResumeTimer();
  const stopTimer = useStopTimer();

  const [displayWork, setDisplayWork] = useState(0);
  const [displayPause, setDisplayPause] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [showStart, setShowStart] = useState(false);

  useEffect(() => {
    if (!activeEntry) {
      setDisplayWork(0);
      setDisplayPause(0);
      return;
    }
    const tick = () => {
      const { workSeconds, pauseSeconds } = computeDisplayTime(activeEntry);
      setDisplayWork(workSeconds);
      setDisplayPause(pauseSeconds);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  const isPaused = !!(activeEntry?.pauseStartedAt);
  const activeProject = projects?.find((p: Project) => p.id === activeEntry?.projectId);

  const handleStart = () => {
    startTimer.mutate({
      projectId: selectedProjectId || undefined,
      description: description || undefined,
    });
    setShowStart(false);
    setDescription('');
  };

  if (isLoading) return <div className="h-32 animate-pulse bg-white/5 rounded-[2rem]" />;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header Info */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400">Zeiterfassung</h3>
          </div>
          <Link href="/time-tracking" className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {activeEntry && (
          <div className="min-h-[2rem]">
            <h4 className="text-base font-bold text-slate-900 tracking-tight truncate">
              {activeProject?.name ?? activeEntry.description ?? 'Projekt ohne Name'}
            </h4>
            <p className="text-[11px] font-black text-[#800040] uppercase tracking-widest mt-0.5">
              MISSION LÄUFT...
            </p>
          </div>
        )}
      </div>

      {/* Timer Body */}
      {activeEntry ? (
        <div className="space-y-4">
          <div className={cn(
            "relative p-4 rounded-2xl border transition-all duration-500 overflow-hidden group",
            isPaused
              ? "border-amber-500/20 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.05)]"
              : "border-[#800040]/30 bg-[#800040]/5 shadow-[0_0_40px_rgba(128,0,64,0.1)]"
          )}>
            {/* Visual Pulse */}
            {!isPaused && (
              <div className="absolute top-1.5 right-3 flex gap-1 items-center">
                <div className="w-0.5 h-0.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[6px] font-black text-emerald-500/80 tracking-widest uppercase">Live</span>
              </div>
            )}

            <div className="flex flex-col items-center">
              <span className={cn(
                "text-3xl font-black tracking-tighter tabular-nums transition-colors duration-500",
                isPaused ? "text-amber-500" : "text-slate-900"
              )}>
                {fmtDuration(displayWork)}
              </span>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40 mt-1 block text-slate-500">
                {isPaused ? `Pause: ${fmtDuration(displayPause)}` : 'Vergangene Zeit'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            {isPaused ? (
              <button
                onClick={() => resumeTimer.mutate(activeEntry.id)}
                disabled={resumeTimer.isPending}
                className="h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-3 h-3 fill-current" /> Weiter
              </button>
            ) : (
              <button
                onClick={() => pauseTimer.mutate(activeEntry.id)}
                disabled={pauseTimer.isPending}
                className="h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Pause className="w-3 h-3 fill-current" /> Pause
              </button>
            )}
            <button
              onClick={() => stopTimer.mutate(activeEntry.id)}
              disabled={stopTimer.isPending}
              className="h-9 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Square className="w-3 h-3 fill-current" /> Stoppen
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Projekt wählen</p>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full h-10 rounded-lg bg-slate-50 border border-slate-100 text-slate-900 text-xs px-3 focus:ring-2 focus:ring-[#800040] outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Kein Projekt</option>
              {(projects ?? []).map((p: Project) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Beschreibung</p>
            <input
              type="text"
              placeholder="Was tust du gerade?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              className="w-full h-9 rounded-lg bg-slate-50 border border-slate-100 text-slate-900 text-xs px-3 placeholder:text-slate-300 focus:ring-2 focus:ring-[#800040] outline-none transition-all"
            />
          </div>

          <div className="flex pt-1">
            <button
              onClick={handleStart}
              disabled={startTimer.isPending}
              className="w-full h-9 rounded-lg bg-[#800040] hover:bg-[#A00055] text-white font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Timer starten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
