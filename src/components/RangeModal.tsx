import { useState, useEffect, useRef } from 'react';
import { X, Hash } from 'lucide-react';

interface RangeModalProps {
  open: boolean;
  onClose: () => void;
  onPopulate: (entries: string[]) => void;
}

export default function RangeModal({ open, onClose, onPopulate }: RangeModalProps) {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(400);
  const minRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => minRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const populate = () => {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const entries: string[] = [];
    for (let i = lo; i <= hi; i++) {
      entries.push(String(i));
    }
    onPopulate(entries);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') populate();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-amber-50 to-yellow-100 shadow-2xl border border-amber-300/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-800 to-yellow-700">
          <h2 className="text-lg font-bold text-amber-50 flex items-center gap-2">
            <Hash className="w-5 h-5" /> Generate Number Range
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-100 hover:bg-amber-600/50 hover:text-white transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5" onKeyDown={handleKeyDown}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-amber-900 mb-2 block">Min Number</label>
              <input
                ref={minRef}
                type="number"
                value={min}
                onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-amber-300/40 bg-white/80 px-4 py-2.5 text-lg font-semibold text-amber-900
                  focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-amber-900 mb-2 block">Max Number</label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-amber-300/40 bg-white/80 px-4 py-2.5 text-lg font-semibold text-amber-900
                  focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-100/60 border border-amber-300/40 px-4 py-3">
            <p className="text-sm text-amber-800">
              This will generate <strong>{Math.abs(max - min) + 1}</strong> entries
              ({Math.min(min, max)} to {Math.max(min, max)}), replacing the current list.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-amber-800 bg-amber-200/60 hover:bg-amber-200 transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={populate}
              className="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-md active:scale-95 transition-all"
            >
              Populate Entries
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
