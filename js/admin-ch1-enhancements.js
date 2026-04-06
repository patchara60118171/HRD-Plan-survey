// ═══════════════════════════════════════════════
// ADMIN CH1 ENHANCEMENTS
// renderCh1Table, expCh1CSV, expCh1XLSX, clrCh1
// ═══════════════════════════════════════════════

function renderCh1Table() {
  const start = (ch1Page - 1) * CH1_PPG;
  const rows = ch1Filt.slice(start, start + CH1_PPG);
  const tb = el('c1-tb');
  if (!rows.length) {
    tb.innerHTML = `<tr><td colspan="35"><div class="emp"><div class="ei">📋</div><p>ไม่พบข้อมูล</p></div></td></tr>`;
    renderPag('c1', ch1Filt.length, ch1Page, CH1_PPG);
    return;
  }

  const supLabel = v => ({ full: 'ครบ', partial: 'บางส่วน', none: 'ไม่มี' }[v] || v || '—');
  const strLabel = v => (STRATEGIC_LABELS[v] || v || '—');
  const num = v => (v != null && v !== '') ? v : '—';
  const fmt = s => s ? new Date(s).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  tb.innerHTML = rows.map((r, i) => {
    const idx = start + i;
    return `<tr>
      <td style="color:var(--tx3);font-size:.8rem">${start + i + 1}</td>
      <td style="font-size:.82rem">${fmt(r.submitted_at)}</td>
      <td><code style="font-size:.78rem">${esc(r.org_code || '—')}</code></td>
      <td>${esc(r.organization || '—')}</td>
      <td style="text-align:right">${num(r.total_staff)}</td>
      <td style="text-align:right">${num(r.type_official)}</td>
      <td style="text-align:right">${num(r.type_employee)}</td>
      <td style="text-align:right">${num(r.type_contract)}</td>
      <td style="text-align:right">${num(r.age_u30)}</td>
      <td style="text-align:right">${num(r.age_31_40)}</td>
      <td style="text-align:right">${num(r.age_41_50)}</td>
      <td style="text-align:right">${num(r.age_51_60)}</td>
      <td style="text-align:right">${num(r.ncd_count)}</td>
      <td style="text-align:right">${num(r.ncd_ratio_pct)}</td>
      <td style="text-align:right">${num(r.disease_diabetes)}</td>
      <td style="text-align:right">${num(r.disease_hypertension)}</td>
      <td style="text-align:right">${num(r.disease_cardiovascular)}</td>
      <td style="text-align:right">${num(r.disease_kidney)}</td>
      <td style="text-align:right">${num(r.disease_liver)}</td>
      <td style="text-align:right">${num(r.disease_cancer)}</td>
      <td style="text-align:right">${num(r.disease_obesity)}</td>
      <td style="text-align:right">${num(r.sick_leave_days)}</td>
      <td style="text-align:right">${num(r.sick_leave_avg)}</td>
      <td style="text-align:right">${num(r.engagement_score)}</td>
      <td style="font-size:.8rem">${esc(supLabel(r.mentoring_system))}</td>
      <td style="font-size:.8rem">${esc(supLabel(r.job_rotation))}</td>
      <td style="font-size:.8rem">${esc(supLabel(r.idp_system))}</td>
      <td style="font-size:.8rem">${esc(supLabel(r.career_path_system))}</td>
      <td style="text-align:right">${num(r.training_hours)}</td>
      <td style="font-size:.8rem">${esc(strLabel(r.strategic_priority_rank1))}</td>
      <td style="font-size:.8rem">${esc(strLabel(r.strategic_priority_rank2))}</td>
      <td style="font-size:.8rem">${esc(strLabel(r.strategic_priority_rank3))}</td>
      <td style="display:flex;gap:.25rem;flex-wrap:wrap">
        <button class="btn bp bxs" onclick="downloadCh1PDF(${idx})" title="ดาวน์โหลด PDF รายบุคคล">📄 PDF</button>
      </td>
    </tr>`;
  }).join('');

  renderPag('c1', ch1Filt.length, ch1Page, CH1_PPG);
}

function clrCh1() {
  el('cof').value = '';
  el('cdf').value = '';
  el('cdt').value = '';
  filterCh1();
}

function downloadCh1PDF(index) {
  const data = ch1Filt[index];
  if (!data) { showToast('ไม่พบข้อมูล', 'error'); return; }
  generateCh1PDF(data);
}

function expCh1CSV() {
  if (!ch1Filt.length) { showToast('ไม่มีข้อมูล', 'warning'); return; }
  const headers = [
    '#', 'วันที่', 'org_code', 'หน่วยงาน', 'บุคลากรรวม',
    'ข้าราชการ', 'พนักงานราชการ', 'ลูกจ้าง',
    'อายุ≤30', 'อายุ31-40', 'อายุ41-50', 'อายุ51-60',
    'NCD รวม', 'NCD%',
    'เบาหวาน', 'ความดัน', 'หัวใจ', 'ไต', 'ตับ', 'มะเร็ง', 'อ้วน',
    'ลาป่วยรวม', 'ลาป่วยเฉลี่ย', 'Engagement',
    'พี่เลี้ยง', 'Job Rotation', 'IDP', 'Career Path', 'ชั่วโมงอบรม',
    'จุดเน้น1', 'จุดเน้น2', 'จุดเน้น3'
  ];
  const strLabel = v => (STRATEGIC_LABELS[v] || v || '');
  const rows = [headers.join(','), ...ch1Filt.map((r, i) => [
    i + 1,
    `"${r.submitted_at ? new Date(r.submitted_at).toLocaleString('th-TH') : ''}"`,
    `"${r.org_code || ''}"`, `"${r.organization || ''}"`,
    r.total_staff ?? '', r.type_official ?? '', r.type_employee ?? '', r.type_contract ?? '',
    r.age_u30 ?? '', r.age_31_40 ?? '', r.age_41_50 ?? '', r.age_51_60 ?? '',
    r.ncd_count ?? '', r.ncd_ratio_pct ?? '',
    r.disease_diabetes ?? '', r.disease_hypertension ?? '', r.disease_cardiovascular ?? '',
    r.disease_kidney ?? '', r.disease_liver ?? '', r.disease_cancer ?? '', r.disease_obesity ?? '',
    r.sick_leave_days ?? '', r.sick_leave_avg ?? '', r.engagement_score ?? '',
    `"${r.mentoring_system || ''}"`, `"${r.job_rotation || ''}"`,
    `"${r.idp_system || ''}"`, `"${r.career_path_system || ''}"`,
    r.training_hours ?? '',
    `"${strLabel(r.strategic_priority_rank1)}"`,
    `"${strLabel(r.strategic_priority_rank2)}"`,
    `"${strLabel(r.strategic_priority_rank3)}"`
  ].join(','))].join('\n');
  dlBlob(new Blob(['\uFEFF' + rows], { type: 'text/csv' }), 'hrd_ch1_' + today() + '.csv');
  showToast('Export CSV สำเร็จ ✓', 'success');
}

function expCh1XLSX() {
  if (!window.XLSX) { showToast('กำลังโหลด SheetJS...', 'info'); return; }
  if (!ch1Filt.length) { showToast('ไม่มีข้อมูล', 'warning'); return; }
  const strLabel = v => (STRATEGIC_LABELS[v] || v || '');
  const data = ch1Filt.map((r, i) => ({
    '#': i + 1,
    'วันที่': r.submitted_at ? new Date(r.submitted_at).toLocaleString('th-TH') : '',
    'org_code': r.org_code || '',
    'หน่วยงาน': r.organization || '',
    'บุคลากรรวม': r.total_staff ?? '',
    'ข้าราชการ': r.type_official ?? '',
    'พนักงานราชการ': r.type_employee ?? '',
    'ลูกจ้าง': r.type_contract ?? '',
    'อายุ≤30': r.age_u30 ?? '',
    'อายุ31-40': r.age_31_40 ?? '',
    'อายุ41-50': r.age_41_50 ?? '',
    'อายุ51-60': r.age_51_60 ?? '',
    'NCD รวม': r.ncd_count ?? '',
    'NCD%': r.ncd_ratio_pct ?? '',
    'เบาหวาน': r.disease_diabetes ?? '',
    'ความดัน': r.disease_hypertension ?? '',
    'หัวใจ': r.disease_cardiovascular ?? '',
    'ไต': r.disease_kidney ?? '',
    'ตับ': r.disease_liver ?? '',
    'มะเร็ง': r.disease_cancer ?? '',
    'อ้วน': r.disease_obesity ?? '',
    'ลาป่วยรวม': r.sick_leave_days ?? '',
    'ลาป่วยเฉลี่ย': r.sick_leave_avg ?? '',
    'Engagement': r.engagement_score ?? '',
    'พี่เลี้ยง': r.mentoring_system || '',
    'Job Rotation': r.job_rotation || '',
    'IDP': r.idp_system || '',
    'Career Path': r.career_path_system || '',
    'ชั่วโมงอบรม': r.training_hours ?? '',
    'จุดเน้น1': strLabel(r.strategic_priority_rank1),
    'จุดเน้น2': strLabel(r.strategic_priority_rank2),
    'จุดเน้น3': strLabel(r.strategic_priority_rank3)
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'HRD Ch1');
  XLSX.writeFile(wb, 'hrd_ch1_' + today() + '.xlsx');
  showToast('Export Excel สำเร็จ ✓', 'success');
}
