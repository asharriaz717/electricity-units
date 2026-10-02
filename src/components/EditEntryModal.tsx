import React, { useState, useEffect } from 'react';
import { Entry } from '../types';
import { Edit2, X, Check } from 'lucide-react';
import { formatDateTime } from '../utils/cycle';
import { LABELS } from '../constants/labels';

interface EditEntryModalProps {
  entry: Entry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newReading: number) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  entry,
  isOpen,
  onClose,
  onSave,
}) => {
  const [readingStr, setReadingStr] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      const val = entry.value ?? entry.reading ?? 0;
      setReadingStr(val.toString());
      setError('');
    }
  }, [entry]);

  if (!isOpen || !entry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(readingStr);
    if (isNaN(num) || num <= 0) {
      setError(LABELS.validation.invalidValue);
      return;
    }
    onSave(entry.id, Math.round(num * 100) / 100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900">{LABELS.modals.edit.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-500 space-y-1">
          <p>
            <span className="font-medium text-slate-700">{LABELS.modals.edit.dateRecorded}</span> {formatDateTime(entry.date)}
          </p>
          <p>
            <span className="font-medium text-slate-700">{LABELS.modals.edit.addedBy}</span> {entry.name}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="editDialReadingInput" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {LABELS.modals.edit.valueLabel}
            </label>
            <div className="relative">
              <input
                id="editDialReadingInput"
                type="number"
                step="any"
                min="0.01"
                autoFocus
                value={readingStr}
                onChange={(e) => {
                  setReadingStr(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-4 py-3 rounded-xl border text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                {LABELS.modals.edit.valueSuffix}
              </span>
            </div>
            {error && <p className="text-xs text-red-600 font-medium mt-1.5">{error}</p>}
            <p className="text-[11px] text-slate-400 mt-1">
              {LABELS.modals.edit.note}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer"
            >
              {LABELS.modals.edit.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{LABELS.modals.edit.update}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
