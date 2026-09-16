import { Leaf, Lightbulb, Flower2 as Flower } from 'lucide-react';

interface CornerEmbellishmentsProps {
  leaves: boolean;
  lamps: boolean;
  garlands: boolean;
  fullscreen: boolean;
}

export default function CornerEmbellishments({
  leaves,
  lamps,
  garlands,
  fullscreen,
}: CornerEmbellishmentsProps) {
  const cornerClass = fullscreen ? 'opacity-50' : 'opacity-70';

  return (
    <>
      {/* Banana leaves — bottom corners */}
      {leaves && (
        <>
          <div className={`fixed bottom-0 left-0 pointer-events-none z-10 ${cornerClass} hidden sm:block`}>
            <Leaf
              className="w-24 h-24 text-green-700 -rotate-12 -translate-x-4 translate-y-4"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            />
          </div>
          <div className={`fixed bottom-0 right-0 pointer-events-none z-10 ${cornerClass} hidden sm:block`}>
            <Leaf
              className="w-24 h-24 text-green-700 rotate-12 translate-x-4 translate-y-4"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
            />
          </div>
        </>
      )}

      {/* Nilavilakku lamps — top corners */}
      {lamps && (
        <>
          <div className={`fixed top-16 left-2 pointer-events-none z-10 ${cornerClass} hidden sm:block`}>
            <Lightbulb
              className="w-12 h-12 text-amber-400"
              style={{ filter: 'drop-shadow(0 0 12px rgba(255, 200, 50, 0.6))' }}
            />
          </div>
          <div className={`fixed top-16 right-2 pointer-events-none z-10 ${cornerClass} hidden sm:block`}>
            <Lightbulb
              className="w-12 h-12 text-amber-400"
              style={{ filter: 'drop-shadow(0 0 12px rgba(255, 200, 50, 0.6))' }}
            />
          </div>
        </>
      )}

      {/* Floral garlands — top edge */}
      {garlands && (
        <div className={`fixed top-0 left-0 right-0 pointer-events-none z-10 h-8 ${cornerClass}`}>
          <div
            className="w-full h-full flex items-center justify-center gap-2 overflow-hidden"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 28px, rgba(255, 184, 28, 0.3) 28px, rgba(255, 184, 28, 0.3) 32px)',
            }}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <Flower
                key={i}
                className="w-5 h-5 shrink-0"
                style={{
                  color: i % 3 === 0 ? '#FF6F00' : i % 3 === 1 ? '#FFB81C' : '#FFF8E7',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
