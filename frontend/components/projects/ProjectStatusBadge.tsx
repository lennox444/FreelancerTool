import { ProjectStatus } from '@/lib/types';
import { Lightbulb, Clock, Pause, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig = {
  [ProjectStatus.PLANNING]: {
    label: 'Planung',
    icon: Lightbulb,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  [ProjectStatus.ACTIVE]: {
    label: 'Aktiv',
    icon: Clock,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  [ProjectStatus.ON_HOLD]: {
    label: 'Pausiert',
    icon: Pause,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  [ProjectStatus.COMPLETED]: {
    label: 'Erledigt',
    icon: CheckCircle2,
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  [ProjectStatus.CANCELLED]: {
    label: 'Abgebrochen',
    icon: XCircle,
    color: 'bg-red-50 text-red-600 border-red-100',
  },
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={cn(
      "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shadow-sm flex items-center gap-1.5 w-fit",
      config.color
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
