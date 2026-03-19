# ⚠️ ONE-OFF SCRIPTS — DANGER ZONE

Scripts ในโฟลเดอร์นี้เป็น **destructive / one-time operations**

## กฎก่อนรัน
1. ต้อง confirm กับ super_admin ก่อนทุกครั้ง
2. ต้องทำ DB backup ก่อน
3. ต้องรันใน test environment ก่อน
4. ต้อง document ผลที่เกิดขึ้นหลังรัน

## Scripts ในนี้
- `cleanup-ch1.js` — ล้างข้อมูล CH1
- `clear-ch1-data.js` — clear ข้อมูล CH1 ทั้งหมด (DANGEROUS)
- `clear-ch1-test-data.js` — clear เฉพาะ test data
- `fix-db-schema.js` — แก้ schema โดยตรง (ใช้ migration แทนถ้าทำได้)
