# 🚀 Performance Optimization Plan

> **เป้าหมาย**: ลดเวลาโหลดหน้า Admin Portal จาก **15-30s → < 3s** โดยเปลี่ยนจาก "โหลดทั้งหมดแล้วกรองใน browser" เป็น "ให้ PostgreSQL ทำงานหนักบน server"

**จัดทำ**: 2026-04-22
**สถานะ**: 📋 Plan — ยังไม่เริ่ม implement

---

## 📊 สรุปปัญหาที่พบ

| # | ปัญหา | ผลกระทบ |
|---|-------|---------|
| 1 | `fetchAllSurveyResponses()` โหลดทุก row (~4,400 rows) | 5-15s network + 50-100MB payload |
| 2 | `raw_responses` JSONB blob 10-50KB/row ถูกโหลดเมื่อเข้า Analytics | 200MB+ ทำให้ browser ค้าง |
| 3 | Client-side filter/aggregation ทุกอย่าง (map/filter/reduce) | Main thread freeze 2-5s |
| 4 | ไม่ใช้ Supabase Query power (eq, gte, in, rpc) | DB ส่งข้อมูลที่ไม่ต้องใช้ |
| 5 | KPI calculations ทำใน browser ทุกครั้งที่เปลี่ยน page | ซ้ำซ้อน ไม่มี cache |
| 6 | ไม่มี Server-side pagination สำหรับ raw data table | Render 4,000+ `<tr>` |
| 7 | Bundle size ใหญ่ (XLSX + html2canvas + qrcode + all pages) | First load 800KB+ |

---

## 🎯 Phase 1: Quick Wins (1-2 วัน, ได้ผล 60-70%)

### 1.1 — สร้าง RPC สำหรับ Dashboard KPIs

**ไฟล์**: `supabase/migrations/20260422_dashboard_kpis_rpc.sql` (ใหม่)

```sql
create or replace function get_admin_dashboard_kpis()
returns json
language sql
stable
as $$
  select json_build_object(
    'total_orgs',       (select count(*) from organizations where is_test = false),
    'ch1_submitted',    (select count(*) from hrd_ch1_responses where status = 'submitted'),
    'wb_submitted',     (select count(*) from survey_responses where is_draft = false),
    'phq9_high_count',  (select count(*) from survey_responses where is_draft = false and phq9_score >= 10),
    'burnout_avg',      (select round(avg(burnout_score)::numeric, 2) from survey_responses where burnout_score is not null),
    'engagement_avg',   (select round(avg(engagement_score)::numeric, 2) from survey_responses where engagement_score is not null),
    'last_update',      (select max(submitted_at) from survey_responses)
  );
$$;
```

**ใน data.js:**
```javascript
async function loadDashboardKpis() {
  const { data } = await sb.rpc('get_admin_dashboard_kpis');
  return data; // 1 call, < 200ms แทน 4,000 rows
}
```

**ผลลัพธ์**: Dashboard หน้าแรกโหลด **< 1s** แทน 15s

---

### 1.2 — สร้าง RPC สำหรับ Org Summary

**ไฟล์**: `supabase/migrations/20260422_org_summary_rpc.sql`

```sql
create or replace function get_org_wellbeing_summary()
returns table (
  organization text,
  total_submitted bigint,
  total_draft bigint,
  phq9_high_count bigint,
  phq9_avg numeric,
  burnout_avg numeric,
  engagement_avg numeric,
  last_submitted_at timestamp
)
language sql
stable
as $$
  select
    organization,
    count(*) filter (where is_draft = false) as total_submitted,
    count(*) filter (where is_draft = true) as total_draft,
    count(*) filter (where phq9_score >= 10) as phq9_high_count,
    round(avg(phq9_score)::numeric, 2) as phq9_avg,
    round(avg(burnout_score)::numeric, 2) as burnout_avg,
    round(avg(engagement_score)::numeric, 2) as engagement_avg,
    max(submitted_at) as last_submitted_at
  from survey_responses
  where organization is not null
  group by organization;
$$;
```

**ผลลัพธ์**: หน้า `renderWellbeingOrg` ไม่ต้องโหลด 4,000 rows แค่ดึง 15 rows

---

### 1.3 — Server-side Pagination สำหรับ Raw Data Table

**แก้ `admin/js/pages/wellbeing.js` — `renderWellbeingRaw`:**

```javascript
async function fetchRawPage({ page = 1, pageSize = 50, filters = {} }) {
  let q = sb.from('survey_responses')
    .select('id, name, email, organization, gender, age, submitted_at', { count: 'exact' })
    .eq('is_draft', false)
    .order('submitted_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters.organization) q = q.eq('organization', filters.organization);
  if (filters.gender)       q = q.eq('gender', filters.gender);
  if (filters.search)       q = q.ilike('name', `%${filters.search}%`);

  return await q;
}
```

**ผลลัพธ์**: โหลดทีละ 50 rows, transfer < 20KB, รองรับ 100,000+ rows

---

### 1.4 — แคช `ORG_NAMES` & `organizations` ด้วย localStorage

```javascript
// admin/js/services/data.js
async function fetchOrganizationsCached() {
  const cached = localStorage.getItem('org_cache_v1');
  if (cached) {
    const { data, ts } = JSON.parse(cached);
    if (Date.now() - ts < 3600_000) return data; // 1 hour TTL
  }
  const { data } = await sb.from('organizations').select('*');
  localStorage.setItem('org_cache_v1', JSON.stringify({ data, ts: Date.now() }));
  return data;
}
```

---

## 🎯 Phase 2: Medium Effort (3-5 วัน, ได้ผล 20-25%)

### 2.1 — Materialized View สำหรับ IDP Dashboard

```sql
create materialized view mv_idp_individual as
select
  id, email, name, organization, gender, age, job,
  phq9_score, gad7_score, burnout_score,
  engagement_score, wlb_score, tmhi_score,
  case
    when phq9_score >= 10 or gad7_score >= 10 or burnout_score >= 3.5 then 'high'
    when burnout_score >= 2.5 or engagement_score < 50 or wlb_score < 3.0 then 'medium'
    when tmhi_score < 44 then 'low'
    else 'normal'
  end as risk_level,
  submitted_at
from survey_responses
where is_draft = false;

create index on mv_idp_individual (organization, risk_level);
create index on mv_idp_individual (risk_level, submitted_at desc);

-- Refresh ทุก 15 นาที (cron)
```

**ใน `idp-dashboard.js`:**
```javascript
async function loadIdpPage({ page = 1, pageSize = 50, orgFilter, riskFilter }) {
  let q = sb.from('mv_idp_individual').select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (orgFilter)  q = q.eq('organization', orgFilter);
  if (riskFilter) q = q.eq('risk_level', riskFilter);
  return q;
}
```

---

### 2.2 — Database Indexes ที่ขาด

```sql
-- Composite index สำหรับ query ที่ใช้บ่อยที่สุด
create index if not exists idx_survey_org_submitted
  on survey_responses (organization, is_draft, submitted_at desc)
  where is_draft = false;

-- สำหรับ PHQ-9 / Burnout filters
create index if not exists idx_survey_phq9 on survey_responses (phq9_score)
  where phq9_score is not null;

create index if not exists idx_survey_burnout on survey_responses (burnout_score)
  where burnout_score is not null;

-- สำหรับ ch1 status queries
create index if not exists idx_ch1_org_status on hrd_ch1_responses (org_code, status);
```

---

### 2.3 — ลด Bundle Size

**แก้ `admin.html`:**
```html
<!-- Lazy-load เฉพาะเมื่อต้องใช้ -->
<script>
  window.loadXlsxLib = () => import('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');
  window.loadHtml2Canvas = () => import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
</script>
```

**ใน export.js:**
```javascript
async function downloadWorkbook(...) {
  if (!window.XLSX) await window.loadXlsxLib();
  // ... existing code
}
```

**ผลลัพธ์**: First load ลด 400KB+

---

### 2.4 — Request Deduplication

```javascript
// admin/js/services/data.js
const _pendingRequests = new Map();

async function dedupedFetch(key, fn) {
  if (_pendingRequests.has(key)) return _pendingRequests.get(key);
  const promise = fn().finally(() => _pendingRequests.delete(key));
  _pendingRequests.set(key, promise);
  return promise;
}

// การใช้งาน
async function loadBackendCore() {
  return dedupedFetch('backend_core', async () => {
    // existing code
  });
}
```

---

## 🎯 Phase 3: Advanced (1-2 สัปดาห์, ได้ผล 5-10%)

### 3.1 — Web Worker สำหรับ Heavy Computations

ย้ายการคำนวณ IDP risk/recommendations ไปยัง Web Worker

### 3.2 — Virtual Scrolling สำหรับตารางใหญ่

ใช้ library เล็ก ๆ เช่น `virtual-scroller` แทนการ render ทุก `<tr>`

### 3.3 — Service Worker + Offline Cache

Cache ข้อมูลที่ไม่เปลี่ยน (organizations, form schemas) ใน IndexedDB

### 3.4 — Incremental Static Regeneration (ISR)

Build static pages สำหรับ public report pages

---

## 📋 Implementation Checklist

### Phase 1 (Priority: 🔴 High)
- [ ] สร้าง migration `get_admin_dashboard_kpis()` RPC
- [ ] สร้าง migration `get_org_wellbeing_summary()` RPC
- [ ] Refactor `loadBackendCore()` ให้ใช้ RPC
- [ ] Refactor `renderWellbeingRaw()` → server-side pagination
- [ ] Refactor `renderWellbeingOrg()` → ใช้ org summary RPC
- [ ] เพิ่ม localStorage cache สำหรับ organizations

### Phase 2 (Priority: 🟡 Medium)
- [ ] สร้าง `mv_idp_individual` materialized view
- [ ] ตั้ง cron refresh materialized view (pg_cron)
- [ ] เพิ่ม indexes (composite + partial)
- [ ] Lazy-load XLSX และ html2canvas
- [ ] Request deduplication layer
- [ ] Refactor `idp-dashboard.js` ใช้ MV + server pagination

### Phase 3 (Priority: 🟢 Low)
- [ ] Web Worker สำหรับ IDP calculations
- [ ] Virtual scrolling library integration
- [ ] Service Worker + IndexedDB cache
- [ ] Lighthouse CI integration

---

## 📈 Expected Results

| Metric | ก่อน | Phase 1 | Phase 2 | Phase 3 |
|--------|------|---------|---------|---------|
| **Dashboard first paint** | 15-30s | < 2s | < 1s | < 500ms |
| **Raw data table** | 10-20s | < 1s | < 500ms | < 300ms |
| **IDP dashboard** | 20-40s | < 3s | < 1s | < 500ms |
| **Network payload** | 50-200MB | 2-5MB | 500KB-2MB | < 500KB |
| **Bundle size** | 800KB+ | 800KB | 400KB | 400KB |
| **Lighthouse score** | 30-50 | 70+ | 85+ | 90+ |

---

## ⚠️ Risk & Considerations

1. **Breaking changes**: RPC functions ต้อง map ให้ตรงกับ existing state shape → ต้อง regression test
2. **RLS policies**: ตรวจสอบให้ RPC เคารพ Row-Level Security (ใช้ `security invoker`)
3. **Materialized view staleness**: Refresh schedule vs data freshness tradeoff
4. **Rollback plan**: Keep old `fetchAllSurveyResponses()` สำหรับ feature flag toggle

---

## 🧪 Testing Strategy

1. **Benchmark before/after** ด้วย Chrome DevTools Performance tab
2. **Lighthouse CI** ใน GitHub Actions ตรวจ regression
3. **Load test** ด้วย Supabase dashboard (watch API calls)
4. **E2E regression** ด้วย Playwright (ที่มีอยู่แล้ว)

---

## 📚 References

- Supabase RPC docs: https://supabase.com/docs/guides/database/functions
- Materialized views: https://www.postgresql.org/docs/current/rules-materializedviews.html
- pg_cron: https://github.com/citusdata/pg_cron
- Vercel Edge caching: https://vercel.com/docs/edge-network/caching
