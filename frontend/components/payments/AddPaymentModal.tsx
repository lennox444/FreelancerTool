'use client';

import { useState } from 'react';
import { useCreatePayment } from '@/lib/hooks/usePayments';

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
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add payment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Customer: {customerName}</div>
          <div className="text-sm text-gray-600">Invoice Amount: ${invoiceAmount}</div>
          <div className="text-sm text-gray-600">Already Paid: ${totalPaid}</div>
          <div className="text-sm font-bold text-blue-600">
            Remaining: ${remainingAmount.toFixed(2)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <input
              type="number"
              required
              step="0.01"
              max={remainingAmount}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max: ${remainingAmount.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Date *</label>
            <input
              type="date"
              required
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
              placeholder="Payment reference, bank transfer details, etc."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPayment.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createPayment.isPending ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
