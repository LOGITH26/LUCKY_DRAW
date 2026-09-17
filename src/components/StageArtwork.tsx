interface StageArtworkProps {
  fullscreen: boolean;
}

export default function StageArtwork({ fullscreen }: StageArtworkProps) {
  return (
    <div className="stage-artwork" aria-hidden="true">
      <img
        src="/assets/images/for_left_side.png"
        alt=""
        className={`stage-artwork-left ${fullscreen ? 'stage-artwork-fullscreen' : ''}`}
      />
      <img
        src="/assets/images/for_right_side.png"
        alt=""
        className={`stage-artwork-right ${fullscreen ? 'stage-artwork-fullscreen' : ''}`}
      />
      <img
        src="/assets/images/organized_by_jbma.png"
        alt=""
        className={`stage-artwork-center ${fullscreen ? 'stage-artwork-fullscreen' : ''}`}
      />
    </div>
  );
}
