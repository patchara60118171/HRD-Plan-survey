# apps/public-survey

Well-being Survey สาธารณะ — ไม่ต้อง login

**Entry point:** `index.html`  
**Deployed route:** `/`

## Files
- `index.html` — copy จาก root `index.html` (source of truth ยังอยู่ที่ root ระหว่าง migration)
- `js/app.js` — main survey logic
- `js/questions.js` — question definitions
- `js/components.js` — UI components
- `js/utils.js` — helpers

> ⚠️ ไฟล์ในโฟลเดอร์นี้คือ **copies** ระหว่างช่วง migration  
> Source of truth คือ root `index.html` จนกว่าจะย้าย route อย่างเป็นทางการ
