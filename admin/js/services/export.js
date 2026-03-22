/* ========== ADMIN PORTAL — EXPORT SERVICE ========== */

function exportCurrentPage() {
  const pageId = visiblePageId();
  if (pageId === 'page-ch1-summary') {
    exportCh1SummaryReport();
    return;
  }
  if (pageId === 'page-form-wb') {
    exportRawTable();
    return;
  }
  if (pageId === 'page-users') {
    downloadWorkbook('admin_users.xlsx', 'Users', state.userRows);
    return;
  }
  if (pageId === 'page-links') {
    downloadWorkbook('org_form_links.xlsx', 'Links', state.linkRows.length ? state.linkRows : getOrgCatalog().map((org) => ({ organization: org.name, url: buildLinkUrl(org) })));
    return;
  }
  const summary = summarizeOrgs();
  downloadWorkbook('admin_org_summary.xlsx', 'Summary', summary.map((org) => ({
    organization: org.name,
    ministry: org.ministry,
    wellbeing_submitted: org.wellbeingSubmitted,
    wellbeing_draft: org.draft,
    high_phq9_count: org.flagged,
    ch1_count: org.ch1Count,
    latest_wellbeing: org.latestWb,
    latest_ch1: org.latestCh1,
  })));
}

function exportRawTable() {
  downloadWorkbook('wellbeing_raw_data.xlsx', 'Raw', state.rawFiltered.map((row, index) => ({
    index: index + 1,
    organization: row.organization,
    gender: row.gender,
    age: row.age,
    age_group: ageGroup(row),
    phq9: getPhq9(row),
    gad7: getGad7(row),
    burnout: getBurnout(row),
    engagement: getEngagement(row),
    wlb: getWlb(row),
    sleep: getSleep(row),
    exercise: getExercise(row),
    chronic: getChronic(row),
    job_satisfaction: getJobSat(row),
    submitted_at: row.submitted_at,
  })));
}

function exportCh1All() {
  if (!state.ch1Rows.length) { showToast('ยังไม่มีข้อมูล Ch1 ในระบบ', 'warn'); return; }
  const stripHtml = (s) => {
    if (s == null) return '';
    return String(s).replace(/<[^>]*>/g, '').replace(/📎 ดูไฟล์/g, '').trim();
  };
  const rows = state.ch1Rows.map((row, i) => {
    const obj = { '#': i + 1 };
    CH1_COLUMNS.forEach((col) => {
      let val = col.get(row);
      val = stripHtml(val);
      if (val === '—') val = '';
      obj[col.label] = val;
    });
    return obj;
  });
  downloadWorkbook('ch1_all_data.xlsx', 'Ch1_Raw', rows);
}

function exportCh1Filtered(orgFilter) {
  const rows = orgFilter ? state.ch1Rows.filter((r) => getCh1Org(r) === orgFilter) : state.ch1Rows;
  if (!rows.length) { showToast('ไม่มีข้อมูลสำหรับองค์กรที่เลือก','warn'); return; }
  downloadWorkbook(`ch1_${orgFilter || 'all'}.xlsx`, 'Ch1', rows.map((row, i) => ({
    index: i + 1, organization: getCh1Org(row), submitted_at: getRowDate(row),
    total_personnel: row.total_personnel || row.total_staff || row.form_data?.total_personnel,
    engagement_score: row.engagement_score || row.form_data?.engagement_score,
  })));
}

function exportWbFiltered(orgFilter) {
  const rows = orgFilter ? state.surveyRows.filter((r) => r.organization === orgFilter && !r.is_draft) : state.surveyRows.filter((r) => !r.is_draft);
  if (!rows.length) { showToast('ไม่มีข้อมูล Wellbeing สำหรับองค์กรที่เลือก','warn'); return; }
  downloadWorkbook(`wellbeing_${orgFilter || 'all'}.xlsx`, 'Wellbeing', rows.map((row, i) => ({
    index: i + 1, organization: row.organization, submitted_at: row.submitted_at,
    gender: row.gender, age_group: ageGroup(row),
    phq9: getPhq9(row), gad7: getGad7(row), burnout: getBurnout(row),
    engagement: getEngagement(row), wlb_score: getWlb(row),
  })));
}

function exportCompareReport() {
  const summary = summarizeOrgs();
  downloadWorkbook('compare_report.xlsx', 'Compare', summary.map((org) => ({
    organization: org.name, ministry: org.ministry,
    wellbeing_submitted: org.wellbeingSubmitted, wellbeing_draft: org.draft,
    high_phq9: org.flagged, ch1_count: org.ch1Count,
    latest_wellbeing: org.latestWb, latest_ch1: org.latestCh1,
  })));
}
