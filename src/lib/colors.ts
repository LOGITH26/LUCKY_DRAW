// Onam festive color palette — Kasavu gold, maragold orange, emerald green, cream, temple red.
export const ONAM_PALETTE = [
  '#FFB81C', // Kasavu gold
  '#FF6F00', // Marigold orange
  '#1B5E20', // Emerald green
  '#FFF8E7', // Warm cream
  '#B71C1C', // Temple red
];

export function getSliceColor(index: number, palette: string[] = ONAM_PALETTE): string {
  return palette[index % palette.length];
}

// Choose a readable text color (dark/light) for a given hex background.
export function getContrastColor(hex: string): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
}

export const PALETTE_OPTIONS: { name: string; colors: string[] }[] = [
  { name: 'Onam Festive', colors: ONAM_PALETTE },
  { name: 'Royal Gold', colors: ['#FFD700', '#FFA500', '#DAA520', '#FF8C00', '#B8860B'] },
  { name: 'Tropical', colors: ['#00ACC1', '#26C6DA', '#66BB6A', '#FFEE58', '#FF7043'] },
  { name: 'Sunset', colors: ['#E53935', '#FB8C00', '#FFB300', '#F4511E', '#8E24AA'] },
  { name: 'Ocean', colors: ['#0277BD', '#0288D1', '#039BE5', '#1E88E5', '#42A5F5'] },
];
