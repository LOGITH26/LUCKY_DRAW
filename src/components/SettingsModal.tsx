import { useState, useRef, useEffect } from 'react';
import {
  X, Volume2, Play, Square, Upload, Music, Image, Palette as PaletteIcon,
  Clock, PartyPopper, Type, Sparkles, Leaf, Lightbulb, Flower2,
  Sun,
} from 'lucide-react';
import { PALETTE_OPTIONS } from '@/lib/colors';
import { readFileAsDataURL } from '@/lib/storage';
import { AudioEngine } from '@/lib/audio';

export type FontFamily = 'system' | 'serif' | 'script' | 'bold-sans';
export type BorderStyle = 'metallic' | 'floral' | 'jewels';
export type ConfettiStyle = 'petals' | 'glitter' | 'ribbons' | 'balloons';

export interface SettingsState {
  spinDuration: number;
  tickerVolume: number;
  celebrationVolume: number;
  autoRemoveWinner: boolean;
  customLogo: string | null;
  customBg: string | null;
  useCustomBg: boolean;
  customVictoryAudio: string | null;
  palette: string[];
  paletteName: string;
  // Event text
  eventTitle: string;
  eventSubtitle: string;
  // Fonts
  sliceFont: FontFamily;
  winnerFont: FontFamily;
  headerFont: FontFamily;
  // Wheel border
  borderStyle: BorderStyle;
  // Corner embellishments
  cornerLeaves: boolean;
  cornerLamps: boolean;
  cornerGarlands: boolean;
  // Vignette
  vignette: number; // 0..1
  // Confetti
  confettiStyle: ConfettiStyle;
}

interface SettingsModalProps {
  open: boolean;
  initialTab?: number;
  state: SettingsState;
  onChange: (state: SettingsState) => void;
  onClose: () => void;
  audioEngine: AudioEngine;
}

type Tab = 'spinning' | 'celebration' | 'design' | 'stage';

const FONT_OPTIONS: { value: FontFamily; label: string; css: string }[] = [
  { value: 'system', label: 'System Sans', css: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { value: 'serif', label: 'Traditional Serif', css: "'Georgia', 'Times New Roman', serif" },
  { value: 'script', label: 'Festive Script', css: "'Brush Script MT', 'Segoe Script', cursive" },
  { value: 'bold-sans', label: 'Modern Bold Sans', css: "'Arial Black', 'Helvetica Neue', sans-serif" },
];

const BORDER_OPTIONS: { value: BorderStyle; label: string; desc: string }[] = [
  { value: 'metallic', label: 'Metallic Ring', desc: 'Clean gold metallic band' },
  { value: 'floral', label: 'Floral Pookkalam', desc: 'Intricate floral wreath border' },
  { value: 'jewels', label: 'Glowing Jewels', desc: 'LED-studded jewel lights' },
];

const CONFETTI_OPTIONS: { value: ConfettiStyle; label: string; desc: string }[] = [
  { value: 'petals', label: 'Flower Petals', desc: 'Marigold & jasmine petals drift down' },
  { value: 'glitter', label: 'Golden Glitter', desc: 'Shimmering golden sparkles' },
  { value: 'ribbons', label: 'Party Ribbons', desc: 'Classic colorful confetti ribbons' },
  { value: 'balloons', label: 'Floating Balloons', desc: 'Balloons rise up gently' },
];

export const FONT_CSS: Record<FontFamily, string> = {
  system: FONT_OPTIONS[0].css,
  serif: FONT_OPTIONS[1].css,
  script: FONT_OPTIONS[2].css,
  'bold-sans': FONT_OPTIONS[3].css,
};

export default function SettingsModal({
  open,
  initialTab = 0,
  state,
  onChange,
  onClose,
  audioEngine,
}: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>(
    initialTab === 3 ? 'stage' :
    initialTab === 2 ? 'design' :
    initialTab === 1 ? 'celebration' : 'spinning'
  );
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (open) {
      setTab(
        initialTab === 3 ? 'stage' :
        initialTab === 2 ? 'design' :
        initialTab === 1 ? 'celebration' : 'spinning'
      );
    }
  }, [open, initialTab]);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, []);

  if (!open) return null;

  const update = (partial: Partial<SettingsState>) => onChange({ ...state, ...partial });

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    update({ customLogo: dataUrl });
  };

  const handleBgUpload = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    update({ customBg: dataUrl, useCustomBg: true });
  };

  const handleVictoryAudioUpload = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    update({ customVictoryAudio: dataUrl });
  };

  const previewVictory = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (state.customVictoryAudio) {
      audioEngine.setCelebrationVolume(state.celebrationVolume);
      previewAudioRef.current = audioEngine.previewCustom(state.customVictoryAudio);
    } else {
      audioEngine.setCelebrationVolume(state.celebrationVolume);
      audioEngine.previewCelebration();
    }
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'spinning', label: 'Spinning', icon: <Clock className="w-4 h-4" /> },
    { id: 'celebration', label: 'Post-Spin', icon: <PartyPopper className="w-4 h-4" /> },
    { id: 'design', label: 'Wheel Design', icon: <PaletteIcon className="w-4 h-4" /> },
    { id: 'stage', label: 'Stage & Event', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-b from-amber-50 to-yellow-100 shadow-2xl border border-amber-300/60 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-800 to-yellow-700">
          <h2 className="text-lg font-bold text-amber-50 flex items-center gap-2">
            <PaletteIcon className="w-5 h-5" /> Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-100 hover:bg-amber-600/50 hover:text-white transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amber-300/40 bg-amber-100/60 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                tab === t.id
                  ? 'text-amber-900 bg-gradient-to-b from-amber-100 to-yellow-50 border-b-2 border-amber-500'
                  : 'text-amber-700/50 hover:text-amber-800 hover:bg-amber-50/40 border-b-2 border-transparent'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'spinning' && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Volume2 className="w-4 h-4" /> Ticker Sound Volume
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={state.tickerVolume}
                  onChange={(e) => update({ tickerVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-xs text-amber-700/50 mt-1">
                  <span>Off</span>
                  <span>{Math.round(state.tickerVolume * 100)}%</span>
                  <span>Max</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Clock className="w-4 h-4" /> Spin Duration: {state.spinDuration}s
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={state.spinDuration}
                  onChange={(e) => update({ spinDuration: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-xs text-amber-700/50 mt-1">
                  <span>1s</span>
                  <span>20s</span>
                </div>
              </div>

              <div className="rounded-xl bg-amber-100/60 border border-amber-300/40 p-4">
                <p className="text-sm text-amber-800">
                  A mechanical ticker click plays during the spin using the Web Audio API.
                  Adjust the volume and spin duration above.
                </p>
              </div>
            </div>
          )}

          {tab === 'celebration' && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Volume2 className="w-4 h-4" /> Celebration Volume
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={state.celebrationVolume}
                  onChange={(e) => update({ celebrationVolume: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-xs text-amber-700/50 mt-1">
                  <span>Off</span>
                  <span>{Math.round(state.celebrationVolume * 100)}%</span>
                  <span>Max</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                  <Music className="w-4 h-4" /> Default Celebration Sound
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Built-in Chenda drum roll + fanfare plays on win (unless custom audio is uploaded).
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={previewVictory}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors active:scale-95"
                  >
                    <Play className="w-4 h-4" /> Preview
                  </button>
                  <button
                    onClick={stopPreview}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors active:scale-95"
                  >
                    <Square className="w-4 h-4" /> Stop
                  </button>
                </div>
              </div>

              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                  <Upload className="w-4 h-4" /> Custom Victory Audio
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Upload your own .mp3 or .wav file to play instead of the default fanfare.
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleVictoryAudioUpload(e.target.files?.[0])}
                  className="block w-full text-sm text-amber-800 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700 file:cursor-pointer cursor-pointer"
                />
                {state.customVictoryAudio && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-300/40 px-3 py-2">
                    <Music className="w-4 h-4 text-green-700" />
                    <span className="text-sm text-green-800 flex-1 truncate">Custom audio uploaded</span>
                    <button
                      onClick={() => update({ customVictoryAudio: null })}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <PartyPopper className="w-4 h-4" /> Auto-Remove Winner
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.autoRemoveWinner}
                    onChange={(e) => update({ autoRemoveWinner: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-600"
                  />
                  <span className="text-sm text-amber-800">
                    Automatically remove winner from entries on spin completion
                  </span>
                </label>
              </div>

              {/* Confetti style */}
              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Sparkles className="w-4 h-4" /> Confetti Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CONFETTI_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update({ confettiStyle: opt.value })}
                      className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 ${
                        state.confettiStyle === opt.value
                          ? 'border-amber-500 bg-amber-100 shadow-md'
                          : 'border-amber-200/40 hover:border-amber-400 hover:bg-amber-50'
                      }`}
                    >
                      <div className="text-sm font-semibold text-amber-900">{opt.label}</div>
                      <div className="text-xs text-amber-700/50">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'design' && (
            <div className="space-y-6">
              {/* Center logo */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                  <Image className="w-4 h-4" /> Center Logo
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Upload a PNG/JPG to display in the wheel's center hub. Leave empty for default Onam motif.
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  className="block w-full text-sm text-amber-800 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700 file:cursor-pointer cursor-pointer"
                />
                {state.customLogo && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={state.customLogo}
                      alt="Logo preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
                    />
                    <button
                      onClick={() => update({ customLogo: null })}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove logo
                    </button>
                  </div>
                )}
              </div>

              {/* Background */}
              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                  <Image className="w-4 h-4" /> Background
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Upload a custom background image, or use the festive Onam preset.
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleBgUpload(e.target.files?.[0])}
                  className="block w-full text-sm text-amber-800 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700 file:cursor-pointer cursor-pointer"
                />
                {state.customBg && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={state.customBg}
                      alt="Background preview"
                      className="w-24 h-16 rounded-lg object-cover border-2 border-amber-400 shadow-md"
                    />
                    <button
                      onClick={() => update({ customBg: null, useCustomBg: false })}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove & use preset
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-3 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.useCustomBg && !!state.customBg}
                    onChange={(e) => update({ useCustomBg: e.target.checked })}
                    disabled={!state.customBg}
                    className="w-5 h-5 rounded accent-amber-600"
                  />
                  <span className="text-sm text-amber-800">Use custom background image</span>
                </label>
              </div>

              {/* Color palette */}
              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <PaletteIcon className="w-4 h-4" /> Color Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PALETTE_OPTIONS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => update({ palette: p.colors, paletteName: p.name })}
                      className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-all duration-200 ${
                        state.paletteName === p.name
                          ? 'border-amber-500 bg-amber-100 shadow-md'
                          : 'border-amber-200/40 hover:border-amber-400 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex gap-1">
                        {p.colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-amber-900">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wheel border accent */}
              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Sparkles className="w-4 h-4" /> Wheel Border Accent
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BORDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update({ borderStyle: opt.value })}
                      className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 ${
                        state.borderStyle === opt.value
                          ? 'border-amber-500 bg-amber-100 shadow-md'
                          : 'border-amber-200/40 hover:border-amber-400 hover:bg-amber-50'
                      }`}
                    >
                      <div className="text-sm font-semibold text-amber-900">{opt.label}</div>
                      <div className="text-xs text-amber-700/50">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font family */}
              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Type className="w-4 h-4" /> Font Family
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-amber-700/60 mb-1 block">Slice Numbers</label>
                    <select
                      value={state.sliceFont}
                      onChange={(e) => update({ sliceFont: e.target.value as FontFamily })}
                      className="w-full rounded-lg border border-amber-300/60 bg-white/70 px-3 py-2 text-sm text-amber-900 focus:outline-none focus:border-amber-500"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-amber-700/60 mb-1 block">Winner Announcement</label>
                    <select
                      value={state.winnerFont}
                      onChange={(e) => update({ winnerFont: e.target.value as FontFamily })}
                      className="w-full rounded-lg border border-amber-300/60 bg-white/70 px-3 py-2 text-sm text-amber-900 focus:outline-none focus:border-amber-500"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-amber-700/60 mb-1 block">Headers & Titles</label>
                    <select
                      value={state.headerFont}
                      onChange={(e) => update({ headerFont: e.target.value as FontFamily })}
                      className="w-full rounded-lg border border-amber-300/60 bg-white/70 px-3 py-2 text-sm text-amber-900 focus:outline-none focus:border-amber-500"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'stage' && (
            <div className="space-y-6">
              {/* Event title & subtitle */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Type className="w-4 h-4" /> Custom Event Header
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Set your event name and category/round. This appears in the top bar and fullscreen title.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-amber-700/60 mb-1 block">Event Name</label>
                    <input
                      type="text"
                      value={state.eventTitle}
                      onChange={(e) => update({ eventTitle: e.target.value })}
                      placeholder="e.g. Onaghosham 2026"
                      className="w-full rounded-lg border border-amber-300/60 bg-white/70 px-3 py-2 text-sm text-amber-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-amber-700/60 mb-1 block">Category / Round</label>
                    <input
                      type="text"
                      value={state.eventSubtitle}
                      onChange={(e) => update({ eventSubtitle: e.target.value })}
                      placeholder="e.g. Grand Prize Round"
                      className="w-full rounded-lg border border-amber-300/60 bg-white/70 px-3 py-2 text-sm text-amber-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Corner embellishments */}
              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Leaf className="w-4 h-4" /> Corner Embellishments
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Toggle decorative corner assets on or off to fit different projector aspect ratios.
                </p>
                <div className="space-y-2.5">
                  <ToggleRow
                    icon={<Leaf className="w-4 h-4" />}
                    label="Banana Leaves"
                    checked={state.cornerLeaves}
                    onChange={(v) => update({ cornerLeaves: v })}
                  />
                  <ToggleRow
                    icon={<Lightbulb className="w-4 h-4" />}
                    label="Nilavilakku Lamps"
                    checked={state.cornerLamps}
                    onChange={(v) => update({ cornerLamps: v })}
                  />
                  <ToggleRow
                    icon={<Flower2 className="w-4 h-4" />}
                    label="Floral Garlands"
                    checked={state.cornerGarlands}
                    onChange={(v) => update({ cornerGarlands: v })}
                  />
                </div>
              </div>

              {/* Vignette / ambient lighting */}
              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Sun className="w-4 h-4" /> Ambient Lighting / Vignette
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Adjust the dark vignette behind the wheel so numbers pop on low-contrast projectors.
                </p>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={state.vignette}
                  onChange={(e) => update({ vignette: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-xs text-amber-700/50 mt-1">
                  <span>None</span>
                  <span>{Math.round(state.vignette * 100)}%</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded accent-amber-600"
      />
      <span className="flex items-center gap-2 text-sm text-amber-800">
        {icon}
        {label}
      </span>
    </label>
  );
}
