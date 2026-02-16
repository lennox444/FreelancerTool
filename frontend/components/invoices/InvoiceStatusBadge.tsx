import { InvoiceStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusConfig = {
  [InvoiceStatus.DRAFT]: { label: 'Entwurf', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  [InvoiceStatus.SENT]: { label: 'Gesendet', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  [InvoiceStatus.PARTIALLY_PAID]: { label: 'Teilweise bezahlt', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  [InvoiceStatus.PAID]: { label: 'Bezahlt', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  [InvoiceStatus.OVERDUE]: { label: 'Überfällig', color: 'bg-rose-50 text-rose-600 border-rose-100' },
};

export default function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status];

  return (
    <span className={cn(
      "px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full border shadow-sm",
      config.color
    )}>
      {config.label}
    </span>
  );
}
