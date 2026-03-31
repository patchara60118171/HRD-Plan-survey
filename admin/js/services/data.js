/* ========== ADMIN PORTAL — DATA LOADING & ORG CATALOG ========== */

const ADMIN_CANONICAL_ORGS = [
  { code: 'nesdc', name: 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ' },
  { code: 'tpso', name: 'สำนักงานนโยบายและยุทธศาสตร์การค้า' },
  { code: 'dss', name: 'กรมวิทยาศาสตร์บริการ' },
  { code: 'dhss', name: 'กรมสนับสนุนบริการสุขภาพ' },
  { code: 'tmd', name: 'กรมอุตุนิยมวิทยา' },
  { code: 'dcp', name: 'กรมส่งเสริมวัฒนธรรม' },
  { code: 'dop', name: 'กรมคุมประพฤติ' },
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
      ministry: row.settings?.ministry || 'ไม่ระบุ',
      code: row.org_code || org.code,
      letter: row.settings?.salutation || 'ไม่ระบุ',
      email: row.settings?.saraban_email || row.contact_email || '',
      contact: row.settings?.coordinator_name || '',
      contactRole: row.settings?.coordinator_position || '',
      contactPhone: row.settings?.coordinator_contact_line || '',
      contactLine: row.settings?.coordinator_contact_line || '',
      contactEmail: row.settings?.coordinator_email || row.contact_email || '',
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

async function loadBackend(retryCount = 0) {
  const maxRetries = 2;
  
  try {
    const [surveyRes, ch1Res, linksRes, usersRows, orgRows, orgHrCredRows] = await Promise.all([
      sb.from('survey_responses').select('id,email,name,title,organization,gender,age,org_type,job,job_duration,bmi,bmi_category,is_draft,submitted_at,timestamp,tmhi_score,raw_responses'),
      sb.from('hrd_ch1_responses').select('*'),
      sb.from('org_form_links').select('*'),
      fetchAdminUserRoles(),
      fetchOrganizations(),
      fetchOrgHrCredentials(),
    ]);

    // Check for critical errors
    const criticalErrors = [];
    if (surveyRes.error && !surveyRes.data?.length) {
      criticalErrors.push('survey_responses: ' + surveyRes.error.message);
    }
    if (ch1Res.error && !ch1Res.data?.length) {
      criticalErrors.push('hrd_ch1_responses: ' + ch1Res.error.message);
    }
    if (usersRows === null || usersRows === undefined) {
      criticalErrors.push('users: ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    }

    // If critical errors exist and we haven't exceeded retries, try again
    if (criticalErrors.length > 0 && retryCount < maxRetries) {
      console.warn(`loadBackend: พบข้อผิดพลาด (${criticalErrors.join(', ')}), ลองใหม่ครั้งที่ ${retryCount + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Wait 1s, 2s
      return loadBackend(retryCount + 1);
    }

    // Log warnings but don't fail
    if (surveyRes.error) console.warn('loadBackend survey_responses:', surveyRes.error.message);
    if (ch1Res.error) console.warn('loadBackend hrd_ch1_responses:', ch1Res.error.message);

    // Exclude test/sandbox orgs from all admin calculations and displays
    const isTestOrgRow = (row) => {
      const code = (row.org_code || row.form_data?.org_code || '').toLowerCase();
      const name = (row.organization || row.org_name || row.org_name_th || row.agency_name || row.form_data?.agency_name || row.form_data?.organization || row.form_data?.org_name || '');
      return code === 'test-org' || name.includes('ทดสอบระบบ');
    };

    console.log('🔍 DEBUG surveyRes:', surveyRes);
    console.log('📊 Raw survey rows count:', (surveyRes.data || []).length);
    
    state.surveyRows = (surveyRes.data || [])
      .filter(row => !isTestOrgRow(row))
      .map(normalizeSurveyRow)
      .sort((a, b) => new Date(getRowDate(b) || 0) - new Date(getRowDate(a) || 0));
    
    console.log('✅ Filtered survey rows count:', state.surveyRows.length);
    console.log('📋 state.surveyRows:', state.surveyRows);
    
    state.ch1Rows = (ch1Res.data || [])
      .filter(row => !isTestOrgRow(row))
      .sort((a, b) => new Date(getRowDate(b) || 0) - new Date(getRowDate(a) || 0));
    console.log(`🏢 ch1Rows count (excl. test): ${state.ch1Rows.length}`);
    console.table(state.ch1Rows.map(r => ({
      id: String(r.id).slice(0,8),
      org_code: r.org_code,
      organization: r.organization,
      agency_name: r.form_data?.agency_name,
      getCh1Org: getCh1Org(r),
    })));
    state.linkRows = linksRes.error ? [] : (linksRes.data || []);
    state.userRows = usersRows || [];
    state.orgHrCredentials = orgHrCredRows || [];
    state.orgProfiles = (orgRows || []).filter((row) => {
      const code = String(row.org_code || '').toLowerCase();
      const name = row.org_name_th || row.display_name || '';
      return ADMIN_CANONICAL_ORG_CODES.has(code) || ADMIN_CANONICAL_ORG_NAMES.has(name);
    });
    
    refreshOrgDerivedState();
    scopeRowsForCurrentUser();
    refreshOrgDerivedState();
    
    // Update status indicator
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = 'เชื่อมต่อสำเร็จ';
      statusEl.style.color = 'var(--A)';
    }
    
  } catch (error) {
    console.error('loadBackend error:', error);
    
    if (retryCount < maxRetries) {
      console.warn(`loadBackend: ข้อผิดพลาดทั่วไป, ลองใหม่ครั้งที่ ${retryCount + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return loadBackend(retryCount + 1);
    }
    
    // Update status indicator
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = 'เชื่อมต่อล้มเหลว';
      statusEl.style.color = 'var(--D)';
    }
    
    // Still populate empty state to prevent crashes
    state.surveyRows = [];
    state.ch1Rows = [];
    state.linkRows = [];
    state.userRows = [];
    state.orgHrCredentials = [];
    state.orgProfiles = [];
    refreshOrgDerivedState();
    
    throw error;
  }
}

function summarizeOrgs() {
  const catalog = getOrgCatalog();
  const map = new Map(catalog.map((org) => [org.name, {
    ...org,
    wellbeingTotal: 0,
    wellbeingSubmitted: 0,
    draft: 0,
    flagged: 0,
    latestWb: null,
    ch1Count: 0,
    latestCh1: null,
  }]));
  const codeMap = new Map(catalog.map((org) => [String(org.code || '').toLowerCase(), org.name]));

  state.surveyRows.forEach((row) => {
    const org = map.get(row.organization);
    if (!org) return;
    org.wellbeingTotal += 1;
    if (row.is_draft) org.draft += 1;
    else org.wellbeingSubmitted += 1;
    if ((getPhq9(row) || 0) >= 15) org.flagged += 1;
    const date = getRowDate(row);
    if (date && (!org.latestWb || new Date(date) > new Date(org.latestWb))) org.latestWb = date;
  });

  state.ch1Rows.forEach((row) => {
    const orgName = getCh1Org(row);
    const rowCode = String(row.org_code || row.form_data?.org_code || '').toLowerCase();
    const resolvedName = map.has(orgName) ? orgName : (codeMap.get(rowCode) || orgName);
    const org = map.get(resolvedName);
    if (!org) return;
    org.ch1Count += 1;
    const date = getRowDate(row);
    if (date && (!org.latestCh1 || new Date(date) > new Date(org.latestCh1))) org.latestCh1 = date;
  });

  return [...map.values()];
}
