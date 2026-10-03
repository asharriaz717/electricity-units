import React, { useState, useEffect, useMemo } from 'react';
import { AppSettings, Entry, MeterId, ActiveScreen } from '../types';
import { METERS } from '../constants';
import {
  getCycleInfo,
  getMeterCycleSummary,
  computeNewlyAddedForInput,
  isDateInCycle,
  formatDateTime,
  formatLiveDateTime,
  getLimitStatus,
} from '../utils/cycle';
import { LABELS } from '../constants/labels';
import {
  ArrowLeft,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Calendar,
  CloudUpload,
  AlertCircle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { EditEntryModal } from './EditEntryModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface MeterScreenProps {
  meterId: MeterId;
  entries: Entry[];
  settings: AppSettings;
  currentUid: string;
  currentUserName: string;
  onNavigate: (screen: ActiveScreen) => void;
  onAddEntry: (meter: MeterId, value: number, customDate?: string) => void;
  onEditEntry: (meter: MeterId, id: string, newValue: number) => void;
  onDeleteEntry: (meter: MeterId, id: string) => void;
}

export const MeterScreen: React.FC<MeterScreenProps> = ({
  meterId,
  entries,
  settings,
  currentUid,
  currentUserName,
  onNavigate,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}) => {
  const meterInfo = METERS[meterId];
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Live Clock ticker
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveFormatted = formatLiveDateTime(currentTime);

  // Edit & Delete modals
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null);

  // Cycle & Summary calculations
  const cycle = getCycleInfo(settings.startDay, settings.endDay);
  const summary = getMeterCycleSummary(
    entries,
    settings.startDay,
    settings.endDay,
    settings.limit
  );

  const status = getLimitStatus(summary.newlyAddedTotal, settings.limit);

  // Live computation preview for newly added
  const preview = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return null;
    return computeNewlyAddedForInput(num, entries);
  }, [inputValue, entries]);

  // Table entries sorted
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [entries, sortOrder]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(inputValue);

    if (isNaN(num) || num < 0) {
      setInputError(LABELS.validation.enterPositiveNumber);
      return;
    }

    const check = computeNewlyAddedForInput(num, entries);
    if (!check.isValid) {
      setInputError(check.errorMessage || LABELS.validation.enterPositiveNumber);
      return;
    }

    setIsSubmitting(true);
    onAddEntry(meterId, Math.round(num * 100) / 100, new Date().toISOString());
    setInputValue('');
    setInputError('');
    setIsSubmitting(false);
  };

  const handleQuickIncrement = (increment: number) => {
    const base = summary.currentValue;
    const next = Math.round((base + increment) * 100) / 100;
    setInputValue(next.toString());
    setInputError('');
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Navigation & Meter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{LABELS.app.backToHome}</span>
        </button>

        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => onNavigate('meter1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              meterId === 'm1'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {LABELS.meters.m1.name} · {LABELS.meters.m1.id}
          </button>
          <button
            onClick={() => onNavigate('meter2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              meterId === 'm2'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {LABELS.meters.m2.name} · {LABELS.meters.m2.id}
          </button>
        </div>
      </div>

      {/* Screen Title with Meter ID */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{meterInfo.name}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200">
              {LABELS.meters.idPrefix} {LABELS.meters[meterId].id}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {LABELS.app.tagline}
          </p>
        </div>
      </div>

      {/* Cycle Summary Banner (Calculates Newly Added from 9 to 9) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Cycle: Day {settings.startDay} to Day {settings.endDay} ({cycle.formattedStart} — {cycle.formattedEnd})</span>
          </div>
          <div className="text-xs font-bold text-slate-700">
            {LABELS.meterScreen.limitLabel} {settings.limit} {LABELS.home.unitsSuffix}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Latest Value */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {LABELS.meterScreen.latestValueCardTitle}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {summary.currentValue.toFixed(2)}{' '}
              <span className="text-xs font-medium text-slate-400">{LABELS.home.unitsSuffix}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {entries.length > 0 ? `Total ${entries.length} ${LABELS.meterScreen.rowsRecorded}` : LABELS.meterScreen.noValuesYet}
            </p>
          </div>

          {/* Newly Added Total from 9 to 9 */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                {LABELS.meterScreen.newlyAddedCycleCardTitle}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  status.isOverLimit
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {status.messageUrdu}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight mt-0.5">
              {summary.newlyAddedTotal.toFixed(2)}{' '}
              <span className="text-xs font-medium text-indigo-500">/ {settings.limit} {LABELS.home.unitsSuffix}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                status.isOverLimit ? 'bg-red-600' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, (summary.newlyAddedTotal / (settings.limit || 1)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-medium mt-1.5">
            <span>0 {LABELS.home.unitsSuffix}</span>
            <span className="font-semibold text-slate-700">
              {Math.round((summary.newlyAddedTotal / (settings.limit || 1)) * 100)}% {LABELS.meterScreen.ofLimit}
            </span>
            <span>{settings.limit} {LABELS.home.unitsSuffix}</span>
          </div>
        </div>
      </div>

      {/* Warning Notice if Google Sheet is not connected on this device */}
      {!settings.webAppUrl && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0">⚠️</span>
            <div>
              <strong className="text-amber-900 block font-bold">Google Sheet Not Connected on this Phone</strong>
              <span className="text-amber-700 block mt-0.5">
                Nayi reading is phone par save ho rahi hai magar Google Sheet mein nahi ja rahi. Settings mein ja kar Google Apps Script URL paste karein ya Test karein.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0 cursor-pointer self-start sm:self-auto transition-colors shadow-xs"
          >
            Connect Sheet
          </button>
        </div>
      )}

      {/* Enter Value Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {LABELS.meterScreen.addFormTitle} ({meterInfo.name} · {LABELS.meters[meterId].id})
          </h3>
          {entries.length > 0 ? (
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              {LABELS.meterScreen.previousValueBadge} <strong className="font-bold">{summary.currentValue.toFixed(2)}</strong>
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              {LABELS.meterScreen.firstRowNotice}
            </span>
          )}
        </div>

        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Value */}
            <div>
              <label htmlFor="meterValueInput" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {LABELS.meterScreen.enterValueLabel} {entries.length > 0 ? LABELS.meterScreen.mustBeGreaterThan.replace('{val}', summary.currentValue.toFixed(2)) : LABELS.meterScreen.firstValuePlaceholder}
              </label>
              <div className="relative">
                <input
                  id="meterValueInput"
                  type="number"
                  step="any"
                  min={entries.length > 0 ? summary.currentValue + 0.01 : 0}
                  placeholder={entries.length > 0 ? `e.g. ${(summary.currentValue + 20).toFixed(2)}` : 'e.g. 100'}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (inputError) setInputError('');
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    inputError
                      ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  {LABELS.home.unitsSuffix}
                </span>
              </div>

              {inputError && (
                <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{inputError}</span>
                </p>
              )}

              {/* Quick Increment suggestions */}
              {entries.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">{LABELS.meterScreen.quickAddPrefix}</span>
                  {[10, 20, 30, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickIncrement(amt)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto Current Date Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {LABELS.meterScreen.liveDateLabel}
              </label>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Clock className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{liveFormatted.date}</div>
                    <div className="text-[11px] font-mono text-indigo-600 font-medium">
                      {liveFormatted.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {LABELS.meterScreen.addedByLabel}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {currentUserName || 'You'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          {preview && preview.isValid && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1 animate-in fade-in duration-150">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{LABELS.meterScreen.previewTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium text-emerald-950">
                <div>
                  • {LABELS.meterScreen.previewValue}{' '}
                  <strong className="text-slate-900 font-bold">
                    {parseFloat(inputValue).toFixed(2)}
                  </strong>
                </div>
                <div>
                  • {LABELS.meterScreen.previewNewlyAdded}{' '}
                  <strong className="text-emerald-700 font-bold">
                    {preview.isFirstEntry
                      ? LABELS.meterScreen.firstRowStartNotice
                      : `+${preview.newlyAdded.toFixed(2)} ${LABELS.home.unitsSuffix} (${parseFloat(inputValue).toFixed(2)} - ${preview.previousValue?.toFixed(2)})`}
                  </strong>
                </div>
                <div>
                  • {LABELS.meterScreen.previewCycleTotal}{' '}
                  <strong className="text-indigo-950 font-bold">
                    {(summary.newlyAddedTotal + preview.newlyAdded).toFixed(2)} {LABELS.home.unitsSuffix}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{LABELS.meterScreen.submitButton}</span>
          </button>
        </form>
      </div>

      {/* The Table (Contains ID, Date, Value, Newly Added, Added By, Actions) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{LABELS.table.title}</h3>
            <p className="text-xs text-slate-500">
              {LABELS.table.subtitle}
            </p>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'desc' ? LABELS.table.sortNewestFirst : LABELS.table.sortOldestFirst}</span>
          </button>
        </div>

        {/* Table Content */}
        {sortedEntries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">{LABELS.table.noRowsFound}</p>
            <p className="text-xs text-slate-400 mt-1">
              {LABELS.table.noRowsHint}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{LABELS.table.columnId}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{LABELS.table.columnDate}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{LABELS.table.columnValue}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{LABELS.table.columnNewlyAdded}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{LABELS.table.columnAddedBy}</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{LABELS.table.columnCycle}</th>
                  <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">{LABELS.table.columnActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sortedEntries.map((entry) => {
                  const inActiveCycle = isDateInCycle(entry.date, cycle.startDate, cycle.endDate);
                  const isOwner = entry.uid === currentUid;
                  const isFirstRow = (entry.newlyAdded === 0 && !entry.previousValue);
                  const rowId = entry.id.slice(-6);

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !inActiveCycle ? 'opacity-60 bg-slate-50/30' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        #{rowId}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-800 font-semibold">{formatDateTime(entry.date)}</span>
                      </td>

                      {/* Value */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-base font-extrabold text-slate-900">
                          {Number(entry.value).toFixed(2)}
                        </span>
                      </td>

                      {/* Newly Added */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isFirstRow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                            {LABELS.table.badgeStart}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                            +{Number(entry.newlyAdded).toFixed(2)} {LABELS.home.unitsSuffix}
                          </span>
                        )}
                      </td>

                      {/* Added By */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {entry.name ? entry.name[0].toUpperCase() : 'U'}
                          </span>
                          <span className="text-slate-700 truncate max-w-[100px]">{entry.name}</span>
                          {entry.pending && (
                            <span title="Pending Sheet Sync" className="text-amber-500">
                              <CloudUpload className="w-3 h-3 animate-bounce" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cycle */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {inActiveCycle ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                            {LABELS.table.badgeActiveCycle}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {LABELS.table.badgePreviousCycle}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {isOwner ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setEditingEntry(entry)}
                              title="Edit value"
                              className="w-7 h-7 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingEntry(entry)}
                              title="Delete row"
                              className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">{LABELS.table.readOnly}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                <tr>
                  <td colSpan={3} className="px-4 py-3">
                    {LABELS.table.footerCycleTotal}
                  </td>
                  <td className="px-4 py-3 text-indigo-700 font-extrabold text-sm">
                    {summary.newlyAddedTotal.toFixed(2)} {LABELS.home.unitsSuffix}
                  </td>
                  <td colSpan={3} className="px-4 py-3 text-slate-500 font-semibold text-xs">
                    {status.messageUrdu} ({settings.limit} {LABELS.home.unitsSuffix} limit)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Edit & Delete Modals */}
      <EditEntryModal
        isOpen={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={(id, newValue) => onEditEntry(meterId, id, newValue)}
      />

      <DeleteConfirmModal
        isOpen={!!deletingEntry}
        entry={deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={(id) => onDeleteEntry(meterId, id)}
      />
    </div>
  );
};
