import { useState, useRef, useEffect } from 'react';
import { Shuffle, ArrowDownAZ, ArrowUpAZ, Hash, Ban, Trash2, Download, List, Trophy } from 'lucide-react';

export interface WinnerRecord {
  name: string;
  timestamp: number;
}

interface EntriesPanelProps {
  entries: string[];
  onEntriesChange: (entries: string[]) => void;
  history: WinnerRecord[];
  onClearHistory: () => void;
  onOpenRangeModal: () => void;
}

type Tab = 'entries' | 'results';

export default function EntriesPanel({
  entries,
  onEntriesChange,
  history,
  onClearHistory,
  onOpenRangeModal,
}: EntriesPanelProps) {
  const [tab, setTab] = useState<Tab>('entries');
  const [excludeText, setExcludeText] = useState('');
  const [showExclude, setShowExclude] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync textarea with entries prop
  const [text, setText] = useState(entries.join('\n'));
  useEffect(() => {
    setText(entries.join('\n'));
  }, [entries]);

  const handleTextChange = (value: string) => {
    setText(value);
    const parsed = value.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    onEntriesChange(parsed);
  };

  const shuffle = () => {
    const arr = [...entries];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setText(arr.join('\n'));
    onEntriesChange(arr);
  };

  const sortAZ = () => {
    const sorted = [...entries].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    setText(sorted.join('\n'));
    onEntriesChange(sorted);
  };

  const sortNumeric = () => {
    const sorted = [...entries].sort((a, b) => {
      const na = parseFloat(a);
      const nb = parseFloat(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
    setText(sorted.join('\n'));
    onEntriesChange(sorted);
  };

  const applyExclude = () => {
    const excludeItems = excludeText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const filtered = entries.filter((e) => !excludeItems.includes(e));
    setText(filtered.join('\n'));
    onEntriesChange(filtered);
    setExcludeText('');
    setShowExclude(false);
  };

  const clearAll = () => {
    setText('');
    onEntriesChange([]);
  };

  const exportCSV = () => {
    const csv = 'Winner,Timestamp\n' +
      history.map((w) => `"${w.name.replace(/"/g, '""')}",${new Date(w.timestamp).toISOString()}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'winners-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-amber-50/95 to-yellow-100/90 rounded-2xl shadow-xl border border-amber-300/50 overflow-hidden">
      {/* Tab header */}
      <div className="flex border-b border-amber-300/40 bg-amber-100/60">
        <TabButton active={tab === 'entries'} onClick={() => setTab('entries')} icon={<List className="w-4 h-4" />}>
          Entries
        </TabButton>
        <TabButton active={tab === 'results'} onClick={() => setTab('results')} icon={<Trophy className="w-4 h-4" />}>
          Results
        </TabButton>
      </div>

      {tab === 'entries' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Entry count badge */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/50 border-b border-amber-200/40">
            <span className="text-sm font-semibold text-amber-900">
              Entries: <span className="text-amber-700 text-base font-bold">{entries.length}</span>
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-amber-700/60 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {/* Textarea */}
          <div className="flex-1 px-4 py-3 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter names or numbers, one per line..."
              className="w-full h-full resize-none rounded-lg border border-amber-300/40 bg-white/80 p-3 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
                placeholder:text-amber-700/30 font-medium leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Exclude input */}
          {showExclude && (
            <div className="px-4 pb-2 animate-[fadeIn_0.2s_ease]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={excludeText}
                  onChange={(e) => setExcludeText(e.target.value)}
                  placeholder="Comma-separated items to exclude..."
                  className="flex-1 rounded-lg border border-amber-300/40 bg-white/80 px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  onKeyDown={(e) => e.key === 'Enter' && applyExclude()}
                />
                <button
                  onClick={applyExclude}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Exclude
                </button>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2.5 border-t border-amber-200/40 bg-amber-50/40 flex-wrap">
            <ToolbarButton onClick={shuffle} label="Shuffle" icon={<Shuffle className="w-4 h-4" />} />
            <ToolbarButton onClick={sortAZ} label="Sort A-Z" icon={<ArrowDownAZ className="w-4 h-4" />} />
            <ToolbarButton onClick={sortNumeric} label="Sort 1-9" icon={<ArrowUpAZ className="w-4 h-4" />} />
            <ToolbarButton onClick={onOpenRangeModal} label="Range" icon={<Hash className="w-4 h-4" />} />
            <ToolbarButton
              onClick={() => setShowExclude((s) => !s)}
              label="Exclude"
              icon={<Ban className="w-4 h-4" />}
              active={showExclude}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50/50 border-b border-amber-200/40">
            <span className="text-sm font-semibold text-amber-900">
              History: <span className="text-amber-700 font-bold">{history.length}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                disabled={history.length === 0}
                className="text-xs text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1 disabled:opacity-30"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={onClearHistory}
                disabled={history.length === 0}
                className="text-xs text-amber-700/60 hover:text-red-600 transition-colors flex items-center gap-1 disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-amber-700/40">
                <Trophy className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No winners yet. Spin the wheel!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {history.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-white/70 border border-amber-200/40 px-3 py-2.5
                      hover:bg-amber-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shrink-0">
                        <Trophy className="w-3.5 h-3.5 text-amber-900" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 truncate">{w.name}</span>
                    </div>
                    <span className="text-[11px] text-amber-700/50 whitespace-nowrap ml-2">
                      {new Date(w.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'text-amber-900 bg-gradient-to-b from-amber-100 to-yellow-50 border-b-2 border-amber-500'
          : 'text-amber-700/50 hover:text-amber-800 hover:bg-amber-50/40 border-b-2 border-transparent'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ToolbarButton({
  onClick,
  label,
  icon,
  active = false,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 ${
        active
          ? 'bg-amber-500 text-white shadow-sm'
          : 'text-amber-800 hover:bg-amber-200/50 hover:text-amber-900'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
