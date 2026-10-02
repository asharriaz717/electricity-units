import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../constants';
import { LABELS } from '../constants/labels';
import { Copy, Check, X, FileCode, HelpCircle } from 'lucide-react';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{LABELS.modals.appsScript.title}</h3>
              <p className="text-xs text-slate-500">{LABELS.modals.appsScript.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 text-indigo-950">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-sm">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>{LABELS.modals.appsScript.setupGuideTitle}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-indigo-900 font-medium pl-1 leading-relaxed">
              <li>
                {LABELS.modals.appsScript.step1}
              </li>
              <li>
                {LABELS.modals.appsScript.step2}
              </li>
              <li>
                {LABELS.modals.appsScript.step3}
              </li>
              <li>
                {LABELS.modals.appsScript.step4}
              </li>
            </ol>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between pb-2">
              <span className="font-semibold text-slate-700">{LABELS.modals.appsScript.codeSectionTitle}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? LABELS.modals.appsScript.copiedCodeButton : LABELS.modals.appsScript.copyCodeButton}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[260px] border border-slate-800">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {LABELS.modals.appsScript.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
};
