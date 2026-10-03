import { AppSettings, Entry } from '../types';

export interface SheetFetchResult {
  success: boolean;
  entries?: Entry[];
  settings?: Partial<AppSettings>;
  error?: string;
  isMock?: boolean;
}

/**
 * Fetch all entries and settings from the Google Sheet Apps Script Web App
 */
export async function fetchSheetData(webAppUrl: string, token: string): Promise<SheetFetchResult> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return {
      success: false,
      error: 'Google Sheet Web App URL is not configured.',
      isMock: true,
    };
  }

  try {
    const cleanUrl = webAppUrl.trim();
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const targetUrl = `${cleanUrl}${separator}token=${encodeURIComponent(token.trim())}&t=${Date.now()}`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.status === 'error') {
      throw new Error(data.message || 'Sheet API returned error');
    }

    return {
      success: true,
      entries: Array.isArray(data.entries) ? data.entries : [],
      settings: data.settings || {},
    };
  } catch (err: any) {
    console.error('fetchSheetData error:', err);
    return {
      success: false,
      error: err.message || 'Network error connecting to Google Sheet',
    };
  }
}

/**
 * Post action to Google Sheet Web App
 * Uses text/plain to prevent CORS preflight blocking in Google Apps Script
 */
async function postToSheet(
  webAppUrl: string,
  token: string,
  payload: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, error: 'Web App URL missing' };
  }

  try {
    const bodyContent = JSON.stringify({
      ...payload,
      token: token.trim(),
    });

    const res = await fetch(webAppUrl.trim(), {
      method: 'POST',
      body: bodyContent,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      if (res.ok) {
        return { success: true, data: { status: 'success' } };
      }
    }

    if (json && json.status === 'error') {
      throw new Error(json.message || 'Action failed on Sheet');
    }

    return { success: true, data: json };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function testSheetConnection(
  webAppUrl: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    return { success: false, message: 'Google Apps Script Web App URL is empty' };
  }

  const fetchRes = await fetchSheetData(webAppUrl, token);
  if (!fetchRes.success) {
    return {
      success: false,
      message: fetchRes.error || 'Connection failed. Check Web App URL and permissions (Who has access: Anyone).',
    };
  }

  return {
    success: true,
    message: 'Google Sheet connected successfully!',
  };
}

export async function addEntryToSheet(
  webAppUrl: string,
  token: string,
  entry: Entry
): Promise<{ success: boolean; error?: string }> {
  return postToSheet(webAppUrl, token, {
    action: 'add',
    entry,
  });
}

export async function editEntryInSheet(
  webAppUrl: string,
  token: string,
  id: string,
  uid: string,
  reading: number,
  deltaUnits?: number,
  cycleTotalUnits?: number
): Promise<{ success: boolean; error?: string }> {
  return postToSheet(webAppUrl, token, {
    action: 'edit',
    id,
    uid,
    reading,
    deltaUnits,
    cycleTotalUnits,
    value: reading,
  });
}

export async function deleteEntryInSheet(
  webAppUrl: string,
  token: string,
  id: string,
  uid: string
): Promise<{ success: boolean; error?: string }> {
  return postToSheet(webAppUrl, token, {
    action: 'delete',
    id,
    uid,
  });
}

export async function syncSettingsToSheet(
  webAppUrl: string,
  token: string,
  settings: AppSettings
): Promise<{ success: boolean; error?: string }> {
  return postToSheet(webAppUrl, token, {
    action: 'settings',
    settings: {
      startDay: settings.startDay,
      endDay: settings.endDay,
      limit: settings.limit,
    },
  });
}

export async function clearAllSheetEntries(
  webAppUrl: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  return postToSheet(webAppUrl, token, {
    action: 'clear',
  });
}
