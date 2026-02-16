'use client';

import { useState } from 'react';
import { useCreatePayment } from '@/lib/hooks/usePayments';
import {
  X,
  DollarSign,
  Calendar,
  FileText,
  Check,
  Loader2,
  Wallet,
  User,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AddPaymentModalProps {
  invoiceId: string;
  invoiceAmount: number;
  totalPaid: number;
  customerName: string;
  onClose: () => void;
}

export default function AddPaymentModal({
  invoiceId,
  invoiceAmount,
  totalPaid,
  customerName,
  onClose,
}: AddPaymentModalProps) {
  const remainingAmount = invoiceAmount - totalPaid;
  const [formData, setFormData] = useState({
    amount: remainingAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    note: '',
  });

  const createPayment = useCreatePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment.mutateAsync({
        invoiceId,
        ...formData,
      });
      toast.success('Zahlung erfolgreich erfasst');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Erfassen der Zahlung');
    }
  };

  const inputClasses = "mt-1 block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800040]/20 focus:border-[#800040] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400";
  const labelClasses = "flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1 ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <Wallet className="w-7 h-7 text-[#ff3366]" />
              Zahlung erfassen
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-2"><User className="w-4 h-4" /> Kunde</span>
              <span className="font-semibold">{customerName}</span>
            </div>
            <div className="h-px bg-white/10 w-full" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Offener Betrag</span>
              <span className="text-xl font-bold text-[#ff3366]">
                {remainingAmount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className={labelClasses}>
              <DollarSign className="w-4 h-4 text-slate-400" />
              Zahlungsbetrag (€) *
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                required
                step="0.01"
                max={remainingAmount}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>
              <Calendar className="w-4 h-4 text-slate-400" />
              Zahlungsdatum *
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#800040] transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>
              <FileText className="w-4 h-4 text-slate-400" />
              Notiz (optional)
            </label>
            <div className="relative group">
              <div className="absolute top-3.5 left-3.5 text-slate-400 group-focus-within:text-[#800040] transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className={cn(inputClasses, "pl-10 h-20")}
                placeholder="Überweisung, Barzahlung, etc."
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full transition-all font-semibold text-sm"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={createPayment.isPending}
              className="flex-1 px-4 py-3 bg-[#800040] hover:bg-[#600030] text-white rounded-full transition-all font-semibold text-sm shadow-lg shadow-pink-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createPayment.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichere...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Zahlung buchen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
