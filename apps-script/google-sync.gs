const SYNC_SECRET = 'CHANGE_ME';
const REQUEST_MAX_AGE_MS = 5 * 60 * 1000;
const NONCE_CACHE_SECONDS = 10 * 60;
const SHEET_NAME = 'CH1 Responses';
const FILES_SHEET_NAME = 'CH1 Files';
const ROOT_DRIVE_FOLDER_ID = '1ZzsIupFp8m4UlTdzJk4X8vSdl6dUDhKG';
const FOLDER_MAP = {
  strategy: '13rZNjRVK0WQt7GZ9jpWX32dEX2rBYfx_',
  org_structure: '1N_7ABo1AY6MN_bDN6zuuiAgEjm7wtHh3',
  hrd_plan: '1jmvIylKw6-eiTqzV9OP2kMm9n0ZCZjtB'
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const scriptSecret = getScriptSecret_();

    if (!isAuthorized_(payload, scriptSecret)) {
      return jsonResponse_({ error: 'Unauthorized' });
    }

    const record = payload.record || {};
    const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
    const sheet = getOrCreateSheet_(SHEET_NAME);
    const filesSheet = getOrCreateSheet_(FILES_SHEET_NAME);

    const flatRecord = flattenRecord_(record);
    const rowNumber = upsertRecord_(sheet, flatRecord);
    const driveFiles = syncAttachments_(filesSheet, record, attachments);

    return jsonResponse_({
      ok: true,
      rowNumber,
      driveFiles
    });
  } catch (error) {
    return jsonResponse_({ error: error.message || String(error) });
  }
}

function getScriptSecret_() {
  return PropertiesService.getScriptProperties().getProperty('SYNC_SECRET') || SYNC_SECRET;
}

function isAuthorized_(payload, scriptSecret) {
  if (!scriptSecret) return false;
  if (!payload || !payload.secret || payload.secret !== scriptSecret) return false;

  const issuedAt = Date.parse(payload.issuedAt || '');
  if (!issuedAt || Math.abs(Date.now() - issuedAt) > REQUEST_MAX_AGE_MS) return false;

  const nonce = String(payload.nonce || '').trim();
  if (!nonce) return false;
  if (isReplayNonce_(nonce)) return false;

  rememberNonce_(nonce);
  return true;
}

function isReplayNonce_(nonce) {
  const cache = CacheService.getScriptCache();
  return Boolean(cache.get('nonce:' + nonce));
}

function rememberNonce_(nonce) {
  const cache = CacheService.getScriptCache();
  cache.put('nonce:' + nonce, '1', NONCE_CACHE_SECONDS);
}

function getOrCreateSheet_(name) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  return sheet;
}

function flattenRecord_(record) {
  const base = {
    id: record.id || '',
    created_at: record.created_at || '',
    submitted_at: record.submitted_at || '',
    respondent_email: record.respondent_email || '',
    respondent_name: record.respondent_name || '',
    organization: record.organization || '',
    department: record.department || '',
    google_sync_status: record.google_sync_status || '',
    google_drive_sync_status: record.google_drive_sync_status || ''
  };

  const flat = { ...base };

  Object.keys(record).forEach((key) => {
    let value = record[key];
    if (value === null || value === undefined) {
      flat[key] = '';
      return;
    }

    if (Array.isArray(value) || typeof value === 'object') {
      flat[key] = JSON.stringify(value);
      return;
    }

    flat[key] = value;
  });

  return flat;
}

function ensureHeaders_(sheet, headers) {
  const currentLastColumn = sheet.getLastColumn();
  const currentHeaders = currentLastColumn > 0
    ? sheet.getRange(1, 1, 1, currentLastColumn).getValues()[0].filter(String)
    : [];

  const missingHeaders = headers.filter((header) => !currentHeaders.includes(header));
  if (missingHeaders.length > 0) {
    const startColumn = currentHeaders.length + 1;
    sheet.getRange(1, startColumn, 1, missingHeaders.length).setValues([missingHeaders]);
  }

  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function upsertRecord_(sheet, flatRecord) {
  const headers = ensureHeaders_(sheet, Object.keys(flatRecord));
  const values = headers.map((header) => flatRecord[header] !== undefined ? flatRecord[header] : '');
  const idColumnIndex = headers.indexOf('id') + 1;

  if (idColumnIndex < 1) {
    throw new Error('Missing id header');
  }

  const lastRow = sheet.getLastRow();
  let targetRow = lastRow + 1;

  if (lastRow >= 2) {
    const ids = sheet.getRange(2, idColumnIndex, lastRow - 1, 1).getValues().flat();
    const existingIndex = ids.indexOf(flatRecord.id);
    if (existingIndex !== -1) {
      targetRow = existingIndex + 2;
    }
  }

  sheet.getRange(targetRow, 1, 1, values.length).setValues([values]);
  return targetRow;
}

function ensureFileHeaders_(sheet) {
  const headers = [
    'response_id',
    'attachment_key',
    'source_url',
    'source_path',
    'original_name',
    'drive_file_id',
    'drive_file_url',
    'target_folder_id',
    'synced_at'
  ];
  ensureHeaders_(sheet, headers);
  return headers;
}

function syncAttachments_(sheet, record, attachments) {
  ensureFileHeaders_(sheet);
  const result = [];

  attachments.forEach((attachment) => {
    const folderId = FOLDER_MAP[attachment.targetFolderKey] || ROOT_DRIVE_FOLDER_ID;
    if (!folderId) {
      return;
    }

    const copied = copyFileToDrive_(attachment, record, folderId);
    upsertAttachmentRow_(sheet, record.id, attachment, copied, folderId);
    result.push(copied);
  });

  return result;
}

function copyFileToDrive_(attachment, record, folderId) {
  const response = UrlFetchApp.fetch(attachment.url, { muteHttpExceptions: true });
  const status = response.getResponseCode();

  if (status < 200 || status >= 300) {
    throw new Error('Failed to download attachment: ' + attachment.url + ' status=' + status);
  }

  const folder = DriveApp.getFolderById(folderId);
  const blob = response.getBlob();
  const ext = attachment.name && attachment.name.indexOf('.') !== -1 ? attachment.name.split('.').pop() : 'pdf';
  const safeName = [record.id, attachment.key].join('_') + '.' + ext;
  blob.setName(safeName);

  const existingFile = findExistingDriveFile_(folder, safeName);
  if (existingFile) {
    existingFile.setTrashed(true);
  }

  const driveFile = folder.createFile(blob);

  return {
    key: attachment.key,
    sourceUrl: attachment.url,
    sourcePath: attachment.path || '',
    originalName: attachment.name || '',
    driveFileId: driveFile.getId(),
    driveFileUrl: driveFile.getUrl()
  };
}

function findExistingDriveFile_(folder, fileName) {
  const files = folder.getFilesByName(fileName);
  return files.hasNext() ? files.next() : null;
}

function upsertAttachmentRow_(sheet, responseId, attachment, copied, folderId) {
  const headers = ensureFileHeaders_(sheet);
  const keyColumn = headers.indexOf('attachment_key') + 1;
  const responseIdColumn = headers.indexOf('response_id') + 1;
  const lastRow = sheet.getLastRow();
  let targetRow = lastRow + 1;

  if (lastRow >= 2) {
    const rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    const existingIndex = rows.findIndex((row) => row[responseIdColumn - 1] === responseId && row[keyColumn - 1] === attachment.key);
    if (existingIndex !== -1) {
      targetRow = existingIndex + 2;
    }
  }

  const rowData = {
    response_id: responseId,
    attachment_key: attachment.key,
    source_url: attachment.url || '',
    source_path: attachment.path || '',
    original_name: attachment.name || '',
    drive_file_id: copied.driveFileId,
    drive_file_url: copied.driveFileUrl,
    target_folder_id: folderId,
    synced_at: new Date().toISOString()
  };

  const values = headers.map((header) => rowData[header] !== undefined ? rowData[header] : '');
  sheet.getRange(targetRow, 1, 1, values.length).setValues([values]);
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
