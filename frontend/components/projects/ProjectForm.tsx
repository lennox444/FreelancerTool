'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers';
import { ProjectStatus, Customer } from '@/lib/types';
import {
  Folder,
  Users,
  Lightbulb,
  DollarSign,
  Calendar,
  FileText,
  StickyNote,
  Check,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const inputClasses =
  'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] transition-all shadow-sm';
const labelClasses = 'block text-sm font-semibold text-slate-700 mb-2 ml-1';

export function ProjectForm({
  initialData,
  onSubmit,
  loading = false,
}: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    customerId: initialData?.customerId || '',
    status: initialData?.status || ProjectStatus.PLANNING,
    budget: initialData?.budget || '',
    startDate: initialData?.startDate
      ? initialData.startDate.split('T')[0]
      : '',
    endDate: initialData?.endDate ? initialData.endDate.split('T')[0] : '',
    notes: initialData?.notes || '',
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      customerId: formData.customerId || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Name */}
        <div className="md:col-span-2 lg:col-span-1">
          <label htmlFor="name" className={labelClasses}>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#800040]" />
              Projektname *
            </div>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClasses}
            placeholder="z.B. Website Redesign"
          />
        </div>

        {/* Customer */}
        <div>
          <label htmlFor="customerId" className={labelClasses}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#800040]" />
              Kunde
            </div>
          </label>
          <select
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            className={cn(inputClasses, "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat")}
          >
            <option value="">Kein Kunde zugeordnet</option>
            {customers?.map((customer: any) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
                {customer.company ? ` (${customer.company})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className={labelClasses}>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#800040]" />
              Status
            </div>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={cn(inputClasses, "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat")}
          >
            <option value={ProjectStatus.PLANNING}>Planung</option>
            <option value={ProjectStatus.ACTIVE}>Aktiv</option>
            <option value={ProjectStatus.ON_HOLD}>Pausiert</option>
            <option value={ProjectStatus.COMPLETED}>Abgeschlossen</option>
            <option value={ProjectStatus.CANCELLED}>Abgebrochen</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className={labelClasses}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#800040]" />
              Budget (€)
            </div>
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={inputClasses}
            placeholder="0.00"
          />
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className={labelClasses}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#800040]" />
              Startdatum
            </div>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className={labelClasses}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#800040]" />
              Enddatum
            </div>
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClasses}>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#800040]" />
            Beschreibung
          </div>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={cn(inputClasses, "resize-none")}
          placeholder="Kurze Beschreibung des Projekts..."
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClasses}>
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-[#800040]" />
            Notizen
          </div>
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className={cn(inputClasses, "resize-none")}
          placeholder="Interne Notizen..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-3.5 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Speichere...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {initialData ? 'Projekt aktualisieren' : 'Projekt erstellen'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
