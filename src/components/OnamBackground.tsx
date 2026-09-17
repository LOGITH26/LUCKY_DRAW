export default function OnamBackground({
  customBg,
  vignette = 0.3,
}: {
  customBg: string | null;
  vignette?: number;
}) {
  if (customBg) {
    return (
      <div className="fixed inset-0 -z-10">
        <img src={customBg} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base golden gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-950" />

      {/* Radial warm glow */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(255, 200, 50, 0.35) 0%, transparent 60%)',
        }}
      />

      {/* Pookkalam mandala SVG pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 800 800"
      >
        <defs>
          <pattern id="pookkalam" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
            <g transform="translate(200,200)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <g key={angle} transform={`rotate(${angle})`}>
                  <ellipse cx="0" cy="-60" rx="14" ry="40" fill="none" stroke="#FFD700" strokeWidth="2" />
                  <ellipse cx="0" cy="-100" rx="8" ry="20" fill="none" stroke="#FF6F00" strokeWidth="1.5" />
                  <circle cx="0" cy="-130" r="5" fill="#FFD700" />
                </g>
              ))}
              <circle r="20" fill="none" stroke="#FFD700" strokeWidth="2" />
              <circle r="35" fill="none" stroke="#FF6F00" strokeWidth="1.5" />
              <circle r="60" fill="none" stroke="#FFD700" strokeWidth="1" strokeDasharray="4 4" />
              <circle r="90" fill="none" stroke="#FF6F00" strokeWidth="1" strokeDasharray="2 6" />
            </g>
          </pattern>
        </defs>
        <rect width="800" height="800" fill="url(#pookkalam)" />
      </svg>

      {/* Vignette for default theme */}
      {vignette > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent ${50 - vignette * 30}%, rgba(60, 30, 0, ${vignette * 0.5}) 100%)`,
          }}
        />
      )}
    </div>
  );
}