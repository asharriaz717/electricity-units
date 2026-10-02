import { CycleInfo, Entry, MeterCycleSummary } from '../types';
import { LABELS } from '../constants/labels';

/**
 * Returns current cycle dates:
 * "then the newly added value will be calculate from 9 to 9 and shows"
 */
export function getCycleInfo(
  startDay: number = 9,
  endDay: number = 9,
  referenceDate: Date = new Date()
): CycleInfo {
  const clampedStart = Math.min(28, Math.max(1, Math.round(startDay) || 9));
  const clampedEnd = Math.min(28, Math.max(1, Math.round(endDay) || 9));

  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const todayDate = referenceDate.getDate();

  let startDate: Date;
  let endDate: Date;

  if (todayDate >= clampedStart) {
    startDate = new Date(year, month, clampedStart, 0, 0, 0, 0);
    endDate = new Date(year, month + 1, clampedEnd, 0, 0, 0, 0);
  } else {
    startDate = new Date(year, month - 1, clampedStart, 0, 0, 0, 0);
    endDate = new Date(year, month, clampedEnd, 0, 0, 0, 0);
  }

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  const formattedStart = startDate.toLocaleDateString('en-GB', options);
  const formattedEnd = endDate.toLocaleDateString('en-GB', options);

  return {
    startDate,
    endDate,
    formattedStart,
    formattedEnd,
    isCurrentCycle: true,
  };
}

/**
 * Check if a date falls strictly within the 9-to-9 cycle [startDate, endDate)
 */
export function isDateInCycle(dateInput: string | Date, startDate: Date, endDate: Date): boolean {
  const d = new Date(dateInput).getTime();
  return d >= startDate.getTime() && d < endDate.getTime();
}

/**
 * Get the latest value from chronological entries
 */
export function getLatestValue(entries: Entry[]): number | null {
  if (!entries || entries.length === 0) return null;
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const last = sorted[sorted.length - 1];
  return Number(last.value ?? last.reading ?? 0);
}

/**
 * Calculates cycle summary:
 * Sums all "newly added" values for entries recorded between startDay (9th) and endDay (9th next month)
 */
export function getMeterCycleSummary(
  entries: Entry[],
  startDay: number = 9,
  endDay: number = 9,
  limit: number = 200,
  referenceDate: Date = new Date()
): MeterCycleSummary {
  const { startDate, endDate } = getCycleInfo(startDay, endDay, referenceDate);

  // Chronologically sorted entries
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Entries falling within 9 to 9 cycle
  const cycleEntries = sorted.filter((e) => isDateInCycle(e.date, startDate, endDate));

  // Sum of newly added values in this cycle
  let newlyAddedTotal = 0;
  for (const entry of cycleEntries) {
    newlyAddedTotal += Number(entry.newlyAdded ?? entry.deltaUnits ?? 0);
  }
  newlyAddedTotal = Math.round(newlyAddedTotal * 100) / 100;

  const currentValue = sorted.length > 0 ? Number(sorted[sorted.length - 1].value ?? 0) : 0;
  const baselineValue =
    sorted.length > 0
      ? Number(sorted[0].previousValue ?? sorted[0].value ?? 0)
      : 0;

  const isOverLimit = newlyAddedTotal > limit;
  const remainingUnits = Math.round(Math.abs(limit - newlyAddedTotal) * 100) / 100;
  const percentage = limit > 0 ? (newlyAddedTotal / limit) * 100 : 0;

  return {
    currentValue,
    baselineValue,
    newlyAddedTotal,
    limit,
    remainingUnits,
    isOverLimit,
    percentage: Math.min(100, percentage),
    entriesCount: cycleEntries.length,
  };
}

/**
 * Helper to validate a new value input:
 * - If first entry: newly added is 0 at start
 * - If subsequent entry: must be > previous value; newly added = newValue - previousValue
 */
export function computeNewlyAddedForInput(
  newValue: number,
  entries: Entry[]
): {
  isValid: boolean;
  errorMessage?: string;
  isFirstEntry: boolean;
  previousValue: number | null;
  newlyAdded: number;
} {
  if (isNaN(newValue) || newValue < 0) {
    return {
      isValid: false,
      errorMessage: LABELS.validation.enterPositiveNumber,
      isFirstEntry: entries.length === 0,
      previousValue: null,
      newlyAdded: 0,
    };
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length === 0) {
    return {
      isValid: true,
      isFirstEntry: true,
      previousValue: null,
      newlyAdded: 0,
    };
  }

  const lastEntry = sorted[sorted.length - 1];
  const previousValue = Number(lastEntry.value ?? lastEntry.reading ?? 0);

  if (newValue <= previousValue) {
    return {
      isValid: false,
      errorMessage: LABELS.validation.mustBeGreaterThanPrev(previousValue),
      isFirstEntry: false,
      previousValue,
      newlyAdded: 0,
    };
  }

  const newlyAdded = Math.round((newValue - previousValue) * 100) / 100;

  return {
    isValid: true,
    isFirstEntry: false,
    previousValue,
    newlyAdded,
  };
}

/**
 * Status message formatting for limit
 */
export function getLimitStatus(totalNewlyAdded: number, limit: number): {
  isOverLimit: boolean;
  diff: number;
  percentage: number;
  messageUrdu: string;
  messageEng: string;
  badgeClass: string;
  progressColor: string;
} {
  const isOverLimit = totalNewlyAdded > limit;
  const diff = Math.round(Math.abs(totalNewlyAdded - limit) * 100) / 100;
  const percentage = limit > 0 ? (totalNewlyAdded / limit) * 100 : 100;

  if (isOverLimit) {
    return {
      isOverLimit: true,
      diff,
      percentage: Math.min(100, percentage),
      messageUrdu: LABELS.status.unitsOverLimitUrdu(diff.toFixed(2)),
      messageEng: LABELS.status.unitsOverLimitEng(diff.toFixed(2)),
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      progressColor: 'bg-red-600',
    };
  } else {
    return {
      isOverLimit: false,
      diff,
      percentage: Math.min(100, percentage),
      messageUrdu: LABELS.status.unitsRemainingUrdu(diff.toFixed(2)),
      messageEng: LABELS.status.unitsRemainingEng(diff.toFixed(2)),
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      progressColor: 'bg-emerald-600',
    };
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatLiveDateTime(date: Date): { date: string; time: string } {
  const dateStr = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return { date: dateStr, time: timeStr };
}
