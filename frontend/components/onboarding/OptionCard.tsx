import { Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ icon: Icon, label, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden flex flex-col items-center justify-center gap-3 text-center aspect-square md:aspect-auto md:min-h-[140px]",
        selected
          ? "border-[#800040] bg-[#800040]/5 shadow-sm scale-[1.02]"
          : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50"
      )}
    >
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
          selected ? "bg-[#800040] text-white shadow-md shadow-[#800040]/20" : "bg-white text-slate-400 border border-slate-100 shadow-sm"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <span
          className={cn(
            "text-sm font-bold tracking-tight transition-colors",
            selected ? "text-slate-900" : "text-slate-500"
          )}
        >
          {label}
        </span>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#800040] rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-300">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
