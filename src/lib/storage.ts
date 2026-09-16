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

export async function loadAsset(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    const result = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const r = tx.objectStore(STORE).get(key);
      r.onsuccess = () => resolve((r.result as string) ?? null);
      r.onerror = () => reject(r.error);
    });
    db.close();
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
  tickerVolume: 0.5,
  celebrationVolume: 0.7,
  muted: false,
  autoRemoveWinner: true,
  hasCustomLogo: false,
  hasCustomBg: false,
  useCustomBg: false,
  hasCustomVictoryAudio: false,
  title: 'Onam Lucky Draw',
  eventTitle: 'Onam Lucky Draw',
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
