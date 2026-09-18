// Persistent storage: settings in localStorage, binary assets (logo, bg image, custom mp3) in IndexedDB.

const DB_NAME = 'spin-wheel-db';
const DB_VERSION = 1;
const STORE = 'assets';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAsset(key: string, data: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(data, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // IndexedDB may be unavailable in some contexts; fail silently.
  }
}

// Helper to convert public asset URL to base64 data URL
async function urlToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function loadAsset(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    let result = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const r = tx.objectStore(STORE).get(key);
      r.onsuccess = () => resolve((r.result as string) ?? null);
      r.onerror = () => reject(r.error);
    });
    db.close();

    // Auto-seed default assets if missing from IndexedDB
    if (!result) {
      if (key === 'customLogo') {
        try {
          result = await urlToDataUrl('/images/logo.png');
          await saveAsset('customLogo', result);
        } catch (e) {
          console.error('Failed to auto-seed default logo', e);
        }
      } else if (key === 'customBg') {
        try {
          result = await urlToDataUrl('/images/bg.png');
          await saveAsset('customBg', result);
        } catch (e) {
          console.error('Failed to auto-seed default background', e);
        }
      }
    }

    return result;
  } catch {
    return null;
  }
}

export async function deleteAsset(key: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore
  }
}

// --- Settings (localStorage) ---

const SETTINGS_KEY = 'spin-wheel-settings';

export interface PersistedSettings {
  spinDuration: number;
  tickerVolume: number;
  celebrationVolume: number;
  muted: boolean;
  autoRemoveWinner: boolean;
  hasCustomLogo: boolean;
  hasCustomBg: boolean;
  useCustomBg: boolean;
  hasCustomVictoryAudio: boolean;
  title: string;
  eventTitle: string;
  eventSubtitle: string;
  sliceFont: string;
  winnerFont: string;
  headerFont: string;
  borderStyle: string;
  cornerLeaves: boolean;
  cornerLamps: boolean;
  cornerGarlands: boolean;
  vignette: number;
  confettiStyle: string;
}

export const defaultSettings: PersistedSettings = {
  spinDuration: 6,
  tickerVolume: 1.0, // Increased default volume
  celebrationVolume: 1.0, // Increased default volume
  muted: false,
  autoRemoveWinner: true,
  hasCustomLogo: true,
  hasCustomBg: true,
  useCustomBg: true, // Default to using custom background
  hasCustomVictoryAudio: false,
  title: 'Onaghosham Lucky Draw',
  eventTitle: 'Onaghosham Lucky Draw',
  eventSubtitle: 'Spin the Wheel',
  sliceFont: 'system',
  winnerFont: 'bold-sans',
  headerFont: 'serif',
  borderStyle: 'metallic',
  cornerLeaves: true,
  cornerLamps: true,
  cornerGarlands: false,
  vignette: 0.3,
  confettiStyle: 'petals',
};

export function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: PersistedSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}