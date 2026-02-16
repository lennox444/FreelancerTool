import { ProjectStatus } from '@/lib/types';
import { Lightbulb, Clock, Pause, CheckCircle2, XCircle } from 'lucide-react';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const statusConfig = {
  [ProjectStatus.PLANNING]: {
    label: 'Planung',
    icon: Lightbulb,
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  [ProjectStatus.ACTIVE]: {
    label: 'Aktiv',
    icon: Clock,
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  [ProjectStatus.ON_HOLD]: {
    label: 'Pausiert',
    icon: Pause,
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  [ProjectStatus.COMPLETED]: {
    label: 'Abgeschlossen',
    icon: CheckCircle2,
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  [ProjectStatus.CANCELLED]: {
    label: 'Abgebrochen',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
