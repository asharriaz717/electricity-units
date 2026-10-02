import React from 'react';
import { Entry } from '../types';
import { Trash2, X } from 'lucide-react';
import { formatDateTime } from '../utils/cycle';
import { LABELS } from '../constants/labels';

interface DeleteConfirmModalProps {
  entry: Entry | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  entry,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !entry) return null;

  const readingVal = Number(entry.value ?? entry.reading ?? 0);
  const delta = Number(entry.newlyAdded ?? entry.deltaUnits ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">{LABELS.modals.delete.title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {LABELS.modals.delete.description}
        </p>

        <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">{LABELS.modals.delete.valueLabel}</span>
            <span className="font-bold text-slate-900">{readingVal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{LABELS.modals.delete.newlyAddedLabel}</span>
            <span className="font-bold text-emerald-700">+{delta.toFixed(2)} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{LABELS.modals.delete.dateLabel}</span>
            <span>{formatDateTime(entry.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{LABELS.modals.delete.recordedByLabel}</span>
            <span className="font-medium text-slate-800">{entry.name}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {LABELS.modals.delete.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(entry.id);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            {LABELS.modals.delete.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
