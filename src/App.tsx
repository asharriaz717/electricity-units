import React, { useState, useEffect, useCallback } from 'react';
import { ActiveScreen, AppSettings, Entry, MeterId } from './types';
import {
  getUserUid,
  getUserName,
  setUserName,
  getSettings,
  saveSettings,
  getEntries,
  saveEntries,
  addLocalEntry,
  updateLocalEntry,
  deleteLocalEntry,
  getOfflineQueue,
  addToOfflineQueue,
  getLastSynced,
  setLastSynced,
  clearAllLocalData,
  seedInitialDataIfEmpty,
} from './utils/storage';
import { getMeterCycleSummary } from './utils/cycle';
import { fetchSheetData, clearAllSheetEntries } from './utils/api';
import { processOfflineQueue } from './utils/queue';
import { LABELS } from './constants/labels';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { MeterScreen } from './components/MeterScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { NameModal } from './components/NameModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');

  // Device & User State
  const [userUid] = useState<string>(() => getUserUid());
  const [userName, setUserNameState] = useState<string>(() => getUserName() || '');
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(() => !getUserName());

  // App Settings
  const [settings, setSettingsState] = useState<AppSettings>(() => getSettings());

  // Entries
  const [entriesM1, setEntriesM1] = useState<Entry[]>([]);
  const [entriesM2, setEntriesM2] = useState<Entry[]>([]);

  // Connectivity & Sync States
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [lastSynced, setLastSyncedState] = useState<string | null>(() => getLastSynced());

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Reload local entries
  const reloadLocalData = useCallback(() => {
    setEntriesM1(getEntries('m1'));
    setEntriesM2(getEntries('m2'));
    setPendingQueueCount(getOfflineQueue().length);
    setLastSyncedState(getLastSynced());
  }, []);

  // Initial startup: seed sample if empty, load local data
  useEffect(() => {
    seedInitialDataIfEmpty();
    reloadLocalData();
  }, [reloadLocalData]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast(LABELS.sync.onlineRestored, 'info');
      syncWithSheet();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast(LABELS.sync.offlineModeNotice, 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings]);

  // Core Sync Function
  const syncWithSheet = useCallback(async () => {
    const currentSettings = getSettings();
    const url = currentSettings.webAppUrl;
    const token = currentSettings.token || '';

    if (!url || !url.trim()) {
      reloadLocalData();
      return;
    }

    setIsSyncing(true);

    try {
      // 1. Check if any local entries have pending === true, ensure they are in offline queue
      const localM1 = getEntries('m1');
      const localM2 = getEntries('m2');
      const pendingEntries = [...localM1, ...localM2].filter((e) => e.pending);
      const currentQueue = getOfflineQueue();
      for (const p of pendingEntries) {
        if (!currentQueue.some((q) => q.payload?.id === p.id)) {
          addToOfflineQueue({
            action: 'add',
            payload: p,
          });
        }
      }

      // 2. Process pending items in offline queue
      await processOfflineQueue(currentSettings, reloadLocalData);

      // 3. Fetch fresh data from sheet
      const result = await fetchSheetData(url, token);
      if (result.success && result.entries) {
        // Map entries
        const sheetM1 = result.entries.filter((e) => e.meter === 'm1');
        const sheetM2 = result.entries.filter((e) => e.meter === 'm2');

        const currentLocalM1 = getEntries('m1');
        const currentLocalM2 = getEntries('m2');

        const stillPendingM1 = currentLocalM1.filter((e) => e.pending);
        const stillPendingM2 = currentLocalM2.filter((e) => e.pending);

        const combinedM1 = [...stillPendingM1, ...sheetM1.filter((s) => !stillPendingM1.some((p) => p.id === s.id))];
        const combinedM2 = [...stillPendingM2, ...sheetM2.filter((s) => !stillPendingM2.some((p) => p.id === s.id))];

        saveEntries('m1', combinedM1);
        saveEntries('m2', combinedM2);

        if (result.settings) {
          const updatedSettings: AppSettings = {
            ...currentSettings,
            startDay: result.settings.startDay ?? currentSettings.startDay,
            endDay: result.settings.endDay ?? currentSettings.endDay,
            limit: result.settings.limit ?? currentSettings.limit,
          };
          saveSettings(updatedSettings);
          setSettingsState(updatedSettings);
        }

        const nowIso = new Date().toISOString();
        setLastSynced(nowIso);
        setLastSyncedState(nowIso);
        showToast(LABELS.sync.syncedSuccess, 'success');
      } else if (result.error) {
        showToast(result.error, 'error');
      }
    } catch (err: any) {
      showToast(LABELS.sync.syncFailed(err.message || 'Network error'), 'error');
    } finally {
      setIsSyncing(false);
      reloadLocalData();
    }
  }, [reloadLocalData]);

  // Sync on mount and check URL query parameters for auto sync configuration
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const syncUrlParam = params.get('syncUrl') || params.get('webAppUrl');
      const sheetUrlParam = params.get('sheetUrl') || params.get('googleSheetUrl');
      if (syncUrlParam) {
        const currentSettings = getSettings();
        const updated = {
          ...currentSettings,
          webAppUrl: syncUrlParam,
          googleSheetUrl: sheetUrlParam || currentSettings.googleSheetUrl,
        };
        saveSettings(updated);
        setSettingsState(updated);
        // Clean URL params from address bar without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast('Google Sheet automatically connected from link!', 'success');
        setTimeout(() => {
          syncWithSheet();
        }, 300);
        return;
      }
    } catch (e) {
      console.error('Error parsing syncUrl param:', e);
    }

    if (settings.webAppUrl && isOnline) {
      syncWithSheet();
    }
  }, []);

  const handleSaveInitialName = (name: string) => {
    setUserName(name);
    setUserNameState(name);
    setIsNameModalOpen(false);
    showToast(LABELS.toasts.welcome(name), 'success');
  };

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    setUserNameState(newName);
    showToast(LABELS.toasts.nameUpdated, 'success');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettingsState(newSettings);

    if (newSettings.webAppUrl) {
      addToOfflineQueue({
        action: 'settings',
        payload: newSettings,
      });
      syncWithSheet();
    }
    showToast(LABELS.toasts.settingsSaved, 'success');
  };

  /**
   * Add Value Entry
   * - Row 1 (first value): e.g. 100, auto current date, newly added is 0 at start
   * - Row 2 (second value): e.g. 120, newly added is 20 (120 - 100 = 20)
   * - 9 to 9 Cycle Total: sums newly added values within the active cycle
   */
  const handleAddEntry = (meter: MeterId, value: number, dateIso?: string) => {
    const currentName = getUserName() || userName || LABELS.app.userFallback;
    const currentEntries = meter === 'm1' ? entriesM1 : entriesM2;

    const summary = getMeterCycleSummary(
      currentEntries,
      settings.startDay,
      settings.endDay,
      settings.limit
    );

    const isFirstRow = currentEntries.length === 0;
    const prevVal = isFirstRow ? undefined : summary.currentValue;
    const newlyAdded = isFirstRow ? 0 : Math.max(0, Math.round((value - (prevVal || 0)) * 100) / 100);

    const newEntry: Entry = {
      id: Date.now().toString(),
      meter,
      value,
      reading: value,
      previousValue: prevVal,
      previousReading: prevVal,
      newlyAdded,
      deltaUnits: newlyAdded,
      date: dateIso || new Date().toISOString(),
      name: currentName,
      uid: userUid,
      pending: true,
    };

    // 1. Local Save
    addLocalEntry(newEntry);
    reloadLocalData();

    // 2. Always queue for Google Sheet sync so data is sent when online/connected
    addToOfflineQueue({
      action: 'add',
      payload: newEntry,
    });

    if (settings.webAppUrl) {
      syncWithSheet();
      showToast(LABELS.toasts.rowAdded(value, isFirstRow, newlyAdded), 'success');
    } else {
      showToast(
        `Saved on phone: ${value.toFixed(2)} (${isFirstRow ? '0.00 at start' : `+${newlyAdded.toFixed(2)} newly added`}). ⚠️ Google Sheet is not connected yet!`,
        'info'
      );
    }
  };

  // Edit Reading Entry (recalculates deltas)
  const handleEditEntry = (meter: MeterId, id: string, newReading: number) => {
    const res = updateLocalEntry(meter, id, newReading, userUid);
    if (!res.success) {
      showToast(res.error || 'Cannot edit this entry', 'error');
      return;
    }

    reloadLocalData();

    if (settings.webAppUrl) {
      addToOfflineQueue({
        action: 'edit',
        payload: {
          id,
          uid: userUid,
          value: newReading,
          reading: newReading,
          newlyAdded: res.updatedEntry?.newlyAdded,
          deltaUnits: res.updatedEntry?.newlyAdded,
        },
      });
      syncWithSheet();
      showToast(LABELS.toasts.entryUpdated, 'success');
    } else {
      showToast(LABELS.toasts.entryUpdated, 'success');
    }
  };

  // Delete Reading Entry (Owner only verified)
  const handleDeleteEntry = (meter: MeterId, id: string) => {
    const res = deleteLocalEntry(meter, id, userUid);
    if (!res.success) {
      showToast(res.error || 'Cannot delete this entry', 'error');
      return;
    }

    reloadLocalData();

    if (settings.webAppUrl) {
      addToOfflineQueue({
        action: 'delete',
        payload: { id, uid: userUid },
      });
      syncWithSheet();
      showToast(LABELS.toasts.entryDeleted, 'success');
    } else {
      showToast(LABELS.toasts.entryDeleted, 'success');
    }
  };

  // Clear All Data
  const handleClearAllData = async () => {
    clearAllLocalData();
    reloadLocalData();

    if (settings.webAppUrl) {
      try {
        await clearAllSheetEntries(settings.webAppUrl, settings.token || '');
      } catch (e) {
        console.error('Failed to clear sheet', e);
      }
    }

    showToast(LABELS.toasts.dataCleared, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800 flex flex-col selection:bg-indigo-100 selection:text-indigo-800">
      {/* Top Navbar */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        userName={userName}
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingCount={pendingQueueCount}
        hasGoogleSheet={Boolean(settings.webAppUrl)}
        onManualSync={syncWithSheet}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentScreen === 'home' && (
          <HomeScreen
            entriesM1={entriesM1}
            entriesM2={entriesM2}
            settings={settings}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'meter1' && (
          <MeterScreen
            meterId="m1"
            entries={entriesM1}
            settings={settings}
            currentUid={userUid}
            currentUserName={userName}
            onNavigate={setCurrentScreen}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {currentScreen === 'meter2' && (
          <MeterScreen
            meterId="m2"
            entries={entriesM2}
            settings={settings}
            currentUid={userUid}
            currentUserName={userName}
            onNavigate={setCurrentScreen}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            userName={userName}
            userUid={userUid}
            pendingQueueCount={pendingQueueCount}
            lastSynced={lastSynced}
            onNavigate={setCurrentScreen}
            onSaveSettings={handleSaveSettings}
            onUpdateUserName={handleUpdateUserName}
            onManualSync={syncWithSheet}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-indigo-600 text-white border-indigo-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-indigo-200 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* First-time Name Prompt Modal */}
      <NameModal isOpen={isNameModalOpen} onSave={handleSaveInitialName} />
    </div>
  );
}
