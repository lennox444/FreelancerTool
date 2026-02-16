'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers';
import { ProjectStatus } from '@/lib/types';
import {
  Folder,
  Users,
  Lightbulb,
  DollarSign,
  Calendar,
  FileText,
  StickyNote,
} from 'lucide-react';

interface ProjectFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const inputClasses =
  'w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all';
const labelClasses = 'block text-sm font-medium text-gray-300 mb-2';

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

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className={labelClasses}>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-purple-400" />
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
              <Users className="w-4 h-4 text-purple-400" />
              Kunde
            </div>
          </label>
          <select
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Kein Kunde zugeordnet</option>
            {customers?.map((customer) => (
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
              <Lightbulb className="w-4 h-4 text-purple-400" />
              Status
            </div>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputClasses}
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
              <DollarSign className="w-4 h-4 text-purple-400" />
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
              <Calendar className="w-4 h-4 text-purple-400" />
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
              <Calendar className="w-4 h-4 text-purple-400" />
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
            <FileText className="w-4 h-4 text-purple-400" />
            Beschreibung
          </div>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={inputClasses}
          placeholder="Kurze Beschreibung des Projekts..."
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClasses}>
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-purple-400" />
            Notizen
          </div>
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className={inputClasses}
          placeholder="Interne Notizen..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading
            ? 'Speichert...'
            : initialData
            ? 'Projekt aktualisieren'
            : 'Projekt erstellen'}
        </button>
      </div>
    </form>
  );
}
