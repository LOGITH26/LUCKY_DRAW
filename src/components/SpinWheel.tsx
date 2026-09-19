import { useRef, useEffect, useCallback, useState } from 'react';
import { drawWheel, computeSpinResult, easeOutCubic, TWO_PI } from '@/lib/wheel';
import { AudioEngine } from '@/lib/audio';
import type { BorderStyle } from '@/components/SettingsModal';

interface SpinWheelProps {
  entries: string[];
  palette: string[];
  logoImage: HTMLImageElement | null;
  spinDuration: number;
  autoRemoveWinner: boolean;
  muted: boolean;
  tickerVolume: number;
  audioEngine: AudioEngine;
  onSpinComplete: (winnerIndex: number, winner: string) => void;
  sliceFontCss: string;
  borderStyle: BorderStyle;
}

export default function SpinWheel({
  entries,
  palette,
  logoImage,
  spinDuration,
  muted,
  tickerVolume,
  audioEngine,
  onSpinComplete,
  sliceFontCss,
  borderStyle,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const spinningRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const idleAnimRef = useRef<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = canvas.clientWidth;
    if (canvas.width !== displaySize * dpr) {
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawWheel(ctx, displaySize, {
      rotation: rotationRef.current,
      entries,
      palette,
      logoImage,
      hubSizeRatio: 0.44,
      sliceFontCss,
      borderStyle,
    });
  }, [entries, palette, logoImage, sliceFontCss, borderStyle]);

  // Idle slow spin loop when wheel is waiting
  useEffect(() => {
    if (isSpinning || entries.length === 0) return;

    let lastTime = performance.now();
    const idleSpeed = 0.0035; // Adjust this value to make idle rotation faster or slower

    const stepIdle = (now: number) => {
      if (spinningRef.current) return;
      const dt = now - lastTime;
      lastTime = now;

      // Increment rotation continuously (scale by ~60fps frame delta)
      rotationRef.current = (rotationRef.current + idleSpeed * (dt / 16.67)) % TWO_PI;
      render();

      idleAnimRef.current = requestAnimationFrame(stepIdle);
    };

    idleAnimRef.current = requestAnimationFrame(stepIdle);

    return () => {
      if (idleAnimRef.current) {
        cancelAnimationFrame(idleAnimRef.current);
      }
    };
  }, [isSpinning, entries.length, render]);

  useEffect(() => {
    const handleResize = () => render();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  const spin = useCallback(() => {
    if (spinningRef.current || entries.length === 0) return;

    // Stop idle animation immediately
    if (idleAnimRef.current) {
      cancelAnimationFrame(idleAnimRef.current);
    }

    spinningRef.current = true;
    setIsSpinning(true);

    const durationMs = spinDuration * 1000;
    const currentAngle = rotationRef.current;

    const { targetRotation, winnerIndex } = computeSpinResult(
      currentAngle,
      entries.length,
      durationMs
    );

    const startRotation = currentAngle;
    const delta = targetRotation - startRotation;
    const startTime = performance.now();

    audioEngine.setTickerVolume(muted ? 0 : tickerVolume);
    audioEngine.startTicker(80);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(t);
      rotationRef.current = startRotation + delta * eased;
      render();

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = ((rotationRef.current % TWO_PI) + TWO_PI) % TWO_PI;
        spinningRef.current = false;
        setIsSpinning(false); // Resumes idle spin loop
        audioEngine.stopTicker();
        onSpinComplete(winnerIndex, entries[winnerIndex]);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [entries, spinDuration, muted, tickerVolume, audioEngine, onSpinComplete, render]);

  const handleClick = () => {
    spin();
  };

  useEffect(() => {
    const handleSpinEvent = () => spin();
    window.addEventListener('wheel-spin', handleSpinEvent);
    return () => window.removeEventListener('wheel-spin', handleSpinEvent);
  }, [spin]);

 return (
    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
      <div className="relative z-10 w-full max-w-[min(75vh,750px)] aspect-square">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className={`relative z-10 w-full h-full cursor-pointer select-none ${
            isSpinning ? 'cursor-not-allowed' : 'hover:drop-shadow-2xl'
          }`}
          style={{ filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.35))' }}
        />

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 translate-y-full z-20">
          <button
            onClick={spin}
            disabled={isSpinning || entries.length === 0}
            className="px-10 py-3.5 rounded-full font-bold text-lg tracking-wide text-amber-900
              bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500
              shadow-[0_6px_20px_rgba(180,83,9,0.5)] ring-2 ring-amber-300/60
              hover:from-yellow-200 hover:to-amber-400 hover:shadow-[0_8px_28px_rgba(180,83,9,0.6)]
              active:scale-95 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </button>
        </div>
      </div>
    </div>
  );
}