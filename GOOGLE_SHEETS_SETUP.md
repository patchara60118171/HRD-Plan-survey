# คู่มือการตั้งค่า Google Sheets เพื่อเก็บข้อมูล (Google Apps Script)

เพื่อให้ระบบเก็บข้อมูลจากผู้ตอบแบบสอบถามทุกคนมารวมที่ Google Sheet ของคุณได้ ให้ทำตามขั้นตอนดังนี้ครับ:

## 1. สร้าง Google Sheet และติดตั้ง Script

1.  สร้าง **Google Sheet** ใหม่ขึ้นมา 1 ไฟล์ (ตั้งชื่อว่า "Survey Responses" หรือตามชอบ)
2.  ที่เมนูข้างบน ไปที่ **Extensions (ส่วนขยาย)** > **Apps Script**
3.  ลบโค้ดเดิมทั้งหมดในหน้า Editor แล้ววางโค้ดข้างล่างนี้ลงไป:

```javascript
// ========================================
// CODE FOR GOOGLE APPS SCRIPT
// ========================================

// ========================================
// CODE FOR GOOGLE APPS SCRIPT
// ========================================

const ADMIN_PASSWORD = "admin"; // Simple protection for demo

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    // Handle Draft Save
    if (action === 'saveDraft') {
        return saveDraft(params.email, params.data);
    }

    // Handle Header Setup (New)
    if (action === 'setupHeaders') {
        return setupHeaders(params.keys);
    }

    // Default: Submit Response
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = params; 
    if (data.action) delete data.action; 

    data.timestamp = new Date(); 

    // Header Handling
    if (headerLength() === 0) {
      const keys = Object.keys(data);
      sheet.getRange(1, 1, 1, keys.length).setValues([keys]);
    }
    const nextRow = Math.max(sheet.getLastRow() + 1, 2); 
    
    // Auto-add new columns if missing
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    const missingHeaders = [];
    Object.keys(data).forEach(key => {
      if (!currentHeaders.includes(key) && key !== 'timestamp') missingHeaders.push(key);
    });
    if (missingHeaders.length > 0) {
      const startCol = currentHeaders.length + (currentHeaders[0] === "" ? 0 : 1);
      sheet.getRange(1, startCol, 1, missingHeaders.length).setValues([missingHeaders]);
    }
    
    const finalHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = [];
    finalHeaders.forEach(header => {
      let value = data[header];
      if (Array.isArray(value)) value = value.join(', ');
      if (header === 'timestamp') value = new Date();
      newRow.push(value !== undefined ? value : '');
    });
    
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow })).setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const action = e.parameter.action;
    
    if (action === 'getHistory') {
       return getHistory(e.parameter.email);
    }
    if (action === 'getDraft') {
       return getDraft(e.parameter.email);
    }
    if (action === 'getAllResponses') {
        if (e.parameter.password !== ADMIN_PASSWORD) {
            return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Unauthorized' })).setMimeType(ContentService.MimeType.JSON);
        }
       return getAllResponses();
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Invalid action' })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
     return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
     lock.releaseLock();
  }
}

// --- Admin Functions ---

function getAllResponses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Get Main Sheet (Assume it's the one that's NOT 'Drafts')
  let sheet = ss.getSheets()[0];
  if (sheet.getName() === "Drafts" && ss.getNumSheets() > 1) {
     sheet = ss.getSheets()[1];
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  const responses = data.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(responses)).setMimeType(ContentService.MimeType.JSON);
}

function setupHeaders(keys) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheets()[0];
  if (sheet.getName() === "Drafts" && ss.getNumSheets() > 1) sheet = ss.getSheets()[1];

  // If sheet has data, warn or skip? For safety, we only append missing.
  // But user specifically asked to "create headers first". 
  
  let currentHeaders = [];
  if (sheet.getLastColumn() > 0) {
      currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }
  
  const missing = keys.filter(k => !currentHeaders.includes(k));
  
  if (missing.length > 0) {
      const startCol = (sheet.getLastColumn() || 0) + 1;
      sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
      return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'message': `Added ${missing.length} headers` })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'No new headers needed' })).setMimeType(ContentService.MimeType.JSON);
}

// --- Draft Functions ---

function getDraftSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Drafts");
  if (!sheet) {
    sheet = ss.insertSheet("Drafts");
    sheet.appendRow(["email", "timestamp", "data"]); // Key columns
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveDraft(email, data) {
  if (!email) return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Email required' })).setMimeType(ContentService.MimeType.JSON);
  
  const sheet = getDraftSheet();
  const lastRow = sheet.getLastRow();
  let foundRow = -1;
  
  // Find existing draft for this email
  if (lastRow > 1) {
      const emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
      const idx = emails.indexOf(email);
      if (idx !== -1) foundRow = idx + 2;
  }
  
  const jsonData = JSON.stringify(data);
  const timestamp = new Date();
  
  if (foundRow !== -1) {
    // Update existing
    sheet.getRange(foundRow, 2).setValue(timestamp);
    sheet.getRange(foundRow, 3).setValue(jsonData);
  } else {
    // Insert new
    sheet.appendRow([email, timestamp, jsonData]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'Draft saved' })).setMimeType(ContentService.MimeType.JSON);
}

function getDraft(email) {
  if (!email) return ContentService.createTextOutput(JSON.stringify({ 'result': 'error' })).setMimeType(ContentService.MimeType.JSON);
  
  const sheet = getDraftSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify(null)).setMimeType(ContentService.MimeType.JSON);
  
  const emails = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const idx = emails.indexOf(email);
  
  if (idx !== -1) {
      const dataStr = sheet.getRange(idx + 2, 3).getValue();
      // Return the inner JSON data directly, wrapper will be handled by fetch
      return ContentService.createTextOutput(dataStr).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify(null)).setMimeType(ContentService.MimeType.JSON);
}


function getHistory(email) {
  if (!email) return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Email required' })).setMimeType(ContentService.MimeType.JSON);

  // Assumes active sheet is the main responses sheet or the first sheet if "Drafts" is active
  // Better to explicitly find "Survey Responses" or similar? For now, standard behavior is ActiveSheet.
  // BUT, if Drafts is active, this fails. Let's iterate sheets to find one that is NOT "Drafts".
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheets()[0]; // Default to first sheet
  // Helper to find the main sheet if likely named something else or just not "Drafts"
  if (sheet.getName() === "Drafts" && ss.getNumSheets() > 1) {
      sheet = ss.getSheets()[1]; 
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  const emailIndex = headers.indexOf('email');
  if (emailIndex === -1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  const history = data.filter(row => row[emailIndex] === email).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  // Sort by timestamp descending
  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return ContentService.createTextOutput(JSON.stringify(history))
      .setMimeType(ContentService.MimeType.JSON);
}

function headerLength() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheets()[0]; 
    if (sheet.getName() === "Drafts" && ss.getNumSheets() > 1) {
      sheet = ss.getSheets()[1]; 
    }
  if (sheet.getLastColumn() == 0) return 0;
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String).length;
}
```

## 2. การ Deploy (อัปเดตเวอร์ชันใหม่)

> **สำคัญ:** ทุกครั้งที่แก้โค้ด คุณต้อง Deploy เป็นเวอร์ชันใหม่ (New Version) เสมอ ไม่อย่างนั้นโค้ดเก่าจะทำงานอยู่

1.  กดปุ่ม **Deploy** > **Manage deployments**
2.  กดรูปดินสอ (Edit) ตรง deployment เดิมที่ใช้งานอยู่
3.  ตรง **Version** ให้เปลี่ยนจาก **Project version** เป็น **"New version"** (สำคัญ!)
4.  กด **Deploy**
5.  (URL จะเป็นตัวเดิม ไม่ต้องเปลี่ยนในโค้ดเว็บไซต์ ถ้าทำถูกวิธี)
