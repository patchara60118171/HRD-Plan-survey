# 🚀 คู่มือการ Deploy - Well-being Survey v3.1

## การอัพเดทจาก v3.0 → v3.1

### 1. อัพเดทไฟล์

```bash
# Pull โค้ดใหม่
git pull origin main

# ติดตั้ง dependencies (ถ้ามี)
npm install
```

### 2. อัพเดท Database (Supabase)

รัน SQL script ใน Supabase SQL Editor:

```sql
-- รันไฟล์ supabase/rls-policies.sql
-- ไฟล์นี้จะ:
-- 1. ลบ policies เก่า
-- 2. สร้าง policies ใหม่ที่ปลอดภัยขึ้น
-- 3. เพิ่ม indexes สำหรับ performance
-- 4. สร้าง functions สำหรับ monitoring
```

### 3. ตรวจสอบ Configuration

ตรวจสอบไฟล์ `js/supabase-config.js`:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 4. ทดสอบ Local

```bash
# ใช้ local server
npx serve

# หรือ
python -m http.server 8000
```

เปิด http://localhost:8000/ch1.html

### 5. Deploy

#### Vercel (Recommended)
```bash
# First time
vercel

# Production deployment
vercel --prod
```

#### GitHub Pages (Alternative)
```bash
git push origin main
```

---

## ✅ Checklist หลัง Deploy

- [ ] ทดสอบส่งแบบสอบถาม
- [ ] ทดสอบ rate limiting (ลองส่งซ้ำ 6 ครั้ง)
- [ ] ทดสอบ resume survey
- [ ] ทดสอบ admin dashboard
- [ ] ทดสอบ pagination
- [ ] ทดสอบ export Excel
- [ ] ตรวจสอบ error messages เป็นภาษาไทย
- [ ] ตรวจสอบ loading states

---

## 🔍 Monitoring

### ตรวจสอบ Rate Limit

```sql
-- ดูจำนวนการส่งต่อชั่วโมง
SELECT 
    email,
    COUNT(*) as submission_count,
    MAX(submitted_at) as last_submission
FROM hrd_ch1_responses
WHERE submitted_at > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) > 3
ORDER BY submission_count DESC;
```

### ตรวจสอบ Performance

```sql
-- ดูขนาดข้อมูล
SELECT 
    organization,
    pg_size_pretty(pg_column_size(raw_payload)) as payload_size
FROM hrd_ch1_responses
ORDER BY pg_column_size(raw_payload) DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting

### ปัญหา: Rate Limiting ไม่ทำงาน

1. ตรวจสอบ localStorage ใน browser
2. ล้าง cache: `localStorage.clear()`
3. ตรวจสอบ console logs

### ปัญหา: RLS Policies บล็อกการส่งข้อมูล

1. ตรวจสอบ policies ใน Supabase Dashboard
2. ดู logs ใน Supabase → Logs → Postgres Logs
3. ตรวจสอบ email format

### ปัญหา: Pagination ไม่แสดง

1. ตรวจสอบว่ามี element `<div id="pagination-controls"></div>` ใน HTML
2. ตรวจสอบ console errors
3. ล้าง cache browser

---

## 📊 Performance Tips

1. **Enable Caching**: ใช้ CDN สำหรับ static files
2. **Compress Images**: ลดขนาดรูปภาพใน assets/
3. **Lazy Load**: โหลด charts เมื่อต้องการใช้เท่านั้น
4. **Database Indexes**: ตรวจสอบว่า indexes ถูกสร้างแล้ว

---

## 🔐 Security Checklist

- [x] RLS Policies enabled
- [x] Rate limiting implemented
- [x] Email validation
- [x] Data size limits
- [x] Duplicate prevention
- [ ] HTTPS enabled (ขึ้นกับ hosting)
- [ ] CORS configured (ถ้าใช้ custom domain)

---

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ console logs
2. ดู Supabase logs
3. ตรวจสอบ CHANGELOG.md
4. ติดต่อทีมพัฒนา
