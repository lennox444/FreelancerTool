import { InvoiceStatus } from '@/lib/types';

const statusConfig = {
  [InvoiceStatus.DRAFT]: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  [InvoiceStatus.SENT]: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  [InvoiceStatus.PARTIALLY_PAID]: { label: 'Partially Paid', color: 'bg-yellow-100 text-yellow-800' },
  [InvoiceStatus.PAID]: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  [InvoiceStatus.OVERDUE]: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
};

export default function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
      {config.label}
    </span>
  );
}
