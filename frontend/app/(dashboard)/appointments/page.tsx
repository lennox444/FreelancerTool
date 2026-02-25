'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppointments, useCreateAppointment, useDeleteAppointment, useUpdateAppointment } from '@/lib/hooks/useAppointments';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorder from '@/components/ui/StarBorder';
import PixelBlast from '@/components/landing/PixelBlast';
import {
    Plus,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    Video,
    User,
    MoreVertical,
    Trash2,
    Edit2,
    ExternalLink,
    Phone,
    Mail,
    X
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

export default function AppointmentsPage() {
    const searchParams = useSearchParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [filterProjectId, setFilterProjectId] = useState('');

    // Initialize from URL params if present
    useEffect(() => {
        const dateParam = searchParams.get('date');
        const idParam = searchParams.get('id');
        const projectParam = searchParams.get('projectId');

        if (dateParam) {
            const date = new Date(dateParam);
            if (!isNaN(date.getTime())) {
                setCurrentDate(date);
                setSelectedDate(date);
            }
        }
        if (projectParam) setFilterProjectId(projectParam);
        if (searchParams.get('new') === '1') setShowForm(true);
    }, [searchParams]);

    const { data: appointments, isLoading } = useAppointments({
        from: startOfMonth(currentDate).toISOString(),
        to: endOfMonth(currentDate).toISOString(),
        ...(filterProjectId ? { projectId: filterProjectId } : {}),
    });

    // Open specific appointment directly if ID is in URL and loaded
    useEffect(() => {
        const idParam = searchParams.get('id');
        if (idParam && appointments) {
            const apt = appointments.find(a => a.id === idParam);
            if (apt) {
                setEditingAppointment(apt);
            }
        }
    }, [searchParams, appointments]);

    const createAppointment = useCreateAppointment();
    const updateAppointment = useUpdateAppointment();
    const deleteAppointment = useDeleteAppointment();

    // Calendar Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

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
        } catch (error: any) {
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

    const getDayAppointments = (date: Date) => {
        return appointments?.filter(apt => isSameDay(parseISO(apt.startTime), date)) || [];
    };

    const selectedDateAppointments = getDayAppointments(selectedDate).sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return (
        <div className="relative isolate min-h-full p-4 md:p-6 flex flex-col gap-6">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
                <div className="absolute inset-0 w-full h-full opacity-30">
                    <PixelBlast
                        variant="square"
                        pixelSize={6}
                        color="#800040"
                        patternScale={4}
                        patternDensity={0.5}
                        pixelSizeJitter={0.5}
                        enableRipples
                        rippleSpeed={0.3}
                        rippleThickness={0.1}
                        speed={0.2}
                        transparent
                    />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8)_0%,rgba(248,250,252,0.95)_100%)]" />
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Kalender</h1>
                    <div className="hidden md:block w-px h-8 bg-slate-300"></div>
                    <p className="text-slate-500 font-medium">
                        Plane und verwalte deine Termine und Meetings.
                    </p>
                    {filterProjectId && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#800040]/10 text-[#800040] rounded-full text-sm font-semibold border border-[#800040]/20">
                            Projektfilter aktiv
                            <button onClick={() => setFilterProjectId('')} className="hover:opacity-70 transition-opacity" title="Filter entfernen">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    )}
                </div>
                <div className="flex gap-3">
                    <StarBorder onClick={() => {
                        setEditingAppointment(null);
                        setShowForm(!showForm);
                    }}
                        className="rounded-full group" color={showForm ? "#94a3b8" : "#ff3366"} speed="4s" thickness={3}>
                        <div className={cn(
                            "px-6 h-12 flex items-center justify-center rounded-full transition-all font-semibold text-sm shadow-lg gap-2",
                            showForm
                                ? "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-slate-200/20"
                                : "bg-[#800040] hover:bg-[#600030] text-white shadow-pink-900/20"
                        )}>
                            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            <span>{showForm ? 'Abbrechen' : 'Neuer Termin'}</span>
                        </div>
                    </StarBorder>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <SpotlightCard className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm p-6 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 capitalize">
                                {format(currentDate, 'MMMM yyyy', { locale: de })}
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                                </button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                                    Heute
                                </button>
                                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                                <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}

                            {calendarDays.map((day, dayIdx) => {
                                const dayApps = getDayAppointments(day);
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isTodayDate = isToday(day);

                                return (
                                    <button
                                        key={day.toString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={cn(
                                            "min-h-[100px] p-2 flex flex-col items-start justify-start transition-all hover:bg-slate-50 relative group text-left",
                                            isCurrentMonth ? "bg-white" : "bg-slate-50/50 text-slate-400",
                                            isSelected && "ring-2 ring-inset ring-[#800040] z-10"
                                        )}
                                    >
                                        <span className={cn(
                                            "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1",
                                            isTodayDate ? "bg-[#800040] text-white" : "text-slate-700",
                                        )}>
                                            {format(day, 'd')}
                                        </span>

                                        <div className="w-full space-y-1">
                                            {dayApps.slice(0, 3).map(apt => (
                                                <div key={apt.id} className="text-[10px] truncate w-full px-1.5 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-100 font-medium">
                                                    {format(parseISO(apt.startTime), 'HH:mm')} {apt.title}
                                                </div>
                                            ))}
                                            {dayApps.length > 3 && (
                                                <div className="text-[10px] text-slate-400 pl-1">
                                                    + {dayApps.length - 3} weitere
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </SpotlightCard>
                </div>

                {/* Sidebar / Details / Form */}
                <div className="space-y-6">
                    {showForm || editingAppointment ? (
                        <SpotlightCard className="bg-white/95 backdrop-blur-md border border-[#800040]/20 shadow-xl p-6 rounded-3xl" spotlightColor="rgba(128, 0, 64, 0.05)">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editingAppointment ? 'Termin bearbeiten' : 'Neuer Termin'}
                                </h3>
                                <button onClick={() => { setShowForm(false); setEditingAppointment(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                            <AppointmentForm
                                appointment={editingAppointment}
                                onSubmit={handleCreate}
                                onCancel={() => { setShowForm(false); setEditingAppointment(null); }}
                                isLoading={createAppointment.isPending || updateAppointment.isPending}
                            />
                        </SpotlightCard>
                    ) : (
                        <div className="space-y-6 h-full flex flex-col">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {isToday(selectedDate) ? 'Heute' : format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
                                </h3>
                                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                    {selectedDateAppointments.length} Termine
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {selectedDateAppointments.length > 0 ? (
                                    selectedDateAppointments.map(apt => (
                                        <SpotlightCard
                                            key={apt.id}
                                            onClick={() => setEditingAppointment(apt)}
                                            className="bg-white border border-slate-100 shadow-sm p-4 rounded-2xl hover:shadow-md transition-all cursor-pointer group relative"
                                            spotlightColor="rgba(128, 0, 64, 0.05)"
                                        >
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleDelete(apt.id, e)}
                                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-slate-900">
                                                        {format(parseISO(apt.startTime), 'HH:mm')}
                                                    </span>
                                                    <div className="w-0.5 h-full bg-slate-100 my-1"></div>
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {format(parseISO(apt.endTime), 'HH:mm')}
                                                    </span>
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-[#800040] transition-colors">
                                                        {apt.title}
                                                    </h4>

                                                    {apt.customer?.company && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                            <User className="w-3 h-3" />
                                                            <span className="truncate">{apt.customer.company}</span>
                                                        </div>
                                                    )}

                                                    {apt.meetingLink && (
                                                        <a
                                                            href={apt.meetingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mt-2 hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Video className="w-3 h-3" />
                                                            Meeting beitreten
                                                        </a>
                                                    )}

                                                    {apt.contactPhone && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <a href={`tel:${apt.contactPhone}`} onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-50 rounded-lg text-slate-500 hover:text-[#800040] hover:bg-pink-50 transition-colors">
                                                                <Phone className="w-3 h-3" />
                                                            </a>
                                                            {apt.contactEmail && (
                                                                <a href={`mailto:${apt.contactEmail}`} onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-50 rounded-lg text-slate-500 hover:text-[#800040] hover:bg-pink-50 transition-colors">
                                                                    <Mail className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                        <CalendarIcon className="w-10 h-10 text-slate-200 mb-3" />
                                        <p className="text-slate-500 font-medium">Keine Termine für diesen Tag</p>
                                        <button
                                            onClick={() => {
                                                setEditingAppointment(null);
                                                setShowForm(true);
                                            }}
                                            className="mt-4 text-sm font-bold text-[#800040] hover:underline"
                                        >
                                            Jetzt erstellen
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
