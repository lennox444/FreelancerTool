'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Clock,
    Timer,
    History,
    Play,
    Plus,
    Square,
    Pause,
    Trash2,
    Edit2,
    ChevronRight,
} from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useTimeEntries,
    useActiveTimeEntry,
    useStartTimer,
    usePauseTimer,
    useResumeTimer,
    useStopTimer,
    useCreateTimeEntry,
    useUpdateTimeEntry,
    useDeleteTimeEntry,
} from '@/lib/hooks/useTimeEntries';
import { TimeEntry } from '@/lib/types';
import TimeEntryModal from '@/components/time-tracking/TimeEntryModal';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ─── Animation helper ─────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
    return {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { type: 'spring' as const, stiffness: 320, damping: 26, delay },
    };
}

/**
 * Compute display seconds from a server-side active entry.
 * Time is always derived from server timestamps — never from local counters.
 */
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

export default function TimeTrackingPage() {
    const searchParams = useSearchParams();

    // Display state (derived from server entry every second — never incremented locally)
    const [displayWork, setDisplayWork] = useState(0);
    const [displayPause, setDisplayPause] = useState(0);

    // UI state
    const [showModal, setShowModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [filterProjectId, setFilterProjectId] = useState('');

    useEffect(() => {
        const p = searchParams.get('projectId');
        if (p) setFilterProjectId(p);
    }, [searchParams]);

    // Server data
    const { data: activeEntry, isLoading: activeLoading } = useActiveTimeEntry();
    const { data: entries, isLoading: entriesLoading } = useTimeEntries(filterProjectId || undefined);

    // Timer mutations
    const startTimer = useStartTimer();
    const pauseTimer = usePauseTimer();
    const resumeTimer = useResumeTimer();
    const stopTimer = useStopTimer();

    // Entry mutations
    const createMutation = useCreateTimeEntry();
    const updateMutation = useUpdateTimeEntry();
    const deleteMutation = useDeleteTimeEntry();

    // ─── Recalculate display every second from server timestamps ──────
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

        tick(); // immediate update
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [activeEntry]);

    const isActive = !!activeEntry;
    const isPaused = !!(activeEntry?.pauseStartedAt);

    // ─── Timer controls ────────────────────────────────────────────────

    const handleStartTimer = async () => {
        await startTimer.mutateAsync({});
    };

    const handleTogglePause = async () => {
        if (!activeEntry) return;
        if (isPaused) {
            await resumeTimer.mutateAsync(activeEntry.id);
        } else {
            await pauseTimer.mutateAsync(activeEntry.id);
        }
    };

    const handleStopTimer = async () => {
        if (!activeEntry) return;
        await stopTimer.mutateAsync(activeEntry.id);
    };

    // ─── Formatting helpers ────────────────────────────────────────────

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) return `${hours} Std. ${minutes} Min.`;
        return `${minutes} Min.`;
    };

    // ─── Manual entry modal ────────────────────────────────────────────

    const handleModalSubmit = async (data: any) => {
        if (editingEntry) {
            await updateMutation.mutateAsync({ id: editingEntry.id, data });
        } else {
            await createMutation.mutateAsync(data);
        }
        setShowModal(false);
        setEditingEntry(null);
    };

    const handleEdit = (entry: TimeEntry) => {
        setEditingEntry(entry);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    // ─── Stats (only from finished entries) ───────────────────────────

    const todayEntries = entries?.filter(e => {
        const today = new Date();
        const entryDate = new Date(e.startTime);
        return today.toDateString() === entryDate.toDateString();
    }) || [];

    const todayWorkSeconds = todayEntries.reduce((acc, curr) => acc + curr.duration, 0);
    const weekWorkSeconds = entries?.reduce((acc, curr) => {
        const entryDate = new Date(curr.startTime);
        const diff = Date.now() - entryDate.getTime();
        if (diff < 7 * 24 * 60 * 60 * 1000) return acc + curr.duration;
        return acc;
    }, 0) || 0;

    // ─── Derived stat tiles ────────────────────────────────────────────

    const totalEntries = entries?.length ?? 0;
    const todayPct = Math.min((todayWorkSeconds / (8 * 3600)) * 100, 100);

    const statTiles = [
        {
            label: 'Heute',
            value: formatDuration(todayWorkSeconds),
            icon: Clock,
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            color: 'text-rose-600',
        },
        {
            label: 'Diese Woche',
            value: formatDuration(weekWorkSeconds),
            icon: History,
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            color: 'text-blue-600',
        },
        {
            label: 'Einträge gesamt',
            value: totalEntries.toString(),
            icon: Timer,
            bg: 'bg-violet-50',
            border: 'border-violet-100',
            color: 'text-violet-600',
        },
        {
            label: 'Tagesziel',
            value: `${Math.round(todayPct)} %`,
            icon: Play,
            bg: todayPct >= 100 ? 'bg-emerald-50' : 'bg-slate-50',
            border: todayPct >= 100 ? 'border-emerald-100' : 'border-slate-200',
            color: todayPct >= 100 ? 'text-emerald-600' : 'text-slate-600',
        },
    ];

    return (
        <div className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-6 pb-20">

            {/* ── Background ── */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#800040]/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/4 rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-20">
                    <PixelBlast
                        variant="square"
                        pixelSize={5}
                        color="#800040"
                        patternScale={5}
                        patternDensity={0.4}
                        pixelSizeJitter={0.5}
                        enableRipples
                        rippleSpeed={0.2}
                        rippleThickness={0.08}
                        speed={0.15}
                        transparent
                    />
                </div>
                <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white/80 to-slate-50/50" />
            </div>

            {/* ── Header ── */}
            <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2.5 mb-0.5 flex-wrap">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px] shadow-lg shadow-rose-900/10">
                            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                                <Clock className="w-4 h-4 text-[#800040]" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Zeiterfassung</h1>
                        {filterProjectId && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#800040]/10 text-[#800040] rounded-full text-[11px] font-black border border-[#800040]/20 uppercase tracking-wide">
                                Projektfilter aktiv
                                <button
                                    onClick={() => setFilterProjectId('')}
                                    className="hover:opacity-70 transition-opacity"
                                    title="Filter entfernen"
                                >
                                    <Square className="w-3 h-3 fill-current" />
                                </button>
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm mt-0.5">Dokumentiere deine Arbeitszeit präzise</p>
                </div>
                <StarBorder onClick={() => setShowModal(true)} color="#ff3366" speed="4s" thickness={2}>
                    <div className="px-5 h-11 flex items-center gap-2 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-900/20">
                        <Plus className="w-4 h-4" />
                        <span>Zeit erfassen</span>
                    </div>
                </StarBorder>
            </motion.div>

            {/* ── Stat Tiles ── */}
            <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statTiles.map((tile, i) => (
                    <motion.div
                        key={tile.label}
                        {...fadeUp(i * 0.04)}
                        className={cn('flex items-center gap-3 p-4 rounded-2xl border', tile.bg, tile.border)}
                    >
                        <div className={cn('p-2 rounded-xl bg-white/80 shrink-0', tile.color)}>
                            <tile.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{tile.label}</p>
                            <p className="font-black text-slate-900 tabular-nums truncate">{tile.value}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── Timer Section ── */}
            <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Main Timer Display */}
                <SpotlightCard
                    className="lg:col-span-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-8 shadow-xl flex flex-col items-center justify-center text-center gap-8"
                    spotlightColor="rgba(128, 0, 64, 0.06)"
                >
                    <div className="flex items-center gap-2.5 self-start">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px]">
                            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                                <Timer className="w-4 h-4 text-[#800040]" />
                            </div>
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Live-Timer</h2>
                    </div>

                    {/* Time display */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-8 w-full">
                        <div className="flex flex-col items-center">
                            <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                                {formatTime(displayWork)}
                            </div>
                            <p className="text-[#800040] font-black text-xs tracking-widest uppercase mt-3">Arbeitszeit</p>
                        </div>

                        {isActive && (
                            <div className="w-0.5 h-16 bg-slate-100 hidden sm:block mx-auto" />
                        )}

                        {isActive && (
                            <div className={cn(
                                'transition-all duration-300 flex flex-col items-center',
                                isPaused ? 'opacity-100 scale-110' : 'opacity-30 scale-90'
                            )}>
                                <div className="text-4xl sm:text-5xl font-black text-slate-400 tracking-tight tabular-nums leading-none">
                                    {formatTime(displayPause)}
                                </div>
                                <p className="text-slate-400 font-black text-[10px] tracking-widest uppercase mt-3">Pause</p>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {activeLoading ? (
                            <div className="px-10 py-4 bg-slate-100 rounded-full text-slate-400 font-black text-base animate-pulse uppercase tracking-widest text-[11px]">
                                Lädt...
                            </div>
                        ) : !isActive ? (
                            <button
                                onClick={handleStartTimer}
                                disabled={startTimer.isPending}
                                className="px-10 py-4 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-black text-sm shadow-xl shadow-rose-900/30 flex items-center gap-3 disabled:opacity-60 uppercase tracking-widest"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Timer starten
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleTogglePause}
                                    disabled={pauseTimer.isPending || resumeTimer.isPending}
                                    className={cn(
                                        'px-8 py-4 rounded-full transition-all shadow-lg flex items-center gap-2.5 font-black text-sm disabled:opacity-60 uppercase tracking-widest',
                                        isPaused
                                            ? 'bg-[#800040] text-white hover:bg-[#600030] shadow-rose-900/20'
                                            : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'
                                    )}
                                >
                                    {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                                    {isPaused ? 'Pause beenden' : 'Pause'}
                                </button>
                                <button
                                    onClick={handleStopTimer}
                                    disabled={stopTimer.isPending}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-full transition-all font-black text-sm shadow-xl hover:bg-black border border-slate-700 flex items-center gap-2.5 disabled:opacity-60 uppercase tracking-widest"
                                >
                                    <Square className="w-4 h-4 fill-current" />
                                    Stoppen
                                </button>
                            </>
                        )}
                    </div>

                    {/* Status indicator */}
                    <div className="h-5 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isActive && !isPaused && (
                                <motion.p
                                    key="working"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="text-emerald-500 font-black text-xs animate-pulse flex items-center gap-2 uppercase tracking-widest"
                                >
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    Arbeitsmodus aktiv
                                </motion.p>
                            )}
                            {isPaused && (
                                <motion.p
                                    key="paused"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="text-orange-500 font-black text-xs animate-pulse flex items-center gap-2 uppercase tracking-widest"
                                >
                                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                                    Pausenmodus aktiv
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </SpotlightCard>

                {/* Side Stats */}
                <div className="flex flex-col gap-4">
                    {/* Today's progress */}
                    <SpotlightCard
                        className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-6 shadow-sm"
                        spotlightColor="rgba(128, 0, 64, 0.04)"
                    >
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 rounded-xl bg-rose-50 shrink-0">
                                <Clock className="w-4 h-4 text-rose-600" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Heute</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tabular-nums">{formatDuration(todayWorkSeconds)}</div>
                        <p className="text-xs text-slate-400 font-semibold mt-1 mb-4">Soll: 8 Std. 0 Min.</p>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-linear-to-r from-[#800040] to-[#E60045] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${todayPct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                            />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 mt-2 text-right tabular-nums">{Math.round(todayPct)}% erreicht</p>
                    </SpotlightCard>

                    {/* Week total */}
                    <SpotlightCard
                        className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-6 shadow-sm"
                        spotlightColor="rgba(128, 0, 64, 0.04)"
                    >
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                                <History className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Woche gesamt</h3>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tabular-nums">{formatDuration(weekWorkSeconds)}</div>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Letzte 7 Tage</p>
                    </SpotlightCard>
                </div>
            </motion.div>

            {/* ── Entries List ── */}
            <motion.div {...fadeUp(0.15)} className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#800040] to-[#E60045] p-[1.5px]">
                        <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                            <History className="w-4 h-4 text-[#800040]" />
                        </div>
                    </div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Letzte Einträge</h2>
                    {totalEntries > 0 && (
                        <span className="bg-[#800040] text-white text-[10px] rounded-full px-2 py-0.5 min-w-[20px] text-center leading-tight font-black">
                            {totalEntries}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {entriesLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 border-4 border-[#800040]/10 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-[#800040] rounded-full animate-spin" />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Lade Einträge...</p>
                        </div>
                    ) : entries && entries.length > 0 ? (
                        entries.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.2 }}
                            >
                                <SpotlightCard
                                    className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.8rem] p-5 flex items-center justify-between hover:shadow-lg transition-shadow group"
                                    spotlightColor="rgba(128, 0, 64, 0.03)"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#800040] transition-colors shadow-sm shrink-0">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-slate-900 text-sm">
                                                    {format(new Date(entry.startTime), 'dd. MMM yyyy', { locale: de })}
                                                </span>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                <span className="text-sm font-black text-[#800040] truncate">
                                                    {entry.project?.name || 'Kein Projekt'}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-xs mt-0.5 line-clamp-1 italic">
                                                {entry.description || 'Keine Beschreibung'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 shrink-0 ml-4">
                                        <div className="text-right">
                                            <div className="text-base font-black text-slate-900 tabular-nums">
                                                {formatDuration(entry.duration)}
                                            </div>
                                            {entry.pauseDuration > 0 && (
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight">
                                                    inkl. {formatDuration(entry.pauseDuration)} Pause
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleEdit(entry)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-5 border-2 border-dashed border-slate-200">
                                <History className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Keine Einträge vorhanden</h3>
                            <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
                                Starte den Timer oder erfasse deine Arbeitszeit manuell, um deine Statistiken zu füllen.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            <TimeEntryModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingEntry(null); }}
                onSubmit={handleModalSubmit}
                initialData={editingEntry || undefined}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
