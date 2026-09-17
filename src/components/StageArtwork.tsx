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

      {/* Center organizer badge - preserved full size */}
      <img
        src="/assets/images/organized_by_jbma.png"
        alt=""
        className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 select-none object-contain stage-artwork-center ${
          fullscreen
            ? 'h-16 sm:h-20 md:h-24 max-w-[85vw] stage-artwork-fullscreen'
            : 'h-12 sm:h-14 md:h-16 max-w-[420px]'
        }`}
      />
    </div>
  );
}