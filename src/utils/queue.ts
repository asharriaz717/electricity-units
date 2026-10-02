import { AppSettings, Entry } from '../types';
import {
  getOfflineQueue,
  saveOfflineQueue,
  markEntrySynced,
  removeFromOfflineQueue,
} from './storage';
import {
  addEntryToSheet,
  editEntryInSheet,
  deleteEntryInSheet,
  syncSettingsToSheet,
  clearAllSheetEntries,
} from './api';

let isProcessing = false;

/**
 * Process pending queued items in sequence
 */
export async function processOfflineQueue(
  settings: AppSettings,
  onUpdate?: () => void
): Promise<{ processed: number; failed: number }> {
  if (isProcessing) return { processed: 0, failed: 0 };
  if (!settings.webAppUrl || !settings.webAppUrl.trim()) {
    return { processed: 0, failed: 0 };
  }

  isProcessing = true;
  let processed = 0;
  let failed = 0;

  try {
    const queue = getOfflineQueue();
    if (queue.length === 0) {
      isProcessing = false;
      return { processed: 0, failed: 0 };
    }

    const remainingQueue = [...queue];

    for (const item of queue) {
      try {
        let success = false;

        if (item.action === 'add') {
          const entry: Entry = item.payload;
          const res = await addEntryToSheet(settings.webAppUrl, settings.token || '', entry);
          if (res.success) {
            markEntrySynced(entry.meter, entry.id);
            success = true;
          }
        } else if (item.action === 'edit') {
          const { id, uid, reading, deltaUnits, cycleTotalUnits, value } = item.payload;
          const res = await editEntryInSheet(
            settings.webAppUrl,
            settings.token || '',
            id,
            uid,
            reading ?? value,
            deltaUnits,
            cycleTotalUnits
          );
          if (res.success) {
            markEntrySynced('m1', id);
            markEntrySynced('m2', id);
            success = true;
          }
        } else if (item.action === 'delete') {
          const { id, uid } = item.payload;
          const res = await deleteEntryInSheet(settings.webAppUrl, settings.token || '', id, uid);
          if (res.success) {
            success = true;
          }
        } else if (item.action === 'settings') {
          const res = await syncSettingsToSheet(settings.webAppUrl, settings.token || '', item.payload);
          if (res.success) {
            success = true;
          }
        } else if (item.action === 'clear') {
          const res = await clearAllSheetEntries(settings.webAppUrl, settings.token || '');
          if (res.success) {
            success = true;
          }
        }

        if (success) {
          removeFromOfflineQueue(item.id);
          processed++;
          if (onUpdate) onUpdate();
        } else {
          item.retryCount = (item.retryCount || 0) + 1;
          failed++;
        }
      } catch (e) {
        failed++;
        item.retryCount = (item.retryCount || 0) + 1;
      }
    }

    saveOfflineQueue(remainingQueue.filter((q) => q.retryCount > 0));
  } finally {
    isProcessing = false;
  }

  return { processed, failed };
}
