'use client';

import { useState } from 'react';
import type { Customer } from '@/lib/types';
import {
  User,
  Building2,
  Mail,
  Clock,
  FileText,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CustomerFormData {
  name: string;
  company?: string;
  email: string;
  defaultPaymentTerms?: number;
  notes?: string;
}

export default function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: customer?.name || '',
    company: customer?.company || '',
    email: customer?.email || '',
    defaultPaymentTerms: customer?.defaultPaymentTerms || 30,
    notes: customer?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültiges E-Mail-Format';
    }

    if (
      formData.defaultPaymentTerms &&
      (formData.defaultPaymentTerms < 1 || formData.defaultPaymentTerms > 365)
    ) {
      newErrors.defaultPaymentTerms = 'Zahlungsziel muss zwischen 1-365 Tagen liegen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Fehler beim Absenden des Formulars:', error);
    }
  };

  const inputClasses = "mt-1 block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400";
  const labelClasses = "flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="relative">
          <label htmlFor="name" className={labelClasses}>
            <User className="w-4 h-4 text-slate-400" />
            Vollständiger Name *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
              <User className="w-4 h-4" />
            </div>
            <input
              id="name"
              type="text"
              required
              placeholder="z.B. Max Mustermann"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(inputClasses, errors.name && "border-red-300 focus:ring-red-200 focus:border-red-500")}
            />
          </div>
          {errors.name && <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{errors.name}</p>}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className={labelClasses}>
            <Building2 className="w-4 h-4 text-slate-400" />
            Unternehmen
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              id="company"
              type="text"
              placeholder="z.B. Muster GmbH"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClasses}>
            <Mail className="w-4 h-4 text-slate-400" />
            E-Mail Adresse *
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              required
              placeholder="max@beispiel.de"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={cn(inputClasses, errors.email && "border-red-300 focus:ring-red-200 focus:border-red-500")}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{errors.email}</p>}
        </div>

        {/* Payment Terms */}
        <div>
          <label htmlFor="defaultPaymentTerms" className={labelClasses}>
            <Clock className="w-4 h-4 text-slate-400" />
            Standard-Zahlungsziel (Tage)
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
              <Clock className="w-4 h-4" />
            </div>
            <input
              id="defaultPaymentTerms"
              type="number"
              min="1"
              max="365"
              value={formData.defaultPaymentTerms}
              onChange={(e) =>
                setFormData({ ...formData, defaultPaymentTerms: parseInt(e.target.value) || undefined })
              }
              className={cn(inputClasses, errors.defaultPaymentTerms && "border-red-300 focus:ring-red-200 focus:border-red-500")}
            />
          </div>
          {errors.defaultPaymentTerms && (
            <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{errors.defaultPaymentTerms}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClasses}>
          <FileText className="w-4 h-4 text-slate-400" />
          Notizen
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Zusätzliche Informationen zum Kunden..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full transition-all font-semibold text-sm disabled:opacity-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              {customer ? 'Kunde aktualisieren' : 'Kunde anlegen'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
