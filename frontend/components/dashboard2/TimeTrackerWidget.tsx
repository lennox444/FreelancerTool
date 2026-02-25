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
  const currentPause = entry.pauseStartedAt
    ? Math.floor((now - new Date(entry.pauseStartedAt).getTime()) / 1000)
    : 0;
  const workSeconds = Math.max(0, totalElapsed - entry.pauseDuration - currentPause);
  return { workSeconds, pauseSeconds: currentPause };
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

  // Recalculate every second from server timestamps — identical to time-tracking/page.tsx
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

  if (isLoading) return <div className="h-20 animate-pulse bg-slate-100 rounded-xl" />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex w-6 h-6 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm leading-tight">Zeiterfassung</h3>
            <p className="text-xs text-slate-400 truncate max-w-[140px]">
              {activeEntry
                ? (activeProject?.name ?? activeEntry.description ?? 'Kein Projekt')
                : 'Kein aktiver Timer'}
            </p>
          </div>
        </div>
        <Link href="/time-tracking" className="text-xs text-[#800040] hover:underline flex items-center gap-1 shrink-0">
          Vollansicht <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Body */}
      {activeEntry ? (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex-1 px-3 py-2.5 rounded-xl font-mono text-xl font-bold text-center tabular-nums',
              isPaused
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            )}
          >
            {fmtDuration(displayWork)}
            <span className="block text-[10px] font-sans font-medium tracking-widest opacity-60 mt-0.5">
              {isPaused ? `PAUSE ${fmtDuration(displayPause)}` : 'LÄUFT'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {isPaused ? (
              <button
                onClick={() => resumeTimer.mutate(activeEntry.id)}
                disabled={resumeTimer.isPending}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors disabled:opacity-50"
                title="Fortsetzen"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => pauseTimer.mutate(activeEntry.id)}
                disabled={pauseTimer.isPending}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors disabled:opacity-50"
                title="Pausieren"
              >
                <Pause className="w-4 h-4 fill-current" />
              </button>
            )}
            <button
              onClick={() => stopTimer.mutate(activeEntry.id)}
              disabled={stopTimer.isPending}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
              title="Stoppen & Speichern"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      ) : showStart ? (
        <div className="space-y-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#800040]/30"
          >
            <option value="">Kein Projekt</option>
            {(projects ?? []).map((p: Project) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Beschreibung (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/30"
          />
          <div className="flex gap-2">
            <button
              onClick={handleStart}
              disabled={startTimer.isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#800040] hover:bg-[#600030] text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Starten
            </button>
            <button
              onClick={() => setShowStart(false)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm transition-colors"
            >
              Abbruch
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowStart(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#800040]/40 hover:bg-slate-50 text-slate-500 hover:text-[#800040] transition-all text-sm font-medium group"
        >
          <Play className="w-4 h-4 group-hover:fill-current transition-all" />
          Timer starten
        </button>
      )}
    </div>
  );
}
