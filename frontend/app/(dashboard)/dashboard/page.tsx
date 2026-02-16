'use client';

import { useDashboardStats, useDashboardOverdue } from '@/lib/hooks/useDashboard';
import LoadingPage from '@/components/ui/LoadingPage';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: overdue } = useDashboardOverdue();

  if (isLoading) return <LoadingPage message="Loading dashboard..." />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded shadow">
          <div className="text-sm text-gray-500">Open Invoices</div>
          <div className="text-2xl font-bold">${stats?.openInvoices?.amount || 0}</div>
          <div className="text-xs text-gray-400">{stats?.openInvoices?.count || 0} invoices</div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="text-sm text-gray-500">Overdue</div>
          <div className="text-2xl font-bold text-red-600">${stats?.overdueInvoices?.amount || 0}</div>
          <div className="text-xs text-gray-400">{stats?.overdueInvoices?.count || 0} invoices</div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="text-sm text-gray-500">This Month</div>
          <div className="text-2xl font-bold text-green-600">${stats?.monthRevenue?.amount || 0}</div>
          <div className="text-xs text-gray-400">{stats?.monthRevenue?.count || 0} payments</div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <div className="text-sm text-gray-500">This Year</div>
          <div className="text-2xl font-bold">${stats?.yearRevenue?.amount || 0}</div>
        </div>
      </div>

      {/* Overdue Invoices */}
      {overdue && overdue.length > 0 && (
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">⚠️ Overdue Invoices</h2>
          <div className="space-y-2">
            {overdue.map((inv: any) => (
              <div key={inv.id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                <div>
                  <div className="font-medium">{inv.customer.name}</div>
                  <div className="text-sm text-gray-600">{inv.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">${inv.amount}</div>
                  <div className="text-xs text-gray-500">
                    Due: {new Date(inv.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Customers:</span>
              <span className="font-medium">{stats?.totalCustomers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Invoices:</span>
              <span className="font-medium">{stats?.totalInvoices || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/invoices" className="block text-blue-600 hover:underline">→ Create Invoice</a>
            <a href="/customers" className="block text-blue-600 hover:underline">→ Add Customer</a>
          </div>
        </div>
      </div>
    </div>
  );
}
