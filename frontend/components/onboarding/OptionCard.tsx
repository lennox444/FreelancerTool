'use client';

interface OptionCardProps {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ icon, label, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative p-6 rounded-xl border-2 transition-all duration-200
        hover:scale-105 hover:shadow-lg
        ${
          selected
            ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        }
      `}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl">{icon}</span>
        <span
          className={`text-sm font-medium ${
            selected ? 'text-purple-400' : 'text-gray-300'
          }`}
        >
          {label}
        </span>
      </div>
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
