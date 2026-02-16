'use client';

import { useState } from 'react';
import { useInvoices, useCreateInvoice, useSendInvoice, useDeleteInvoice } from '@/lib/hooks/useInvoices';
import { useCustomers } from '@/lib/hooks/useCustomers';
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge';
import { InvoiceStatus } from '@/lib/types';

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    amount: 0,
    description: '',
    dueDate: '',
  });

  const { data: invoices, isLoading } = useInvoices();
  const { data: customers } = useCustomers();
  const createInvoice = useCreateInvoice();
  const sendInvoice = useSendInvoice();
  const deleteInvoice = useDeleteInvoice();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice.mutateAsync(formData);
    setShowForm(false);
    setFormData({ customerId: '', amount: 0, description: '', dueDate: '' });
  };

  const handleSend = async (id: string) => {
    if (confirm('Send this invoice?')) {
      await sendInvoice.mutateAsync(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this invoice? (Only DRAFT can be deleted)')) {
      try {
        await deleteInvoice.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Invoice'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">New Invoice</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select customer</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
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
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <button
              type="submit"
              disabled={createInvoice.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        {invoices && invoices.length > 0 ? (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{inv.customer?.name}</div>
                    <div className="text-xs text-gray-500">{inv.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">${inv.amount}</td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="px-6 py-4 text-sm">${inv.totalPaid}</td>
                  <td className="px-6 py-4 text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    {inv.status === InvoiceStatus.DRAFT && (
                      <button
                        onClick={() => handleSend(inv.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Send
                      </button>
                    )}
                    {inv.status === InvoiceStatus.DRAFT && (
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">No invoices yet</div>
        )}
      </div>
    </div>
  );
}
