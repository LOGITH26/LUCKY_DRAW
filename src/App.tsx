import { useState, useEffect, useRef, useCallback } from 'react';
import { Pencil } from 'lucide-react';
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

function App() {
  const [settings, setSettings] = useState<SettingsState>({
    spinDuration: defaultSettings.spinDuration,
    tickerVolume: defaultSettings.tickerVolume,
    celebrationVolume: defaultSettings.celebrationVolume,
    autoRemoveWinner: defaultSettings.autoRemoveWinner,
    customLogo: null,
    customBg: null,
    useCustomBg: false,
    customVictoryAudio: null,
    palette: ONAM_PALETTE,
    paletteName: 'Onam Festive',
    eventTitle: defaultSettings.eventTitle,
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

  // Initialize entries from localStorage so refresh won't reset them
  const [entries, setEntries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load entries from localStorage', e);
    }
    return DEFAULT_ENTRIES;
  });

  // Initialize history from localStorage
  const [history, setHistory] = useState<WinnerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
      return [];
    }
  });

  // Persist entries on every update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save entries to localStorage', e);
    }
  }, [entries]);

  // Persist history on every update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [winner, setWinner] = useState<{ name: string; index: number } | null>(null);

  const audioEngineRef = useRef<AudioEngine | null>(null);
  if (!audioEngineRef.current) {
    audioEngineRef.current = new AudioEngine();
  }
  const audioEngine = audioEngineRef.current;

  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const init = async () => {
      const persisted = loadSettings();
      const logo = await loadAsset('customLogo');
      const bg = await loadAsset('customBg');
      const victoryAudio = await loadAsset('customVictoryAudio');

      const loaded: SettingsState = {
        ...settings,
        spinDuration: persisted.spinDuration,
        tickerVolume: persisted.tickerVolume,
        celebrationVolume: persisted.celebrationVolume,
        autoRemoveWinner: persisted.autoRemoveWinner,
        customLogo: logo,
        customBg: bg,
        useCustomBg: persisted.useCustomBg && !!bg,
        customVictoryAudio: victoryAudio,
        eventTitle: persisted.eventTitle || defaultSettings.eventTitle,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (settings.customVictoryAudio) saveAsset('customVictoryAudio', settings.customVictoryAudio);
  }, [settings.customVictoryAudio]);

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
    if (winner) {
      setEntries((prev) => prev.filter((_, i) => i !== winner.index));
    }
    setWinner(null);
  };

  const handleKeepWinner = () => {
    if (winner && settings.autoRemoveWinner) {
      setEntries((prev) => prev.filter((_, i) => i !== winner.index));
    }
    setWinner(null);
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
        const btn = document.createElement('div');
        btn.textContent = 'Link copied to clipboard!';
        btn.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-amber-600 text-white font-medium shadow-lg animate-[fadeIn_0.2s_ease]';
        document.body.appendChild(btn);
        setTimeout(() => btn.remove(), 2000);
      }
    } catch {
      // user cancelled or clipboard unavailable
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.code === 'Space') {
        if (winner) {
          e.preventDefault();
          handleKeepWinner();
        } else if (editingTitle) {
          // Let spaces type into the title input
        } else if (!isTyping && !settingsOpen && !rangeOpen) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('wheel-spin'));
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (!isTyping) {
          e.preventDefault();
          toggleFullscreen();
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (!isTyping) {
          e.preventDefault();
          setSettingsTab(0);
          setSettingsOpen(true);
        }
      } else if (e.key === 'Enter') {
        if (winner) {
          e.preventDefault();
          handleKeepWinner();
        }
      } else if (e.key === 'Escape') {
        if (editingTitle) setEditingTitle(false);
        if (settingsOpen) setSettingsOpen(false);
        if (rangeOpen) setRangeOpen(false);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [winner, settingsOpen, rangeOpen, settings.autoRemoveWinner, editingTitle]);

  const handleSettingsChange = (newState: SettingsState) => {
    setSettings(newState);
  };

  const openDesignTab = () => {
    setSettingsTab(2);
    setSettingsOpen(true);
  };

  const openStageTab = () => {
    setSettingsTab(3);
    setSettingsOpen(true);
  };

  const handlePopulateRange = (newEntries: string[]) => {
    setEntries(newEntries);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      console.error('Failed to clear history from localStorage', e);
    }
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

      {/* Top nav — hidden in fullscreen for a clean wheel-only view */}
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
          onOpenDesign={openDesignTab}
          onOpenStage={openStageTab}
          onShare={handleShare}
        />
      )}

      {/* Main content */}
      <main className={`relative z-10 flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden ${isFullscreen ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
        {/* Left: Wheel stage - top padding ensures wheel clears the fullscreen title */}
        <div className={`flex-1 flex items-center justify-center min-h-0 ${isFullscreen ? 'pt-16 sm:pt-20 pb-16' : 'pb-20'}`}>
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

        {/* Right: Entries/Results panel — hidden in fullscreen */}
        {!isFullscreen && (
          <div className="w-full lg:w-[380px] lg:shrink-0 h-[50vh] lg:h-auto lg:max-h-[calc(100vh-100px)]">
            <EntriesPanel
              entries={entries}
              onEntriesChange={setEntries}
              history={history}
              onClearHistory={handleClearHistory}
              onOpenRangeModal={() => setRangeOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Fullscreen overlay — solid red pill title bar with high-contrast maroon subtitle */}
      {isFullscreen && (
        <>
          {/* Title + subtitle bar */}
          <div className="fixed top-0 left-0 right-0 z-30 flex flex-col items-center justify-center px-20 py-3 pointer-events-none gap-0.5">
            {editingTitle ? (
              <input
                autoFocus
                value={settings.eventTitle}
                onChange={(e) => setSettings((s) => ({ ...s, eventTitle: e.target.value }))}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingTitle(false);
                }}
                className="pointer-events-auto text-center text-2xl sm:text-3xl font-extrabold bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] rounded-2xl px-6 py-2 outline-none border-2 border-amber-400 shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all max-w-[80vw]"
                style={{
                  fontFamily: headerFontCss,
                  color: currentTheme === 'custom' ? settings.titleCustomColor : '#FDE68A',
                }}
                placeholder="Enter title..."
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="pointer-events-auto group flex items-center gap-2 text-2xl sm:text-4xl font-black bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] hover:from-[#dc2626] hover:to-[#991b1b] rounded-2xl px-8 py-2.5 border-2 border-amber-400/80 shadow-[0_8px_25px_rgba(127,29,29,0.7),inset_0_1px_2px_rgba(255,255,255,0.35)] transition-all active:scale-95"
                style={{ fontFamily: headerFontCss }}
              >
                <span
                  className={`truncate max-w-[60vw] tracking-wider filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
                    currentTheme === 'custom'
                      ? ''
                      : `bg-gradient-to-b ${themeGradient} bg-clip-text text-transparent`
                  }`}
                  style={currentTheme === 'custom' ? { color: settings.titleCustomColor } : undefined}
                >
                  {settings.eventTitle}
                </span>
                <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-200 shrink-0" />
              </button>
            )}

            {/* Subtitle with deep maroon text & light drop shadow */}
            {settings.eventSubtitle && (
              <span
                className="pointer-events-auto mt-1 text-xs sm:text-sm font-black tracking-[0.25em] uppercase text-[#7f1d1d] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]"
                style={{ fontFamily: headerFontCss }}
              >
                {settings.eventSubtitle}
              </span>
            )}
          </div>

          {/* Mute & exit buttons */}
          <div className="fixed top-4 right-4 z-40 flex gap-2">
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-sm"
              aria-label="Toggle mute"
            >
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all backdrop-blur-sm"
              aria-label="Exit fullscreen"
            >
              Exit
            </button>
          </div>
        </>
      )}

      {/* Modals */}
      <SettingsModal
        open={settingsOpen}
        initialTab={settingsTab}
        state={settings}
        onChange={handleSettingsChange}
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
        onPopulate={handlePopulateRange}
      />
    </div>
  );
}

export default App;