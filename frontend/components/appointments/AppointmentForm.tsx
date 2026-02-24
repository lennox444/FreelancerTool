'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, User, Mail, Phone, Link, Video, Calendar, Clock, FileText, Folder } from 'lucide-react';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useProjects } from '@/lib/hooks/useProjects';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface AppointmentFormData {
    title: string;
    description?: string;
    startTime: string; // ISO date string without time
    endTime: string;   // ISO date string without time
    startTimeTime?: string; // HH:mm
    endTimeTime?: string;   // HH:mm
    customerId?: string;
    projectId?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    meetingLink?: string;
    meetingId?: string;
}

interface AppointmentFormProps {
    appointment?: any;
    onSubmit: (data: AppointmentFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function AppointmentForm({
    appointment,
    onSubmit,
    onCancel,
    isLoading
}: AppointmentFormProps) {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AppointmentFormData>({
        defaultValues: appointment ? {
            title: appointment.title,
            description: appointment.description ?? '',
            startTime: new Date(appointment.startTime).toISOString().slice(0, 10),
            endTime: new Date(appointment.endTime).toISOString().slice(0, 10),
            startTimeTime: new Date(appointment.startTime).toISOString().slice(11, 16),
            endTimeTime: new Date(appointment.endTime).toISOString().slice(11, 16),
            customerId: appointment.customerId ?? '',
            projectId: appointment.projectId ?? '',
            contactName: appointment.contactName ?? '',
            contactEmail: appointment.contactEmail ?? '',
            contactPhone: appointment.contactPhone ?? '',
            meetingLink: appointment.meetingLink ?? '',
            meetingId: appointment.meetingId ?? '',
        } : {
            startTime: new Date().toISOString().slice(0, 10),
            endTime: new Date().toISOString().slice(0, 10),
            startTimeTime: "09:00",
            endTimeTime: "10:00",
        }
    });

    const selectedCustomerId = watch('customerId');
    const { data: customers } = useCustomers();
    const { data: projects } = useProjects({ customerId: selectedCustomerId || undefined });

    const inputClasses = "mt-1 block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400";
    const labelClasses = "flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1 ml-1";

    // Auto-fill contact info when customer selected
    useEffect(() => {
        if (selectedCustomerId && !appointment) {
            const customer = customers?.find(c => c.id === selectedCustomerId);
            if (customer) {
                setValue('contactName', customer.name);
                setValue('contactEmail', customer.email);
            }
        }
    }, [selectedCustomerId, customers, setValue, appointment]);


    const onFormSubmit = async (data: AppointmentFormData) => {
        // Construct full ISO strings
        const startT = data.startTimeTime || "00:00";
        const endT = data.endTimeTime || "23:59";

        const startDateTime = new Date(`${data.startTime}T${startT}:00`);
        const endDateTime = new Date(`${data.endTime}T${endT}:00`);

        // Basic validation
        if (endDateTime < startDateTime) {
            toast.error("Endzeit muss nach Startzeit liegen");
            return;
        }

        // Strip helper fields not in DTO; convert empty strings to undefined
        const { startTimeTime, endTimeTime, ...rest } = data;
        await onSubmit({
            ...rest,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            customerId: rest.customerId || undefined,
            projectId: rest.projectId || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Title */}
                <div className="md:col-span-2">
                    <label className={labelClasses}>
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Titel *
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                            <FileText className="w-4 h-4" />
                        </div>
                        <input
                            {...register('title', { required: 'Titel ist erforderlich' })}
                            className={inputClasses}
                            placeholder="z.B. Kick-off Meeting"
                        />
                    </div>
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                </div>

                {/* Date & Time Start */}
                <div className="space-y-4">
                    <div>
                        <label className={labelClasses}>
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Startdatum *
                        </label>
                        <div className="relative group">
                            <input
                                type="date"
                                {...register('startTime', { required: 'Startdatum ist erforderlich' })}
                                className={cn(inputClasses, "pl-4")}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>
                            <Clock className="w-4 h-4 text-slate-400" />
                            Startzeit
                        </label>
                        <div className="relative group">
                            <input
                                type="time"
                                {...register('startTimeTime')}
                                className={cn(inputClasses, "pl-4")}
                            />
                        </div>
                    </div>
                </div>

                {/* Date & Time End */}
                <div className="space-y-4">
                    <div>
                        <label className={labelClasses}>
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Enddatum *
                        </label>
                        <div className="relative group">
                            <input
                                type="date"
                                {...register('endTime', { required: 'Enddatum ist erforderlich' })}
                                className={cn(inputClasses, "pl-4")}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>
                            <Clock className="w-4 h-4 text-slate-400" />
                            Endzeit
                        </label>
                        <div className="relative group">
                            <input
                                type="time"
                                {...register('endTimeTime')}
                                className={cn(inputClasses, "pl-4")}
                            />
                        </div>
                    </div>
                </div>

                {/* Association */}
                <div>
                    <label className={labelClasses}>
                        <User className="w-4 h-4 text-slate-400" />
                        Kunde (optional)
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                        <select {...register('customerId')} className={inputClasses}>
                            <option value="">Kein Kunde</option>
                            {customers?.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>
                        <Folder className="w-4 h-4 text-slate-400" />
                        Projekt (optional)
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                            <Folder className="w-4 h-4" />
                        </div>
                        <select
                            {...register('projectId')}
                            className={inputClasses}
                            disabled={!selectedCustomerId}
                        >
                            <option value="">{selectedCustomerId ? 'Kein Projekt' : 'Zuerst Kunde wählen'}</option>
                            {projects?.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 block">Kontaktperson</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    {...register('contactName')}
                                    className={inputClasses}
                                    placeholder="Name"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <input
                                    {...register('contactPhone')}
                                    className={inputClasses}
                                    placeholder="Telefon"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    {...register('contactEmail')}
                                    className={inputClasses}
                                    placeholder="Email"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meeting Details */}
                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 block">Online Meeting (optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>Meeting Link</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                                    <Link className="w-4 h-4" />
                                </div>
                                <input
                                    {...register('meetingLink')}
                                    className={inputClasses}
                                    placeholder="https://zoom.us/..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Meeting ID / Passcode</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                                    <Video className="w-4 h-4" />
                                </div>
                                <input
                                    {...register('meetingId')}
                                    className={inputClasses}
                                    placeholder="ID: 123-456-789"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className={labelClasses}>
                        <FileText className="w-4 h-4 text-slate-400" />
                        Beschreibung / Notizen
                    </label>
                    <div className="relative group">
                        <div className="absolute top-3.5 left-3.5 text-slate-400 group-focus-within:text-[#800040] transition-colors">
                            <FileText className="w-4 h-4" />
                        </div>
                        <textarea
                            {...register('description')}
                            className={`${inputClasses} pl-10 h-24`}
                            placeholder="Agenda, Vorbereitung, etc."
                        />
                    </div>
                </div>

            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full transition-all font-semibold text-sm"
                >
                    Abbrechen
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                    {appointment ? 'Termin speichern' : 'Termin erstellen'}
                </button>
            </div>
        </form>
    );
}
