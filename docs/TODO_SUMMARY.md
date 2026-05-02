# 📋 สรุปรายการที่ยังไม่เสร็จ (TODO Summary)

**วันที่สร้าง:** 29 เมษายน 2026  
**อัปเดตล่าสุด:** 25 เมษายน 2026 (หลัง Wave 1/2/4 fix)  
**สรุปจาก:** AUDIT_REPORT, PERFORMANCE_PLAN, UX_UI_PLAN, PHASE1/2 Planning

---

## ✅ ปิดไปแล้ว (จาก Wave 1/2/4 — 2026-04-25)

| ID | รายการ | หมายเหตุ |
|----|--------|----------|
| C1 | Pagination cap + batched fetch | `SURVEY_FETCH_CAP=10000` + `_batchedFetch(concurrency=3)` ใน `data.js` |
| M2 | ลบ `console.log` สองจุดที่หลุด | `analytics-wb.js` L6 + `data.js::summarizeOrgs` |
| W1-B | `showToast()` XSS | ใส่ `esc(message)` ใน `utils.js` |
| W1-C | ลบไฟล์ล้าสมัย | `docs/CURRENT_PROJECT_STATUS.md` ลบแล้ว |
| L4 | README path/routing ผิด | แก้ `apps/public-survey/` → `index.html`, `/ch1` routing ตาม `vercel.json` จริง |
| L8 | CHANGELOG ไม่ update | เพิ่ม entries April 2026 ครบแล้ว |

---

## 🔴 Critical / High — ยังค้างอยู่

### C1-remainder — Full Server-Side Aggregation
**สถานะ:** ⏳ partial (cap ทำแล้ว แต่ยังดึง client-side)  
**ผลกระทบ:** Dashboard โหลด 15-30s, 50-200MB payload  
**วิธีแก้ระยะยาว:** ต้องสร้าง RPC PostgreSQL (ดู Performance Plan Phase 1)

### H2 — Schema Drift (Migration Baseline)
**สถานะ:** ⏳ open  
**ปัญหา:** `supabase/migrations/` มีแค่ 2 ไฟล์ แต่ production ใช้ schema ที่ apply มาหลายสิบ migration แล้ว → recreate DB ไม่ได้จาก repo  
**วิธีแก้:** รันคำสั่ง `npx supabase db dump --linked > supabase/schema_baseline.sql` (ต้องทำเองใน terminal)  
**ข้อสังเกต:** ทำ 1 ครั้งแล้วเก็บไว้ใน repo — ไม่มี code change

### H6 — `admin/js/pages/ch1.js` 114KB
**สถานะ:** ⏳ open  
**ผลกระทบ:** debug/maintain ยาก, parse time ช้า  
**วิธีแก้:** แยกเป็น 3 ไฟล์ — `ch1-table.js`, `ch1-export.js`, `ch1-detail-modal.js`  
**ข้อควรระวัง:** legacy `onclick="..."` ใน `admin.html` อ้าง globals — ต้องคง function names ไว้ (rule 9)

### M1 — `ADMIN_CANONICAL_ORGS` Hardcode 2 ที่
**สถานะ:** ⏳ open  
**ปัญหา:** org list อยู่ทั้งใน `admin/js/services/data.js` (L3-19) และ `js/project-ssot.js` → แก้ 2 ที่เมื่อ org เปลี่ยน  
**วิธีแก้:** ดึงจาก Supabase `organizations` table เป็น SSOT เดียว (ต้อง verify DB sync ก่อน)

---

## 🟠 Medium — ยังค้างอยู่

### M3 — Loading Skeletons
**สถานะ:** ⏳ open  
**รายละเอียด:** ตอนโหลดเห็นแค่ spinner ไม่มี skeleton placeholder  
**เกี่ยวข้อง:** Performance Plan 1.3 (pagination ทำก่อน skeleton ถึงมีประโยชน์)

### M6 — CH1 Detail Modal Focus Trap
**สถานะ:** ⏳ partial  
**รายละเอียด:** QR modal + consent popup ทำแล้ว แต่ CH1 detail modal ยัง TODO  
**ผลกระทบ:** accessibility (WCAG 2.1 AA)

### M7 — Supabase Key ใน Env
**สถานะ:** ⏳ open  
**รายละเอียด:** `js/supabase-config.js` hardcode URL + anon key → ควรย้ายไป Vercel env injection  
**ข้อสังเกต:** anon key เป็น public by design แต่ควรย้ายออกจาก repo ก่อน public เพื่อความปลอดภัย

### M8 — Contrast Ratio (WCAG AA)
**สถานะ:** ⏳ open  
**รายละเอียด:** สีเทาอ่อนบนพื้นขาวบางจุดผ่าน AA ไม่ได้

### M12 — Timeout Progress + Cancel
**สถานะ:** ⏳ open  
**รายละเอียด:** session timeout 12s / loader 15s ไม่มี progress bar หรือปุ่ม cancel

### M13 — Date Picker Buddhist Era
**สถานะ:** ⏳ open  
**รายละเอียด:** `<input type="date">` ไม่แสดง พ.ศ. — มี helper `isoToBuddhistDisplay()` แล้ว แต่ยังไม่ bind ทุก input

---

## 🟡 Low / Design Polish — ยังค้างอยู่

| ID | รายการ | สถานะ |
|----|--------|--------|
| L1 | Icon system (Lucide แทน emoji) | ⬜ open |
| L2 | ฟอนต์ 2 ตระกูล → รวมเป็น 1 | ⬜ open |
| L3 | Chart colors design token | ⬜ open |
| L6 | E2E test suite ครอบคลุม CH1, admin login | ⬜ open |
| M11 | Wrap EN text ใน `<span lang="en">` | ⏳ low impact |

---

## ⚡ Performance Plan — สถานะรายการ

### Phase 1 (Quick Wins — ยังไม่ทำ)
| รายการ | สถานะ | หมายเหตุ |
|--------|--------|----------|
| RPC `get_admin_dashboard_kpis()` | ⬜ ยังไม่ทำ | ลด dashboard load จาก 15s → <1s |
| RPC `get_org_wellbeing_summary()` | ⬜ ยังไม่ทำ | แทน 4,000 rows ด้วย 15 rows |
| Refactor `loadBackendCore()` ใช้ RPC | ⬜ ยังไม่ทำ | depends on RPC ข้างบน |
| Server-side pagination `renderWellbeingRaw()` | ⬜ ยังไม่ทำ | fetch 50 rows แทน 4,000 |
| Refactor `renderWellbeingOrg()` ใช้ RPC | ⬜ ยังไม่ทำ | depends on org summary RPC |
| localStorage cache for organizations | ⬜ ยังไม่ทำ | มี `_cacheGet/_cacheSet` แล้วใน data.js แต่ยังไม่ครอบ orgs |

### Phase 2 (Medium Effort — ยังไม่ทำ)
| รายการ | สถานะ | หมายเหตุ |
|--------|--------|----------|
| Materialized view `mv_idp_individual` | ⬜ ยังไม่ทำ | IDP dashboard speed |
| Cron refresh materialized view | ⬜ ยังไม่ทำ | ต้องมี pg_cron extension |
| Composite + partial indexes | ⬜ ยังไม่ทำ | SQL migration ใหม่ |
| Lazy-load XLSX + html2canvas | ⬜ ยังไม่ทำ | ลด first load 400KB+ |
| Request deduplication layer | ⬜ ยังไม่ทำ | ป้องกัน duplicate fetch |
| Refactor `idp-dashboard.js` ใช้ MV | ⬜ ยังไม่ทำ | depends on MV |

### Phase 3 (Advanced — ยังไม่ทำ)
| รายการ | สถานะ |
|--------|--------|
| Web Worker สำหรับ IDP calculations | ⬜ ยังไม่ทำ |
| Virtual scrolling | ⬜ ยังไม่ทำ |
| Service Worker + IndexedDB cache | ⬜ ยังไม่ทำ |
| Lighthouse CI in GitHub Actions | ⬜ ยังไม่ทำ |

---

## 📊 สถิติรวม (อัปเดต 2026-04-25)

| หมวด | ก่อน Wave 1/2/4 | หลัง Wave 1/2/4 |
|------|:-:|:-:|
| 🔴 Critical/High ที่ยังค้าง | 17 | 4 (H2, H6, M1, C1-remainder) |
| 🟠 Medium ที่ยังค้าง | 9 | 6 |
| 🟡 Low/Polish | 9 | 6 |
| ⚡ Performance Plan | 17 | 17 (ยังไม่เริ่ม) |
| **รวมที่ยังต้องทำ** | **52** | **33** |

---

## 🗺️ แผนการแก้ไขที่แนะนำ (เพื่อพิจารณา)

> **หมายเหตุ:** นี่คือแผนเพื่อพูดคุย ยังไม่ได้ implement — รอ approve ก่อน

---

### Wave 3 — Migration Baseline (ทำเองใน terminal, 30 นาที)

**ไม่มี code change — ทำ 1 ครั้ง:**
```
npx supabase db dump --linked > supabase/schema_baseline.sql
git add supabase/schema_baseline.sql
git commit -m "docs(supabase): add schema baseline snapshot (H2)"
```
**Closes:** H2

---

### Wave 5 — Performance Phase 1 RPC (~2-3 วัน)

**งานที่จะทำ (แยก commit):**

| Commit | งาน | ผลลัพธ์ |
|--------|-----|---------|
| `feat(rpc): add get_admin_dashboard_kpis` | Migration SQL ใหม่ | Dashboard KPI <1s |
| `feat(rpc): add get_org_wellbeing_summary` | Migration SQL ใหม่ | Wellbeing org table <1s |
| `refactor(data): use dashboard KPI RPC` | แก้ `loadBackendCore()` | ลด payload 95% |
| `feat(data): server-side pagination wellbeing raw` | แก้ `renderWellbeingRaw()` | รองรับ 100k+ rows |

**ข้อควรระวัง:**
- RPC ต้องตั้ง `security invoker` เพื่อเคารพ RLS
- regression test ก่อน push ทุก commit
- ต้องทำ `mcp1_apply_migration` เท่านั้น (rule 1)

---

### Wave 6 — H6 File Split `ch1.js` (~1-2 วัน)

**แยกออกเป็น 3 ไฟล์:**

```
admin/js/pages/
├── ch1.js            (entry: globals + init + wiring)  ~20KB
├── ch1-table.js      (renderCh1, renderCh1Summary, table logic)  ~40KB
├── ch1-export.js     (exportCh1All, exportCh1Filtered, PDF)  ~30KB
└── ch1-detail-modal.js  (showCh1Detail, focus-trap M6)  ~24KB
```

**Rule 9 compliance:** global function names ทั้งหมดต้องคงไว้ใน `ch1.js` wrapper:
```javascript
// ch1.js — re-export globals ที่ admin.html onclick ใช้
function renderCh1(summary) { return _ch1Table.renderCh1(summary); }
function exportCh1All()     { return _ch1Export.exportCh1All(); }
// ...
```

**Bonus:** M6 CH1 detail modal focus trap ทำพร้อมกันได้ใน `ch1-detail-modal.js`  
**Closes:** H6, M6 (partial)

---

### Wave 7 — M1 SSOT Org List (~1 วัน)

**เงื่อนไขก่อนทำ:** ต้อง verify ว่า `organizations` table ใน Supabase ครบ 15 org  

**Plan:**
1. Query `organizations` table → ถ้าครบ → ลบ `ADMIN_CANONICAL_ORGS` hardcode ใน `data.js`
2. ให้ `getOrgCatalog()` ดึงจาก `state.orgProfiles` โดยตรง (ซึ่งมาจาก DB แล้ว)
3. `js/project-ssot.js` → `orgHrMap` ยังคงไว้เป็น fallback สำหรับ CH1 form (public, ไม่ login)

**Closes:** M1

---

### Wave 8 — Performance Phase 2 (~3-5 วัน)

ทำหลัง Phase 1 stable แล้ว:
- Materialized view `mv_idp_individual`
- Lazy-load XLSX + html2canvas
- Additional composite indexes
- Request deduplication

---

## 🚦 สรุปสิ่งที่ต้องพูดคุยก่อน implement

| # | คำถาม | เกี่ยวกับ |
|---|--------|-----------|
| 1 | Wave 3 (schema dump) — พร้อมรัน terminal หรือให้เขียน guide แทน? | H2 |
| 2 | Wave 5 RPC — จะทำ Phase 1 ทั้งหมด หรือเริ่มจาก `get_admin_dashboard_kpis` ก่อน? | Performance |
| 3 | Wave 6 split — อยากเริ่ม H6 ไหม? ควรทำก่อนหรือหลัง Performance? | H6 |
| 4 | Wave 7 M1 — ต้องการให้ตรวจ `organizations` table ใน DB ก่อนไหม? | M1 |
| 5 | M3 Loading Skeletons — ทำก่อนหรือหลัง Pagination? (skeleton มีประโยชน์มากกว่าถ้า pagination เสร็จแล้ว) | UX |
