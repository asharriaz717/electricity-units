import { AppSettings, Entry, MeterId, QueueItem } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';
import { getCycleInfo } from './cycle';

export function getUserUid(): string {
  try {
    let uid = localStorage.getItem(STORAGE_KEYS.USER_UID);
    if (!uid) {
      uid = 'uid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(STORAGE_KEYS.USER_UID, uid);
    }
    return uid;
  } catch {
    return 'uid_fallback_' + Math.random().toString(36).substring(2, 8);
  }
}

export function getUserName(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    if (!existing || existing === 'Ali' || existing === 'User') {
      localStorage.setItem(STORAGE_KEYS.USER_NAME, 'ashar');
      return 'ashar';
    }
    return existing;
  } catch {
    return 'ashar';
  }
}

export function setUserName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name.trim());
  } catch (e) {
    console.error('Failed to save user name', e);
  }
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        startDay: Number(parsed.startDay) || DEFAULT_SETTINGS.startDay,
        endDay: Number(parsed.endDay) || DEFAULT_SETTINGS.endDay,
        limit: Number(parsed.limit) || DEFAULT_SETTINGS.limit,
        webAppUrl:
          parsed.webAppUrl && parsed.webAppUrl.trim().startsWith('http')
            ? parsed.webAppUrl.trim()
            : DEFAULT_SETTINGS.webAppUrl,
        token: parsed.token || DEFAULT_SETTINGS.token,
        googleSheetUrl:
          parsed.googleSheetUrl && parsed.googleSheetUrl.trim().startsWith('http')
            ? parsed.googleSheetUrl.trim()
            : DEFAULT_SETTINGS.googleSheetUrl,
        m1BaselineReading: Number(parsed.m1BaselineReading) || DEFAULT_SETTINGS.m1BaselineReading || 100,
        m2BaselineReading: Number(parsed.m2BaselineReading) || DEFAULT_SETTINGS.m2BaselineReading || 100,
      };
    }
  } catch (e) {
    console.warn('Failed to parse settings', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

/**
 * Recomputes newlyAdded differences across chronologically sorted entries:
 * - Row 1: newlyAdded = 0 at start
 * - Row 2: newlyAdded = value - previousValue (e.g. 120 - 100 = 20)
 * - Row 3: newlyAdded = value - previousValue (e.g. 170 - 120 = 50)
 */
export function recalculateEntries(entries: Entry[]): Entry[] {
  if (!entries || entries.length === 0) return [];

  // Sort oldest first
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let previousVal = 0;
  const recalculated = sorted.map((entry, index) => {
    const val = Number(entry.value ?? entry.reading ?? 0);
    let newlyAdded = 0;

    if (index === 0) {
      newlyAdded = 0; // First value starts at 0 newly added
      previousVal = val;
    } else {
      newlyAdded = Math.max(0, Math.round((val - previousVal) * 100) / 100);
      previousVal = val;
    }

    return {
      ...entry,
      value: val,
      reading: val,
      previousValue: index === 0 ? undefined : previousVal - newlyAdded,
      previousReading: index === 0 ? undefined : previousVal - newlyAdded,
      newlyAdded,
      deltaUnits: newlyAdded,
    };
  });

  // Return sorted newest first for table display
  return recalculated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getEntries(meter: MeterId): Entry[] {
  try {
    const key = meter === 'm1' ? STORAGE_KEYS.ENTRIES_M1 : STORAGE_KEYS.ENTRIES_M2;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: Entry[] = JSON.parse(raw);
      return parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (e) {
    console.warn(`Failed to read entries for ${meter}`, e);
  }
  return [];
}

export function saveEntries(meter: MeterId, entries: Entry[]): void {
  try {
    const key = meter === 'm1' ? STORAGE_KEYS.ENTRIES_M1 : STORAGE_KEYS.ENTRIES_M2;
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(key, JSON.stringify(sorted));
  } catch (e) {
    console.error(`Failed to save entries for ${meter}`, e);
  }
}

export function addLocalEntry(entry: Entry): Entry[] {
  const current = getEntries(entry.meter);
  const updatedList = [entry, ...current];
  const recalculated = recalculateEntries(updatedList);
  saveEntries(entry.meter, recalculated);
  return recalculated;
}

export function updateLocalEntry(
  meter: MeterId,
  id: string,
  newValue: number,
  uid: string
): { success: boolean; entries: Entry[]; updatedEntry?: Entry; error?: string } {
  const current = getEntries(meter);
  const targetIndex = current.findIndex((e) => e.id === id);
  if (targetIndex === -1) {
    return { success: false, entries: current, error: 'Entry not found' };
  }
  if (current[targetIndex].uid !== uid) {
    return { success: false, entries: current, error: 'Only creator can edit this entry' };
  }

  current[targetIndex].value = newValue;
  current[targetIndex].reading = newValue;
  current[targetIndex].pending = true;

  const recalculated = recalculateEntries(current);
  saveEntries(meter, recalculated);
  const updatedEntry = recalculated.find((e) => e.id === id);
  return { success: true, entries: recalculated, updatedEntry };
}

export function deleteLocalEntry(
  meter: MeterId,
  id: string,
  uid: string
): { success: boolean; entries: Entry[]; error?: string } {
  const current = getEntries(meter);
  const target = current.find((e) => e.id === id);
  if (!target) {
    return { success: false, entries: current, error: 'Entry not found' };
  }
  if (target.uid !== uid) {
    return { success: false, entries: current, error: 'Only creator can delete this entry' };
  }

  const filtered = current.filter((e) => e.id !== id);
  const recalculated = recalculateEntries(filtered);
  saveEntries(meter, recalculated);
  return { success: true, entries: recalculated };
}

export function markEntrySynced(meter: MeterId, id: string): void {
  const current = getEntries(meter);
  const updated = current.map((e) => (e.id === id ? { ...e, pending: false } : e));
  saveEntries(meter, updated);
}

export function getOfflineQueue(): QueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (raw) return JSON.parse(raw);
  } catch {
    // empty
  }
  return [];
}

export function saveOfflineQueue(queue: QueueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save queue', e);
  }
}

export function addToOfflineQueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>): QueueItem {
  const queue = getOfflineQueue();
  const newItem: QueueItem = {
    ...item,
    id: 'q_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    retryCount: 0,
  };
  queue.push(newItem);
  saveOfflineQueue(queue);
  return newItem;
}

export function removeFromOfflineQueue(id: string): void {
  const queue = getOfflineQueue();
  const filtered = queue.filter((q) => q.id !== id);
  saveOfflineQueue(filtered);
}

export function getLastSynced(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
  } catch {
    return null;
  }
}

export function setLastSynced(isoString: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, isoString);
  } catch (e) {
    console.error(e);
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ENTRIES_M1);
    localStorage.removeItem(STORAGE_KEYS.ENTRIES_M2);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNCED);
  } catch (e) {
    console.error('Failed to clear local data', e);
  }
}

/**
 * Seeds initial sample data exactly matching the user request:
 * "user enter a first vlaue 100, auto current date, newly added is zero at start
 * then user enter the value 120 first it must be more then previos value and now table will be like
 * 100 first row as it as then second row 120 but newly added is 20 because 100+20 = 120 which is second row value same goes
 * then the newly added value will be calculate from 9 to 9 and shows"
 */
const SEED_VERSION_KEY = 'ebm_seed_version_v3_ashar_3999_11298';

/**
 * Seeds initial data according to user request:
 * - Meter 1 (ID: 02141190423402): first value is 3999, added by ashar
 * - Meter 2 (ID: 02141190423403): first value is 11298, added by ashar
 * - Both start with newly added = 0 at start
 */
export function seedInitialDataIfEmpty(): void {
  try {
    const seedVersion = localStorage.getItem(SEED_VERSION_KEY);
    const hasM1 = localStorage.getItem(STORAGE_KEYS.ENTRIES_M1);
    const hasM2 = localStorage.getItem(STORAGE_KEYS.ENTRIES_M2);

    if (!seedVersion || !hasM1 || !hasM2) {
      const myUid = getUserUid();
      const myName = 'ashar';
      setUserName(myName);

      const cycle = getCycleInfo(9, 9);
      const cycleStart = cycle.startDate.getTime();

      // Meter 1 (02141190423402): first value is 3999, newly added is 0 at start, added by ashar
      const e1_m1: Entry = {
        id: (cycleStart + 86400000 * 1).toString(),
        meter: 'm1',
        value: 3999.0,
        reading: 3999.0,
        newlyAdded: 0.0,
        deltaUnits: 0.0,
        date: new Date().toISOString(),
        name: myName,
        uid: myUid,
        pending: false,
      };

      // Meter 2 (02141190423403): first value is 11298, newly added is 0 at start, added by ashar
      const e1_m2: Entry = {
        id: (cycleStart + 86400000 * 2).toString(),
        meter: 'm2',
        value: 11298.0,
        reading: 11298.0,
        newlyAdded: 0.0,
        deltaUnits: 0.0,
        date: new Date().toISOString(),
        name: myName,
        uid: myUid,
        pending: false,
      };

      saveEntries('m1', [e1_m1]);
      saveEntries('m2', [e1_m2]);

      // Update default settings with accurate baselines
      const currentSettings = getSettings();
      saveSettings({
        ...currentSettings,
        m1BaselineReading: 3999,
        m2BaselineReading: 11298,
      });

      localStorage.setItem(SEED_VERSION_KEY, 'v3_ashar_3999_11298');
    }
  } catch (e) {
    console.warn('Could not seed initial sample data', e);
  }
}
