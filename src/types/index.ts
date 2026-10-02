export type MeterId = 'm1' | 'm2';

export interface Entry {
  id: string;
  meter: MeterId;
  /** The value entered by the user (e.g. 100, 120, 170) */
  value: number;
  /** Same as value for reading */
  reading?: number;
  /** Previous value before this entry */
  previousValue?: number;
  previousReading?: number;
  /** Newly added units difference (e.g. 0 at start, then 120 - 100 = 20) */
  newlyAdded: number;
  /** Alias for newlyAdded */
  deltaUnits?: number;
  /** Cumulative cycle total up to this reading */
  cycleTotalUnits?: number;
  /** Automatic ISO timestamp */
  date: string;
  name: string;
  uid: string;
  pending?: boolean;
}

export interface AppSettings {
  startDay: number; // 1 to 28 (default 9)
  endDay: number;   // 1 to 28 (default 9)
  limit: number;    // default 200
  webAppUrl?: string;
  token?: string;
  googleSheetUrl?: string;
  m1BaselineReading?: number;
  m2BaselineReading?: number;
}

export interface QueueItem {
  id: string;
  action: 'add' | 'edit' | 'delete' | 'settings' | 'clear';
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface CycleInfo {
  startDate: Date;
  endDate: Date;
  formattedStart: string;
  formattedEnd: string;
  isCurrentCycle: boolean;
}

export interface MeterCycleSummary {
  currentValue: number;
  baselineValue: number;
  newlyAddedTotal: number;
  limit: number;
  remainingUnits: number;
  isOverLimit: boolean;
  percentage: number;
  entriesCount: number;
}

export type ActiveScreen = 'home' | 'meter1' | 'meter2' | 'settings';
