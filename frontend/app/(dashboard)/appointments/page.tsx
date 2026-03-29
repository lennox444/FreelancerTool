'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppointments, useCreateAppointment, useDeleteAppointment, useUpdateAppointment } from '@/lib/hooks/useAppointments';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import PixelBlast from '@/components/landing/PixelBlast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Video,
    User,
    Trash2,
    Edit2,
    Phone,
    Mail,
    X,
    CalendarDays,
    Sparkles,
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 320, damping: 26 } as const,
    },
};

export default function AppointmentsPage() {
    const searchParams = useSearchParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [filterProjectId, setFilterProjectId] = useState('');

    useEffect(() => {
        const dateParam = searchParams.get('date');
        const projectParam = searchParams.get('projectId');
        if (dateParam) {
            const date = new Date(dateParam);
            if (!isNaN(date.getTime())) { setCurrentDate(date); setSelectedDate(date); }
        }
        if (projectParam) setFilterProjectId(projectParam);
        if (searchParams.get('new') === '1') setShowForm(true);
    }, [searchParams]);

    const { data: appointments, isLoading } = useAppointments({
        from: startOfMonth(currentDate).toISOString(),
        to: endOfMonth(currentDate).toISOString(),
        ...(filterProjectId ? { projectId: filterProjectId } : {}),
    });

    useEffect(() => {
        const idParam = searchParams.get('id');
        if (idParam && appointments) {
            const apt = appointments.find((a: any) => a.id === idParam);
            if (apt) setEditingAppointment(apt);
        }
    }, [searchParams, appointments]);

    const createAppointment = useCreateAppointment();
    const updateAppointment = useUpdateAppointment();
    const deleteAppointment = useDeleteAppointment();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const handleCreate = async (data: any) => {
        try {
            if (editingAppointment) {
                await updateAppointment.mutateAsync({ id: editingAppointment.id, data });
                setEditingAppointment(null);
                toast.success('Termin aktualisiert');
            } else {
                await createAppointment.mutateAsync(data);
                setShowForm(false);
                toast.success('Termin erstellt');
            }
        } catch {
            toast.error('Fehler beim Speichern');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Termin wirklich löschen?')) {
            await deleteAppointment.mutateAsync(id);
            toast.success('Termin gelöscht');
            if (editingAppointment?.id === id) setEditingAppointment(null);
        }
    };

    const getDayAppointments = (date: Date) =>
        (appointments as any[])?.filter(apt => isSameDay(parseISO(apt.startTime), date)) || [];

    const selectedDateAppointments = getDayAppointments(selectedDate).sort(
        (a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative isolate min-h-full p-4 md:p-8 flex flex-col gap-6"
        >
            {/* — Background — */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-[#800040]/8 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/4 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 w-full h-full opacity-[0.35]">
                    <PixelBlast variant="square" pixelSize={6} color="#800040" patternScale={4} patternDensity={0.3} pixelSizeJitter={0.5} enableRipples rippleSpeed={0.2} rippleThickness={0.1} speed={0.1} transparent />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white/80 to-slate-50/50" />
            </div>

            {/* — Main Grid — */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">

                {/* Calendar */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <SpotlightCard
                        className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] p-6 rounded-[2rem]"
                        spotlightColor="rgba(128, 0, 64, 0.04)"
                    >
                        {/* Month Nav */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                                {format(currentDate, 'MMMM yyyy', { locale: de })}
                            </h2>
                            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
                                <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-slate-900">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentDate(new Date())}
                                    className="px-3 py-1.5 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-slate-900"
                                >
                                    Heute
                                </button>
                                <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500 hover:text-slate-900">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-2">
                            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                                <div key={day} className="py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-px bg-slate-100/60 rounded-2xl overflow-hidden border border-slate-100">
                            {calendarDays.map((day) => {
                                const dayApps = getDayAppointments(day);
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isTodayDate = isToday(day);

                                return (
                                    <button
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            'min-h-[90px] p-2 flex flex-col items-start justify-start transition-all relative group text-left',
                                            isCurrentMonth ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-50',
                                            isSelected && 'ring-2 ring-inset ring-[#800040] bg-rose-50/30 z-10'
                                        )}
                                    >
                                        <span className={cn(
                                            'w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1.5 transition-all',
                                            isTodayDate
                                                ? 'bg-[#800040] text-white shadow-md shadow-rose-900/20'
                                                : isCurrentMonth
                                                    ? 'text-slate-700 group-hover:text-slate-900'
                                                    : 'text-slate-300'
                                        )}>
                                            {format(day, 'd')}
                                        </span>

                                        <div className="w-full space-y-0.5">
                                            {dayApps.slice(0, 2).map((apt: any) => (
                                                <div
                                                    key={apt.id}
                                                    className="text-[9px] truncate w-full px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#800040]/10 to-[#800040]/5 text-[#800040] font-black uppercase tracking-wide border border-[#800040]/10"
                                                >
                                                    {format(parseISO(apt.startTime), 'HH:mm')} {apt.title}
                                                </div>
                                            ))}
                                            {dayApps.length > 2 && (
                                                <div className="text-[9px] text-slate-400 pl-1 font-bold">
                                                    +{dayApps.length - 2} mehr
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </SpotlightCard>
                </motion.div>

                {/* Sidebar */}
                <motion.div variants={itemVariants} className="space-y-4 flex flex-col">
                    <AnimatePresence mode="wait">
                        {showForm || editingAppointment ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                            >
                                <SpotlightCard
                                    className="bg-white/95 backdrop-blur-xl border border-[#800040]/15 shadow-[0_20px_50px_-15px_rgba(128,0,64,0.12)] p-6 rounded-[2rem]"
                                    spotlightColor="rgba(128, 0, 64, 0.05)"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-[#800040]/10 text-[#800040]">
                                                {editingAppointment ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                                                {editingAppointment ? 'Termin bearbeiten' : 'Neuer Termin'}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => { setShowForm(false); setEditingAppointment(null); }}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <AppointmentForm
                                        appointment={editingAppointment}
                                        onSubmit={handleCreate}
                                        onCancel={() => { setShowForm(false); setEditingAppointment(null); }}
                                        isLoading={createAppointment.isPending || updateAppointment.isPending}
                                    />
                                </SpotlightCard>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                                className="flex flex-col gap-4 h-full"
                            >
                                {/* Day Header */}
                                <div className="flex items-center justify-between px-1">
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                                            {isToday(selectedDate) ? 'Heute' : format(selectedDate, 'EEEE', { locale: de })}
                                        </h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            {format(selectedDate, 'd. MMMM yyyy', { locale: de })}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest",
                                        selectedDateAppointments.length > 0
                                            ? "bg-[#800040]/10 text-[#800040] border border-[#800040]/20"
                                            : "bg-slate-100 text-slate-400"
                                    )}>
                                        {selectedDateAppointments.length} Termine
                                    </span>
                                </div>

                                {/* Appointments List */}
                                <div className="flex-1 space-y-3 overflow-y-auto">
                                    <AnimatePresence>
                                        {selectedDateAppointments.length > 0 ? (
                                            selectedDateAppointments.map((apt: any, i: number) => (
                                                <motion.div
                                                    key={apt.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 26 }}
                                                >
                                                    <SpotlightCard
                                                        onClick={() => setEditingAppointment(apt)}
                                                        className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-sm hover:shadow-md p-4 rounded-2xl cursor-pointer group relative overflow-hidden transition-all hover:-translate-y-0.5"
                                                        spotlightColor="rgba(128, 0, 64, 0.04)"
                                                    >
                                                        {/* Left accent bar */}
                                                        <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-[#800040] to-[#800040]/30 rounded-l-2xl" />

                                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                            <button
                                                                onClick={(e) => handleDelete(apt.id, e)}
                                                                className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        <div className="flex gap-3 pl-3">
                                                            {/* Time column */}
                                                            <div className="flex flex-col items-center pt-0.5 min-w-[36px]">
                                                                <span className="text-[11px] font-black text-slate-900 tabular-nums">
                                                                    {format(parseISO(apt.startTime), 'HH:mm')}
                                                                </span>
                                                                <div className="flex-1 w-px bg-slate-100 my-1" />
                                                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                                    {format(parseISO(apt.endTime), 'HH:mm')}
                                                                </span>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-black text-slate-900 text-sm group-hover:text-[#800040] transition-colors truncate leading-tight">
                                                                    {apt.title}
                                                                </h4>

                                                                {apt.customer?.company && (
                                                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5 font-medium">
                                                                        <User className="w-3 h-3 flex-shrink-0" />
                                                                        <span className="truncate">{apt.customer.company}</span>
                                                                    </div>
                                                                )}

                                                                {apt.location && (
                                                                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-medium">
                                                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                                                        <span className="truncate">{apt.location}</span>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                    {apt.meetingLink && (
                                                                        <a
                                                                            href={apt.meetingLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors uppercase tracking-wide border border-blue-100"
                                                                        >
                                                                            <Video className="w-3 h-3" />
                                                                            Beitreten
                                                                        </a>
                                                                    )}
                                                                    {apt.contactPhone && (
                                                                        <a
                                                                            href={`tel:${apt.contactPhone}`}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-[#800040] hover:bg-pink-50 transition-colors border border-slate-100"
                                                                        >
                                                                            <Phone className="w-3 h-3" />
                                                                        </a>
                                                                    )}
                                                                    {apt.contactEmail && (
                                                                        <a
                                                                            href={`mailto:${apt.contactEmail}`}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-[#800040] hover:bg-pink-50 transition-colors border border-slate-100"
                                                                        >
                                                                            <Mail className="w-3 h-3" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </SpotlightCard>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center justify-center py-14 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/40"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                                    <CalendarIcon className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Kein Termin</p>
                                                <p className="text-xs text-slate-400 font-medium mb-4">Für diesen Tag leer</p>
                                                <button
                                                    onClick={() => { setEditingAppointment(null); setShowForm(true); }}
                                                    className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#800040] uppercase tracking-widest hover:underline"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Jetzt erstellen
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
}
