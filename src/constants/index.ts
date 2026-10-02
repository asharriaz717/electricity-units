import { AppSettings, MeterId } from '../types';
export { LABELS } from './labels';

export const METERS: Record<MeterId, { id: MeterId; serialNumber: string; name: string; tag: string; description: string }> = {
  m1: {
    id: 'm1',
    serialNumber: '02141190423402',
    name: 'Meter 1 (UP)',
    tag: 'UP Floor',
    description: 'First floor / upper portion meter',
  },
  m2: {
    id: 'm2',
    serialNumber: '02141190423403',
    name: 'Meter 2 (Down)',
    tag: 'Down Floor',
    description: 'Ground floor / lower portion meter',
  },
};

/** Pre-configured Google Sheet template & docs */
export const DEFAULT_GOOGLE_SHEET_TEMPLATE_URL = 'https://docs.google.com/spreadsheets/d/1iarZLhW22wODdLMfZPbnyOLfTnm6tc7lqofpTOGSUrg/edit?gid=0#gid=0';

export const DEFAULT_SETTINGS: AppSettings = {
  startDay: 9,
  endDay: 9,
  limit: 200,
  webAppUrl: '',
  token: 'electricity_secret_token',
  googleSheetUrl: '',
  m1BaselineReading: 3999,
  m2BaselineReading: 11298,
};

export const SHEET_HEADERS = [
  'ID',
  'Meter',
  'Meter ID / Serial',
  'Meter Reading',
  'Newly Added',
  'Cycle Total (9 to 9)',
  'Date & Time',
  'Added By',
  'UID',
];

export const CSV_TEMPLATE_CONTENT = `ID,Meter,Meter ID / Serial,Meter Reading,Newly Added,Cycle Total (9 to 9),Date & Time,Added By,UID
1,Meter 1 (UP),02141190423402,3999.00,0.00 (Start),0.00,2026-09-09 09:00:00,ashar,uid_ashar
2,Meter 2 (Down),02141190423403,11298.00,0.00 (Start),0.00,2026-09-09 09:00:00,ashar,uid_ashar
`;

export const STORAGE_KEYS = {
  ENTRIES_M1: 'ebm_entries_m1',
  ENTRIES_M2: 'ebm_entries_m2',
  SETTINGS: 'ebm_settings',
  USER_NAME: 'ebm_user_name',
  USER_UID: 'ebm_user_uid',
  OFFLINE_QUEUE: 'ebm_offline_queue',
  LAST_SYNCED: 'ebm_last_synced',
};

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Electricity Bill Manager - Google Apps Script Backend
 * ---------------------------------------------------
 * Cumulative Meter Readings & Consumption Delta Calculation
 *
 * Headers in "Entries" Sheet:
 * ID | Meter | Meter ID / Serial | Meter Reading | Newly Added | Cycle Total (9 to 9) | Date & Time | Added By | UID
 *
 * Headers in "Settings" Sheet:
 * Key | Value | Description
 */

const SECRET_TOKEN = "electricity_secret_token"; // Must match Token in App Settings!

function doGet(e) {
  try {
    const token = e.parameter.token;
    if (token !== SECRET_TOKEN) {
      return jsonResponse({ status: "error", message: "Unauthorized token" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheets(ss);

    const entriesSheet = ss.getSheetByName("Entries");
    const settingsSheet = ss.getSheetByName("Settings");

    // Fetch entries
    const entriesData = entriesSheet.getDataRange().getValues();
    const entries = [];
    if (entriesData.length > 1) {
      for (let i = 1; i < entriesData.length; i++) {
        const row = entriesData[i];
        if (row[0]) {
          const isM2 = String(row[1]).includes("2") || String(row[1]) === "m2" || String(row[2]).includes("02141190423403");
          entries.push({
            id: String(row[0]),
            meter: isM2 ? "m2" : "m1",
            value: Number(row[3]) || 0,
            reading: Number(row[3]) || 0,
            newlyAdded: Number(row[4]) || 0,
            deltaUnits: Number(row[4]) || 0,
            cycleTotalUnits: Number(row[5]) || 0,
            date: String(row[6] || ""),
            name: String(row[7] || ""),
            uid: String(row[8] || "")
          });
        }
      }
    }

    // Fetch settings
    const settingsData = settingsSheet.getDataRange().getValues();
    const settings = { startDay: 9, endDay: 9, limit: 200 };
    if (settingsData.length > 1) {
      for (let i = 1; i < settingsData.length; i++) {
        const key = String(settingsData[i][0]);
        const val = settingsData[i][1];
        if (key === "startDay" || key === "endDay" || key === "limit") {
          settings[key] = Number(val);
        }
      }
    }

    return jsonResponse({
      status: "success",
      entries: entries,
      settings: settings
    });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const payload = JSON.parse(e.postData.contents || "{}");
    const token = payload.token || e.parameter.token;

    if (token !== SECRET_TOKEN) {
      return jsonResponse({ status: "error", message: "Unauthorized token" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheets(ss);

    const entriesSheet = ss.getSheetByName("Entries");
    const settingsSheet = ss.getSheetByName("Settings");
    const action = payload.action;

    if (action === "add") {
      const entry = payload.entry;
      if (!entry || !entry.id) {
        return jsonResponse({ status: "error", message: "Invalid entry payload" });
      }

      // Check if entry id already exists to prevent duplicate insertion
      const data = entriesSheet.getDataRange().getValues();
      let exists = false;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(entry.id)) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        const meterLabel = entry.meter === "m1" ? "Meter 1 (UP)" : "Meter 2 (Down)";
        const meterSerial = entry.meter === "m1" ? "02141190423402" : "02141190423403";
        entriesSheet.appendRow([
          String(entry.id),
          meterLabel,
          meterSerial,
          Number(entry.value ?? entry.reading ?? 0),
          Number(entry.newlyAdded ?? entry.deltaUnits ?? 0),
          Number(entry.cycleTotalUnits || 0),
          String(entry.date),
          String(entry.name || ""),
          String(entry.uid || "")
        ]);
      }

      return jsonResponse({ status: "success", action: "add", entryId: entry.id });
    }

    if (action === "edit") {
      const id = String(payload.id);
      const uid = String(payload.uid);
      const newReading = Number(payload.reading ?? payload.value ?? 0);
      const newDelta = Number(payload.deltaUnits ?? payload.newlyAdded ?? 0);
      const newCycleTotal = Number(payload.cycleTotalUnits ?? 0);

      const data = entriesSheet.getDataRange().getValues();
      let updated = false;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === id) {
          const rowUid = String(data[i][8] || data[i][7] || "");
          if (rowUid === uid) {
            entriesSheet.getRange(i + 1, 4).setValue(newReading);
            entriesSheet.getRange(i + 1, 5).setValue(newDelta);
            entriesSheet.getRange(i + 1, 6).setValue(newCycleTotal);
            updated = true;
            break;
          } else {
            return jsonResponse({ status: "error", message: "Forbidden: UID does not match owner" });
          }
        }
      }

      if (updated) {
        return jsonResponse({ status: "success", action: "edit", id: id });
      }
      return jsonResponse({ status: "error", message: "Entry not found" });
    }

    if (action === "delete") {
      const id = String(payload.id);
      const uid = String(payload.uid);

      const data = entriesSheet.getDataRange().getValues();
      let deleted = false;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === id) {
          const rowUid = String(data[i][8] || data[i][7] || "");
          if (rowUid === uid) {
            entriesSheet.deleteRow(i + 1);
            deleted = true;
            break;
          } else {
            return jsonResponse({ status: "error", message: "Forbidden: UID does not match owner" });
          }
        }
      }

      if (deleted) {
        return jsonResponse({ status: "success", action: "delete", id: id });
      }
      return jsonResponse({ status: "error", message: "Entry not found" });
    }

    if (action === "settings") {
      const settings = payload.settings || {};
      settingsSheet.clearContents();
      settingsSheet.appendRow(["Key", "Value", "Description"]);
      settingsSheet.appendRow(["startDay", Number(settings.startDay) || 9, "Day of month cycle starts"]);
      settingsSheet.appendRow(["endDay", Number(settings.endDay) || 9, "Day of month cycle ends"]);
      settingsSheet.appendRow(["limit", Number(settings.limit) || 200, "Monthly consumption threshold"]);

      return jsonResponse({ status: "success", action: "settings" });
    }

    if (action === "clear") {
      entriesSheet.clearContents();
      entriesSheet.appendRow(["ID", "Meter", "Meter ID / Serial", "Meter Reading", "Newly Added", "Cycle Total (9 to 9)", "Date & Time", "Added By", "UID"]);
      return jsonResponse({ status: "success", action: "clear" });
    }

    return jsonResponse({ status: "error", message: "Unknown action" });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function initSheets(ss) {
  let entriesSheet = ss.getSheetByName("Entries");
  if (!entriesSheet) {
    entriesSheet = ss.insertSheet("Entries");
    entriesSheet.appendRow(["ID", "Meter", "Meter ID / Serial", "Meter Reading", "Newly Added", "Cycle Total (9 to 9)", "Date & Time", "Added By", "UID"]);
    entriesSheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#EEF2FF");
    entriesSheet.setFrozenRows(1);
  }

  let settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    settingsSheet.appendRow(["Key", "Value", "Description"]);
    settingsSheet.appendRow(["startDay", 9, "Day of month cycle starts"]);
    settingsSheet.appendRow(["endDay", 9, "Day of month cycle ends"]);
    settingsSheet.appendRow(["limit", 200, "Monthly consumption threshold"]);
    settingsSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#EEF2FF");
    settingsSheet.setFrozenRows(1);
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
