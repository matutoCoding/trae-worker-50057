const STORAGE_PREFIX = 'funeral_home_';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const fullKey = STORAGE_PREFIX + key;
    localStorage.setItem(fullKey, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const fullKey = STORAGE_PREFIX + key;
    const stored = localStorage.getItem(fullKey);
    if (stored === null) {
      return defaultValue;
    }
    return JSON.parse(stored) as T;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    const fullKey = STORAGE_PREFIX + key;
    localStorage.removeItem(fullKey);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}

export function hasStorageData(key: string): boolean {
  try {
    const fullKey = STORAGE_PREFIX + key;
    return localStorage.getItem(fullKey) !== null;
  } catch (e) {
    return false;
  }
}
