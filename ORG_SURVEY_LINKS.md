# ลิงก์แบบสอบถาม Well-being รายองค์กร
> อัปเดต: 2026-03-23 | org_code ยืนยันตรงกับ Supabase `organizations` table (post-migration)
> Format: `https://nidawellbeing.vercel.app/?org=<org_code>`

## รายการ 15 หน่วยงาน (org_code = Supabase canonical)

| sort | org_code | ชื่อส่วนราชการ | URL Well-being Survey |
|------|----------|---------------|----------------------|
| 1 | nesdc | สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ | https://nidawellbeing.vercel.app/?org=nesdc |
| 2 | tpso | สำนักงานนโยบายและยุทธศาสตร์การค้า | https://nidawellbeing.vercel.app/?org=tpso |
| 3 | dss | กรมวิทยาศาสตร์บริการ | https://nidawellbeing.vercel.app/?org=dss |
| 4 | dhss | กรมสนับสนุนบริการสุขภาพ | https://nidawellbeing.vercel.app/?org=dhss |
| 5 | tmd | กรมอุตุนิยมวิทยา | https://nidawellbeing.vercel.app/?org=tmd |
| 6 | dcp | กรมส่งเสริมวัฒนธรรม | https://nidawellbeing.vercel.app/?org=dcp |
| 7 | dop | กรมคุมประพฤติ | https://nidawellbeing.vercel.app/?org=dop |
| 8 | mots | สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา | https://nidawellbeing.vercel.app/?org=mots |
| 9 | dmh | กรมสุขภาพจิต | https://nidawellbeing.vercel.app/?org=dmh |
| 10 | onep | สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม | https://nidawellbeing.vercel.app/?org=onep |
| 11 | nrct | สำนักงานการวิจัยแห่งชาติ | https://nidawellbeing.vercel.app/?org=nrct |
| 12 | acfs | สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ | https://nidawellbeing.vercel.app/?org=acfs |
| 13 | opdc | สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.) | https://nidawellbeing.vercel.app/?org=opdc |
| 14 | rid | กรมชลประทาน | https://nidawellbeing.vercel.app/?org=rid |
| 15 | dcy | กรมกิจการเด็กและเยาวชน | https://nidawellbeing.vercel.app/?org=dcy |

---

## Copy-paste สำหรับ Dev (Admin Portal link menu)

```
nesdc | สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ
https://nidawellbeing.vercel.app/?org=nesdc

tpso | สำนักงานนโยบายและยุทธศาสตร์การค้า
https://nidawellbeing.vercel.app/?org=tpso

dss | กรมวิทยาศาสตร์บริการ
https://nidawellbeing.vercel.app/?org=dss

dhss | กรมสนับสนุนบริการสุขภาพ
https://nidawellbeing.vercel.app/?org=dhss

tmd | กรมอุตุนิยมวิทยา
https://nidawellbeing.vercel.app/?org=tmd

dcp | กรมส่งเสริมวัฒนธรรม
https://nidawellbeing.vercel.app/?org=dcp

dop | กรมคุมประพฤติ
https://nidawellbeing.vercel.app/?org=dop

mots | สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา
https://nidawellbeing.vercel.app/?org=mots

dmh | กรมสุขภาพจิต
https://nidawellbeing.vercel.app/?org=dmh

onep | สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม
https://nidawellbeing.vercel.app/?org=onep

nrct | สำนักงานการวิจัยแห่งชาติ
https://nidawellbeing.vercel.app/?org=nrct

acfs | สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ
https://nidawellbeing.vercel.app/?org=acfs

opdc | สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)
https://nidawellbeing.vercel.app/?org=opdc

rid | กรมชลประทาน
https://nidawellbeing.vercel.app/?org=rid

dcy | กรมกิจการเด็กและเยาวชน
https://nidawellbeing.vercel.app/?org=dcy
```

---

## org_code ที่แก้ไขจาก migration `canonicalize_org_codes_abbr_sort` (2026-03-23)

| หน่วยงาน | org_code เก่า | org_code ใหม่ (canonical) | sort เก่า → ใหม่ |
|----------|---------------|--------------------------|-----------------|
| กรมสนับสนุนบริการสุขภาพ | hssd | **dhss** | 7 → 4 |
| กรมคุมประพฤติ | probation | **dop** | 6 → 7 |
| สำนักงานคณะกรรมการพัฒนาระบบราชการ | ocsc | **opdc** | 13 → 13 |
| กรมอุตุนิยมวิทยา | (tmd) | tmd | 4 → 5 |
| กรมส่งเสริมวัฒนธรรม | (dcp) | dcp | 5 → 6 |

## หมายเหตุ Dev
- org_code ใน URL ต้องตรงกับ `organizations.org_code` ใน Supabase (lowercase, exact match)
- test-org (sort_order=99) ไม่อยู่ในชุดนี้ — ไว้ทดสอบเท่านั้น
- Legacy aliases (hssd, probation, ocsc) ยังคงอยู่ใน `js/project-ssot.js` orgCodeNameMap เพื่อ backward-compat เท่านั้น
- ถ้าต้องการเปลี่ยน org_code ให้ run migration + update `organizations` table โดยตรง (FK CASCADE จะ propagate ไป admin_user_roles)
