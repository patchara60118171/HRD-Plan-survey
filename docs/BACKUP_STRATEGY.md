# กลยุทธ์การสำรองข้อมูล - Well-being Survey v3.1

## 📋 ภาพรวม

เอกสารนี้กำหนดกลยุทธ์การสำรองข้อมูลสำหรับระบบ Well-being Survey เพื่อให้มั่นใจว่าข้อมูลจะไม่สูญหายและสามารถกู้คืนได้ในกรณีฉุกเฉิน

---

## 🎯 วัตถุประสงค์

1. **RPO (Recovery Point Objective)**: สูญเสียข้อมูลได้ไม่เกิน 24 ชั่วโมง
2. **RTO (Recovery Time Objective)**: กู้คืนระบบได้ภายใน 4 ชั่วโมง
3. **Retention**: เก็บข้อมูลสำรองย้อนหลัง 90 วัน

---

## 💾 ข้อมูลที่ต้องสำรอง

### 1. Database (Supabase PostgreSQL)
- **ความสำคัญ**: สูงสุด (Critical)
- **ข้อมูล**: แบบสอบถามทั้งหมด, ข้อมูลผู้ใช้, สถิติ
- **ความถี่**: ทุกวัน (Daily)
- **วิธีการ**: Automated Backup (Supabase)

### 2. Application Code
- **ความสำคัญ**: สูง (High)
- **ข้อมูล**: HTML, CSS, JavaScript files
- **ความถี่**: ทุกครั้งที่มีการเปลี่ยนแปลง
- **วิธีการ**: GitHub + Vercel

### 3. Configuration Files
- **ความสำคัญ**: ปานกลาง (Medium)
- **ข้อมูล**: Supabase config, environment variables
- **ความถี่**: ทุกครั้งที่มีการเปลี่ยนแปลง
- **วิธีการ**: GitHub Secrets + Local backup

### 4. User Sessions & Cache
- **ความสำคัญ**: ต่ำ (Low)
- **ข้อมูล**: Session data, cache
- **ความถี่**: ไม่จำเป็นต้องสำรอง (rebuild ได้)

---

## 🔄 กลยุทธ์การสำรองข้อมูล

### ระดับที่ 1: Automated Daily Backup (Supabase)

```sql
-- Supabase มีการสำรองข้อมูลอัตโนมัติทุกวัน
-- สามารถดาวน์โหลดได้จาก Supabase Dashboard
```

**ขั้นตอน**:
1. เข้า Supabase Dashboard → Database → Backups
2. ตรวจสอบว่า Daily Backup ทำงานปกติ
3. ดาวน์โหลด backup ล่าสุดเก็บไว้ที่เครื่อง (สัปดาห์ละครั้ง)

### ระดับที่ 2: Weekly Manual Backup

**รัน SQL Script** (ทุกวันอาทิตย์):

```bash
# สร้างไฟล์ backup
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres -f backup_$(date +%Y%m%d).sql

# หรือใช้ Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d).sql
```

**ข้อมูลที่สำรอง**:
- ข้อมูลทั้งหมดในตาราง hrd_ch1_responses
- Schema และ constraints
- Indexes และ triggers

### ระดับที่ 3: Real-time Replication (ถ้าจำเป็น)

```sql
-- ตั้งค่า read replica สำหรับ disaster recovery
-- ติดต่อ Supabase Support สำหรับ Enterprise Plan
```

---

## 🛡️ ขั้นตอนการสำรองข้อมูลด้วยตนเอง

### 1. สำรอง Database

#### วิธีที่ 1: ผ่าน Supabase Dashboard (แนะนำ)
```
1. เข้า https://app.supabase.com
2. เลือก Project → Database → Backups
3. คลิก "Download" ที่ backup ล่าสุด
4. บันทึกไฟล์ .dump ไว้ในที่ปลอดภัย
```

#### วิธีที่ 2: ผ่าน SQL Script
```sql
-- สร้าง backup ผ่าน SQL Editor
COPY (SELECT * FROM hrd_ch1_responses) 
TO '/tmp/backup_$(date +%Y%m%d).csv' 
WITH (FORMAT csv, HEADER true);
```

### 2. สำรองโค้ด

```bash
# สร้าง tag สำหรับการสำรอง
 git tag -a "backup-$(date +%Y%m%d)" -m "Weekly backup"
 git push origin "backup-$(date +%Y%m%d)"

# หรือสร้าง branch สำรอง
 git checkout -b "backup-$(date +%Y%m%d)"
 git push origin "backup-$(date +%Y%m%d)"
```

### 3. สำรอง Configuration

```bash
# สร้างไฟล์ config-backup.txt เก็บข้อมูลสำคัญ
cat > config-backup-$(date +%Y%m%d).txt << EOF
Supabase URL: $SUPABASE_URL
Project ID: [PROJECT_ID]
Created: $(date)
IMPORTANT: อย่าแชร์ไฟล์นี้!
EOF

# เก็บไฟล์นี้ในที่ปลอดภัย (เช่น password manager)
```

---

## 🚨 ขั้นตอนการกู้คืนข้อมูล (Disaster Recovery)

### สถานการณ์ที่ 1: Database Corruption

```sql
-- 1. หยุดการเข้าถึงชั่วคราว (Maintenance Mode)
-- 2. กู้คืนจาก backup ล่าสุด

-- วิธีที่ 1: ใช้ Supabase Dashboard
-- Project → Database → Backups → Restore

-- วิธีที่ 2: ใช้ psql (ถ้ามีไฟล์ .sql)
psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup_YYYYMMDD.sql
```

**เวลาที่ใช้**: ~30 นาที - 2 ชั่วโมง (ขึ้นอยู่กับขนาดข้อมูล)

### สถานการณ์ที่ 2: Application ล่ม

```bash
# 1. ตรวจสอบสถานะ Vercel
vercel --version

# 2. Deploy จาก commit ล่าสุดที่ทำงานได้
vercel --prod

# 3. หรือ revert ถ้าจำเป็น
 git revert HEAD
 git push origin main
```

**เวลาที่ใช้**: ~5-15 นาที

### สถานการณ์ที่ 3: ข้อมูลสูญหายบางส่วน

```sql
-- กู้คืนข้อมูลเฉพาะส่วน
-- ตัวอย่าง: กู้คืนข้อมูลขององค์กรเดียว
INSERT INTO hrd_ch1_responses 
SELECT * FROM backup_table 
WHERE form_data->>'agency_name' = 'ชื่อหน่วยงาน';
```

---

## 📅 ตารางการสำรองข้อมูล

| ความถี่ | รายการ | ผู้รับผิดชอบ | วิธีการ |
|---------|--------|-------------|---------|
| **Real-time** | Database | Supabase | Automated |
| **Daily** | Database | Supabase | Automated |
| **Weekly** | Database + Code | Admin | Manual |
| **Monthly** | Full System | Admin | Manual + Cloud |
| **Quarterly** | Test Restore | Admin | DR Drill |

---

## 🔐 ความปลอดภัยของข้อมูลสำรอง

### Encryption
- ไฟล์ backup ต้องเก็บใน encrypted storage
- ใช้ password manager สำหรับ encryption keys

### Access Control
- จำกัดการเข้าถึงข้อมูลสำรองเฉพาะผู้ดูแลระบบ
- บันทึก log การเข้าถึง

### Retention Policy
```
- Daily backups: 7 วัน
- Weekly backups: 4 สัปดาห์
- Monthly backups: 3 เดือน
- Quarterly backups: 1 ปี
```

---

## 🧪 การทดสอบการกู้คืน (DR Drill)

ควรทดสอบการกู้คืนข้อมูลทุก 3 เดือน:

```bash
# 1. สร้าง environment ทดสอบ
# 2. กู้คืนข้อมูลจาก backup
# 3. ตรวจสอบความถูกต้อง
# 4. บันทึกเวลาที่ใช้และปัญหาที่พบ
```

**Checklist**:
- [ ] Database กู้คืนได้ครบถ้วน
- [ ] Application ทำงานได้ปกติ
- [ ] ข้อมูลถูกต้อง 100%
- [ ] RTO ภายใน 4 ชั่วโมง

---

## 📞 ข้อมูลติดต่อฉุกเฉิน

| บทบาท | ชื่อ | เบอร์โทร | Email |
|-------|------|----------|-------|
| **System Admin** | [ชื่อ] | [เบอร์] | [อีเมล] |
| **Database Admin** | [ชื่อ] | [เบอร์] | [อีเมล] |
| **Project Manager** | [ชื่อ] | [เบอร์] | [อีเมล] |

**ผู้ให้บริการ**:
- **Supabase**: support@supabase.io
- **Vercel**: support@vercel.com
- **GitHub**: support@github.com

---

## ✅ Checklist รายวัน/สัปดาห์

### รายวัน (Daily)
- [ ] ตรวจสอบ Supabase backup status
- [ ] ตรวจสอบ error logs
- [ ] ตรวจสอบ disk space

### รายสัปดาห์ (Weekly)
- [ ] ดาวน์โหลด backup ไว้ที่เครื่อง
- [ ] สร้าง Git tag สำรอง
- [ ] ตรวจสอบ backup integrity

### รายเดือน (Monthly)
- [ ] ทดสอบ restore บน environment ทดสอบ
- [ ] อัปเดต contact list
- [ ] ทบทวน backup strategy

---

## 📊 Metrics ที่ต้องติดตาม

```sql
-- ตรวจสอบขนาด database
SELECT pg_size_pretty(pg_database_size('postgres'));

-- ตรวจสอบจำนวน records
SELECT COUNT(*) FROM hrd_ch1_responses;

-- ตรวจสอบ last backup time (ถ้ามี)
SELECT MAX(created_at) FROM pg_stat_statements;
```

---

## 🎯 เป้าหมาย SLA

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Backup Success Rate** | 100% | Daily check |
| **RTO** | < 4 hours | DR Drill |
| **RPO** | < 24 hours | Backup frequency |
| **Data Integrity** | 100% | Weekly verify |
| **Recovery Test** | Quarterly | DR Drill |

---

## 📝 การบันทึกเหตุการณ์ (Incident Log)

| วันที่ | เหตุการณ์ | ผลกระทบ | การแก้ไข | เวลาที่ใช้ |
|--------|----------|---------|----------|------------|
| [วันที่] | [รายละเอียด] | [ระดับ] | [วิธี] | [นาที/ชม.] |

---

## 🚀 การปรับปรุงในอนาคต

1. **Automated Backup Verification** - สคริปต์ตรวจสอบ backup อัตโนมัติ
2. **Cross-region Replication** - สำรองข้อมูลในภูมิภาคอื่น
3. **Point-in-time Recovery** - กู้คืนข้อมูลถึงเวลาที่กำหนด
4. **Backup as a Service** - ใช้บริการสำรองข้อมูลภายนอก

---

## 📚 References

- [Supabase Backup Documentation](https://supabase.com/docs/guides/database/backups)
- [PostgreSQL Backup & Recovery](https://www.postgresql.org/docs/current/backup.html)
- [Vercel Deployment Documentation](https://vercel.com/docs/concepts/deployments/overview)

---

**อัปเดตล่าสุด**: March 2026  
**เวอร์ชัน**: 3.1  
**ผู้จัดทำ**: NIDA Well-being Project Team
