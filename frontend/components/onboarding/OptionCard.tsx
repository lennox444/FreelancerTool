import { Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  color?: string; // e.g. 'indigo', 'emerald', 'rose', 'amber', 'cyan', 'slate', 'blue', 'purple', 'green'
}

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string; iconText: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', iconBg: 'bg-rose-100', iconText: 'text-rose-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', iconBg: 'bg-slate-100', iconText: 'text-slate-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', iconBg: 'bg-green-100', iconText: 'text-green-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', iconBg: 'bg-orange-100', iconText: 'text-orange-600' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', iconBg: 'bg-red-100', iconText: 'text-red-600' },
  wine: { bg: 'bg-[#800040]/5', text: 'text-[#800040]', border: 'border-[#800040]/10', iconBg: 'bg-[#800040]/10', iconText: 'text-[#800040]' },
};

export function OptionCard({ icon: Icon, label, description, selected, onClick, color = 'wine' }: OptionCardProps) {
  // Extract base color name if it comes as 'bg-color-500' or similar
  const colorKey = color.startsWith('bg-') ? color.split('-')[1] : color;
  const theme = colorMap[colorKey] || colorMap.wine;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300 group overflow-hidden flex flex-col items-center justify-center gap-2.5 text-center min-h-[110px]",
        selected
          ? "border-[#800040] bg-[#800040]/5 shadow-[0_10px_30px_rgba(128,0,64,0.08)] scale-[1.02]"
          : cn("bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200")
      )}
    >
      <div className="relative z-10 flex flex-col items-center gap-2.5">
        <div className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm border",
          selected
            ? "bg-[#800040] text-white border-transparent shadow-md shadow-[#800040]/30"
            : cn(theme.iconBg, theme.iconText, "border-black/5")
        )}>
          <Icon className="w-5.5 h-5.5 relative z-10" />
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              "text-xs font-black tracking-tight transition-colors",
              selected ? "text-slate-900" : "text-slate-600"
            )}
          >
            {label}
          </span>
          {description && (
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-wider mt-0.5 transition-colors",
              selected ? "text-slate-500" : "text-slate-400"
            )}>
              {description}
            </span>
          )}
        </div>
      </div>

      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-[#800040] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300 z-20">
          <Check className="w-3 h-3 text-white" strokeWidth={4} />
        </div>
      )}
    </button>
  );
}
