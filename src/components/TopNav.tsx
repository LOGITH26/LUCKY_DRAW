import { Settings, Palette, Share2, Maximize, Minimize, Volume2, VolumeX, Crown, Sparkles } from 'lucide-react';

interface TopNavProps {
  muted: boolean;
  isFullscreen: boolean;
  eventTitle: string;
  eventSubtitle: string;
  headerFontCss: string;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenDesign: () => void;
  onOpenStage: () => void;
  onShare: () => void;
}

export default function TopNav({
  muted,
  isFullscreen,
  eventTitle,
  eventSubtitle,
  headerFontCss,
  onToggleMute,
  onToggleFullscreen,
  onOpenSettings,
  onOpenDesign,
  onOpenStage,
  onShare,
}: TopNavProps) {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-900/80 via-yellow-800/80 to-amber-900/80 backdrop-blur-md border-b border-amber-600/40 shadow-lg z-30 relative">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-md ring-2 ring-amber-300/50">
          <Crown className="w-5 h-5 text-amber-900" />
        </div>
        <div className="flex flex-col leading-tight">
          <span
            className="text-amber-50 font-bold text-base sm:text-lg tracking-wide"
            style={{ fontFamily: headerFontCss }}
          >
            {eventTitle}
          </span>
          {eventSubtitle && (
            <span className="text-amber-300/70 text-[10px] sm:text-xs font-medium tracking-wider uppercase">
              {eventSubtitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <NavButton onClick={onOpenSettings} label="Settings" icon={<Settings className="w-4 h-4 sm:w-5 sm:h-5" />} />
        <NavButton onClick={onOpenStage} label="Stage" icon={<Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />} />
        <NavButton onClick={onOpenDesign} label="Design" icon={<Palette className="w-4 h-4 sm:w-5 sm:h-5" />} />
        <NavButton onClick={onShare} label="Share" icon={<Share2 className="w-4 h-4 sm:w-5 sm:h-5" />} hideOnMobile />
        <NavButton
          onClick={onToggleFullscreen}
          label="Fullscreen"
          icon={isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
        />
        <NavButton
          onClick={onToggleMute}
          label="Mute"
          icon={muted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        />
      </div>
    </nav>
  );
}

function NavButton({
  onClick,
  label,
  icon,
  hideOnMobile = false,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  hideOnMobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`group flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-amber-50 hover:bg-amber-600/40 hover:text-yellow-200 transition-all duration-200 active:scale-95 ${
        hideOnMobile ? 'hidden sm:flex' : 'flex'
      }`}
    >
      {icon}
      <span className="text-xs sm:text-sm font-medium hidden sm:inline">{label}</span>
    </button>
  );
}
