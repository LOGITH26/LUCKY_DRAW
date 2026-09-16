import { getSliceColor, getContrastColor } from './colors';
import type { BorderStyle } from '@/components/SettingsModal';

export interface WheelRenderOptions {
  rotation: number;
  entries: string[];
  palette: string[];
  logoImage: HTMLImageElement | null;
  hubSizeRatio: number;
  sliceFontCss: string;
  borderStyle: BorderStyle;
}

const TWO_PI = Math.PI * 2;

export function drawWheel(
  ctx: CanvasRenderingContext2D,
  size: number,
  opts: WheelRenderOptions
) {
  const { rotation, entries, palette, logoImage, hubSizeRatio, sliceFontCss, borderStyle } = opts;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;
  const n = entries.length;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);

  // Outer border based on selected style
  if (borderStyle === 'metallic') {
    drawMetallicRing(ctx, radius);
  } else if (borderStyle === 'floral') {
    drawFloralBorder(ctx, radius);
  } else if (borderStyle === 'jewels') {
    drawJewelBorder(ctx, radius);
  }

  ctx.rotate(rotation);

  if (n === 0) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TWO_PI);
    ctx.fillStyle = '#FFF8E7';
    ctx.fill();
  } else if (n === 1) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TWO_PI);
    ctx.fillStyle = getSliceColor(0, palette);
    ctx.fill();
  } else {
    const sliceAngle = TWO_PI / n;
    for (let i = 0; i < n; i++) {
      const startAngle = -Math.PI / 2 + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = getSliceColor(i, palette);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (sliceAngle > 0.04) {
        ctx.save();
        const midAngle = startAngle + sliceAngle / 2;
        ctx.rotate(midAngle);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const fontSize = Math.max(
          8,
          Math.min(18, Math.floor(radius * sliceAngle * 0.7))
        );
        const weight = sliceFontCss.includes('Black') ? '900' : '600';
        ctx.font = `${weight} ${fontSize}px ${sliceFontCss}`;
        ctx.fillStyle = getContrastColor(getSliceColor(i, palette));

        const maxTextWidth = radius * 0.75;
        const label = entries[i];
        let displayLabel = label;
        if (ctx.measureText(label).width > maxTextWidth) {
          let lo = 0;
          let hi = label.length;
          while (lo < hi) {
            const mid = Math.floor((lo + hi + 1) / 2);
            if (ctx.measureText(label.substring(0, mid) + '…').width <= maxTextWidth) {
              lo = mid;
            } else {
              hi = mid - 1;
            }
          }
          displayLabel = label.substring(0, lo) + '…';
        }
        ctx.fillText(displayLabel, radius - 12, 0);
        ctx.restore();
      }
    }
  }

  ctx.restore();

  // Center hub
  const hubRadius = Math.max(130, (size * 0.36) / 2);
  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  ctx.arc(0, 0, hubRadius + 8, 0, TWO_PI);
  const hubGrad = ctx.createRadialGradient(0, 0, hubRadius * 0.3, 0, 0, hubRadius + 8);
  hubGrad.addColorStop(0, '#FFD700');
  hubGrad.addColorStop(0.7, '#D4AF37');
  hubGrad.addColorStop(1, '#8B6914');
  ctx.fillStyle = hubGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, hubRadius, 0, TWO_PI);
  const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, hubRadius);
  innerGrad.addColorStop(0, '#FFF8E7');
  innerGrad.addColorStop(1, '#F5E6CA');
  ctx.fillStyle = innerGrad;
  ctx.fill();

  if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius - 4, 0, TWO_PI);
    ctx.clip();

    const avail = (hubRadius - 4) * 2;
    const imgW = logoImage.naturalWidth;
    const imgH = logoImage.naturalHeight;
    const scale = Math.min(avail / imgW, avail / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    ctx.drawImage(logoImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    drawDefaultMotif(ctx, hubRadius - 6);
  }

  ctx.beginPath();
  ctx.arc(0, 0, hubRadius, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();

  drawPointer(ctx, cx, cy, radius);
}

function drawMetallicRing(ctx: CanvasRenderingContext2D, radius: number) {
  ctx.beginPath();
  ctx.arc(0, 0, radius + 6, 0, TWO_PI);
  const ringGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
  ringGrad.addColorStop(0, '#D4AF37');
  ringGrad.addColorStop(0.5, '#FFD700');
  ringGrad.addColorStop(1, '#B8860B');
  ctx.fillStyle = ringGrad;
  ctx.fill();
}

function drawFloralBorder(ctx: CanvasRenderingContext2D, radius: number) {
  // Base ring
  drawMetallicRing(ctx, radius);

  // Floral petals around the ring
  const petalCount = 24;
  ctx.save();
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * TWO_PI;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -radius - 3, 5, 10, 0, 0, TWO_PI);
    ctx.fillStyle = i % 2 === 0 ? '#FF6F00' : '#FFB81C';
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawJewelBorder(ctx: CanvasRenderingContext2D, radius: number) {
  // Dark base ring
  ctx.beginPath();
  ctx.arc(0, 0, radius + 8, 0, TWO_PI);
  ctx.fillStyle = '#1a1a2e';
  ctx.fill();

  // Glowing jewels
  const jewelCount = 32;
  ctx.save();
  for (let i = 0; i < jewelCount; i++) {
    const angle = (i / jewelCount) * TWO_PI;
    const jx = Math.cos(angle) * (radius + 4);
    const jy = Math.sin(angle) * (radius + 4);

    // Glow
    const glow = ctx.createRadialGradient(jx, jy, 0, jx, jy, 8);
    const colors = ['#FFD700', '#FF6F00', '#FF1744', '#00E5FF', '#76FF03'];
    const color = colors[i % colors.length];
    glow.addColorStop(0, color);
    glow.addColorStop(0.5, color + '80');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(jx, jy, 8, 0, TWO_PI);
    ctx.fill();

    // Jewel core
    ctx.beginPath();
    ctx.arc(jx, jy, 3, 0, TWO_PI);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();

  // Inner gold ring
  ctx.beginPath();
  ctx.arc(0, 0, radius + 1, 0, TWO_PI);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawPointer(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const pointerTipX = cx + radius - 4;
  const pointerBaseX = cx + radius + 28;
  const pointerHalfHeight = 18;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pointerTipX, cy);
  ctx.lineTo(pointerBaseX, cy - pointerHalfHeight);
  ctx.lineTo(pointerBaseX, cy + pointerHalfHeight);
  ctx.closePath();

  const ptrGrad = ctx.createLinearGradient(pointerTipX, cy, pointerBaseX, cy);
  ptrGrad.addColorStop(0, '#B71C1C');
  ptrGrad.addColorStop(1, '#E53935');
  ctx.fillStyle = ptrGrad;
  ctx.fill();
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawDefaultMotif(ctx: CanvasRenderingContext2D, radius: number) {
  ctx.save();
  ctx.strokeStyle = '#D4AF37';
  ctx.fillStyle = '#FFB81C';
  ctx.lineWidth = 1.5;

  const petalCount = 8;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * TWO_PI;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.45, radius * 0.12, radius * 0.35, 0, 0, TWO_PI);
    ctx.fillStyle = i % 2 === 0 ? '#FFB81C' : '#FF6F00';
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.18, 0, TWO_PI);
  ctx.fillStyle = '#B71C1C';
  ctx.fill();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.08, 0, TWO_PI);
  ctx.fillStyle = '#FFD700';
  ctx.fill();

  ctx.restore();
}

export function computeSpinResult(
  currentRotation: number,
  entryCount: number,
  duration: number
): { targetRotation: number; winnerIndex: number } {
  if (entryCount === 0) return { targetRotation: currentRotation, winnerIndex: 0 };

  const sliceAngle = TWO_PI / entryCount;
  const minSpins = 5;
  const extraRotation = minSpins * TWO_PI + Math.random() * TWO_PI;
  const targetRotation = currentRotation + extraRotation;

  const normalizedRotation = ((targetRotation % TWO_PI) + TWO_PI) % TWO_PI;
  let winnerIndex = Math.floor(
    (Math.PI / 2 - normalizedRotation) / sliceAngle
  );
  winnerIndex = ((winnerIndex % entryCount) + entryCount) % entryCount;

  return { targetRotation, winnerIndex };
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export { TWO_PI };
