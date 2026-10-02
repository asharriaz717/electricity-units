/**
 * Electricity Bill Manager - All Application Labels & Strings
 * -----------------------------------------------------------
 * ALL user-facing text, button labels, modal copy, table headers,
 * alerts, validation messages, and setup guides are centralized
 * in this single file.
 */

export const LABELS = {
  // App Branding & Navigation
  app: {
    name: 'Electricity Bill Manager',
    subtitle: 'Meter 1 (UP) & Meter 2 (Down)',
    tagline: 'Values, Newly Added Units, & 9 to 9 Cycle Calculation',
    backToHome: 'Back to Home',
    openSettings: 'Open Settings',
    settings: 'Settings & Google Sheet Config',
    appConfig: 'Application Settings',
    userFallback: 'ashar',
    you: 'You',
  },

  // Meter Names & Subtitles
  meters: {
    idPrefix: 'ID:',
    meterIdLabel: 'Meter ID:',
    m1: {
      id: "02141190423402",
      name: 'Meter 1 (UP)',
      tag: 'UP Floor',
      description: 'First floor / upper portion meter',
      button: 'Open Meter 1',
      quickAdd: '+ Add to UP',
    },
    m2: {
      id: "02141190423403",
      name: 'Meter 2 (Down)',
      tag: 'Down Floor',
      description: 'Ground floor / lower portion meter',
      button: 'Open Meter 2',
      quickAdd: '+ Add to Down',
    },
  },

  // Sync & Status Header
  sync: {
    syncing: 'Syncing...',
    pending: 'Pending',
    sheetSynced: 'Sheet Synced',
    localOnly: 'Local Only',
    online: 'Online',
    offline: 'Offline',
    offlineModeNotice: 'Offline mode active. Readings will be saved locally.',
    onlineRestored: 'Back online! Processing sync queue...',
    syncedSuccess: 'Synced with Google Sheet!',
    savedLocally: 'Saved locally',
    lastSynced: 'Last synced:',
    syncFailed: (err: string) => `Sync failed: ${err}`,
    loggedAs: (name: string) => `Logged in as ${name}. Click for Settings`,
  },

  // Home Screen
  home: {
    cycleBannerTitle: 'Current Billing Cycle',
    startDayPrefix: 'Start Day:',
    endDayPrefix: 'End Day:',
    limitPrefix: 'Limit:',
    unitsSuffix: 'units',
    newlyAddedTotalLabel: 'Newly Added Total (9 to 9 Cycle)',
    latestValueLabel: 'Latest Value:',
    lastEntryLabel: 'Last entry:',
    noEntriesYet: 'No entries yet',
    combinedBannerTitle: 'Combined Consumption (Meter 1 + Meter 2)',
    combinedBannerSubtitle: 'units total consumed this cycle',
    quickAddPrompt: 'Quick add reading:',
    openMeter1: 'Open Meter 1',
    openMeter2: 'Open Meter 2',
    billingCycleLabel: 'Billing Cycle:',
    googleSheetLabel: 'Google Sheet:',
    sheetConnected: 'Connected',
    sheetConfigured: 'Google Sheet Connected',
    sheetNotConfigured: 'Local Mode (Google Sheet Not Configured)',
  },

  // Meter Screen & Form
  meterScreen: {
    cycleLabel: 'Billing Cycle (9 to 9):',
    limitLabel: 'Threshold Limit:',
    latestValueCardTitle: 'Latest Meter Value',
    rowsRecorded: 'rows recorded',
    noValuesYet: 'No values added yet',
    newlyAddedCycleCardTitle: 'Newly Added Total (9 to 9 Cycle)',
    newlyAddedSubtitle: 'Sum of Newly Added values within active 9th–9th cycle',
    ofLimit: 'of limit',
    addFormTitle: 'Add New Row to Table',
    previousValueBadge: 'Previous value:',
    firstRowNotice: 'First row: Newly Added will be 0 at start',
    enterValueLabel: 'Enter Value',
    mustBeGreaterThan: '(Must be > {val})',
    firstValuePlaceholder: '(First Value e.g. 100)',
    quickAddPrefix: 'Quick add:',
    liveDateLabel: 'Auto Current Date & Time (Automatic)',
    addedByLabel: 'Added by',
    autoDateNote: 'Every entry is automatically stamped with the exact current date & time.',
    previewTitle: 'New Row Preview:',
    previewValue: 'Value:',
    previewNewlyAdded: 'Newly Added:',
    previewCycleTotal: 'Cycle Total (9 to 9) will be:',
    firstRowStartNotice: '0.00 (Zero at start)',
    submitButton: 'Add Row to Table',
  },

  // Readings Table
  table: {
    title: 'Readings Table',
    subtitle: 'Columns: ID · Date · Value · Newly Added · Added By',
    sortNewestFirst: 'Sort: Newest First',
    sortOldestFirst: 'Sort: Oldest First',
    noRowsFound: 'No rows in table yet',
    noRowsHint: 'Add your first value (e.g. 100) above to start the table!',
    columnId: 'ID',
    columnDate: 'Date & Time',
    columnValue: 'Value',
    columnNewlyAdded: 'Newly Added',
    columnAddedBy: 'Added By',
    columnCycle: 'Cycle (9 to 9)',
    columnActions: 'Actions',
    badgeStart: '0.00 (Start)',
    badgeActiveCycle: 'Active (9 to 9)',
    badgePreviousCycle: 'Previous Cycle',
    readOnly: 'Read only',
    footerCycleTotal: 'Total Newly Added for Current Cycle (9th to 9th):',
  },

  // Limit alerts & status
  status: {
    unitsRemainingUrdu: (val: number | string) => `${val} units baqi`,
    unitsRemainingEng: (val: number | string) => `${val} units remaining`,
    unitsOverLimitUrdu: (val: number | string) => `Limit se ${val} units zyada!`,
    unitsOverLimitEng: (val: number | string) => `${val} units over limit`,
  },

  // Validation messages
  validation: {
    enterPositiveNumber: 'Please enter a valid positive number',
    mustBeGreaterThanPrev: (prev: number | string) =>
      `Value must be greater than previous value (${prev}). Enter a higher number.`,
    enterName: 'Please enter your name',
    nameMinLength: 'Name must be at least 2 characters',
    invalidValue: 'Please enter a valid meter number greater than 0',
  },

  // Settings Screen
  settings: {
    profileTitle: 'Your Profile',
    profileSubtitle: 'This name is recorded on every meter entry you submit',
    yourNameLabel: 'Your Name',
    enterNamePlaceholder: 'Enter your name',
    saveNameButton: 'Save Name',
    nameSavedSuccess: 'Name updated successfully!',
    deviceUidLabel: 'Device UID:',
    sheetSectionTitle: 'Google Sheet Link & Headers Template',
    sheetSectionSubtitle: 'Stores meter readings, deltas, dates, and names in your shared spreadsheet',
    viewHeadersButton: 'View Sheet Headers & CSV',
    sheetUrlLabel: 'Google Sheet Spreadsheet URL (Project Config)',
    sheetUrlNote: 'Link to your Google Spreadsheet where family data is stored and viewed.',
    openSheetButton: 'Open',
    webAppUrlLabel: 'Google Apps Script Web App URL (Sync Endpoint)',
    webAppUrlNote: 'Deployed from Google Sheet > Extensions > Apps Script > Deploy as Web app.',
    secretTokenLabel: 'Secret Token (Password)',
    secretTokenNote: 'Must match the SECRET_TOKEN specified in your Google Apps Script',
    offlineQueueLabel: 'Offline Pending Queue:',
    appsScriptButton: 'Apps Script',
    syncNowButton: 'Sync Now',
    cycleSectionTitle: 'Billing Cycle & Meter Baseline',
    cycleSectionSubtitle: 'Configure cycle dates, alert limit, and starting dial baselines',
    startDayLabel: 'Cycle Start Day',
    startDayDefault: 'Default: 9th',
    endDayLabel: 'Cycle End Day (Next Month)',
    endDayDefault: 'Default: 9th',
    limitLabel: 'Alert Limit (Units)',
    limitDefault: 'Default: 200 units',
    baselineSectionTitle: 'Cycle Start Baseline Dial Readings (e.g. 3999 for M1, 11298 for M2):',
    m1BaselineLabel: 'Meter 1 (UP) Start Reading (ID: 02141190423402)',
    m2BaselineLabel: 'Meter 2 (Down) Start Reading (ID: 02141190423403)',
    saveSettingsButton: 'Save Settings',
    settingsSavedSuccess: 'Settings saved successfully!',
    dangerZoneTitle: 'Danger Zone',
    dangerZoneSubtitle: 'Clear all readings across Meter 1 and Meter 2',
    dangerZoneDescription:
      'Naye cycle ke liye data delete karne ki zaroorat nahi hoti; app khud ba khud nayi cycle mein 0 se shuru karti hai aur purana record mehfooz rehta hai. Sirf tab clear karein agar aapko poora reset karna ho.',
    clearAllButton: 'Clear All Data...',
  },

  // Modals
  modals: {
    name: {
      title: 'Welcome to Electricity Bill Manager',
      description:
        'Apna naam darj karein (Enter your name). Har meter reading ke sath aapka naam save hoga taake sabhi family members dekh saken kisne entry ki.',
      nameLabel: 'Your Name',
      placeholder: 'e.g. Ali Raza, Usman, Aisha',
      button: 'Continue to App',
      footerNote: 'You can change this name anytime later in Settings.',
    },
    edit: {
      title: 'Edit Meter Reading',
      dateRecorded: 'Date recorded:',
      addedBy: 'Added by:',
      valueLabel: 'Meter Value',
      valueSuffix: 'units',
      note: 'Updating this value will automatically recalculate Newly Added units for this and subsequent rows.',
      cancel: 'Cancel',
      update: 'Update',
    },
    delete: {
      title: 'Delete Reading?',
      description:
        'Are you sure you want to delete this entry? This action will remove it and recalculate subsequent differences.',
      valueLabel: 'Meter Value:',
      newlyAddedLabel: 'Newly Added:',
      dateLabel: 'Date:',
      recordedByLabel: 'Recorded by:',
      cancel: 'Cancel',
      confirm: 'Delete',
    },
    clear: {
      title: 'Clear All Readings',
      description:
        'Yeh action Meter 1 aur Meter 2 ke saare readings ko aapke phone aur shared Google Sheet se mukammal delete kar dega. Naye cycle ki zaroorat ke liye data delete karne ki zaroorat nahi hoti, cycle automatically reset hota hai.',
      instruction: 'Type CLEAR neeche box mein likhein to confirm:',
      placeholder: 'Type CLEAR',
      cancel: 'Cancel',
      confirm: 'Delete All',
    },
    sheetTemplate: {
      title: 'Google Sheet & Excel Template',
      subtitle: 'Headers, structure & automatic Apps Script sync',
      formulaTitle: 'How the Cumulative Meter Formula Works:',
      formulaDesc: 'Whenever user inputs the new meter reading, the system subtracts the previous reading to calculate units consumed:',
      step1: '1st Row: Initial reading 100 on 9th -> Newly Added = 0 (Start point)',
      step2: '2nd Row: User enters 120 -> Newly Added = 20 units (120 - 100 = 20)',
      step3: '3rd Row: User enters 170 -> Newly Added = 50 units (170 - 120 = 50)',
      stepTotal: '9 to 9 Cycle Total = 20 + 50 = 70 units',
      headersTitle: 'Google Sheet Headers (Tab: "Entries")',
      copyHeaders: 'Copy Headers',
      copiedHeaders: 'Copied Tab-separated!',
      downloadCsv: 'Download CSV Template (.csv)',
      copyScript: 'Copy Apps Script Code',
      copiedScript: 'Apps Script Copied!',
      close: 'Close',
    },
    appsScript: {
      title: 'Google Apps Script Code',
      subtitle: 'Google Sheet Backend for 3-4 Phones Sync',
      setupGuideTitle: 'Easy 4-Step Setup (Asaan tareeqa):',
      step1: 'Ek nayi Google Sheet banayein aur do tabs banayein: Entries aur Settings.',
      step2: 'Menu mein Extensions > Apps Script par click karein.',
      step3: 'Puraana code mita kar neeche diya gaya code paste karein aur SECRET_TOKEN set karein.',
      step4: 'Upar Deploy > New deployment dabayein, Web app chunein, Who has access: Anyone karein, aur URL ko is app ki Settings mein paste kar dein!',
      codeSectionTitle: 'Code (Google Apps Script):',
      copyCodeButton: 'Copy Entire Code',
      copiedCodeButton: 'Copied to Clipboard!',
      closeButton: 'Close',
    },
    mobileGuide: {
      title: 'Use as a Mobile App on your Phone',
      subtitle: 'Install directly on 3-4 family phones with its own home screen icon!',
      androidTitle: '📱 Android (Chrome):',
      androidDesc: 'Browser menu (⋮ three dots) par tap karein aur "Add to Home screen" ya "Install App" choose karein.',
      iphoneTitle: '🍏 iPhone (Safari):',
      iphoneDesc: 'Neeche Share button ([↑]) par tap karein aur "Add to Home Screen" par click karein.',
    },
  },

  // Toast notifications
  toasts: {
    welcome: (name: string) => `Welcome, ${name}!`,
    nameUpdated: 'Name updated successfully',
    settingsSaved: 'Settings saved successfully',
    rowAdded: (val: number, isFirst: boolean, delta: number) =>
      `Added row: ${val.toFixed(2)} (${isFirst ? '0.00 at start' : `+${delta.toFixed(2)} newly added`})`,
    rowSavedLocal: (val: number, isFirst: boolean, delta: number) =>
      `Saved: ${val.toFixed(2)} (${isFirst ? '0.00 at start' : `+${delta.toFixed(2)} newly added`})`,
    entryUpdated: 'Entry updated successfully',
    entryDeleted: 'Entry deleted',
    dataCleared: 'All meter readings have been cleared',
  },
};
