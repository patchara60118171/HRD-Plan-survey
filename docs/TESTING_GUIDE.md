# 🧪 คู่มือการทดสอบ - Well-being Survey v3.1

## การทดสอบ Priority 1 Features

### 1. Rate Limiting

#### Test Case 1.1: ส่งข้อมูลปกติ
```
1. เปิด ch1.html
2. กรอกอีเมล: test@example.com
3. กรอกข้อมูลครบถ้วน
4. ส่งข้อมูล
✅ Expected: ส่งสำเร็จ
```

#### Test Case 1.2: ส่งซ้ำเกิน 5 ครั้ง
```
1. ส่งข้อมูลด้วยอีเมลเดียวกัน 6 ครั้งภายใน 1 ชั่วโมง
✅ Expected: ครั้งที่ 6 ถูกบล็อก แสดงข้อความ "ส่งข้อมูลบ่อยเกินไป"
```

#### Test Case 1.3: Disposable Email
```
1. กรอกอีเมล: test@tempmail.com
✅ Expected: แสดง error "ไม่สามารถใช้อีเมลชั่วคราวได้"
```

### 2. RLS Policies

#### Test Case 2.1: Duplicate Prevention
```
1. ส่งข้อมูลจากองค์กรเดียวกัน 2 ครั้งภายใน 1 ชั่วโมง
✅ Expected: ครั้งที่ 2 ถูกบล็อก
```

#### Test Case 2.2: Data Size Limit
```
1. พยายามส่งข้อมูลขนาดใหญ่เกิน 2MB
✅ Expected: ถูกบล็อกโดย database
```

### 3. Resume Survey

#### Test Case 3.1: Auto Resume
```
1. เริ่มทำแบบสอบถาม ไปถึง step 3
2. ปิดหน้าต่าง
3. เปิดใหม่
✅ Expected: แสดง popup ถามว่าต้องการทำต่อหรือไม่
```

#### Test Case 3.2: Expired Draft
```
1. สร้าง draft เก่ากว่า 7 วัน (แก้ timestamp ใน localStorage)
2. เปิดหน้าใหม่
✅ Expected: ไม่แสดง popup, draft ถูกลบอัตโนมัติ
```

### 4. Validation

#### Test Case 4.1: Email Validation
```
Test emails:
- "invalid" → ❌ Error
- "test@" → ❌ Error
- "test@example" → ❌ Error
- "test@example.com" → ✅ Pass
```

#### Test Case 4.2: Number Validation
```
1. กรอกจำนวนบุคลากร: -5
✅ Expected: แสดง error "ต้องมากกว่า 0"

2. กรอกจำนวนบุคลากร: 200000
✅ Expected: แสดง error "จำนวนบุคลากรสูงเกินไป"
```

---

## การทดสอบ Priority 2 Features

### 5. Pagination

#### Test Case 5.1: Basic Pagination
```
1. เข้า admin dashboard
2. มีข้อมูลมากกว่า 20 รายการ
✅ Expected: แสดง pagination controls
✅ Expected: แสดง 20 รายการต่อหน้า
```

#### Test Case 5.2: Page Navigation
```
1. คลิก "ถัดไป"
✅ Expected: ไปหน้าถัดไป, แสดงรายการ 21-40
2. คลิก "ก่อนหน้า"
✅ Expected: กลับหน้าแรก, แสดงรายการ 1-20
```

### 6. Chart Caching

#### Test Case 6.1: Cache Hit
```
1. เปิด admin dashboard (charts โหลด)
2. เปลี่ยน filter กลับมาค่าเดิม
✅ Expected: console log "Using cached chart data"
✅ Expected: charts แสดงเร็วขึ้น
```

#### Test Case 6.2: Cache Miss
```
1. เปลี่ยน filter
✅ Expected: คำนวณ chart data ใหม่
✅ Expected: บันทึก cache ใหม่
```

### 7. Error Messages

#### Test Case 7.1: Thai Error Messages
```
Test scenarios:
- Network error → "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้"
- Duplicate → "ข้อมูลซ้ำ: หน่วยงานนี้เพิ่งส่งข้อมูลไปแล้ว"
- Timeout → "หมดเวลาการเชื่อมต่อ"
✅ Expected: ทุก error เป็นภาษาไทย
```

### 8. Loading States

#### Test Case 8.1: Global Loading
```
1. ส่งแบบสอบถาม
✅ Expected: แสดง overlay "กำลังบันทึกข้อมูล..."
✅ Expected: ปิด scroll
✅ Expected: แสดง progress ถ้ามี retry
```

#### Test Case 8.2: Inline Loading
```
1. โหลดข้อมูลใน admin dashboard
✅ Expected: แสดง spinner ใน section ที่กำลังโหลด
✅ Expected: ไม่ block ทั้งหน้า
```

---

## Performance Testing

### 9. Load Testing

```bash
# ใช้ Apache Bench
ab -n 100 -c 10 https://your-domain.com/ch1.html

✅ Expected: 
- Response time < 2s
- No errors
- Rate limiting works
```

### 10. Database Performance

```sql
-- ทดสอบ query performance
EXPLAIN ANALYZE
SELECT * FROM hrd_ch1_responses
WHERE organization = 'กรมอนามัย'
AND submitted_at > NOW() - INTERVAL '1 hour';

✅ Expected: Uses index, execution time < 100ms
```

---

## Browser Compatibility

### 11. Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

Features to test:
- [ ] Form submission
- [ ] LocalStorage
- [ ] Charts rendering
- [ ] Responsive design
- [ ] Touch interactions (mobile)

---

## Accessibility Testing

### 12. Keyboard Navigation

```
1. ใช้ Tab เพื่อนำทาง
✅ Expected: สามารถเข้าถึงทุก input ได้
✅ Expected: มี focus indicator ชัดเจน

2. ใช้ Enter เพื่อ submit
✅ Expected: ทำงานได้ปกติ
```

### 13. Screen Reader

```
1. เปิด screen reader (NVDA/JAWS)
2. นำทางผ่านฟอร์ม
✅ Expected: อ่าน labels ได้ถูกต้อง
✅ Expected: แจ้ง errors ได้ชัดเจน
```

---

## Security Testing

### 14. SQL Injection

```
Test inputs:
- "'; DROP TABLE hrd_ch1_responses; --"
- "<script>alert('XSS')</script>"
✅ Expected: ถูก sanitize โดย Supabase
```

### 15. XSS Prevention

```
1. กรอก <script>alert('test')</script> ในช่อง text
✅ Expected: แสดงเป็น text ธรรมดา, ไม่ execute
```

---

## Regression Testing

### 16. Existing Features

Test ว่าฟีเจอร์เดิมยังทำงาน:
- [ ] Auto-save ทุก 30 วินาที
- [ ] BMI calculation
- [ ] TMHI calculation
- [ ] Export Excel
- [ ] Admin login
- [ ] Charts rendering
- [ ] Responsive design

---

## Test Report Template

```markdown
## Test Report - v3.1.0

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: [Production/Staging]

### Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Blocked: XX

### Failed Tests
1. [Test Case ID]: [Description]
   - Expected: [...]
   - Actual: [...]
   - Screenshot: [link]

### Notes
[Any additional observations]
```
