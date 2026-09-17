interface StageArtworkProps {
  fullscreen: boolean;
}

export default function StageArtwork({ fullscreen }: StageArtworkProps) {
  return (
    <div
      className="stage-artwork pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Left decorative artwork */}
      <img
        src="/assets/images/for_left_side.png"
        alt=""
        className={`pointer-events-none absolute bottom-0 left-0 select-none object-contain stage-artwork-left ${
          fullscreen ? 'stage-artwork-fullscreen max-w-[280px] lg:max-w-[360px]' : 'max-w-[220px] lg:max-w-[300px]'
        }`}
      />

      {/* Right decorative artwork */}
      <img
        src="/assets/images/for_right_side.png"
        alt=""
        className={`pointer-events-none absolute bottom-0 right-0 select-none object-contain stage-artwork-right ${
          fullscreen ? 'stage-artwork-fullscreen max-w-[280px] lg:max-w-[360px]' : 'max-w-[220px] lg:max-w-[300px]'
        }`}
      />

      {/* Center organizer badge - Enlarged sizing */}
      <img
        src="/assets/images/organized_by_jbma.png"
        alt=""
        className={`pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 select-none object-contain stage-artwork-center ${
          fullscreen
            ? 'h-18 sm:h-24 md:h-28 lg:h-32 max-w-[90vw] stage-artwork-fullscreen'
            : 'h-14 md:h-20 lg:h-26 max-w-[600px]'
        }`}
      />
    </div>
  );
}