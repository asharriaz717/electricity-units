import React, { useState } from 'react';
import { User, ArrowRight, ShieldCheck } from 'lucide-react';
import { LABELS } from '../constants/labels';

interface NameModalProps {
  isOpen: boolean;
  onSave: (name: string) => void;
}

export const NameModal: React.FC<NameModalProps> = ({ isOpen, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(LABELS.validation.enterName);
      return;
    }
    if (trimmed.length < 2) {
      setError(LABELS.validation.nameMinLength);
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
          <User className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {LABELS.modals.name.title}
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {LABELS.modals.name.description}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="userNameInput" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {LABELS.modals.name.nameLabel}
            </label>
            <input
              id="userNameInput"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder={LABELS.modals.name.placeholder}
              className={`w-full px-4 py-3 rounded-xl border text-slate-900 text-base font-medium placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
              }`}
            />
            {error && <p className="text-xs text-red-600 font-medium mt-1.5">{error}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>{LABELS.modals.name.button}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{LABELS.modals.name.footerNote}</span>
        </div>
      </div>
    </div>
  );
};
