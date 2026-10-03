import React, { useState } from 'react';
import { AppSettings, ActiveScreen } from '../types';
import { LABELS } from '../constants/labels';
import {
  ArrowLeft,
  User,
  Sliders,
  Save,
  CheckCircle2,
  FileCode,
  RefreshCw,
  Shield,
  Gauge,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { ClearConfirmModal } from './ClearConfirmModal';
import { AppsScriptModal } from './AppsScriptModal';
import { testSheetConnection } from '../utils/api';

interface SettingsScreenProps {
  settings: AppSettings;
  userName: string;
  userUid: string;
  pendingQueueCount: number;
  lastSynced: string | null;
  onNavigate: (screen: ActiveScreen) => void;
  onSaveSettings: (settings: AppSettings) => void;
  onUpdateUserName: (newName: string) => void;
  onManualSync: () => void;
  onClearAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  userName,
  userUid,
  pendingQueueCount,
  lastSynced,
  onNavigate,
  onSaveSettings,
  onUpdateUserName,
  onManualSync,
  onClearAllData,
}) => {
  // Form states
  const [nameInput, setNameInput] = useState(userName);
  const [startDay, setStartDay] = useState(settings.startDay || 9);
  const [endDay, setEndDay] = useState(settings.endDay || 9);
  const [limit, setLimit] = useState(settings.limit || 200);
  const [webAppUrl, setWebAppUrl] = useState(settings.webAppUrl || '');
  const [token] = useState(settings.token || 'electricity_secret_token');
  const [m1Baseline, setM1Baseline] = useState(settings.m1BaselineReading || 3999);
  const [m2Baseline, setM2Baseline] = useState(settings.m2BaselineReading || 11298);

  const [nameSaveMsg, setNameSaveMsg] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState(false);
  const [sheetSaveMsg, setSheetSaveMsg] = useState(false);

  // Sheet connection testing
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveSheetConfig = () => {
    const updated: AppSettings = {
      ...settings,
      webAppUrl: webAppUrl.trim(),
      token: token.trim(),
      startDay,
      endDay,
      limit,
      m1BaselineReading: m1Baseline,
      m2BaselineReading: m2Baseline,
    };
    onSaveSettings(updated);
    setSheetSaveMsg(true);
    setTimeout(() => setSheetSaveMsg(false), 3000);
    onManualSync();
  };

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({ success: false, message: 'Google Apps Script Web App URL khali hai.' });
      return;
    }
    setIsTestingSheet(true);
    setTestResult(null);
    try {
      const res = await testSheetConnection(webAppUrl.trim(), token.trim());
      setTestResult(res);
      if (res.success) {
        handleSaveSheetConfig();
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTestingSheet(false);
    }
  };

  // Modals
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateUserName(nameInput.trim());
      setNameSaveMsg(true);
      setTimeout(() => setNameSaveMsg(false), 2000);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const clampedStart = Math.min(28, Math.max(1, Number(startDay) || 9));
    const clampedEnd = Math.min(28, Math.max(1, Number(endDay) || 9));
    const cleanLimit = Math.max(1, Number(limit) || 200);

    onSaveSettings({
      startDay: clampedStart,
      endDay: clampedEnd,
      limit: cleanLimit,
      webAppUrl: webAppUrl.trim(),
      token: token.trim(),
      googleSheetUrl: settings.googleSheetUrl || '',
      m1BaselineReading: Number(m1Baseline) || 100,
      m2BaselineReading: Number(m2Baseline) || 100,
    });

    setSettingsSaveMsg(true);
    setTimeout(() => setSettingsSaveMsg(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{LABELS.app.backToHome}</span>
        </button>

        <span className="text-xs font-semibold text-slate-400">{LABELS.app.settings}</span>
      </div>



      {/* Section 1: User Profile */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{LABELS.settings.profileTitle}</h3>
            <p className="text-xs text-slate-500">
              {LABELS.settings.profileSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="mt-4 space-y-3">
          <div>
            <label htmlFor="settingsUserName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {LABELS.settings.yourNameLabel}
            </label>
            <div className="flex gap-2">
              <input
                id="settingsUserName"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={LABELS.settings.enterNamePlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{LABELS.settings.saveNameButton}</span>
              </button>
            </div>
            {nameSaveMsg && (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {LABELS.settings.nameSavedSuccess}
              </p>
            )}
          </div>

          <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">
              {LABELS.settings.deviceUidLabel}{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-700">
                {userUid}
              </code>
            </span>
          </div>
        </form>
      </div>

      {/* Section 2: Google Sheet Sync - ONLY shown when user is ashrii_2314 */}
      {userName.toLowerCase().trim() === 'ashrii_2314' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Google Sheet Sync</h3>
              <p className="text-xs text-slate-500">Live 2-way sync with Google Sheet</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="settingsWebAppUrl" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Apps Script Web App URL
              </label>
              <input
                id="settingsWebAppUrl"
                type="url"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Test connection result banner */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <strong className="block font-bold">
                    {testResult.success ? 'Google Sheet Connected!' : 'Connection Error'}
                  </strong>
                  <span className="text-[11px] block mt-0.5">{testResult.message}</span>
                </div>
              </div>
            )}

            {sheetSaveMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Settings saved! Syncing with sheet...</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <div className="text-xs text-slate-600 space-y-0.5">
                <div>
                  <span className="font-semibold text-slate-700">Offline Queue:</span>{' '}
                  <strong className={pendingQueueCount > 0 ? 'text-amber-600 font-bold' : 'text-slate-700 font-bold'}>
                    {pendingQueueCount} items
                  </strong>
                </div>
                {lastSynced && (
                  <div className="text-slate-400 text-[11px]">
                    Last synced: {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAppsScriptModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-600" />
                  <span>Script Code</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingSheet}
                  className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSheet ? 'animate-spin' : ''}`} />
                  <span>{isTestingSheet ? 'Testing...' : 'Test Connection'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveSheetConfig}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Connect</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Billing Cycle & Baseline Readings */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{LABELS.settings.cycleSectionTitle}</h3>
            <p className="text-xs text-slate-500">
              {LABELS.settings.cycleSectionSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Start Day */}
            <div>
              <label htmlFor="settingsStartDay" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {LABELS.settings.startDayLabel}
              </label>
              <input
                id="settingsStartDay"
                type="number"
                min="1"
                max="28"
                value={startDay}
                onChange={(e) => setStartDay(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">{LABELS.settings.startDayDefault}</p>
            </div>

            {/* End Day */}
            <div>
              <label htmlFor="settingsEndDay" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {LABELS.settings.endDayLabel}
              </label>
              <input
                id="settingsEndDay"
                type="number"
                min="1"
                max="28"
                value={endDay}
                onChange={(e) => setEndDay(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">{LABELS.settings.endDayDefault}</p>
            </div>

            {/* Limit */}
            <div>
              <label htmlFor="settingsLimit" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {LABELS.settings.limitLabel}
              </label>
              <input
                id="settingsLimit"
                type="number"
                min="1"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">{LABELS.settings.limitDefault}</p>
            </div>
          </div>

          {/* Starting Baseline Readings */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Gauge className="w-4 h-4 text-indigo-600" />
              <span>{LABELS.settings.baselineSectionTitle}</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settingsM1Baseline" className="block text-xs font-semibold text-slate-600 mb-1">
                  {LABELS.settings.m1BaselineLabel}
                </label>
                <input
                  id="settingsM1Baseline"
                  type="number"
                  step="any"
                  value={m1Baseline}
                  onChange={(e) => setM1Baseline(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label htmlFor="settingsM2Baseline" className="block text-xs font-semibold text-slate-600 mb-1">
                  {LABELS.settings.m2BaselineLabel}
                </label>
                <input
                  id="settingsM2Baseline"
                  type="number"
                  step="any"
                  value={m2Baseline}
                  onChange={(e) => setM2Baseline(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              When units consumed exceed {limit} units, the meter displays red alert.
            </span>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{LABELS.settings.saveSettingsButton}</span>
            </button>
          </div>
          {settingsSaveMsg && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {LABELS.settings.settingsSavedSuccess}
            </p>
          )}
        </form>
      </div>

      {/* Section 4: Danger Zone - ONLY shown when user is ashrii_2314 */}
      {userName.toLowerCase().trim() === 'ashrii_2314' && (
        <div className="bg-red-50/50 rounded-2xl p-5 sm:p-6 border border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-950 text-base">{LABELS.settings.dangerZoneTitle}</h3>
              <p className="text-xs text-red-700">Clear all records and reset sheets</p>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm shadow-red-600/20 transition-colors cursor-pointer"
            >
              {LABELS.settings.clearAllButton}
            </button>
          </div>
        </div>
      )}

      {/* Clear Confirm Modal */}
      <ClearConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={onClearAllData}
      />

      {/* Apps Script Code Modal */}
      <AppsScriptModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
      />
    </div>
  );
};
