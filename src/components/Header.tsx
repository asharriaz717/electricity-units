import React from 'react';
import { RefreshCw, Cloud, CloudOff, User, Zap } from 'lucide-react';
import { ActiveScreen } from '../types';
import { LABELS } from '../constants/labels';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  userName: string;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  hasGoogleSheet: boolean;
  onManualSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  userName,
  isOnline,
  isSyncing,
  pendingCount,
  hasGoogleSheet,
  onManualSync,
}) => {
  // Get initials from user name
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo & App Name */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-150">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              {LABELS.app.name}
            </h1>
          </div>
        </button>

        {/* Right side controls: Sync Status & User Profile */}
        <div className="flex items-center gap-2">
          {/* Sync status & Refresh button */}
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              pendingCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : hasGoogleSheet
                ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">
              {isSyncing
                ? LABELS.sync.syncing
                : pendingCount > 0
                ? `${pendingCount} ${LABELS.sync.pending}`
                : hasGoogleSheet
                ? LABELS.sync.sheetSynced
                : LABELS.sync.localOnly}
            </span>
            {isOnline ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-rose-500 ml-0.5" />
            )}
          </button>

          {/* User profile avatar / Settings trigger */}
          <button
            onClick={() => onNavigate('settings')}
            title={LABELS.sync.loggedAs(userName || LABELS.app.userFallback)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <span className="text-xs font-semibold text-slate-700 max-w-[80px] sm:max-w-[120px] truncate group-hover:text-indigo-600">
              {userName || LABELS.app.userFallback}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
