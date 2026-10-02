import React, { useState } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import { LABELS } from '../constants/labels';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const CONFIRM_KEYWORD = 'CLEAR';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="font-bold text-slate-900">{LABELS.modals.clear.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-4 leading-relaxed">
          {LABELS.modals.clear.description}
        </p>

        <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700">
          {LABELS.modals.clear.instruction}
        </div>

        <div className="mt-3">
          <input
            type="text"
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value.toUpperCase())}
            placeholder={LABELS.modals.clear.placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-center font-bold tracking-widest uppercase focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {LABELS.modals.clear.cancel}
          </button>
          <button
            type="button"
            disabled={typedConfirmation !== CONFIRM_KEYWORD}
            onClick={() => {
              if (typedConfirmation === CONFIRM_KEYWORD) {
                onConfirm();
                setTypedConfirmation('');
                onClose();
              }
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
              typedConfirmation === CONFIRM_KEYWORD
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {LABELS.modals.clear.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
