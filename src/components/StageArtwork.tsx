interface StageArtworkProps {
  fullscreen: boolean;
}

export default function StageArtwork({ fullscreen }: StageArtworkProps) {
  return (
    <div
      className="stage-artwork pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <img
        src="/assets/images/for_left_side.png"
        alt=""
        className={`pointer-events-none absolute bottom-0 left-0 select-none stage-artwork-left ${
          fullscreen ? 'stage-artwork-fullscreen' : ''
        }`}
      />
      <img
        src="/assets/images/for_right_side.png"
        alt=""
        className={`pointer-events-none absolute bottom-0 right-0 select-none stage-artwork-right ${
          fullscreen ? 'stage-artwork-fullscreen' : ''
        }`}
      />
      <img
        src="/assets/images/organized_by_jbma.png"
        alt=""
        className={`pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none stage-artwork-center ${
          fullscreen ? 'stage-artwork-fullscreen' : ''
        }`}
      />
    </div>
  );
}