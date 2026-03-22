/* ========== ADMIN PORTAL — DATA LOADING & ORG CATALOG ========== */

function getOrgCatalog() {
  if (!state.orgProfiles.length) return ORG_META;
  return state.orgProfiles.map((row) => ({
    name: row.org_name_th,
    ministry: row.settings?.ministry || 'ไม่ระบุ',
    code: row.org_code || 'ORG',
    letter: row.settings?.salutation || 'ไม่ระบุ',
    email: row.settings?.saraban_email || row.contact_email || '',
    contact: row.settings?.coordinator_name || '',
    contactRole: row.settings?.coordinator_position || '',
    contactPhone: row.settings?.coordinator_contact_line || '',
    contactLine: row.settings?.coordinator_contact_line || '',
    contactEmail: row.settings?.coordinator_email || row.contact_email || '',
  }));
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

async function loadBackend() {
  const [surveyRes, ch1Res, linksRes, usersRows, orgRows, orgHrCredRows] = await Promise.all([
    sb.from('survey_responses').select('id,email,name,title,organization,gender,age,org_type,job,job_duration,bmi,bmi_category,is_draft,submitted_at,timestamp,tmhi_score,raw_responses'),
    sb.from('hrd_ch1_responses').select('*'),
    sb.from('org_form_links').select('*'),
    fetchAdminUserRoles(),
    fetchOrganizations(),
    fetchOrgHrCredentials(),
  ]);

  if (surveyRes.error) throw surveyRes.error;
  if (ch1Res.error) throw ch1Res.error;

  state.surveyRows = (surveyRes.data || [])
    .map(normalizeSurveyRow)
    .sort((a, b) => new Date(getRowDate(b) || 0) - new Date(getRowDate(a) || 0));
  state.ch1Rows = (ch1Res.data || [])
    .sort((a, b) => new Date(getRowDate(b) || 0) - new Date(getRowDate(a) || 0));
  state.linkRows = linksRes.error ? [] : (linksRes.data || []);
  state.userRows = usersRows || [];
  state.orgHrCredentials = orgHrCredRows || [];
  state.orgProfiles = orgRows || [];
  refreshOrgDerivedState();
  scopeRowsForCurrentUser();
  refreshOrgDerivedState();
}

function summarizeOrgs() {
  const map = new Map(getOrgCatalog().map((org) => [org.name, {
    ...org,
    wellbeingTotal: 0,
    wellbeingSubmitted: 0,
    draft: 0,
    flagged: 0,
    latestWb: null,
    ch1Count: 0,
    latestCh1: null,
  }]));

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
    const org = map.get(orgName);
    if (!org) return;
    org.ch1Count += 1;
    const date = getRowDate(row);
    if (date && (!org.latestCh1 || new Date(date) > new Date(org.latestCh1))) org.latestCh1 = date;
  });

  return [...map.values()];
}
