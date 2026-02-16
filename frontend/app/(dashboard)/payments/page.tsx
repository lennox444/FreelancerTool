'use client';

import { useState } from 'react';
import { usePayments, useCreatePayment, useDeletePayment } from '@/lib/hooks/usePayments';
import { useInvoices } from '@/lib/hooks/useInvoices';
import LoadingPage from '@/components/ui/LoadingPage';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: 0,
    paymentDate: '',
    note: '',
  });

  const { data: payments, isLoading } = usePayments();
  const { data: invoices } = useInvoices();
  const createPayment = useCreatePayment();
  const deletePayment = useDeletePayment();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment.mutateAsync(formData);
      setShowForm(false);
      setFormData({ invoiceId: '', amount: 0, paymentDate: '', note: '' });
      toast.success('Payment added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this payment? Invoice status will be recalculated.')) {
      try {
        await deletePayment.mutateAsync(id);
        toast.success('Payment deleted successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete payment');
      }
    }
  };

  // Filter invoices that are not fully paid
  const unpaidInvoices = invoices?.filter(
    (inv) => inv.totalPaid < inv.amount
  ) || [];

  if (isLoading) return <LoadingPage message="Loading payments..." />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Payment'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">New Payment</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice</label>
              <select
                required
                value={formData.invoiceId}
                onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select invoice</option>
                {unpaidInvoices?.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.customer?.name} - ${inv.amount} (Paid: ${inv.totalPaid}) - {inv.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Date</label>
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
              />
            </div>

            <button
              type="submit"
              disabled={createPayment.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createPayment.isPending ? 'Creating...' : 'Create Payment'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        {payments && payments.length > 0 ? (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{payment.invoice?.description || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      Invoice: ${payment.invoice?.amount || 0} (Status: {payment.invoice?.status})
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{payment.invoice?.customer?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">${payment.amount}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.note || '-'}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No payments yet"
            description="Add your first payment to track income"
            action={{
              label: 'Add Payment',
              onClick: () => setShowForm(true),
            }}
          />
        )}
      </div>
    </div>
  );
}
