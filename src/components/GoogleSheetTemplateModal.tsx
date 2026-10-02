import React, { useState } from 'react';
import {
  SHEET_HEADERS,
  CSV_TEMPLATE_CONTENT,
  GOOGLE_APPS_SCRIPT_CODE,
} from '../constants';
import { LABELS } from '../constants/labels';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  X,
  Info,
  Layers,
} from 'lucide-react';

interface GoogleSheetTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuredSheetUrl?: string;
}

export const GoogleSheetTemplateModal: React.FC<GoogleSheetTemplateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyHeaders = async () => {
    try {
      await navigator.clipboard.writeText(SHEET_HEADERS.join('\t'));
      setCopiedHeaders(true);
      setTimeout(() => setCopiedHeaders(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadCsv = () => {
    const blob = new Blob([CSV_TEMPLATE_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'electricity_meter_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{LABELS.modals.sheetTemplate.title}</h3>
              <p className="text-xs text-slate-500">{LABELS.modals.sheetTemplate.subtitle}</p>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Formula Explanation Callout */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-2 text-indigo-950">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-sm">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>{LABELS.modals.sheetTemplate.formulaTitle}</span>
            </div>
            <p className="leading-relaxed">
              {LABELS.modals.sheetTemplate.formulaDesc}
            </p>
            <div className="p-3 bg-white/90 rounded-lg font-mono text-[11px] text-slate-800 space-y-1 border border-indigo-100/70">
              <div>• {LABELS.modals.sheetTemplate.step1}</div>
              <div>• {LABELS.modals.sheetTemplate.step2}</div>
              <div>• {LABELS.modals.sheetTemplate.step3}</div>
              <div className="pt-1 border-t border-slate-200 font-bold text-slate-900">
                • {LABELS.modals.sheetTemplate.stepTotal}
              </div>
            </div>
          </div>

          {/* Sheet Columns & Headers Table */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>{LABELS.modals.sheetTemplate.headersTitle}</span>
              </span>
              <button
                onClick={handleCopyHeaders}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                {copiedHeaders ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHeaders ? LABELS.modals.sheetTemplate.copiedHeaders : LABELS.modals.sheetTemplate.copyHeaders}</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    {SHEET_HEADERS.map((h, i) => (
                      <th key={i} className="px-3 py-2 border-r border-slate-200 last:border-0 font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-mono text-[11px]">
                  <tr className="bg-white">
                    <td className="px-3 py-2 border-r border-slate-100">1727850001</td>
                    <td className="px-3 py-2 border-r border-slate-100 text-indigo-600 font-bold">m1</td>
                    <td className="px-3 py-2 border-r border-slate-100 font-bold text-slate-900">140.00</td>
                    <td className="px-3 py-2 border-r border-slate-100 text-emerald-700 font-bold">+40.00</td>
                    <td className="px-3 py-2 border-r border-slate-100 font-bold">40.00</td>
                    <td className="px-3 py-2 border-r border-slate-100">2026-09-15 14:30</td>
                    <td className="px-3 py-2 border-r border-slate-100">Ali</td>
                    <td className="px-3 py-2">uid_ali_phone</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="px-3 py-2 border-r border-slate-100">1727850002</td>
                    <td className="px-3 py-2 border-r border-slate-100 text-indigo-600 font-bold">m1</td>
                    <td className="px-3 py-2 border-r border-slate-100 font-bold text-slate-900">200.00</td>
                    <td className="px-3 py-2 border-r border-slate-100 text-emerald-700 font-bold">+60.00</td>
                    <td className="px-3 py-2 border-r border-slate-100 font-bold">100.00</td>
                    <td className="px-3 py-2 border-r border-slate-100">2026-09-22 18:45</td>
                    <td className="px-3 py-2 border-r border-slate-100">Usman</td>
                    <td className="px-3 py-2">uid_usman_phone</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadCsv}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{LABELS.modals.sheetTemplate.downloadCsv}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? LABELS.modals.sheetTemplate.copiedScript : LABELS.modals.sheetTemplate.copyScript}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <span className="text-[11px] text-slate-500">
            Copy into Google Sheets &gt; Extensions &gt; Apps Script
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            {LABELS.modals.sheetTemplate.close}
          </button>
        </div>
      </div>
    </div>
  );
};
