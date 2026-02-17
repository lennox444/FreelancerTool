'use client';

import { useState, useEffect } from 'react';
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
    ChevronRight
} from 'lucide-react';
import PixelBlast from '@/components/landing/PixelBlast';
import StarBorder from '@/components/ui/StarBorder';
import SpotlightCard from '@/components/ui/SpotlightCard';
import {
    useTimeEntries,
    useCreateTimeEntry,
    useUpdateTimeEntry,
    useDeleteTimeEntry
} from '@/lib/hooks/useTimeEntries';
import { TimeEntry } from '@/lib/types';
import TimeEntryModal from '@/components/time-tracking/TimeEntryModal';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function TimeTrackingPage() {
    // Timer States
    const [seconds, setSeconds] = useState(0);
    const [pauseSeconds, setPauseSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);

    // UI States
    const [showModal, setShowModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

    // Queries & Mutations
    const { data: entries, isLoading } = useTimeEntries();
    const createMutation = useCreateTimeEntry();
    const updateMutation = useUpdateTimeEntry();
    const deleteMutation = useDeleteTimeEntry();

    // Timer Interval
    useEffect(() => {
        let interval: any = null;
        if (isActive) {
            interval = setInterval(() => {
                if (isPaused) {
                    setPauseSeconds((prev) => prev + 1);
                } else {
                    setSeconds((prev) => prev + 1);
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, isPaused]);

    const handleStartTimer = () => {
        setIsActive(true);
        setIsPaused(false);
        setStartTime(new Date());
    };

    const handleTogglePause = () => {
        setIsPaused(!isPaused);
    };

    const handleStopTimer = async () => {
        if (!startTime) return;

        const duration = seconds;
        const pDuration = pauseSeconds;

        await createMutation.mutateAsync({
            duration,
            pauseDuration: pDuration,
            startTime: startTime.toISOString(),
            endTime: new Date().toISOString(),
            description: 'Timer-Sitzung',
        });

        // Reset Timer
        setIsActive(false);
        setIsPaused(false);
        setSeconds(0);
        setPauseSeconds(0);
        setStartTime(null);
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

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

    // Stats
    const todayEntries = entries?.filter(e => {
        const today = new Date();
        const entryDate = new Date(e.startTime);
        return today.toDateString() === entryDate.toDateString();
    }) || [];

    const todayWorkSeconds = todayEntries.reduce((acc, curr) => acc + curr.duration, 0);
    const weekWorkSeconds = entries?.reduce((acc, curr) => {
        const now = new Date();
        const entryDate = new Date(curr.startTime);
        const diff = now.getTime() - entryDate.getTime();
        if (diff < 7 * 24 * 60 * 60 * 1000) return acc + curr.duration;
        return acc;
    }, 0) || 0;

    return (
        <div className="relative isolate min-h-full p-4 md:p-6 pb-20">
            <div className="fixed inset-0 -z-10 bg-slate-50/50">
                <div className="absolute inset-0 w-full h-full opacity-[0.03]">
                    <PixelBlast
                        variant="square"
                        pixelSize={6}
                        color="#800040"
                        patternScale={4}
                        patternDensity={0.5}
                        speed={0.2}
                        transparent
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 items-center justify-center text-[#800040]">
                            <Clock className="w-7 h-7" />
                        </div>
                        <div className="h-12 w-px bg-slate-200 hidden sm:block mx-1"></div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Zeiterfassung</h1>
                            <p className="text-slate-500 font-medium">Dokumentiere deine Arbeitszeit präzise</p>
                        </div>
                    </div>

                    <StarBorder as="div" className="rounded-full group" color="#ff3366" speed="4s" thickness={3}>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 h-12 flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg gap-2 bg-[#800040] hover:bg-[#600030] text-white shadow-pink-900/20"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Zeit manuell erfassen</span>
                        </button>
                    </StarBorder>
                </div>

                {/* Timer UI */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SpotlightCard
                        className="lg:col-span-2 p-10 bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-8"
                        spotlightColor="rgba(128, 0, 64, 0.08)"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-8 sm:gap-12">
                            <div className="flex flex-col items-center">
                                <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                                    {formatTime(seconds)}
                                </div>
                                <p className="text-[#800040] font-bold text-xs sm:text-sm tracking-widest uppercase mt-4">Arbeitszeit</p>
                            </div>

                            {isActive && (
                                <div className="w-px h-20 bg-slate-200 hidden sm:block"></div>
                            )}

                            {isActive && (
                                <div className={`transition-all duration-300 flex flex-col items-center ${isPaused ? "opacity-100 scale-110" : "opacity-30 scale-90"}`}>
                                    <div className="text-4xl sm:text-5xl font-black text-slate-400 tracking-tight tabular-nums leading-none">
                                        {formatTime(pauseSeconds)}
                                    </div>
                                    <p className="text-slate-400 font-bold text-[10px] sm:text-xs tracking-widest uppercase mt-4">Pause</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            {!isActive ? (
                                <button
                                    onClick={handleStartTimer}
                                    className="px-12 py-5 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-bold text-xl shadow-xl shadow-pink-900/40 flex items-center gap-3 group"
                                >
                                    <Play className="w-7 h-7 fill-current" />
                                    Timer starten
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleTogglePause}
                                        className={`px-10 py-5 rounded-full transition-all shadow-lg flex items-center gap-3 font-bold text-lg ${isPaused
                                            ? "bg-[#800040] text-white hover:bg-[#600030]"
                                            : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                                            }`}
                                    >
                                        {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                                        {isPaused ? 'Pause beenden' : 'Pause'}
                                    </button>
                                    <button
                                        onClick={handleStopTimer}
                                        className="px-10 py-5 bg-slate-900 text-white rounded-full transition-all font-bold text-lg shadow-xl hover:bg-black border border-slate-700 flex items-center gap-3"
                                    >
                                        <Square className="w-5 h-5 fill-current" />
                                        Stoppen
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="h-6">
                            {isActive && !isPaused && (
                                <p className="text-emerald-500 font-bold text-sm animate-pulse flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    Arbeitsmodus aktiv
                                </p>
                            )}
                            {isPaused && (
                                <p className="text-orange-500 font-bold text-sm animate-pulse flex items-center gap-2">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    Pausenmodus aktiv
                                </p>
                            )}
                        </div>
                    </SpotlightCard>

                    <div className="space-y-6">
                        <SpotlightCard className="p-8 bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm rounded-[2rem]">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-[#800040]" />
                                Heute
                            </h3>
                            <div className="text-4xl font-black text-slate-900">{formatDuration(todayWorkSeconds)}</div>
                            <p className="text-sm text-slate-500 font-medium mt-1">Soll: 8h 0m</p>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-6 overflow-hidden">
                                <div
                                    className="h-full bg-[#800040] transition-all duration-1000"
                                    style={{ width: `${Math.min((todayWorkSeconds / (8 * 3600)) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </SpotlightCard>

                        <SpotlightCard className="p-8 bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm rounded-[2rem]">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                Woche gesamt
                            </h3>
                            <div className="text-4xl font-black text-slate-900">{formatDuration(weekWorkSeconds)}</div>
                            <p className="text-sm text-slate-500 font-medium mt-1">Letzte 7 Tage</p>
                        </SpotlightCard>
                    </div>
                </div>

                {/* Entries List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 ml-1">
                        <History className="w-5 h-5 text-[#800040]" />
                        Letzte Einträge
                    </h2>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="py-20 text-center text-slate-400">Lädt Einträge...</div>
                        ) : entries && entries.length > 0 ? (
                            entries.map((entry) => (
                                <SpotlightCard
                                    key={entry.id}
                                    className="p-5 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-[1.5rem] flex items-center justify-between hover:shadow-lg hover:border-slate-200 transition-all group"
                                    spotlightColor="rgba(128, 0, 64, 0.03)"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#800040] transition-colors shadow-sm">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">
                                                    {format(new Date(entry.startTime), 'dd. MMM yyyy', { locale: de })}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                                <span className="text-sm font-semibold text-[#800040]">
                                                    {entry.project?.name || 'Kein Projekt'}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm mt-0.5 line-clamp-1 italic">
                                                {entry.description || 'Keine Beschreibung'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <div className="text-xl font-black text-slate-900">
                                                {formatDuration(entry.duration)}
                                            </div>
                                            {entry.pauseDuration > 0 && (
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                    inkl. {formatDuration(entry.pauseDuration)} Pause
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(entry)}
                                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                            >
                                                <Edit2 className="w-4.5 h-4.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            ))
                        ) : (
                            <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-100 border-dashed py-24 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <History className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Keine Einträge vorhanden</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                                    Starte den Timer oder erfasse deine Arbeitszeit manuell, um deine Statistiken zu füllen.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
