/* ========== ADMIN PORTAL — DATA LOADING & ORG CATALOG ========== */

const ADMIN_CANONICAL_ORGS = [
  { code: 'nesdc', name: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ' },
  { code: 'tpso', name: 'สำนักงานนโยบายและยุทธศาสตร์การค้า' },
  { code: 'dss', name: 'กรมวิทยาศาสตร์บริการ' },
  { code: 'tmd', name: 'กรมอุตุนิยมวิทยา' },
  { code: 'dcp', name: 'กรมส่งเสริมวัฒนธรรม' },
  { code: 'dop', name: 'กรมคุมประพฤติ' },
  { code: 'dhss', name: 'กรมสนับสนุนบริการสุขภาพ' },
  { code: 'mots', name: 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา' },
  { code: 'dmh', name: 'กรมสุขภาพจิต' },
  { code: 'onep', name: 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม' },
  { code: 'nrct', name: 'สำนักงานการวิจัยแห่งชาติ' },
  { code: 'acfs', name: 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ' },
  { code: 'opdc', name: 'สำนักงานคณะกรรมการพัฒนาระบบราชการ' },
  { code: 'rid', name: 'กรมชลประทาน' },
  { code: 'dcy', name: 'กรมกิจการเด็กและเยาวชน' },
];

const ADMIN_CANONICAL_ORG_CODES = new Set(ADMIN_CANONICAL_ORGS.map((org) => org.code));
const ADMIN_CANONICAL_ORG_NAMES = new Set(ADMIN_CANONICAL_ORGS.map((org) => org.name));
const SURVEY_SELECT_FIELDS = 'id,email,name,title,organization,gender,age,org_type,job,job_duration,bmi,bmi_category,is_draft,submitted_at,timestamp,tmhi_score,raw_responses';
// Light fields for first-paint: skip heavy form_data JSONB. form_data is filled in the extras phase.
const CH1_LITE_FIELDS = 'id,org_code,organization,status,created_at,last_saved_at,submitted_at,form_version';
// Full fields for extras phase — explicit list excluding raw_payload (can exceed 2MB per row).
// If a new column is needed by the admin UI, add it here rather than reverting to '*'.
// See docs/AUDIT_REPORT_2026-04.md item C2.
const CH1_FULL_FIELDS = [
  'id', 'org_code', 'organization', 'status',
  'created_at', 'last_saved_at', 'submitted_at',
  'form_version', 'respondent_email',
  'total_personnel', 'total_staff', 'form_completion',
  'ncd_ratio_pct', 'mental_burnout', 'engagement_score', 'type_official',
  'form_data'
].join(',');

function getOrgCatalog() {
  const profileMap = new Map(
    state.orgProfiles.map((row) => {
      const code = String(row.org_code || '').toLowerCase();
      const name = row.org_name_th || row.display_name || '';
      return [code || name, row];
    })
  );

  return ADMIN_CANONICAL_ORGS.map((org) => {
    const row = profileMap.get(org.code)
      || state.orgProfiles.find((item) => (item.org_name_th || item.display_name || '') === org.name)
      || {};
    return {
      name: org.name,
      ministry: row.ministry || row.settings?.ministry || 'ไม่ระบุ',
      code: row.org_code || org.code,
      letter: row.salutation || row.settings?.salutation || 'ไม่ระบุ',
      email: row.saraban_email || row.settings?.saraban_email || row.contact_email || '',
      contact: row.coordinator_name || row.settings?.coordinator_name || '',
      contactRole: row.coordinator_position || row.settings?.coordinator_position || '',
      contactPhone: row.coordinator_contact_line || row.settings?.coordinator_contact_line || '',
      contactLine: row.coordinator_contact_line || row.settings?.coordinator_contact_line || '',
      contactEmail: row.coordinator_email || row.settings?.coordinator_email || row.contact_email || '',
    };
  });
}

function refreshOrgDerivedState() {
  const catalog = getOrgCatalog();
  ORG_NAMES = catalog.map((org) => org.name);
  ORG_LOOKUP = new Map(catalog.map((org) => [org.name, org]));
}

function getCurrentUserRow() {
  const email = state.session?.user?.email;
  if (!email) return null;
  return state.userRows.find((row) => row.email === email) || null;
}

function scopeRowsForCurrentUser() {
  const myRow = getCurrentUserRow();
  const myRole = LOCKED_SUPERADMIN_EMAILS.includes(state.session?.user?.email || '')
    ? 'superadmin'
    : (myRow?.role || 'viewer');

  if (myRole !== 'org_hr') return;

  const myOrgCode = (myRow?.org_code || '').toLowerCase();
  const myOrgName = myRow?.org_name || myRow?.display_name || '';

  state.surveyRows = state.surveyRows.filter((row) => {
    const rowOrgName = row.organization || '';
    const rowOrgCode = (ORG_LOOKUP.get(rowOrgName)?.code || '').toLowerCase();
    return (myOrgCode && rowOrgCode === myOrgCode) || (myOrgName && rowOrgName === myOrgName);
  });

  state.ch1Rows = state.ch1Rows.filter((row) => {
    const rowOrgName = getCh1Org(row);
    const rowOrgCode = (row.org_code || ORG_LOOKUP.get(rowOrgName)?.code || '').toLowerCase();
    return (myOrgCode && rowOrgCode === myOrgCode) || (myOrgName && rowOrgName === myOrgName);
  });

  state.linkRows = state.linkRows.filter((row) => {
    const rowOrgCode = (row.org_code || '').toLowerCase();
    const rowOrgName = row.org_name || row.organization || '';
    return (myOrgCode && rowOrgCode === myOrgCode) || (myOrgName && rowOrgName === myOrgName);
  });

  state.orgProfiles = state.orgProfiles.filter((row) => {
    const rowOrgCode = (row.org_code || '').toLowerCase();
    const rowOrgName = row.org_name_th || row.display_name || '';
    return (myOrgCode && rowOrgCode === myOrgCode) || (myOrgName && rowOrgName === myOrgName);
  });
}

async function fetchAllSurveyResponses() {
  const pageSize = 1000;
  // Use ordering to ensure consistent pagination and leverage the composite index
  const countRes = await sb.from('survey_responses')
    .select('id', { count: 'exact', head: true })
    .order('submitted_at', { ascending: false, nullsFirst: false });

  if (countRes.error) {
    return { data: [], error: countRes.error };
  }

  const total = countRes.count || 0;
  if (total === 0) return { data: [], error: null };

  const ranges = [];
  for (let from = 0; from < total; from += pageSize) {
    ranges.push([from, Math.min(from + pageSize - 1, total - 1)]);
  }

  // Add ordering to each page query for consistent results and index usage
  const pageResults = await Promise.all(
    ranges.map(([from, to]) =>
      sb.from('survey_responses')
        .select(SURVEY_SELECT_FIELDS)
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .range(from, to)
    )
  );

  const failed = pageResults.find((res) => res.error);
  if (failed?.error) {
    return { data: [], error: failed.error };
  }

  const rows = pageResults.flatMap((res) => res.data || []);

  return { data: rows, error: null };
}

// ────────────────────────────────────────────────────────────────────────
// Progressive loading:
//   loadBackendCore()   → fast, enough to paint the dashboard (KPIs + trend)
//   loadBackendExtras() → heavy (ch1.form_data, org_form_links, credentials)
//   loadBackend()       → legacy wrapper: runs core then extras (for refresh)
// ────────────────────────────────────────────────────────────────────────

const _LOAD_TIMEOUT_MS = 10000;
const _LOAD_MAX_RETRIES = 1;

function _withTimeout(promise, ms = _LOAD_TIMEOUT_MS, label = 'เชื่อมต่อ') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(
      () => reject(new Error(`หมดเวลา${label} (${Math.round(ms/1000)}s)`)),
      ms
    )),
  ]);
}

// Exclude test/sandbox orgs from all admin calculations and displays
function _isTestOrgRow(row) {
  const code = (row.org_code || row.form_data?.org_code || '').toLowerCase();
  const name = (row.organization || row.org_name || row.org_name_th || row.agency_name || row.form_data?.agency_name || row.form_data?.organization || row.form_data?.org_name || '');
  return code === 'test-org' || name.includes('ทดสอบระบบ');
}

// Internal flags to track phase completion
state._coreLoaded = false;
state._extrasLoaded = false;

// Simple in-memory cache for frequently accessed data (5-minute TTL)
const _cache = new Map();
const _CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function _cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > _CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }
  return entry.data;
}

function _cacheSet(key, data) {
  _cache.set(key, { data, timestamp: Date.now() });
}

function _cacheClear() {
  _cache.clear();
}

async function loadBackendCore(retryCount = 0) {
  try {
    // Check cache for organizations and admin users (rarely change)
    const cachedOrgs = _cacheGet('organizations');
    const cachedUsers = _cacheGet('admin_user_roles');

    // Fire the 4 lightweight queries in parallel.
    // Ch1 is fetched WITHOUT form_data (JSONB blob) for speed — full ch1 comes in extras.
    const [surveyRes, ch1LiteRes, usersRows, orgRows] = await _withTimeout(Promise.all([
      fetchAllSurveyResponses(),
      sb.from('hrd_ch1_responses')
        .select(CH1_LITE_FIELDS)
        .order('submitted_at', { ascending: false, nullsFirst: false }),
      cachedUsers ? Promise.resolve(cachedUsers) : fetchAdminUserRoles(),
      cachedOrgs ? Promise.resolve(cachedOrgs) : fetchOrganizations(),
    ]));

    if (surveyRes.error) console.warn('loadBackendCore survey_responses:', surveyRes.error.message);
    if (ch1LiteRes.error) console.warn('loadBackendCore hrd_ch1_responses:', ch1LiteRes.error.message);

    state.surveyRows = (surveyRes.data || [])
      .filter((row) => !_isTestOrgRow(row))
      .map(normalizeSurveyRow)
      .sort((a, b) => new Date(getRowDate(b) || 0) - new Date(getRowDate(a) || 0));

    state.ch1Rows = (ch1LiteRes.data || [])
      .filter((row) => !_isTestOrgRow(row))
      .sort((a, b) => new Date(getRowDate(b) || 0) - new Date(getRowDate(a) || 0));

    state.userRows = usersRows || [];
    state.orgProfiles = (orgRows || []).filter((row) => {
      const code = String(row.org_code || '').toLowerCase();
      const name = row.org_name_th || row.display_name || '';
      return ADMIN_CANONICAL_ORG_CODES.has(code) || ADMIN_CANONICAL_ORG_NAMES.has(name);
    });

    // Cache organizations and admin users for future requests
    if (!cachedOrgs && orgRows) _cacheSet('organizations', orgRows);
    if (!cachedUsers && usersRows) _cacheSet('admin_user_roles', usersRows);

    refreshOrgDerivedState();
    scopeRowsForCurrentUser();
    refreshOrgDerivedState();

    state._coreLoaded = true;

    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = 'กำลังโหลดข้อมูลเพิ่มเติม...';
      statusEl.style.color = 'var(--tx2)';
    }

    return { loaded: true };
  } catch (error) {
    console.error('loadBackendCore error:', error);

    if (retryCount < _LOAD_MAX_RETRIES) {
      console.warn(`loadBackendCore: ลองใหม่ครั้งที่ ${retryCount + 1}/${_LOAD_MAX_RETRIES}`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      return loadBackendCore(retryCount + 1);
    }

    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = 'เชื่อมต่อล้มเหลว';
      statusEl.style.color = 'var(--D)';
    }

    // Populate empty state to prevent crashes
    state.surveyRows = state.surveyRows || [];
    state.ch1Rows = state.ch1Rows || [];
    state.userRows = state.userRows || [];
    state.orgProfiles = state.orgProfiles || [];
    state.linkRows = state.linkRows || [];
    state.orgHrCredentials = state.orgHrCredentials || [];
    refreshOrgDerivedState();

    return { error: error.message || 'Unknown error', loaded: false };
  }
}

async function loadBackendExtras(retryCount = 0) {
  try {
    // Heavier queries: full ch1 (with form_data), org_form_links, org_hr_credentials
    const [ch1FullRes, linksRes, orgHrCredRows] = await _withTimeout(Promise.all([
      sb.from('hrd_ch1_responses')
        .select(CH1_FULL_FIELDS)
        .order('submitted_at', { ascending: false, nullsFirst: false }),
      sb.from('org_form_links').select('*'),
      fetchOrgHrCredentials(),
    ]), 15000, 'โหลดข้อมูลเพิ่มเติม');

    if (ch1FullRes.error) console.warn('loadBackendExtras hrd_ch1_responses:', ch1FullRes.error.message);
    if (linksRes.error) console.warn('loadBackendExtras org_form_links:', linksRes.error.message);

    // Replace ch1Rows with the full rows (including form_data) so ch1 pages work properly.
    state.ch1Rows = (ch1FullRes.data || [])
      .filter((row) => !_isTestOrgRow(row))
      .sort((a, b) => new Date(getRowDate(b) || 0) - new Date(getRowDate(a) || 0));

    state.linkRows = linksRes.error ? [] : (linksRes.data || []);
    state.orgHrCredentials = orgHrCredRows || [];

    scopeRowsForCurrentUser();
    refreshOrgDerivedState();

    state._extrasLoaded = true;

    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = 'เชื่อมต่อสำเร็จ';
      statusEl.style.color = 'var(--A)';
    }

    return { loaded: true };
  } catch (error) {
    console.error('loadBackendExtras error:', error);

    if (retryCount < _LOAD_MAX_RETRIES) {
      console.warn(`loadBackendExtras: ลองใหม่ครั้งที่ ${retryCount + 1}/${_LOAD_MAX_RETRIES}`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      return loadBackendExtras(retryCount + 1);
    }

    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = 'เชื่อมต่อบางส่วน';
      statusEl.style.color = 'var(--W, #C08F2A)';
    }

    // Keep empty collections so pages don't crash
    state.linkRows = state.linkRows || [];
    state.orgHrCredentials = state.orgHrCredentials || [];

    return { error: error.message || 'Unknown error', loaded: false };
  }
}

// Legacy wrapper: preserves the original contract (refreshData, manual reload).
// Runs core then extras sequentially and returns a combined result.
async function loadBackend() {
  const coreRes = await loadBackendCore();
  if (coreRes && coreRes.error) return coreRes;
  const extrasRes = await loadBackendExtras();
  if (extrasRes && extrasRes.error) return extrasRes;
  return { loaded: true };
}

// Call this function after any data modifications to invalidate cache
function invalidateCache() {
  _cacheClear();
}

function summarizeOrgs() {
  // Defensive: ensure state is initialized
  const safeState = state || {};
  const safeSurveyRows = safeState.surveyRows || [];
  const safeCh1Rows = safeState.ch1Rows || [];
  
  const catalog = getOrgCatalog();
  if (!catalog || catalog.length === 0) {
    console.warn('summarizeOrgs: empty catalog, returning empty summary');
    return [];
  }
  
  const map = new Map(catalog.map((org) => [org.name, {
    ...org,
    wellbeingTotal: 0,
    wellbeingSubmitted: 0,
    draft: 0,
    flagged: 0,
    latestWb: null,
    ch1Count: 0,
    latestCh1: null,
    ch1CompletionPct: 0,
    ch1FilledFields: 0,
    ch1TotalFields: 0,
    typeOfficial: null,
  }]));
  const codeMap = new Map(catalog.map((org) => [String(org.code || '').toLowerCase(), org.name]));

  const countCompletedCh1Fields = (row) => {
    const source = row?.form_data && typeof row.form_data === 'object' ? row.form_data : row;
    if (!source || typeof source !== 'object') return { filled: 0, total: 0 };

    const ignoredKeys = new Set([
      'id', 'created_at', 'updated_at', 'submitted_at', 'timestamp', 'org_code', 'organization', 'org_name', 'agency_name', 'status', 'user_id', 'email',
      'respondent_email', 'form_version', 'ncd_ratio_pct', 'sick_leave_avg',
      'turnover_rate_2564', 'turnover_rate_2565', 'turnover_rate_2566', 'turnover_rate_2567', 'turnover_rate_2568',
      'google_sync_status', 'google_sync_attempts', 'google_synced_at', 'google_sheet_row_id', 'google_sync_error',
      'attachment_urls', 'attachments', 'files', 'file_urls'
    ]);

    let filled = 0;
    let total = 0;

    Object.entries(source).forEach(([key, value]) => {
      if (ignoredKeys.has(key)) return;
      total += 1;

      if (Array.isArray(value)) {
        if (value.length > 0) filled += 1;
        return;
      }

      if (value && typeof value === 'object') {
        if (Object.keys(value).length > 0) filled += 1;
        return;
      }

      if (value !== null && value !== undefined && String(value).trim() !== '') {
        filled += 1;
      }
    });

    return { filled, total };
  };

  safeSurveyRows.forEach((row) => {
    const org = map.get(row.organization);
    if (!org) return;
    org.wellbeingTotal += 1;
    if (row.is_draft) org.draft += 1;
    else org.wellbeingSubmitted += 1;
    if ((getPhq9(row) || 0) >= 15) org.flagged += 1;
    const date = getRowDate(row);
    if (date && (!org.latestWb || new Date(date) > new Date(org.latestWb))) org.latestWb = date;
  });

  safeCh1Rows.forEach((row) => {
    const orgName = getCh1Org(row);
    const rowCode = String(row.org_code || row.form_data?.org_code || '').toLowerCase();
    const resolvedName = map.has(orgName) ? orgName : (codeMap.get(rowCode) || orgName);
    const org = map.get(resolvedName);
    if (!org) return;
    org.ch1Count += 1;
    if (org.typeOfficial === null) {
      const v = row.form_data?.type_official ?? row.type_official;
      if (v != null && v !== '') org.typeOfficial = Number(v) || 0;
    }
    const date = getRowDate(row);
    if (date && (!org.latestCh1 || new Date(date) > new Date(org.latestCh1))) {
      const completion = countCompletedCh1Fields(row);
      org.latestCh1 = date;
      org.ch1FilledFields = completion.filled;
      org.ch1TotalFields = completion.total;
      org.ch1CompletionPct = completion.total > 0 ? (completion.filled / completion.total) * 100 : 0;
    }
  });

  return [...map.values()];
}


// ─── Populate Org Select Dropdowns (moved from admin.html inline script) ────
function populateOrgSelects() {
  const ids = ['exp-ch1-org', 'exp-wb-org', 'exp-cmp-org', 'c1data-org', 'c1sheet-org'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = `<option value="">ทุกองค์กร</option>${getOrgCatalog().map(org => `<option value="${esc(org.name)}">${esc(org.name)}</option>`).join('')}`;
    el.value = cur;
  });
  const ch1Sel = document.getElementById('ch1-link-org');
  if (ch1Sel) {
    ch1Sel.innerHTML = `<option value="">-- เลือกองค์กร --</option>${getOrgCatalog().map((org) => `<option value="${esc(org.name)}">${esc(org.name)}</option>`).join('')}`;
  }
  const cmpSel = document.getElementById('compare-add-select');
  if (cmpSel) {
    cmpSel.innerHTML = `<option value="">— เลือก —</option>${ORG_NAMES.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}`;
  }
  const viewerOrgSel = document.getElementById('viewer-org-select');
  if (viewerOrgSel) {
    const cur = viewerOrgSel.value;
    viewerOrgSel.innerHTML = `<option value="">— เลือกองค์กร —</option>${ORG_NAMES.map((name) => `<option value="${esc(name)}"${name===cur?' selected':''}>${esc(name)}</option>`).join('')}`;
  }
}
