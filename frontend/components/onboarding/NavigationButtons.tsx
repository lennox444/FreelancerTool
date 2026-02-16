'use client';

interface NavigationButtonsProps {
  onBack: (() => void) | null;
  onSkip: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function NavigationButtons({
  onBack,
  onSkip,
  onNext,
  nextDisabled = false,
  loading = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-6">
      {/* Back Button */}
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Zurück
        </button>
      ) : (
        <div></div>
      )}

      <div className="flex items-center gap-3">
        {/* Skip Button */}
        <button
          type="button"
          onClick={onSkip}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Überspringen
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600"
        >
          {loading ? 'Lädt...' : 'Weiter'}
        </button>
      </div>
    </div>
  );
}
