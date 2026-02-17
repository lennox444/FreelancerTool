'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/lib/hooks/useProjects';
import { Project, TimeEntry } from '@/lib/types';
import {
    Folder,
    FileText,
    Clock,
    Timer,
    X,
    Check,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: TimeEntry;
    loading?: boolean;
}

export default function TimeEntryModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading,
}: TimeEntryModalProps) {
    const { data: projects } = useProjects();
    const [formData, setFormData] = useState({
        projectId: '',
        description: '',
        duration: 0, // In Minuten für die Eingabe
        pauseDuration: 0, // In Minuten für die Eingabe
        startTime: new Date().toISOString().slice(0, 16),
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                projectId: initialData.projectId || '',
                description: initialData.description || '',
                duration: Math.floor(initialData.duration / 60),
                pauseDuration: Math.floor(initialData.pauseDuration / 60),
                startTime: new Date(initialData.startTime).toISOString().slice(0, 16),
            });
        } else {
            setFormData({
                projectId: '',
                description: '',
                duration: 0,
                pauseDuration: 0,
                startTime: new Date().toISOString().slice(0, 16),
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            duration: formData.duration * 60,
            pauseDuration: formData.pauseDuration * 60,
        });
    };

    const inputClasses =
        'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#800040]/5 rounded-2xl flex items-center justify-center text-[#800040]">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {initialData ? 'Eintrag bearbeiten' : 'Zeit manuell erfassen'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                Details deiner Arbeitszeit dokumentieren
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-full">
                            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                <Folder className="w-4 h-4 text-[#800040]" />
                                Projekt
                            </label>
                            <select
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className={inputClasses}
                            >
                                <option value="">Kein Projekt zugewiesen</option>
                                {projects?.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 col-span-full">
                            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#800040]" />
                                Beschreibung
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Was hast du gemacht?"
                                rows={3}
                                className={cn(inputClasses, 'resize-none')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                <Timer className="w-4 h-4 text-[#800040]" />
                                Dauer (Minuten)
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                className={inputClasses}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                <Timer className="w-4 h-4 text-slate-400" />
                                Pause (Minuten)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.pauseDuration}
                                onChange={(e) => setFormData({ ...formData, pauseDuration: parseInt(e.target.value) || 0 })}
                                className={inputClasses}
                            />
                        </div>

                        <div className="space-y-2 col-span-full">
                            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#800040]" />
                                Start-Datum & Zeit
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-50 transition-all text-sm"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-6 py-4 bg-[#800040] text-white rounded-full font-bold shadow-lg shadow-pink-900/20 hover:bg-[#600030] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Check className="w-5 h-5" />
                            )}
                            {initialData ? 'Speichern' : 'Eintrag erstellen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
