import React from 'react';
import { AppSettings, Entry, ActiveScreen } from '../types';
import { METERS } from '../constants';
import { getCycleInfo, getMeterCycleSummary, getLimitStatus } from '../utils/cycle';
import { ArrowRight, Settings, Zap, Calendar, TrendingUp } from 'lucide-react';

import { LABELS } from '../constants/labels';

interface HomeScreenProps {
  entriesM1: Entry[];
  entriesM2: Entry[];
  settings: AppSettings;
  onNavigate: (screen: ActiveScreen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  entriesM1,
  entriesM2,
  settings,
  onNavigate,
}) => {
  const cycle = getCycleInfo(settings.startDay, settings.endDay);

  const summaryM1 = getMeterCycleSummary(entriesM1, settings.startDay, settings.endDay, settings.limit);
  const summaryM2 = getMeterCycleSummary(entriesM2, settings.startDay, settings.endDay, settings.limit);

  const combinedConsumed = Math.round((summaryM1.newlyAddedTotal + summaryM2.newlyAddedTotal) * 100) / 100;

  const statusM1 = getLimitStatus(summaryM1.newlyAddedTotal, settings.limit);
  const statusM2 = getLimitStatus(summaryM2.newlyAddedTotal, settings.limit);

  const lastEntryM1 = entriesM1[0];
  const lastEntryM2 = entriesM2[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Cycle Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {LABELS.home.cycleBannerTitle}
            </div>
            <div className="text-base font-bold text-slate-900">
              {cycle.formattedStart} — {cycle.formattedEnd}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 self-start sm:self-auto font-medium">
          {LABELS.home.startDayPrefix} <strong className="text-slate-800 font-semibold">{settings.startDay}</strong> · {LABELS.home.endDayPrefix}{' '}
          <strong className="text-slate-800 font-semibold">{settings.endDay}</strong> · {LABELS.home.limitPrefix}{' '}
          <strong className="text-slate-800 font-semibold">{settings.limit} {LABELS.home.unitsSuffix}</strong>
        </div>
      </div>

      {/* Main 3 Cards: Meter 1, Meter 2, Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Meter 1 (UP) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    {LABELS.meters.m1.tag}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-100">
                    {LABELS.meters.idPrefix} {LABELS.meters.m1.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{LABELS.meters.m1.name}</h3>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  statusM1.isOverLimit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <Zap className="w-5 h-5 fill-current" />
              </div>
            </div>

            {/* Units Consumed */}
            <div className="mt-5">
              <div className="text-xs text-slate-500 font-medium">{LABELS.home.newlyAddedTotalLabel}</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summaryM1.newlyAddedTotal.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ {settings.limit} {LABELS.home.unitsSuffix}</span>
              </div>
            </div>

            {/* Current Value info */}
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
              <span>{LABELS.home.latestValueLabel}</span>
              <span className="font-bold text-slate-800">{summaryM1.currentValue.toFixed(2)} {LABELS.home.unitsSuffix}</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    statusM1.isOverLimit ? 'bg-red-600' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (summaryM1.newlyAddedTotal / (settings.limit || 1)) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold mt-2">
                <span className={statusM1.isOverLimit ? 'text-red-600' : 'text-emerald-600'}>
                  {statusM1.messageUrdu}
                </span>
                <span className="text-slate-400">
                  {Math.round((summaryM1.newlyAddedTotal / (settings.limit || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Last entry */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>{LABELS.home.lastEntryLabel}</span>
              <span className="font-medium text-slate-700">
                {lastEntryM1
                  ? `Dial ${Number(lastEntryM1.reading || lastEntryM1.value || 0).toFixed(2)} (+${Number(lastEntryM1.deltaUnits || lastEntryM1.newlyAdded || 0).toFixed(2)}) by ${lastEntryM1.name}`
                  : LABELS.home.noEntriesYet}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('meter1')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>{LABELS.meters.m1.button}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Meter 2 (Down) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    {LABELS.meters.m2.tag}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-100">
                    {LABELS.meters.idPrefix} {LABELS.meters.m2.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{LABELS.meters.m2.name}</h3>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  statusM2.isOverLimit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <Zap className="w-5 h-5 fill-current" />
              </div>
            </div>

            {/* Units Consumed */}
            <div className="mt-5">
              <div className="text-xs text-slate-500 font-medium">{LABELS.home.newlyAddedTotalLabel}</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summaryM2.newlyAddedTotal.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-slate-500">/ {settings.limit} {LABELS.home.unitsSuffix}</span>
              </div>
            </div>

            {/* Current Value info */}
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
              <span>{LABELS.home.latestValueLabel}</span>
              <span className="font-bold text-slate-800">{summaryM2.currentValue.toFixed(2)} {LABELS.home.unitsSuffix}</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    statusM2.isOverLimit ? 'bg-red-600' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (summaryM2.newlyAddedTotal / (settings.limit || 1)) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold mt-2">
                <span className={statusM2.isOverLimit ? 'text-red-600' : 'text-emerald-600'}>
                  {statusM2.messageUrdu}
                </span>
                <span className="text-slate-400">
                  {Math.round((summaryM2.newlyAddedTotal / (settings.limit || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Last entry */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>{LABELS.home.lastEntryLabel}</span>
              <span className="font-medium text-slate-700">
                {lastEntryM2
                  ? `Dial ${Number(lastEntryM2.reading || lastEntryM2.value || 0).toFixed(2)} (+${Number(lastEntryM2.deltaUnits || lastEntryM2.newlyAdded || 0).toFixed(2)}) by ${lastEntryM2.name}`
                  : LABELS.home.noEntriesYet}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('meter2')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>{LABELS.meters.m2.button}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Settings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-slate-300 transition-all md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {LABELS.app.appConfig}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{LABELS.app.settings}</h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">{LABELS.home.billingCycleLabel}</span>
                <span className="font-semibold text-slate-800">
                  Day {settings.startDay} to {settings.endDay}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">{LABELS.home.limitPrefix}</span>
                <span className="font-semibold text-slate-800">{settings.limit} {LABELS.home.unitsSuffix}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-500">{LABELS.home.googleSheetLabel}</span>
                <span className="font-semibold text-slate-800">
                  {settings.webAppUrl ? (
                    <span className="text-emerald-600 font-bold">{LABELS.home.sheetConnected}</span>
                  ) : (
                    <span className="text-amber-600">{LABELS.sync.localOnly}</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all cursor-pointer"
          >
            <span>{LABELS.app.openSettings}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Combined Household Total Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>{LABELS.home.combinedBannerTitle}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-1">
            {combinedConsumed.toFixed(2)}{' '}
            <span className="text-sm font-medium text-slate-300">{LABELS.home.combinedBannerSubtitle}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            UP ({summaryM1.newlyAddedTotal.toFixed(2)} {LABELS.home.unitsSuffix}) + Down ({summaryM2.newlyAddedTotal.toFixed(2)} {LABELS.home.unitsSuffix})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('meter1')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            {LABELS.meters.m1.quickAdd}
          </button>
          <button
            onClick={() => onNavigate('meter2')}
            className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            {LABELS.meters.m2.quickAdd}
          </button>
        </div>
      </div>
    </div>
  );
};
