import { useState, useEffect, useRef, useCallback } from 'react';
import { Undo2, Pencil } from 'lucide-react';
import TopNav from '@/components/TopNav';
import SpinWheel from '@/components/SpinWheel';
import EntriesPanel, { WinnerRecord } from '@/components/EntriesPanel';
import SettingsModal, {
  SettingsState,
  FONT_CSS,
  TITLE_COLOR_THEMES,
} from '@/components/SettingsModal';
import WinnerModal from '@/components/WinnerModal';
import RangeModal from '@/components/RangeModal';
import OnamBackground from '@/components/OnamBackground';
import CornerEmbellishments from '@/components/CornerEmbellishments';
import { AudioEngine } from '@/lib/audio';
import { celebrateConfetti } from '@/lib/confetti';
import { ONAM_PALETTE } from '@/lib/colors';
import {
  loadSettings,
  saveSettings,
  saveAsset,
  loadAsset,
  defaultSettings,
} from '@/lib/storage';

const DEFAULT_ENTRIES = Array.from({ length: 100 }, (_, i) => String(i + 1));
const STORAGE_KEY_ENTRIES = 'jbma_wheel_entries';
const STORAGE_KEY_HISTORY = 'jbma_wheel_history';

// Helper to convert an image path to a base64 data URL
async function urlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function App() {
  const [settings, setSettings] = useState<SettingsState>({
    spinDuration: defaultSettings.spinDuration,
    tickerVolume: 1.0,
    celebrationVolume: 1.0,
    autoRemoveWinner: defaultSettings.autoRemoveWinner,
    customLogo: null,
    customBg: null,
    useCustomBg: true,
    customVictoryAudio: null,
    palette: ONAM_PALETTE,
    paletteName: 'Onam Festive',
    eventTitle: 'Onaghosham Lucky Draw',
    eventSubtitle: defaultSettings.eventSubtitle,
    titleTheme: 'gold',
    titleCustomColor: '#F59E0B',
    sliceFont: defaultSettings.sliceFont as SettingsState['sliceFont'],
    winnerFont: defaultSettings.winnerFont as SettingsState['winnerFont'],
    headerFont: defaultSettings.headerFont as SettingsState['headerFont'],
    borderStyle: defaultSettings.borderStyle as SettingsState['borderStyle'],
    cornerLeaves: defaultSettings.cornerLeaves,
    cornerLamps: defaultSettings.cornerLamps,
    cornerGarlands: defaultSettings.cornerGarlands,
    vignette: defaultSettings.vignette,
    confettiStyle: defaultSettings.confettiStyle as SettingsState['confettiStyle'],
  });

  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const [entries, setEntries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load entries', e);
    }
    return DEFAULT_ENTRIES;
  });

  const [history, setHistory] = useState<WinnerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [winner, setWinner] = useState<{ name: string; index: number } | null>(null);

  const [undoSnapshot, setUndoSnapshot] = useState<{
    entries: string[];
    history: WinnerRecord[];
    winner: { name: string; index: number } | null;
  } | null>(null);

  const audioEngineRef = useRef<AudioEngine | null>(null);
  if (!audioEngineRef.current) {
    audioEngineRef.current = new AudioEngine();
  }
  const audioEngine = audioEngineRef.current;

  const entriesRef = useRef(entries);
  const historyRef = useRef(history);
  const winnerRef = useRef(winner);
  useEffect(() => { entriesRef.current = entries; }, [entries]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { winnerRef.current = winner; }, [winner]);

  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const init = async () => {
      const persisted = loadSettings();
      let logo = await loadAsset('customLogo');
      let bg = await loadAsset('customBg');
      
      // Fallback direct load if storage helper missed it
      if (!logo) {
        try {
          logo = await urlToDataUrl('/images/LOGO.png');
          await saveAsset('customLogo', logo);
        } catch (err) {
          console.error('Failed to load default logo', err);
        }
      }

      if (!bg) {
        try {
          bg = await urlToDataUrl('/images/BACKGROUND.png');
          await saveAsset('customBg', bg);
        } catch (err) {
          console.error('Failed to load default bg', err);
        }
      }

      const victoryAudio = await loadAsset('customVictoryAudio');

      const loaded: SettingsState = {
        ...settings,
        spinDuration: persisted.spinDuration,
        tickerVolume: persisted.tickerVolume ?? 1.0,
        celebrationVolume: persisted.celebrationVolume ?? 1.0,
        autoRemoveWinner: persisted.autoRemoveWinner,
        customLogo: logo,
        customBg: bg,
        useCustomBg: persisted.useCustomBg ?? true,
        customVictoryAudio: victoryAudio,
        eventTitle: persisted.eventTitle || 'Onaghosham Lucky Draw',
        eventSubtitle: persisted.eventSubtitle || defaultSettings.eventSubtitle,
        titleTheme: (persisted as any).titleTheme || 'gold',
        titleCustomColor: (persisted as any).titleCustomColor || '#F59E0B',
        sliceFont: (persisted.sliceFont || defaultSettings.sliceFont) as SettingsState['sliceFont'],
        winnerFont: (persisted.winnerFont || defaultSettings.winnerFont) as SettingsState['winnerFont'],
        headerFont: (persisted.headerFont || defaultSettings.headerFont) as SettingsState['headerFont'],
        borderStyle: (persisted.borderStyle || defaultSettings.borderStyle) as SettingsState['borderStyle'],
        cornerLeaves: persisted.cornerLeaves ?? defaultSettings.cornerLeaves,
        cornerLamps: persisted.cornerLamps ?? defaultSettings.cornerLamps,
        cornerGarlands: persisted.cornerGarlands ?? defaultSettings.cornerGarlands,
        vignette: persisted.vignette ?? defaultSettings.vignette,
        confettiStyle: (persisted.confettiStyle || defaultSettings.confettiStyle) as SettingsState['confettiStyle'],
      };
      setSettings(loaded);
      setMuted(persisted.muted);
      audioEngine.setMuted(persisted.muted);
    };
    init();
  }, []);

  useEffect(() => {
    saveSettings({
      spinDuration: settings.spinDuration,
      tickerVolume: settings.tickerVolume,
      celebrationVolume: settings.celebrationVolume,
      muted,
      autoRemoveWinner: settings.autoRemoveWinner,
      hasCustomLogo: !!settings.customLogo,
      hasCustomBg: !!settings.customBg,
      useCustomBg: settings.useCustomBg,
      hasCustomVictoryAudio: !!settings.customVictoryAudio,
      title: settings.eventTitle,
      eventTitle: settings.eventTitle,
      eventSubtitle: settings.eventSubtitle,
      titleTheme: settings.titleTheme,
      titleCustomColor: settings.titleCustomColor,
      sliceFont: settings.sliceFont,
      winnerFont: settings.winnerFont,
      headerFont: settings.headerFont,
      borderStyle: settings.borderStyle,
      cornerLeaves: settings.cornerLeaves,
      cornerLamps: settings.cornerLamps,
      cornerGarlands: settings.cornerGarlands,
      vignette: settings.vignette,
      confettiStyle: settings.confettiStyle,
    } as any);
  }, [settings, muted]);

  useEffect(() => {
    if (settings.customLogo) saveAsset('customLogo', settings.customLogo);
  }, [settings.customLogo]);

  useEffect(() => {
    if (settings.customBg) saveAsset('customBg', settings.customBg);
  }, [settings.customBg]);

  useEffect(() => {
    if (settings.customLogo) {
      const img = new Image();
      img.onload = () => setLogoImage(img);
      img.src = settings.customLogo;
    } else {
      setLogoImage(null);
    }
  }, [settings.customLogo]);

  useEffect(() => {
    audioEngine.setTickerVolume(muted ? 0 : settings.tickerVolume);
    audioEngine.setCelebrationVolume(muted ? 0 : settings.celebrationVolume);
    audioEngine.setMuted(muted);
  }, [muted, settings.tickerVolume, settings.celebrationVolume, audioEngine]);

  const handleSpinComplete = useCallback(
    (winnerIndex: number, winnerName: string) => {
      setUndoSnapshot({
        entries: entriesRef.current,
        history: historyRef.current,
        winner: winnerRef.current,
      });

      audioEngine.setCelebrationVolume(muted ? 0 : settings.celebrationVolume);
      if (settings.customVictoryAudio) {
        audioEngine.playCustomAudio(settings.customVictoryAudio);
      } else {
        audioEngine.playCelebration();
      }

      celebrateConfetti(settings.confettiStyle);

      setHistory((prev) => [
        { name: winnerName, timestamp: Date.now() },
        ...prev,
      ]);

      if (settings.autoRemoveWinner) {
        setEntries((prev) => prev.filter((_, i) => i !== winnerIndex));
      }
      setWinner({ name: winnerName, index: winnerIndex });
    },
    [audioEngine, muted, settings.celebrationVolume, settings.customVictoryAudio, settings.autoRemoveWinner, settings.confettiStyle]
  );

  const handleRemoveWinner = () => {
    setWinner(null);
  };

  const handleKeepWinner = () => {
    setWinner(null);
  };

  const handleUndo = () => {
    if (!undoSnapshot) return;
    setEntries(undoSnapshot.entries);
    setHistory(undoSnapshot.history);
    setWinner(undoSnapshot.winner);
    setUndoSnapshot(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleMute = () => {
    setMuted((m) => {
      const newMuted = !m;
      audioEngine.setMuted(newMuted);
      return newMuted;
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `${settings.eventTitle} - Spin the Wheel`,
      text: 'Check out this festive Spin the Wheel lucky draw app!',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {}
  };

  const headerFontCss = FONT_CSS[settings.headerFont] || 'inherit';
  const currentTheme = settings.titleTheme || 'gold';
  const themeGradient = TITLE_COLOR_THEMES[currentTheme]?.gradient || TITLE_COLOR_THEMES.gold.gradient;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden font-sans text-gray-900">
      <OnamBackground
        customBg={settings.useCustomBg ? settings.customBg : null}
        vignette={settings.vignette}
      />
      <CornerEmbellishments
        leaves={settings.cornerLeaves}
        lamps={settings.cornerLamps}
        garlands={settings.cornerGarlands}
        fullscreen={isFullscreen}
      />

      {!isFullscreen && (
        <TopNav
          muted={muted}
          isFullscreen={isFullscreen}
          eventTitle={settings.eventTitle}
          eventSubtitle={settings.eventSubtitle}
          headerFontCss={headerFontCss}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
          onOpenSettings={() => { setSettingsTab(0); setSettingsOpen(true); }}
          onOpenDesign={() => { setSettingsTab(2); setSettingsOpen(true); }}
          onOpenStage={() => { setSettingsTab(3); setSettingsOpen(true); }}
          onShare={handleShare}
        />
      )}

      <main className={`relative z-10 flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden ${isFullscreen ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
        <div className={`flex-1 flex items-center justify-center min-h-0 scale-95 origin-center ${isFullscreen ? 'pt-16 sm:pt-20 pb-16' : 'pb-20'}`}>
          <SpinWheel
            entries={entries}
            palette={settings.palette}
            logoImage={logoImage}
            spinDuration={settings.spinDuration}
            autoRemoveWinner={settings.autoRemoveWinner}
            muted={muted}
            tickerVolume={settings.tickerVolume}
            audioEngine={audioEngine}
            onSpinComplete={handleSpinComplete}
            sliceFontCss={FONT_CSS[settings.sliceFont]}
            borderStyle={settings.borderStyle}
          />
        </div>

        {!isFullscreen && (
          <div className="w-full lg:w-[380px] lg:shrink-0 h-[50vh] lg:h-auto lg:max-h-[calc(100vh-100px)]">
            <EntriesPanel
              entries={entries}
              onEntriesChange={setEntries}
              history={history}
              onClearHistory={() => setHistory([])}
              onOpenRangeModal={() => setRangeOpen(true)}
              canUndo={!!undoSnapshot}
              onUndo={handleUndo}
            />
          </div>
        )}
      </main>

      {isFullscreen && (
        <div className="fixed top-0 left-0 right-0 z-30 flex flex-col items-center justify-center px-20 py-3 pointer-events-none gap-0.5">
          <button
            onClick={() => setEditingTitle(true)}
            className="pointer-events-auto group flex items-center gap-2 text-2xl sm:text-4xl font-black bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] rounded-2xl px-8 py-2.5 border-2 border-amber-400/80 shadow-[0_8px_25px_rgba(127,29,29,0.7)]"
            style={{ fontFamily: headerFontCss }}
          >
            <span
              className={`truncate max-w-[60vw] tracking-wider ${
                currentTheme === 'custom' ? '' : `bg-gradient-to-b ${themeGradient} bg-clip-text text-transparent`
              }`}
              style={currentTheme === 'custom' ? { color: settings.titleCustomColor } : undefined}
            >
              {settings.eventTitle}
            </span>
            <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-200 shrink-0" />
          </button>
        </div>
      )}

      <SettingsModal
        open={settingsOpen}
        initialTab={settingsTab}
        state={settings}
        onChange={setSettings}
        onClose={() => setSettingsOpen(false)}
        audioEngine={audioEngine}
      />

      <WinnerModal
        open={!!winner}
        winner={winner?.name ?? ''}
        autoRemove={settings.autoRemoveWinner}
        onRemove={handleRemoveWinner}
        onKeep={handleKeepWinner}
        winnerFontCss={FONT_CSS[settings.winnerFont]}
        headerFontCss={headerFontCss}
        eventSubtitle={settings.eventSubtitle}
      />

      <RangeModal
        open={rangeOpen}
        onClose={() => setRangeOpen(false)}
        onPopulate={setEntries}
      />
    </div>
  );
}

export default App;