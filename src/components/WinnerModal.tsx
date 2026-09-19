import { useEffect, useRef } from 'react';
import { Trophy, X, Minus, RotateCw } from 'lucide-react';

interface WinnerModalProps {
  open: boolean;
  winner: string;
  autoRemove: boolean;
  onRemove: () => void;
  onKeep: () => void;
  winnerFontCss: string;
  headerFontCss: string;
  eventSubtitle: string;
}

export default function WinnerModal({
  open,
  winner,
  autoRemove,
  onRemove,
  onKeep,
  winnerFontCss,
  headerFontCss,
  eventSubtitle,
}: WinnerModalProps) {
  const removeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => removeRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
      onClick={onKeep}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Expanded container size to max-w-2xl */}
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100
          shadow-2xl border-2 border-amber-400/60 animate-[scaleIn_0.3s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="winner-side-fireworks winner-side-fireworks-left" aria-hidden="true">
          <span className="firework firework-one" />
          <span className="firework firework-two" />
          <img src="/assets/images/Asset_3@4x.png" alt="" />
        </div>
        <div className="winner-side-fireworks winner-side-fireworks-right" aria-hidden="true">
          <span className="firework firework-one" />
          <span className="firework firework-two" />
          <img src="/assets/images/Asset_2@4x.png" alt="" />
        </div>
        {/* Decorative top bar */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

        {/* Close button */}
        <button
          onClick={onKeep}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-amber-700/50 hover:bg-amber-200/50 hover:text-amber-900 transition-all active:scale-90 z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center px-6 py-10 sm:py-12">
          {/* Trophy icon */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg ring-4 ring-amber-300/40 mb-5 animate-[bounceIn_0.5s_ease]">
            <Trophy className="w-12 h-12 text-amber-900" />
          </div>

          {/* Congratulations */}
          <h2
            className="text-3xl sm:text-4xl font-bold text-amber-900 mb-1 tracking-wide"
            style={{ fontFamily: headerFontCss }}
          >
            Congratulations!
          </h2>
          {eventSubtitle && (
            <p className="text-base sm:text-lg text-amber-700/70 mb-1" style={{ fontFamily: headerFontCss }}>
              {eventSubtitle}
            </p>
          )}
          <p className="text-sm sm:text-base text-amber-700/60 mb-6">The wheel has chosen</p>

          {/* Enriched & Larger Winner display */}
          <div className="w-full mb-8">
            <div
              className="text-center text-6xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text
                bg-gradient-to-b from-amber-600 via-amber-800 to-amber-950
                py-8 px-6 rounded-3xl bg-white/70 border-2 border-amber-400/60 shadow-inner
                break-words leading-none filter drop-shadow-sm"
              style={{ fontFamily: winnerFontCss }}
            >
              {winner}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            {!autoRemove && (
              <button
                ref={removeRef}
                onClick={onRemove}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base text-white
                  bg-gradient-to-b from-red-500 to-red-600 shadow-md hover:from-red-400 hover:to-red-500
                  active:scale-95 transition-all duration-200"
              >
                <Minus className="w-5 h-5" />
                Remove from Wheel
              </button>
            )}
            <button
              ref={autoRemove ? removeRef : undefined}
              onClick={onKeep}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base text-amber-900
                bg-gradient-to-b from-yellow-300 to-amber-400 shadow-md hover:from-yellow-200 hover:to-amber-300
                active:scale-95 transition-all duration-200"
            >
              <RotateCw className="w-5 h-5" />
              {autoRemove ? 'Next Spin' : 'Keep / Next Spin'}
            </button>
          </div>

          <p className="text-xs text-amber-700/50 mt-6">
            Press Spacebar or Enter to continue
          </p>
        </div>
      </div>
    </div>
  );
}