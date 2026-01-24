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

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const nextRow = sheet.getLastRow() + 1;

    // Parse data
    const data = JSON.parse(e.postData.contents);
    data.timestamp = new Date(); // Add server timestamp

    const newRow = [];

    // If header doesn't exist, create it
    if (headerLength() === 0) {
      const keys = Object.keys(data);
      sheet.getRange(1, 1, 1, keys.length).setValues([keys]);
    }

    // Map data to headers
    const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    
    // Add missing headers if any
    const missingHeaders = [];
    Object.keys(data).forEach(key => {
      if (!currentHeaders.includes(key) && key !== 'timestamp') {
        missingHeaders.push(key);
      }
    });
    
    if (missingHeaders.length > 0) {
      const startCol = currentHeaders.length + (currentHeaders[0] === "" ? 0 : 1);
      sheet.getRange(1, startCol, 1, missingHeaders.length).setValues([missingHeaders]);
    }

    // Refresh headers after update
    const finalHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    finalHeaders.forEach(header => {
      let value = data[header];
      if (Array.isArray(value)) value = value.join(', ');
      if (header === 'timestamp') value = new Date();
      newRow.push(value !== undefined ? value : '');
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
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
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
     return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
     lock.releaseLock();
  }
}

function getHistory(email) {
  if (!email) return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Email required' })).setMimeType(ContentService.MimeType.JSON);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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
