import { useState, useEffect, useRef } from 'react';
import { X, Hash, Ticket } from 'lucide-react';

interface RangeModalProps {
  open: boolean;
  onClose: () => void;
  onPopulate: (entries: string[]) => void;
}

type RangeMode = 'ticket' | 'number';

export default function RangeModal({ open, onClose, onPopulate }: RangeModalProps) {
  const [mode, setMode] = useState<RangeMode>('ticket');
  const [prefix, setPrefix] = useState('J');
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(400);
  const [padding, setPadding] = useState(3);
  const startRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => startRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  const count = Math.abs(end - start) + 1;
  const formatId = (value: number) => `${prefix.trim().toUpperCase()}${String(value).padStart(padding, '0')}`;
  const preview = mode === 'ticket' ? `${formatId(lo)} to ${formatId(hi)}` : `${lo} to ${hi}`;

  const populate = () => {
    const entries: string[] = [];
    for (let value = lo; value <= hi; value += 1) {
      entries.push(mode === 'ticket' ? formatId(value) : String(value));
    }
    onPopulate(entries);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') populate();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-amber-50 to-yellow-100 shadow-2xl border border-amber-300/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-800 to-yellow-700">
          <h2 className="text-lg font-bold text-amber-50 flex items-center gap-2">
            <Ticket className="w-5 h-5" /> Generate Ticket IDs
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-100 hover:bg-amber-600/50 hover:text-white transition-all active:scale-90" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5" onKeyDown={handleKeyDown}>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-amber-200/50 p-1">
            <button
              onClick={() => setMode('ticket')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode === 'ticket' ? 'bg-white text-amber-900 shadow-sm' : 'text-amber-700'}`}
            >
              <Ticket className="w-4 h-4" /> Ticket IDs
            </button>
            <button
              onClick={() => setMode('number')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${mode === 'number' ? 'bg-white text-amber-900 shadow-sm' : 'text-amber-700'}`}
            >
              <Hash className="w-4 h-4" /> Numbers
            </button>
          </div>

          {mode === 'ticket' && (
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <div>
                <label className="text-sm font-semibold text-amber-900 mb-2 block">Ticket Prefix</label>
                <input
                  ref={startRef}
                  type="text"
                  value={prefix}
                  maxLength={8}
                  onChange={(e) => setPrefix(e.target.value.replace(/[^a-z0-9-]/gi, ''))}
                  placeholder="J"
                  className="w-full rounded-lg border border-amber-300/40 bg-white/80 px-4 py-2.5 text-lg font-semibold uppercase text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-amber-900 mb-2 block">Digits</label>
                <select
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full rounded-lg border border-amber-300/40 bg-white/80 px-4 py-3 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} digits</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-amber-900 mb-2 block">Start</label>
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-lg border border-amber-300/40 bg-white/80 px-4 py-2.5 text-lg font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-amber-900 mb-2 block">End</label>
              <input
                type="number"
                value={end}
                onChange={(e) => setEnd(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-lg border border-amber-300/40 bg-white/80 px-4 py-2.5 text-lg font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-100/60 border border-amber-300/40 px-4 py-3">
            <p className="text-sm text-amber-800">
              This will generate <strong>{count}</strong> entries from <strong>{preview}</strong>, replacing the current list.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg font-medium text-amber-800 bg-amber-200/60 hover:bg-amber-200 transition-colors active:scale-95">Cancel</button>
            <button onClick={populate} className="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-md active:scale-95 transition-all">Populate Entries</button>
          </div>
        </div>
      </div>
    </div>
  );
}
