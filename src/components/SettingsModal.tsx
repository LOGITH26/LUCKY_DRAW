import { useState, useRef, useEffect } from 'react';
import {
  X, Volume2, Play, Square, Upload, Music, Image, Palette as PaletteIcon,
  Clock, PartyPopper, Type, Sparkles, Leaf, Lightbulb, Flower2,
  Sun, Pipette,
} from 'lucide-react';
import { PALETTE_OPTIONS } from '@/lib/colors';
import { readFileAsDataURL } from '@/lib/storage';
import { AudioEngine } from '@/lib/audio';

export type FontFamily =
  | 'system'
  | 'serif'
  | 'script'
  | 'bold-sans'
  | 'cinzel'
  | 'playfair'
  | 'montserrat'
  | 'bebas'
  | 'samarkan'
  | 'cormorant'
  | 'poppins'
  | 'righteous';

export type BorderStyle = 'metallic' | 'floral' | 'jewels';
export type ConfettiStyle = 'petals' | 'glitter' | 'ribbons' | 'balloons';
export type TitleColorTheme = 'gold' | 'silver' | 'bronze' | 'ruby' | 'emerald' | 'white' | 'custom';

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
  eventTitle: string;
  eventSubtitle: string;
  titleTheme?: TitleColorTheme;
  titleCustomColor?: string;
  sliceFont: FontFamily;
  winnerFont: FontFamily;
  headerFont: FontFamily;
  borderStyle: BorderStyle;
  cornerLeaves: boolean;
  cornerLamps: boolean;
  cornerGarlands: boolean;
  vignette: number;
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

export const FONT_OPTIONS: { value: FontFamily; label: string; css: string }[] = [
  { value: 'cinzel', label: 'Cinzel Decorative (Regal & Classical)', css: "'Cinzel Decorative', serif" },
  { value: 'playfair', label: 'Playfair Display (Elegant Serif)', css: "'Playfair Display', serif" },
  { value: 'montserrat', label: 'Montserrat (Bold & Modern)', css: "'Montserrat', sans-serif" },
  { value: 'bebas', label: 'Bebas Neue (Punchy & Tall)', css: "'Bebas Neue', sans-serif" },
  { value: 'samarkan', label: 'Rozha One (Traditional Indian Display)', css: "'Rozha One', serif" },
  { value: 'cormorant', label: 'Cormorant Garamond (Graceful Serif)', css: "'Cormorant Garamond', serif" },
  { value: 'poppins', label: 'Poppins (Geometric Clean)', css: "'Poppins', sans-serif" },
  { value: 'righteous', label: 'Righteous (Stage & Retro)', css: "'Righteous', sans-serif" },
  { value: 'system', label: 'System Sans', css: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { value: 'serif', label: 'Traditional Serif (Georgia)', css: "'Georgia', 'Times New Roman', serif" },
  { value: 'script', label: 'Festive Script', css: "'Brush Script MT', 'Segoe Script', cursive" },
  { value: 'bold-sans', label: 'Heavy Sans (Arial Black)', css: "'Arial Black', 'Helvetica Neue', sans-serif" },
];

export const TITLE_COLOR_THEMES: Record<TitleColorTheme, { label: string; gradient: string }> = {
  gold: { label: 'Metallic Gold', gradient: 'from-[#FFF6CC] via-[#F5D061] to-[#A37010]' },
  silver: { label: 'Metallic Silver / Chrome', gradient: 'from-[#FFFFFF] via-[#D1D5DB] to-[#6B7280]' },
  bronze: { label: 'Metallic Bronze / Rose Gold', gradient: 'from-[#FFE4D6] via-[#E0A985] to-[#8C4A2F]' },
  ruby: { label: 'Ruby Festive', gradient: 'from-[#FFE4E6] via-[#F43F5E] to-[#9F1239]' },
  emerald: { label: 'Emerald Jewel', gradient: 'from-[#D1FAE5] via-[#10B981] to-[#065F46]' },
  white: { label: 'Pure Crisp White', gradient: 'from-[#FFFFFF] via-[#F9FAFB] to-[#E5E7EB]' },
  custom: { label: 'Custom Solid Color', gradient: '' },
};

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

export const FONT_CSS: Record<FontFamily, string> = FONT_OPTIONS.reduce(
  (acc, item) => ({ ...acc, [item.value]: item.css }),
  {} as Record<FontFamily, string>
);

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
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                  <Music className="w-4 h-4" /> Default Celebration Sound
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={previewVictory}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    <Play className="w-4 h-4" /> Preview
                  </button>
                  <button
                    onClick={stopPreview}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    <Square className="w-4 h-4" /> Stop
                  </button>
                </div>
              </div>

              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                  <Upload className="w-4 h-4" /> Custom Victory Audio (.mp3/.wav)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleVictoryAudioUpload(e.target.files?.[0])}
                  className="block w-full text-sm text-amber-800 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                />
                {state.customVictoryAudio && (
                  <button
                    onClick={() => update({ customVictoryAudio: null })}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove custom audio
                  </button>
                )}
              </div>

              <div className="border-t border-amber-300/40 pt-5">
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
            </div>
          )}

          {tab === 'design' && (
            <div className="space-y-6">
              {/* Center logo option */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                  <Image className="w-4 h-4" /> Wheel Center Logo Option
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Upload a custom image to display in the center hub of the spin wheel.
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  className="block w-full text-sm text-amber-800 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                />
                {state.customLogo && (
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-amber-400 shadow-md shrink-0"
                      style={{ backgroundImage: `url(${state.customLogo})` }}
                    />
                    <button
                      onClick={() => update({ customLogo: null })}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove custom logo
                    </button>
                  </div>
                )}
              </div>

              {/* Background option */}
              <div className="border-t border-amber-300/40 pt-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-2">
                  <Image className="w-4 h-4" /> Background Option
                </label>
                <p className="text-xs text-amber-700/60 mb-3">
                  Upload a custom background image for your stage/app view.
                </p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleBgUpload(e.target.files?.[0])}
                  className="block w-full text-sm text-amber-800 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                />
                {state.customBg && (
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className="w-24 h-16 rounded-lg bg-cover bg-center border-2 border-amber-400 shadow-md shrink-0"
                      style={{ backgroundImage: `url(${state.customBg})` }}
                    />
                    <button
                      onClick={() => update({ customBg: null, useCustomBg: false })}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove custom background
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
            </div>
          )}

          {tab === 'stage' && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-900 mb-3">
                  <Type className="w-4 h-4" /> Custom Event Header
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-amber-700/60 mb-1 block">Event Name</label>
                    <input
                      type="text"
                      value={state.eventTitle}
                      onChange={(e) => update({ eventTitle: e.target.value })}
                      className="w-full rounded-lg border border-amber-300/60 bg-white/70 px-3 py-2 text-sm text-amber-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-amber-700/60 mb-1 block">Category / Round</label>
                    <input
                      type="text"
                      value={state.eventSubtitle}
                      onChange={(e) => update({ eventSubtitle: e.target.value })}
                      className="w-full rounded-lg border border-amber-300/60 bg-white/70 px-3 py-2 text-sm text-amber-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}