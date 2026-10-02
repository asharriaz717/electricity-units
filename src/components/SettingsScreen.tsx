import React, { useState } from 'react';
import { AppSettings, ActiveScreen } from '../types';
import { DEFAULT_GOOGLE_SHEET_TEMPLATE_URL } from '../constants';
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
  FileSpreadsheet,
  ExternalLink,
  Gauge,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { ClearConfirmModal } from './ClearConfirmModal';
import { AppsScriptModal } from './AppsScriptModal';
import { GoogleSheetTemplateModal } from './GoogleSheetTemplateModal';

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
  const [token, setToken] = useState(settings.token || 'electricity_secret_token');
  const [googleSheetUrl, setGoogleSheetUrl] = useState(
    settings.googleSheetUrl || DEFAULT_GOOGLE_SHEET_TEMPLATE_URL
  );
  const [m1Baseline, setM1Baseline] = useState(settings.m1BaselineReading || 100);
  const [m2Baseline, setM2Baseline] = useState(settings.m2BaselineReading || 100);

  const [nameSaveMsg, setNameSaveMsg] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState(false);

  // Modals
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState(false);
  const [isSheetTemplateModalOpen, setIsSheetTemplateModalOpen] = useState(false);

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
      googleSheetUrl: googleSheetUrl.trim(),
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

      {/* Mobile App Installation Guide */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{LABELS.modals.mobileGuide.title}</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                {LABELS.modals.mobileGuide.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong className="text-white block mb-1">{LABELS.modals.mobileGuide.androidTitle}</strong>
            <span>{LABELS.modals.mobileGuide.androidDesc}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <strong className="text-white block mb-1">{LABELS.modals.mobileGuide.iphoneTitle}</strong>
            <span>{LABELS.modals.mobileGuide.iphoneDesc}</span>
          </div>
        </div>
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

      {/* Section 2: Google Sheet Link & Template */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{LABELS.settings.sheetSectionTitle}</h3>
              <p className="text-xs text-slate-500">
                {LABELS.settings.sheetSectionSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSheetTemplateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{LABELS.settings.viewHeadersButton}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="settingsGoogleSheetUrl" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {LABELS.settings.sheetUrlLabel}
            </label>
            <div className="flex gap-2">
              <input
                id="settingsGoogleSheetUrl"
                type="url"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              {googleSheetUrl && (
                <a
                  href={googleSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{LABELS.settings.openSheetButton}</span>
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {LABELS.settings.sheetUrlNote}
            </p>
          </div>

          <div>
            <label htmlFor="settingsWebAppUrl" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {LABELS.settings.webAppUrlLabel}
            </label>
            <input
              id="settingsWebAppUrl"
              type="url"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {LABELS.settings.webAppUrlNote}
            </p>
          </div>

          <div>
            <label htmlFor="settingsSecretToken" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {LABELS.settings.secretTokenLabel}
            </label>
            <input
              id="settingsSecretToken"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="electricity_secret_token"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {LABELS.settings.secretTokenNote}
            </p>
          </div>

          {/* Sync status & actions */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>
                <span className="font-semibold text-slate-700">{LABELS.settings.offlineQueueLabel}</span>{' '}
                <strong className={pendingQueueCount > 0 ? 'text-amber-600' : 'text-slate-700'}>
                  {pendingQueueCount} items
                </strong>
              </div>
              {lastSynced && (
                <div className="text-slate-400 text-[11px]">
                  {LABELS.sync.lastSynced} {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAppsScriptModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-600" />
                <span>{LABELS.settings.appsScriptButton}</span>
              </button>
              <button
                type="button"
                onClick={onManualSync}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{LABELS.settings.syncNowButton}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {/* Section 4: Danger Zone */}
      <div className="bg-red-50/50 rounded-2xl p-5 sm:p-6 border border-red-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-red-950 text-base">{LABELS.settings.dangerZoneTitle}</h3>
            <p className="text-xs text-red-700">
              {LABELS.settings.dangerZoneSubtitle}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          {LABELS.settings.dangerZoneDescription}
        </p>

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

      {/* Google Sheet Template & Headers Modal */}
      <GoogleSheetTemplateModal
        isOpen={isSheetTemplateModalOpen}
        onClose={() => setIsSheetTemplateModalOpen(false)}
        configuredSheetUrl={googleSheetUrl}
      />
    </div>
  );
};
