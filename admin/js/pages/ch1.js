/**
 * ch1.js — Page: CH1 Survey Data + Summary + PDF
 * Sprint 3C: Extracted from admin.html inline script
 * Depends on: config.js (state, ORG_NAMES, ORG_LOOKUP, sb), utils.js (esc, fmtDate, fmtNum, showToast, getCh1Org, getRowDate, ch1v)
 *             export.js (downloadWorkbook), links.js (renderMiniBars, renderTrendLine, renderTrendLines, renderCh1SummaryChart)
 */

// ─── renderCh1 ────────────────────────────────────────────────────────────────

function renderCh1(summary) {
  const responded = summary.filter((org) => org.ch1Count > 0);
  const orgCount = ORG_NAMES.length;
  const ctrl = document.getElementById('c1-ctrl');
  const stats = ctrl.querySelectorAll('.st-val');
  stats[0].textContent = fmtNum(responded.length);
  stats[1].textContent = fmtNum(orgCount - responded.length);
  stats[2].textContent = '5';
  ctrl.querySelector('.fc-head .badge').textContent = responded.length ? 'เชื่อมต่อแล้ว' : 'ยังไม่มีข้อมูล';

  const linkSelect = ctrl.querySelector('select');
  linkSelect.innerHTML = `<option value="">-- เลือกองค์กร --</option>${getOrgCatalog().map((org) => `<option value="${esc(org.name)}">${esc(org.name)}</option>`).join('')}`;
  linkSelect.onchange = () => {
    const selected = ORG_LOOKUP.get(linkSelect.value);
    const code = selected?.code || 'ORG';
    const codeBox = ctrl.querySelector('.code-box code');
    codeBox.textContent = `ch1.html?org=${code}`;
  };

  const ch1DataTbody = document.getElementById('c1-data-tbody') || document.querySelector('#c1-data tbody');
  if (ch1DataTbody) ch1DataTbody.innerHTML = state.ch1Rows.map((row, index) => `<tr>
    <td>${esc(getCh1Org(row))}</td>
    <td>${fmtNum(row.total_staff || row.total_personnel || row.form_data?.total_personnel)}</td>
    <td>${esc(row.form_completion || '5/5 ส่วน')}</td>
    <td>${fmtDate(getRowDate(row))}</td>
    <td class="td-act"><button class="btn b-blue" onclick="showCh1RowDetail(${index})">ดูละเอียด</button><button class="btn b-gray" onclick="showCh1PDF(${index})">📄 PDF</button></td>
  </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--tx3)">ยังไม่มีข้อมูล Ch1</td></tr>';

  renderCh1RawSheet();
  renderCh1Pdf();
}

// ─── renderCh1RawSheet ────────────────────────────────────────────────────────

function renderCh1RawSheet() {
  const thead = document.getElementById('c1-sheet-thead');
  const tbody = document.getElementById('c1-sheet-tbody');
  if (!thead || !tbody) return;

  thead.innerHTML = '<th style="position:sticky;left:0;background:var(--bg);z-index:3">#</th>' +
    CH1_COLUMNS.map((col) => `<th>${esc(col.label)}</th>`).join('');

  const rows = state.ch1Rows;
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="${CH1_COLUMNS.length + 1}" style="text-align:center;color:var(--tx3)">ยังไม่มีข้อมูล Ch1</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map((row, index) =>
    `<tr><td style="position:sticky;left:0;background:#F8FAFC;font-weight:600;z-index:1;border-right:1.5px solid var(--bdr)">${index + 1}</td>` +
    CH1_COLUMNS.map((col) => `<td>${col.get(row)}</td>`).join('') + '</tr>'
  ).join('');
}

// ─── renderCh1Pdf ─────────────────────────────────────────────────────────────

function renderCh1Pdf() {
  const tbody = document.getElementById('c1-pdf-tbody');
  if (!tbody) return;
  const orgSel = document.getElementById('c1pdf-org');
  if (orgSel) {
    const orgs = [...new Set(state.ch1Rows.map((r) => getCh1Org(r)).filter(Boolean))].sort();
    orgSel.innerHTML = '<option value="">ทุกองค์กร</option>' +
      orgs.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  }
  if (!state.ch1Rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--tx3)">ยังไม่มีข้อมูล Ch1</td></tr>';
    return;
  }
  tbody.innerHTML = state.ch1Rows.map((row, i) => `<tr data-org="${esc(getCh1Org(row))}">
    <td style="text-align:center;font-weight:600;color:var(--tx3)">${i + 1}</td>
    <td>${esc(getCh1Org(row))}</td>
    <td>${fmtDate(getRowDate(row), true)}</td>
    <td class="td-act">
      <button class="btn b-gray" onclick="showCh1RowDetail(${i})">📋 ดูรายละเอียด</button>
      <button class="btn b-blue" onclick="showCh1PDF(${i})">📄 ดู PDF</button>
    </td>
  </tr>`).join('');
}

// ─── filterCh1Pdf ─────────────────────────────────────────────────────────────

function filterCh1Pdf() {
  const search = (document.getElementById('c1pdf-search')?.value || '').toLowerCase();
  const org = document.getElementById('c1pdf-org')?.value || '';
  document.querySelectorAll('#c1-pdf-tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const rowOrg = tr.dataset.org || '';
    tr.style.display = (!search || text.includes(search)) && (!org || rowOrg === org) ? '' : 'none';
  });
}

// ─── renderCh1Summary ─────────────────────────────────────────────────────────

function renderCh1Summary() {
  const page = document.getElementById('page-ch1-summary');
  if (!page) return;

  const orgList = document.getElementById('ch1-org-list');
  if (orgList && !orgList.hasChildNodes()) {
    const orgs = [...new Set(state.ch1Rows.map((row) => getCh1Org(row)).filter(Boolean))].sort();
    orgList.innerHTML = orgs.map(org => `<label class="org-check-item"><input type="checkbox" value="${esc(org)}" checked onchange="ch1OrgCheckOne()"> <span>${esc(org)}</span></label>`).join('');
  }

  const rows = ch1VisibleRows();
  const selectedOrgs = ch1GetSelectedOrgs();
  const orgsInScope = [...new Set(rows.map((row) => getCh1Org(row)).filter(Boolean))];
  const totalStaff = ch1Sum(rows, ['total_staff', 'total_personnel']);
  const totalNcd = ch1Sum(rows, 'ncd_count');
  const ncdRatio = ch1Pct(totalNcd, totalStaff);
  const sickLeave = ch1Sum(rows, 'sick_leave_days');
  const burnoutAvg = ch1Avg(rows, 'mental_burnout');
  const engAvg = ch1Avg(rows, 'engagement_score');

  const sub = document.getElementById('ch1-summary-sub');
  if (sub) {
    sub.textContent = !selectedOrgs
      ? `สรุปข้อมูลที่กรอกแล้วทั้งหมด ${fmtNum(orgsInScope.length)} องค์กร จาก ${fmtNum(state.ch1Rows.length)} รายการ`
      : selectedOrgs.length === 1
        ? `สรุปเฉพาะองค์กร: ${selectedOrgs[0]}`
        : `สรุป ${selectedOrgs.length} องค์กรที่เลือก จาก ${fmtNum(state.ch1Rows.length)} รายการ`;
  }

  const setEl = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  setEl('ch1sum-kpi-orgs', !selectedOrgs ? fmtNum(orgsInScope.length) : selectedOrgs.length === 1 ? '1' : fmtNum(selectedOrgs.length));
  setEl('ch1sum-kpi-staff', totalStaff ? fmtNum(totalStaff) + ' คน' : '—');
  setEl('ch1sum-kpi-ncd', ncdRatio == null ? '—' : `${fmtNum(ncdRatio, 1)}%`);
  setEl('ch1sum-kpi-sick', sickLeave ? fmtNum(sickLeave) + ' วัน' : '—');
  setEl('ch1sum-kpi-burnout', burnoutAvg == null ? '—' : fmtNum(burnoutAvg, 1));
  setEl('ch1sum-kpi-eng', engAvg == null ? '—' : fmtNum(engAvg, 1));

  renderCh1SummaryChart(document.getElementById('ch1sum-age-chart'), [
    { label: '≤30 ปี', value: ch1Sum(rows, ['age_u30', 'age_under30']) },
    { label: '31–40 ปี', value: ch1Sum(rows, 'age_31_40') },
    { label: '41–50 ปี', value: ch1Sum(rows, 'age_41_50') },
    { label: '51–60 ปี', value: ch1Sum(rows, 'age_51_60') },
  ], (item) => `${fmtNum(item.value)} คน`);

  renderCh1SummaryChart(document.getElementById('ch1sum-service-chart'), [
    { label: '<1 ปี', value: ch1Sum(rows, 'service_u1') },
    { label: '1–5 ปี', value: ch1Sum(rows, 'service_1_5') },
    { label: '6–10 ปี', value: ch1Sum(rows, 'service_6_10') },
    { label: '11–15 ปี', value: ch1Sum(rows, 'service_11_15') },
    { label: '16–20 ปี', value: ch1Sum(rows, 'service_16_20') },
    { label: '21–25 ปี', value: ch1Sum(rows, 'service_21_25') },
    { label: '26–30 ปี', value: ch1Sum(rows, 'service_26_30') },
    { label: '>30 ปี', value: ch1Sum(rows, 'service_over30') },
  ], (item) => `${fmtNum(item.value)} คน`);

  renderCh1SummaryChart(document.getElementById('ch1sum-position-chart'), [
    { label: 'O1', value: ch1Sum(rows, 'pos_o1') },
    { label: 'O2', value: ch1Sum(rows, 'pos_o2') },
    { label: 'O3', value: ch1Sum(rows, 'pos_o3') },
    { label: 'O4', value: ch1Sum(rows, 'pos_o4') },
    { label: 'K1', value: ch1Sum(rows, 'pos_k1') },
    { label: 'K2', value: ch1Sum(rows, 'pos_k2') },
    { label: 'K3', value: ch1Sum(rows, 'pos_k3') },
    { label: 'K4', value: ch1Sum(rows, 'pos_k4') },
    { label: 'K5', value: ch1Sum(rows, 'pos_k5') },
    { label: 'M1', value: ch1Sum(rows, 'pos_m1') },
    { label: 'M2', value: ch1Sum(rows, 'pos_m2') },
    { label: 'S1', value: ch1Sum(rows, 'pos_s1') },
    { label: 'S2', value: ch1Sum(rows, 'pos_s2') },
  ], (item) => `${fmtNum(item.value)} คน`);

  renderTrendLine(document.getElementById('ch1sum-turnover-chart'), [
    { label: '2564', value: ch1AvgRate(rows, '2564') || 0 },
    { label: '2565', value: ch1AvgRate(rows, '2565') || 0 },
    { label: '2566', value: ch1AvgRate(rows, '2566') || 0 },
    { label: '2567', value: ch1AvgRate(rows, '2567') || 0 },
    { label: '2568', value: ch1AvgRate(rows, '2568') || 0 },
  ], { unit: '%' });

  const years = ['2564', '2565', '2566', '2567', '2568'];
  renderTrendLines(document.getElementById('ch1sum-headcount-trend-chart'), years, [
    { name: 'ต้นปี (คน)', color: '#0F4C81', values: years.map((y) => ch1Avg(rows, `begin_${y}`) || 0) },
    { name: 'ปลายปี (คน)', color: '#1E8E3E', values: years.map((y) => ch1Avg(rows, `end_${y}`) || 0) },
    { name: 'ลาออก/โอนย้าย (คน)', color: '#C2410C', values: years.map((y) => ch1Avg(rows, `leave_${y}`) || 0) },
  ]);

  renderTrendLines(document.getElementById('ch1sum-eng-trend-chart'), years, [
    { name: 'Engagement (คะแนน)', color: '#7C3AED', values: [
      ch1Avg(rows, 'engagement_score_2564') || 0,
      ch1Avg(rows, 'engagement_score_2565') || 0,
      ch1Avg(rows, 'engagement_score_2566') || 0,
      ch1Avg(rows, 'engagement_score_2567') || 0,
      ch1Avg(rows, 'engagement_score_2568') || 0,
    ] },
  ]);

  renderCh1SummaryChart(document.getElementById('ch1sum-ncd-chart'), [
    { label: 'เบาหวาน', value: ch1Sum(rows, 'disease_diabetes') },
    { label: 'ความดัน', value: ch1Sum(rows, 'disease_hypertension') },
    { label: 'หัวใจ/หลอดเลือด', value: ch1Sum(rows, 'disease_cardiovascular') },
    { label: 'ไต', value: ch1Sum(rows, 'disease_kidney') },
    { label: 'อ้วน/น้ำหนักเกิน', value: ch1Sum(rows, 'disease_obesity') },
    { label: 'NCD รวม', value: totalNcd },
  ], (item) => `${fmtNum(item.value)} คน`);

  renderCh1SummaryChart(document.getElementById('ch1sum-mental-chart'), [
    { label: 'Burnout', value: burnoutAvg || 0 },
    { label: 'Engagement', value: engAvg || 0 },
    { label: 'ลาป่วยเฉลี่ย', value: ch1Avg(rows, 'sick_leave_avg') || 0 },
    { label: 'ผู้ใช้คลินิก', value: ch1Sum(rows, 'clinic_users_per_year') || 0 },
  ], (item) => `${fmtNum(item.value, 1)}`);

  // Top-3 Priority Rankings
  const priorityEl = document.getElementById('ch1sum-priority-ranking');
  if (priorityEl) {
    const priorityCounts = {};
    rows.forEach(row => {
      ['strategic_priority_rank1', 'strategic_priority_rank2', 'strategic_priority_rank3'].forEach((field, idx) => {
        const val = (ch1v(row, field) || '').toString().trim();
        if (val && val !== '—' && val !== '-') {
          if (!priorityCounts[val]) priorityCounts[val] = { topic: val, rank1: 0, rank2: 0, rank3: 0, total: 0, isNew: false };
          if (idx === 0) priorityCounts[val].rank1++;
          else if (idx === 1) priorityCounts[val].rank2++;
          else priorityCounts[val].rank3++;
          priorityCounts[val].total++;
        }
      });
      const other = (ch1v(row, 'strategic_priority_other') || '').toString().trim();
      if (other && other !== '—' && other !== '-') {
        if (!priorityCounts[other]) priorityCounts[other] = { topic: other, rank1: 0, rank2: 0, rank3: 0, total: 0, isNew: true };
        priorityCounts[other].total++;
        priorityCounts[other].isNew = true;
      }
    });
    const sorted = Object.values(priorityCounts).sort((a, b) => b.total - a.total || b.rank1 - a.rank1);
    if (sorted.length) {
      priorityEl.innerHTML = sorted.map((item, i) => `<tr>
        <td style="width:32px;text-align:center;color:var(--tx3);font-size:11px">${i + 1}</td>
        <td style="font-size:12px;color:var(--tx);font-weight:500;padding-left:8px">${esc(item.topic)}${item.isNew ? ' <span style="background:#FEF3C7;color:#92400E;padding:1px 6px;border-radius:99px;font-size:9.5px;font-weight:600">เสนอใหม่</span>' : ''}</td>
        <td style="width:56px;text-align:center;font-size:12px;font-weight:600;color:var(--P)">${item.rank1 || '—'}</td>
        <td style="width:56px;text-align:center;font-size:12px;color:var(--tx2)">${item.rank2 || '—'}</td>
        <td style="width:56px;text-align:center;font-size:12px;color:var(--tx3)">${item.rank3 || '—'}</td>
        <td style="width:50px;text-align:center;font-size:12.5px;font-weight:700;color:var(--tx)">${item.total}</td>
      </tr>`).join('');
    } else {
      priorityEl.innerHTML = '<tr><td colspan="6" class="summary-empty">ยังไม่มีข้อมูลจุดเน้น</td></tr>';
    }
  }

  const sectionsEl = document.getElementById('ch1-summary-sections');
  if (!sectionsEl) return;

  const questionSummaries = buildCh1QuestionSummaries(rows);
  const visibleSummaries = questionSummaries.filter((item) => !ch1IsEmptyQuestionSummary(item));
  const hiddenCount = questionSummaries.length - visibleSummaries.length;
  const summaryRows = visibleSummaries.map((item, index) => `<tr>
      <td style="width:52px;color:var(--tx3);font-size:11px">${index + 1}</td>
      <td class="summary-label" style="width:34%">${esc(item.question)}</td>
      <td>
        <div class="summary-value">${esc(item.value)}</div>
        <div class="summary-note">${esc(item.note)}</div>
      </td>
    </tr>`).join('');

  sectionsEl.innerHTML = `<div class="card summary-section-card" style="grid-column:1/-1">
    <div class="card-head"><h3>สรุปรายข้อคำถาม Ch1</h3><span class="section-badge">แสดง ${fmtNum(visibleSummaries.length)} / ${fmtNum(questionSummaries.length)} ข้อ</span></div>
    <div style="padding:0 14px 10px;color:var(--tx3);font-size:11.5px">ซ่อนข้อที่ยังไม่มีข้อมูลแล้ว ${fmtNum(hiddenCount)} ข้อ</div>
    <div class="card-body" style="max-height:640px;overflow:auto">
      <table class="summary-table"><tbody>${summaryRows || '<tr><td class="summary-empty" colspan="3">ยังไม่มีข้อมูล</td></tr>'}</tbody></table>
    </div>
  </div>`;
}

// ─── filterCh1Data ────────────────────────────────────────────────────────────

function filterCh1Data() {
  const search = (document.getElementById('c1data-search')?.value || '').toLowerCase();
  const org = document.getElementById('c1data-org')?.value || '';
  document.querySelectorAll('#c1-data tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const matchSearch = !search || text.includes(search);
    const matchOrg = !org || tr.cells[0]?.textContent?.trim() === org;
    tr.style.display = (matchSearch && matchOrg) ? '' : 'none';
  });
}

// ─── filterCh1Sheet ───────────────────────────────────────────────────────────

function filterCh1Sheet() {
  const search = (document.getElementById('c1sheet-search')?.value || '').toLowerCase();
  const org = document.getElementById('c1sheet-org')?.value || '';
  document.querySelectorAll('#c1-sheet tbody tr').forEach((tr) => {
    const text = tr.textContent.toLowerCase();
    const matchSearch = !search || text.includes(search);
    const matchOrg = !org || tr.cells[1]?.textContent?.trim() === org;
    tr.style.display = (matchSearch && matchOrg) ? '' : 'none';
  });
}

// ─── exportCh1SummaryReport ───────────────────────────────────────────────────

function exportCh1SummaryReport() {
  const rows = ch1VisibleRows();
  if (!rows.length) {
    showToast('ยังไม่มีข้อมูล Ch1 ในระบบ', 'warn');
    return;
  }

  const exportRows = buildCh1QuestionSummaries(rows).map((item, index) => ({
    index: index + 1,
    question: item.question,
    summary: item.value,
    detail: item.note,
  }));

  const selOrgs = ch1GetSelectedOrgs();
  downloadWorkbook(`ch1_summary_${selOrgs ? selOrgs.join('_') : 'all'}.xlsx`, 'Ch1_Summary', exportRows);
  showToast('Export สรุป Ch1 สำเร็จ ✅', 'success');
}

// ─── exportCh1SummaryPdf ──────────────────────────────────────────────────────

function exportCh1SummaryPdf() {
  const page = document.getElementById('page-ch1-summary');
  if (!page) {
    showToast('ไม่พบหน้าสรุป Ch1', 'warn');
    return;
  }
  const rows = ch1VisibleRows();
  if (!rows.length) {
    showToast('ยังไม่มีข้อมูลสำหรับ Export PDF', 'warn');
    return;
  }

  const selOrgs = ch1GetSelectedOrgs();
  const selectedOrg = !selOrgs ? 'ทุกองค์กร' : selOrgs.length === 1 ? selOrgs[0] : `${selOrgs.length} องค์กร`;
  const printable = `
    <h1>สรุปภาพรวม Ch1 (${esc(selectedOrg)})</h1>
    ${page.querySelector('.page-sub')?.outerHTML || ''}
    ${page.querySelector('.kpi-grid')?.outerHTML || ''}
    ${page.querySelector('.summary-sections')?.outerHTML || ''}
    ${document.getElementById('ch1-summary-sections')?.outerHTML || ''}
  `;

  const html = `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8" />
    <title>Ch1 Summary PDF</title>
    <style>
      @page { size: A4 landscape; margin: 10mm; }
      body{font-family:Segoe UI,Tahoma,sans-serif;color:#1F2D3D;margin:0}
      h1{margin:0 0 6px;font-size:20px;color:#0F4C81}
      .page-sub{margin-bottom:12px;font-size:12px;color:#52677F}
      .kpi-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:12px}
      .kpi{border:1px solid #d9e2ef;border-radius:8px;padding:10px;background:#fff}
      .kpi-val{font-size:20px;font-weight:700;color:#0f4c81}
      .kpi-label{font-size:12px;font-weight:600}
      .kpi-sub{font-size:11px;color:#6b7f95}
      .summary-sections{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .card{border:1px solid #d9e2ef;border-radius:8px;break-inside:avoid;background:#fff}
      .card-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e8eef6;padding:9px 12px}
      .card-head h3{font-size:14px;margin:0;color:#1f2d3d}
      .section-badge{font-size:10px;background:#edf2f7;color:#51657d;padding:2px 8px;border-radius:99px}
      .card-body{padding:10px 12px}
      .summary-table{width:100%;border-collapse:collapse}
      .summary-table td{padding:6px 0;border-bottom:1px solid #eef3f9;vertical-align:top;font-size:11px}
      .summary-table tr:last-child td{border-bottom:none}
      .summary-mini-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
      .summary-mini-label{width:96px;font-size:10.5px;color:#5b7088}
      .summary-mini-bar{flex:1;height:7px;background:#edf2f7;border-radius:99px;overflow:hidden}
      .summary-mini-bar span{display:block;height:100%;background:#0F4C81;border-radius:99px}
      .summary-mini-val{width:64px;text-align:right;font-size:10.5px;font-weight:600;color:#445b74}
      .trend-tooltip{display:none !important}
      svg{max-width:100%;height:auto}
    </style>
  </head><body>${printable}<script>window.onload=function(){window.print()}<\/script></body></html>`;

  const w = window.open('', '_blank', 'width=1360,height=900');
  if (w) {
    w.document.write(html);
    w.document.close();
    showToast('เปิดหน้า PDF แล้ว (เลือก Save as PDF ได้ทันที)', 'success');
  } else {
    showToast('กรุณาอนุญาต Popup เพื่อ Export PDF', 'warn');
  }
}

// ─── showCh1RowDetail ─────────────────────────────────────────────────────────

function showCh1RowDetail(index) {
  const row = state.ch1Rows[index];
  if (!row) return;
  const fd = row.form_data || row;
  const org = getCh1Org(row);
  const dateStr = fmtDate(getRowDate(row), true);

  const v = (k) => { const val = fd[k] ?? row[k]; return (val !== undefined && val !== null) ? val : ''; };
  const n = (k, d) => fmtNum(parseFloat(v(k)) || 0, d !== undefined ? d : 0);
  const s = (k) => esc(v(k) || '—');
  const yn = (k) => { const val = v(k); if (val === true || val === 1 || val === 'true' || val === '1' || val === 'yes') return '✓ มี'; if (val === false || val === 0 || val === 'false' || val === '0' || val === 'no') return '✗ ไม่มี'; return val ? esc(String(val)) : '—'; };
  const fmtSupport = (k) => { const val = v(k); if (val === 'full') return '✅ มีตามแผน'; if (val === 'partial') return '⚠️ มีไม่ครบตามแผน'; if (val === 'none') return '❌ ไม่มี'; return val ? esc(String(val)) : '—'; };

  const histRows = ['2564','2565','2566','2567','2568'].map((yr) => {
    const bg = v(`begin_count_${yr}`); const end = v(`end_count_${yr}`); const lv = v(`leave_count_${yr}`); const rt = v(`turnover_rate_${yr}`);
    if (!bg && !end && !lv && !rt) return '';
    return `<tr><td>${yr}</td><td>${fmtNum(parseFloat(bg)||0)}</td><td>${fmtNum(parseFloat(end)||0)}</td><td>${fmtNum(parseFloat(lv)||0)}</td><td>${fmtNum(parseFloat(rt)||0,1)}%</td></tr>`;
  }).filter(Boolean).join('') || '<tr><td colspan="5" style="color:#9CA3AF;text-align:center">—</td></tr>';

  const reportContent = `
<div style="font-family:'Sarabun',sans-serif;color:#1A2433;font-size:13px;line-height:1.75">
<style>#ch1-detail-inner h1{font-size:19px;color:#0F4C81;margin-bottom:4px}#ch1-detail-inner h2{font-size:13.5px;color:#0F4C81;margin:20px 0 6px;border-bottom:2px solid #E8F1FB;padding-bottom:5px;font-weight:700}#ch1-detail-inner h3{font-size:12px;color:#374151;margin:12px 0 4px;font-weight:600}#ch1-detail-inner .meta{font-size:11.5px;color:#6B7280;margin-bottom:18px}#ch1-detail-inner table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:12px}#ch1-detail-inner th,#ch1-detail-inner td{padding:6px 10px;border:1px solid #D8DCE3;text-align:left}#ch1-detail-inner th{background:#F4F6F9;font-weight:600;color:#374151;width:44%}#ch1-detail-inner td.c{text-align:center;width:auto}#ch1-detail-inner .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}#ch1-detail-inner .kpi{background:#F4F6F9;border:1px solid #D8DCE3;border-radius:8px;padding:9px 12px;text-align:center}#ch1-detail-inner .kpi-val{font-size:20px;font-weight:700;color:#0F4C81}#ch1-detail-inner .kpi-label{font-size:10.5px;color:#6B7280;margin-top:2px}#ch1-detail-inner .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}</style>
<h1>📋 รายงาน Ch1 — ข้อมูลสุขภาวะองค์กร</h1>
<div class="meta">องค์กร: <b>${org}</b> &nbsp;|&nbsp; วันที่ส่ง: <b>${dateStr}</b> &nbsp;|&nbsp; ระบบ Admin Portal Well-being Survey</div>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-val">${n('total_personnel')}</div><div class="kpi-label">บุคลากรทั้งหมด (คน)</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('mental_burnout'))||0,1)}%</div><div class="kpi-label">Burnout Rate</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('engagement_score'))||0,1)}</div><div class="kpi-label">Engagement Score</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('sick_leave_days'))||0,1)}</div><div class="kpi-label">วันลาป่วยเฉลี่ย/คน/ปี</div></div>
</div>
<h2>ส่วนที่ 1: โครงสร้างบุคลากร</h2>
<div class="two-col">
  <div>
    <h3>จำนวนและช่วงอายุ</h3>
    <table>
      <tr><th>จำนวนบุคลากรทั้งหมด</th><td>${n('total_personnel')} คน</td></tr>
      <tr><th>อายุ ≤ 30 ปี</th><td>${n('age_under30')} คน</td></tr>
      <tr><th>อายุ 31–40 ปี</th><td>${n('age_31_40')} คน</td></tr>
      <tr><th>อายุ 41–50 ปี</th><td>${n('age_41_50')} คน</td></tr>
      <tr><th>อายุ 51–60 ปี</th><td>${n('age_51_60')} คน</td></tr>
    </table>
  </div>
  <div>
    <h3>อายุราชการ (ปี)</h3>
    <table>
      <tr><th>น้อยกว่า 1 ปี</th><td>${n('service_u1')} คน</td></tr>
      <tr><th>1–5 ปี</th><td>${n('service_1_5')} คน</td></tr>
      <tr><th>6–10 ปี</th><td>${n('service_6_10')} คน</td></tr>
      <tr><th>11–15 ปี</th><td>${n('service_11_15')} คน</td></tr>
      <tr><th>16–20 ปี</th><td>${n('service_16_20')} คน</td></tr>
      <tr><th>21–25 ปี</th><td>${n('service_21_25')} คน</td></tr>
      <tr><th>26–30 ปี</th><td>${n('service_26_30')} คน</td></tr>
      <tr><th>มากกว่า 30 ปี</th><td>${n('service_over30')} คน</td></tr>
    </table>
  </div>
</div>
<div class="two-col">
  <div>
    <h3>ระดับตำแหน่ง</h3>
    <table>
      <tr><th colspan="2" style="background:#E8F1FB;color:#0F4C81">ประเภททั่วไป (O)</th></tr>
      <tr><th>ปฏิบัติงาน (O1)</th><td>${n('pos_o1')} คน</td></tr>
      <tr><th>ชำนาญงาน (O2)</th><td>${n('pos_o2')} คน</td></tr>
      <tr><th>อาวุโส (O3)</th><td>${n('pos_o3')} คน</td></tr>
      <tr><th>ทักษะพิเศษ (O4)</th><td>${n('pos_o4')} คน</td></tr>
      <tr><th colspan="2" style="background:#E8F1FB;color:#0F4C81">ประเภทวิชาการ (K)</th></tr>
      <tr><th>ปฏิบัติการ (K1)</th><td>${n('pos_k1')} คน</td></tr>
      <tr><th>ชำนาญการ (K2)</th><td>${n('pos_k2')} คน</td></tr>
      <tr><th>ชำนาญการพิเศษ (K3)</th><td>${n('pos_k3')} คน</td></tr>
      <tr><th>เชี่ยวชาญ (K4)</th><td>${n('pos_k4')} คน</td></tr>
      <tr><th>ทรงคุณวุฒิ (K5)</th><td>${n('pos_k5')} คน</td></tr>
      <tr><th colspan="2" style="background:#E8F1FB;color:#0F4C81">ประเภทอำนวยการ (M)</th></tr>
      <tr><th>ระดับต้น (M1)</th><td>${n('pos_m1')} คน</td></tr>
      <tr><th>ระดับสูง (M2)</th><td>${n('pos_m2')} คน</td></tr>
      <tr><th colspan="2" style="background:#E8F1FB;color:#0F4C81">ประเภทบริหาร (S)</th></tr>
      <tr><th>ระดับต้น (S1)</th><td>${n('pos_s1')} คน</td></tr>
      <tr><th>ระดับสูง (S2)</th><td>${n('pos_s2')} คน</td></tr>
    </table>
  </div>
  <div>
    <h3>ประเภทบุคลากร</h3>
    <table>
      <tr><th>ข้าราชการ</th><td>${n('type_official')} คน</td></tr>
      <tr><th>พนักงานราชการ</th><td>${n('type_employee')} คน</td></tr>
      <tr><th>ลูกจ้าง/จ้างเหมา</th><td>${n('type_contract')} คน</td></tr>
      <tr><th>อื่นๆ</th><td>${n('type_other')} คน</td></tr>
    </table>
  </div>
</div>
<h3>อัตราการลาออก/โอนย้าย</h3>
<table>
  <tr><th>จำนวนลาออก</th><td>${n('turnover_count')} คน</td></tr>
  <tr><th>อัตราการลาออก</th><td>${fmtNum(parseFloat(v('turnover_rate'))||0,2)}%</td></tr>
  <tr><th>จำนวนโอนย้าย</th><td>${n('transfer_count')} คน</td></tr>
</table>
${histRows !== '<tr><td colspan="5" style="color:#9CA3AF;text-align:center">—</td></tr>' ? `
<h3>ประวัติอัตราการลาออกรายปี</h3>
<table>
  <thead><tr><th style="width:auto">ปี</th><th class="c">ต้นปี</th><th class="c">ปลายปี</th><th class="c">ลาออก</th><th class="c">อัตรา %</th></tr></thead>
  <tbody>${histRows}</tbody>
</table>` : ''}
<h2>ส่วนที่ 2: บริบทและนโยบาย</h2>
<table>
  <tr><th>นโยบายที่เกี่ยวข้อง</th><td>${s('related_policies')}</td></tr>
  <tr><th>บริบทและความท้าทาย</th><td>${s('context_challenges')}</td></tr>
</table>
<h2>ส่วนที่ 3: สุขภาวะบุคลากร</h2>
<div class="two-col">
  <div>
    <h3>โรค NCD</h3>
    <table>
      <tr><th>โรคเบาหวาน</th><td>${n('ncd_diabetes')} คน</td></tr>
      <tr><th>โรคความดันโลหิตสูง</th><td>${n('ncd_hypertension')} คน</td></tr>
      <tr><th>โรคหัวใจและหลอดเลือด</th><td>${n('disease_cardiovascular')} คน</td></tr>
      <tr><th>โรคไต</th><td>${n('disease_kidney')} คน</td></tr>
      <tr><th>โรคตับ</th><td>${n('disease_liver')} คน</td></tr>
      <tr><th>มะเร็ง</th><td>${n('disease_cancer')} คน</td></tr>
      <tr><th>โรคอ้วน</th><td>${n('disease_obesity')} คน</td></tr>
      <tr><th>โรคอื่นๆ (จำนวน)</th><td>${n('disease_other_count')} คน</td></tr>
      ${v('disease_other_detail') ? `<tr><th>โรคอื่นๆ (รายละเอียด)</th><td>${s('disease_other_detail')}</td></tr>` : ''}
    </table>
  </div>
  <div>
    <h3>สุขภาพจิตและการลา</h3>
    <table>
      <tr><th>วันลาป่วยเฉลี่ย/คน/ปี</th><td>${fmtNum(parseFloat(v('sick_leave_days'))||0,1)} วัน</td></tr>
      <tr><th>วันลาป่วยเฉลี่ย (รายละเอียด)</th><td>${fmtNum(parseFloat(v('sick_leave_avg'))||0,1)} วัน</td></tr>
      <tr><th>ภาวะเครียด</th><td>${fmtNum(parseFloat(v('mental_stress'))||0,1)}%</td></tr>
      <tr><th>ภาวะวิตกกังวล</th><td>${fmtNum(parseFloat(v('mental_anxiety'))||0,1)}%</td></tr>
      <tr><th>ปัญหาการนอนหลับ</th><td>${fmtNum(parseFloat(v('mental_sleep'))||0,1)}%</td></tr>
      <tr><th>ภาวะซึมเศร้า</th><td>${fmtNum(parseFloat(v('mental_depression'))||0,1)}%</td></tr>
      <tr><th>ภาวะหมดไฟ (Burnout)</th><td>${fmtNum(parseFloat(v('mental_burnout'))||0,1)}%</td></tr>
    </table>
    <h3>ข้อมูลคลินิก</h3>
    <table>
      <tr><th>ผู้ใช้บริการคลินิก/ปี</th><td>${n('clinic_users_per_year')} คน</td></tr>
      <tr><th>อาการที่พบบ่อย</th><td>${s('clinic_top_symptoms')}</td></tr>
      <tr><th>ยาที่สั่งจ่ายบ่อย</th><td>${s('clinic_top_medications')}</td></tr>
    </table>
  </div>
</div>
<h2>ส่วนที่ 4: ระบบการบริหารและพัฒนาบุคลากร</h2>
<div class="two-col">
  <div>
    <h3>ระบบ Engagement</h3>
    <table>
      <tr><th>Engagement Score (ปัจจุบัน)</th><td>${fmtNum(parseFloat(v('engagement_score'))||0,1)} / 100</td></tr>
      ${['2568','2567','2566','2565','2564'].map((yr) => { const sc = v(`engagement_score_${yr}`); return sc ? `<tr><th>Engagement ปี ${yr}</th><td>${fmtNum(parseFloat(sc)||0,1)}</td></tr>` : ''; }).filter(Boolean).join('')}
      ${v('engagement_low_areas') ? `<tr><th>ด้านที่คะแนนต่ำ</th><td>${s('engagement_low_areas')}</td></tr>` : ''}
    </table>
  </div>
  <div>
    <h3>ระบบพัฒนาบุคลากร</h3>
    <table>
      <tr><th>ระบบพี่เลี้ยง (Mentoring)</th><td>${fmtSupport('mentoring_system')}</td></tr>
      <tr><th>หมุนเวียนงาน (Job Rotation)</th><td>${fmtSupport('job_rotation')}</td></tr>
      <tr><th>แผนพัฒนารายบุคคล (IDP)</th><td>${fmtSupport('idp_system')}</td></tr>
      <tr><th>เส้นทางความก้าวหน้า (Career Path)</th><td>${fmtSupport('career_path_system')}</td></tr>
      <tr><th>ชั่วโมงฝึกอบรมเฉลี่ย/คน/ปี</th><td>${fmtNum(parseFloat(v('training_hours'))||0,1)} ชั่วโมง</td></tr>
      <tr><th>สภาพแวดล้อมการทำงาน (Ergonomics)</th><td>${s('ergonomics_status')}</td></tr>
    </table>
  </div>
</div>
<h2>ส่วนที่ 5: ทิศทางและเป้าหมายสุขภาวะ</h2>
<table>
  <tr><th>ประเด็นสุขภาวะสำคัญ</th><td>${s('strategic_priorities')}</td></tr>
  <tr><th>อันดับ 1</th><td>${s('strategic_priority_rank1')}</td></tr>
  <tr><th>อันดับ 2</th><td>${s('strategic_priority_rank2')}</td></tr>
  <tr><th>อันดับ 3</th><td>${s('strategic_priority_rank3')}</td></tr>
  <tr><th>Feedback ชุดมาตรการ</th><td>${s('intervention_packages_feedback')}</td></tr>
  <tr><th>ผลลัพธ์แผน HRD ที่คาดหวัง</th><td>${s('hrd_plan_results')}</td></tr>
</table>
</div>`;

  const existing = document.getElementById('ch1-detail-modal');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'ch1-detail-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:20px;overflow-y:auto';
  overlay.innerHTML = `<div id="ch1-detail-inner" style="background:#fff;border-radius:16px;padding:28px 32px;max-width:920px;width:100%;margin:auto;box-shadow:0 24px 60px rgba(0,0,0,.25)">
    ${reportContent}
    <div style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end;border-top:1px solid #E5E7EB;padding-top:14px">
      <button class="btn b-blue" onclick="showCh1PDF(${index})">📄 พิมพ์/ดู PDF</button>
      <button class="btn b-gray" onclick="document.getElementById('ch1-detail-modal').remove()">✕ ปิด</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ─── showCh1PDF ───────────────────────────────────────────────────────────────

function showCh1PDF(index) {
  const row = state.ch1Rows[index];
  if (!row) { showToast('ไม่พบข้อมูลในตำแหน่งนี้', 'warn'); return; }
  const fd = row.form_data || row;
  const org = getCh1Org(row);
  const dateStr = fmtDate(getRowDate(row), true);

  const v = (k) => { const val = fd[k] ?? row[k]; return (val !== undefined && val !== null) ? val : ''; };
  const n = (k, d) => fmtNum(parseFloat(v(k)) || 0, d !== undefined ? d : 0);
  const s = (k) => esc(v(k) || '—');
  const yn = (k) => { const val = v(k); if (val === true || val === 1 || val === 'true' || val === '1' || val === 'yes') return '✓ มี'; if (val === false || val === 0 || val === 'false' || val === '0' || val === 'no') return '✗ ไม่มี'; return val ? esc(String(val)) : '—'; };
  const fmtSupport = (k) => { const val = v(k); if (val === 'full') return '✅ มีตามแผน'; if (val === 'partial') return '⚠️ มีไม่ครบตามแผน'; if (val === 'none') return '❌ ไม่มี'; return val ? esc(String(val)) : '—'; };

  const histRows = ['2564','2565','2566','2567','2568'].map((yr) => {
    const bg = v(`begin_count_${yr}`); const end = v(`end_count_${yr}`); const lv = v(`leave_count_${yr}`); const rt = v(`turnover_rate_${yr}`);
    if (!bg && !end && !lv && !rt) return '';
    return `<tr><td>${yr}</td><td>${fmtNum(parseFloat(bg)||0)}</td><td>${fmtNum(parseFloat(end)||0)}</td><td>${fmtNum(parseFloat(lv)||0)}</td><td>${fmtNum(parseFloat(rt)||0,1)}%</td></tr>`;
  }).filter(Boolean).join('') || '<tr><td colspan="5" style="color:#9CA3AF;text-align:center">—</td></tr>';

  const pdfHtml = `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">
<title>Ch1 Report — ${org}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body{font-family:'Sarabun',sans-serif;margin:28px 36px;color:#1A2433;font-size:13px;line-height:1.75}
  h1{font-size:19px;color:#0F4C81;margin-bottom:4px}
  h2{font-size:13.5px;color:#0F4C81;margin:20px 0 6px;border-bottom:2px solid #E8F1FB;padding-bottom:5px;font-weight:700}
  h3{font-size:12px;color:#374151;margin:12px 0 4px;font-weight:600}
  .meta{font-size:11.5px;color:#6B7280;margin-bottom:18px}
  table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:12px}
  th,td{padding:6px 10px;border:1px solid #D8DCE3;text-align:left}
  th{background:#F4F6F9;font-weight:600;color:#374151;width:44%}
  td.c{text-align:center;width:auto}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .kpi{background:#F4F6F9;border:1px solid #D8DCE3;border-radius:8px;padding:9px 12px;text-align:center}
  .kpi-val{font-size:20px;font-weight:700;color:#0F4C81}
  .kpi-label{font-size:10.5px;color:#6B7280;margin-top:2px}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .footer{margin-top:28px;font-size:10.5px;color:#9CA3AF;border-top:1px solid #E5E7EB;padding-top:8px}
  @media print{body{margin:14px 20px}h2{page-break-after:avoid}}
</style>
</head><body>
<h1>📋 รายงาน Ch1 — ข้อมูลสุขภาวะองค์กร</h1>
<div class="meta">องค์กร: <b>${org}</b> &nbsp;|&nbsp; วันที่ส่ง: <b>${dateStr}</b> &nbsp;|&nbsp; ระบบ Admin Portal Well-being Survey</div>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-val">${n('total_personnel')}</div><div class="kpi-label">บุคลากรทั้งหมด (คน)</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('mental_burnout'))||0,1)}%</div><div class="kpi-label">Burnout Rate</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('engagement_score'))||0,1)}</div><div class="kpi-label">Engagement Score</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('sick_leave_days'))||0,1)}</div><div class="kpi-label">วันลาป่วยเฉลี่ย/คน/ปี</div></div>
</div>
<h2>ส่วนที่ 1: โครงสร้างบุคลากร</h2>
<div class="two-col">
  <div>
    <h3>จำนวนและช่วงอายุ</h3>
    <table>
      <tr><th>จำนวนบุคลากรทั้งหมด</th><td>${n('total_personnel')} คน</td></tr>
      <tr><th>อายุ ≤ 30 ปี</th><td>${n('age_under30')} คน</td></tr>
      <tr><th>อายุ 31–40 ปี</th><td>${n('age_31_40')} คน</td></tr>
      <tr><th>อายุ 41–50 ปี</th><td>${n('age_41_50')} คน</td></tr>
      <tr><th>อายุ 51–60 ปี</th><td>${n('age_51_60')} คน</td></tr>
    </table>
  </div>
  <div>
    <h3>อายุราชการ (ปี)</h3>
    <table>
      <tr><th>น้อยกว่า 1 ปี</th><td>${n('service_u1')} คน</td></tr>
      <tr><th>1–5 ปี</th><td>${n('service_1_5')} คน</td></tr>
      <tr><th>6–10 ปี</th><td>${n('service_6_10')} คน</td></tr>
      <tr><th>11–15 ปี</th><td>${n('service_11_15')} คน</td></tr>
      <tr><th>16–20 ปี</th><td>${n('service_16_20')} คน</td></tr>
      <tr><th>21–25 ปี</th><td>${n('service_21_25')} คน</td></tr>
      <tr><th>26–30 ปี</th><td>${n('service_26_30')} คน</td></tr>
      <tr><th>มากกว่า 30 ปี</th><td>${n('service_over30')} คน</td></tr>
    </table>
  </div>
</div>
<div class="two-col">
  <div>
    <h3>ระดับตำแหน่ง</h3>
    <table>
      <tr><th colspan="2" style="background:#E8F1FB;color:#0F4C81">ประเภททั่วไป (O)</th></tr>
      <tr><th>ปฏิบัติงาน (O1)</th><td>${n('pos_o1')} คน</td></tr>
      <tr><th>ชำนาญงาน (O2)</th><td>${n('pos_o2')} คน</td></tr>
      <tr><th>อาวุโส (O3)</th><td>${n('pos_o3')} คน</td></tr>
      <tr><th>ทักษะพิเศษ (O4)</th><td>${n('pos_o4')} คน</td></tr>
      <tr><th colspan="2" style="background:#E8F1FB;color:#0F4C81">ประเภทวิชาการ (K)</th></tr>
      <tr><th>ปฏิบัติการ (K1)</th><td>${n('pos_k1')} คน</td></tr>
      <tr><th>ชำนาญการ (K2)</th><td>${n('pos_k2')} คน</td></tr>
      <tr><th>ชำนาญการพิเศษ (K3)</th><td>${n('pos_k3')} คน</td></tr>
      <tr><th>เชี่ยวชาญ (K4)</th><td>${n('pos_k4')} คน</td></tr>
      <tr><th>ทรงคุณวุฒิ (K5)</th><td>${n('pos_k5')} คน</td></tr>
      <tr><th colspan="2" style="background:#E8F1FB;color:#0F4C81">ประเภทอำนวยการ (M)</th></tr>
      <tr><th>ระดับต้น (M1)</th><td>${n('pos_m1')} คน</td></tr>
      <tr><th>ระดับสูง (M2)</th><td>${n('pos_m2')} คน</td></tr>
      <tr><th colspan="2" style="background:#E8F1FB;color:#0F4C81">ประเภทบริหาร (S)</th></tr>
      <tr><th>ระดับต้น (S1)</th><td>${n('pos_s1')} คน</td></tr>
      <tr><th>ระดับสูง (S2)</th><td>${n('pos_s2')} คน</td></tr>
    </table>
  </div>
  <div>
    <h3>ประเภทบุคลากร</h3>
    <table>
      <tr><th>ข้าราชการ</th><td>${n('type_official')} คน</td></tr>
      <tr><th>พนักงานราชการ</th><td>${n('type_employee')} คน</td></tr>
      <tr><th>ลูกจ้าง/จ้างเหมา</th><td>${n('type_contract')} คน</td></tr>
      <tr><th>อื่นๆ</th><td>${n('type_other')} คน</td></tr>
    </table>
  </div>
</div>
<h3>อัตราการลาออก/โอนย้าย</h3>
<table>
  <tr><th>จำนวนลาออก</th><td>${n('turnover_count')} คน</td></tr>
  <tr><th>อัตราการลาออก</th><td>${fmtNum(parseFloat(v('turnover_rate'))||0,2)}%</td></tr>
  <tr><th>จำนวนโอนย้าย</th><td>${n('transfer_count')} คน</td></tr>
</table>
${histRows !== '<tr><td colspan="5" style="color:#9CA3AF;text-align:center">—</td></tr>' ? `
<h3>ประวัติอัตราการลาออกรายปี</h3>
<table>
  <thead><tr><th style="width:auto">ปี</th><th class="c">ต้นปี</th><th class="c">ปลายปี</th><th class="c">ลาออก</th><th class="c">อัตรา %</th></tr></thead>
  <tbody>${histRows}</tbody>
</table>` : ''}
<h2>ส่วนที่ 2: บริบทและนโยบาย</h2>
<table>
  <tr><th>นโยบายที่เกี่ยวข้อง</th><td>${s('related_policies')}</td></tr>
  <tr><th>บริบทและความท้าทาย</th><td>${s('context_challenges')}</td></tr>
</table>
<h2>ส่วนที่ 3: สุขภาวะบุคลากร</h2>
<div class="two-col">
  <div>
    <h3>โรค NCD</h3>
    <table>
      <tr><th>โรคเบาหวาน</th><td>${n('ncd_diabetes')} คน</td></tr>
      <tr><th>โรคความดันโลหิตสูง</th><td>${n('ncd_hypertension')} คน</td></tr>
      <tr><th>โรคหัวใจและหลอดเลือด</th><td>${n('disease_cardiovascular')} คน</td></tr>
      <tr><th>โรคไต</th><td>${n('disease_kidney')} คน</td></tr>
      <tr><th>โรคตับ</th><td>${n('disease_liver')} คน</td></tr>
      <tr><th>มะเร็ง</th><td>${n('disease_cancer')} คน</td></tr>
      <tr><th>โรคอ้วน</th><td>${n('disease_obesity')} คน</td></tr>
      <tr><th>โรคอื่นๆ (จำนวน)</th><td>${n('disease_other_count')} คน</td></tr>
      ${v('disease_other_detail') ? `<tr><th>โรคอื่นๆ (รายละเอียด)</th><td>${s('disease_other_detail')}</td></tr>` : ''}
    </table>
  </div>
  <div>
    <h3>สุขภาพจิตและการลา</h3>
    <table>
      <tr><th>วันลาป่วยเฉลี่ย/คน/ปี</th><td>${fmtNum(parseFloat(v('sick_leave_days'))||0,1)} วัน</td></tr>
      <tr><th>วันลาป่วยเฉลี่ย (รายละเอียด)</th><td>${fmtNum(parseFloat(v('sick_leave_avg'))||0,1)} วัน</td></tr>
      <tr><th>ภาวะเครียด</th><td>${fmtNum(parseFloat(v('mental_stress'))||0,1)}%</td></tr>
      <tr><th>ภาวะวิตกกังวล</th><td>${fmtNum(parseFloat(v('mental_anxiety'))||0,1)}%</td></tr>
      <tr><th>ปัญหาการนอนหลับ</th><td>${fmtNum(parseFloat(v('mental_sleep'))||0,1)}%</td></tr>
      <tr><th>ภาวะซึมเศร้า</th><td>${fmtNum(parseFloat(v('mental_depression'))||0,1)}%</td></tr>
      <tr><th>ภาวะหมดไฟ (Burnout)</th><td>${fmtNum(parseFloat(v('mental_burnout'))||0,1)}%</td></tr>
    </table>
    <h3>ข้อมูลคลินิก</h3>
    <table>
      <tr><th>ผู้ใช้บริการคลินิก/ปี</th><td>${n('clinic_users_per_year')} คน</td></tr>
      <tr><th>อาการที่พบบ่อย</th><td>${s('clinic_top_symptoms')}</td></tr>
      <tr><th>ยาที่สั่งจ่ายบ่อย</th><td>${s('clinic_top_medications')}</td></tr>
    </table>
  </div>
</div>
<h2>ส่วนที่ 4: ระบบการบริหารและพัฒนาบุคลากร</h2>
<div class="two-col">
  <div>
    <h3>ระบบ Engagement</h3>
    <table>
      <tr><th>Engagement Score (ปัจจุบัน)</th><td>${fmtNum(parseFloat(v('engagement_score'))||0,1)} / 100</td></tr>
      ${['2568','2567','2566','2565','2564'].map((yr) => { const sc = v(`engagement_score_${yr}`); return sc ? `<tr><th>Engagement ปี ${yr}</th><td>${fmtNum(parseFloat(sc)||0,1)}</td></tr>` : ''; }).filter(Boolean).join('')}
      ${v('engagement_low_areas') ? `<tr><th>ด้านที่คะแนนต่ำ</th><td>${s('engagement_low_areas')}</td></tr>` : ''}
    </table>
  </div>
  <div>
    <h3>ระบบพัฒนาบุคลากร</h3>
    <table>
      <tr><th>ระบบพี่เลี้ยง (Mentoring)</th><td>${fmtSupport('mentoring_system')}</td></tr>
      <tr><th>หมุนเวียนงาน (Job Rotation)</th><td>${fmtSupport('job_rotation')}</td></tr>
      <tr><th>แผนพัฒนารายบุคคล (IDP)</th><td>${fmtSupport('idp_system')}</td></tr>
      <tr><th>เส้นทางความก้าวหน้า (Career Path)</th><td>${fmtSupport('career_path_system')}</td></tr>
      <tr><th>ชั่วโมงฝึกอบรมเฉลี่ย/คน/ปี</th><td>${fmtNum(parseFloat(v('training_hours'))||0,1)} ชั่วโมง</td></tr>
      <tr><th>สภาพแวดล้อมการทำงาน (Ergonomics)</th><td>${s('ergonomics_status')}</td></tr>
    </table>
  </div>
</div>
<h2>ส่วนที่ 5: ทิศทางและเป้าหมายสุขภาวะ</h2>
<table>
  <tr><th>ประเด็นสุขภาวะสำคัญ</th><td>${s('strategic_priorities')}</td></tr>
  <tr><th>อันดับ 1</th><td>${s('strategic_priority_rank1')}</td></tr>
  <tr><th>อันดับ 2</th><td>${s('strategic_priority_rank2')}</td></tr>
  <tr><th>อันดับ 3</th><td>${s('strategic_priority_rank3')}</td></tr>
  <tr><th>Feedback ชุดมาตรการ</th><td>${s('intervention_packages_feedback')}</td></tr>
  <tr><th>ผลลัพธ์แผน HRD ที่คาดหวัง</th><td>${s('hrd_plan_results')}</td></tr>
</table>
<div class="footer">พิมพ์เมื่อ: ${new Date().toLocaleDateString('th-TH',{year:'numeric',month:'long',day:'numeric'})} &nbsp;|&nbsp; ระบบ Admin Portal Well-being Survey</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`;
  const w = window.open('', '_blank', 'width=960,height=780');
  if (w) { w.document.write(pdfHtml); w.document.close(); }
  else showToast('กรุณาอนุญาต Popup เพื่อดู PDF', 'warn');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ch1v(row, key) { return row.form_data?.[key] ?? row[key]; }

function ch1FileLink(url) {
  if (!url) return '—';
  return `<a href="${esc(url)}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline;white-space:nowrap">📎 ดูไฟล์</a>`;
}

function ch1Rate(row, yr) {
  const stored = ch1v(row, `rate_${yr}`);
  if (stored != null && stored !== '') return fmtNum(parseFloat(stored), 2) + '%';
  const b = parseFloat(ch1v(row, `begin_${yr}`)), e = parseFloat(ch1v(row, `end_${yr}`)), l = parseFloat(ch1v(row, `leave_${yr}`));
  if (!isNaN(b) && !isNaN(e) && !isNaN(l) && (b + e) > 0) return fmtNum((l / ((b + e) / 2)) * 100, 2) + '%';
  return '—';
}

function resetCh1SummaryFilter() {
  const allCb = document.querySelector('#ch1-org-dropdown > label input[type="checkbox"]');
  if (allCb) allCb.checked = true;
  document.querySelectorAll('#ch1-org-list input[type="checkbox"]').forEach(cb => cb.checked = true);
  ch1UpdateOrgLabel();
  renderCh1Summary();
}

function updateCh1Link() {
  const sel = document.getElementById('ch1-link-org');
  const code = document.getElementById('ch1-link-code');
  if (!sel || !code) return;
  const org = ORG_LOOKUP.get(sel.value);
  code.textContent = `ch1.html?org=${org?.code || sel.value || 'ORG'}`;
}

function copyCh1Link() {
  const code = document.getElementById('ch1-link-code')?.textContent || '';
  const full = SURVEY_BASE_URL + '/' + code;
  navigator.clipboard.writeText(full).then(() => showToast('คัดลอกลิงก์แล้ว: ' + full));
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

// ─── CH1 Org Multi-Select Helpers ─────────────────────────────────────────────

function ch1ToggleOrgDropdown() {
  const dd = document.getElementById('ch1-org-dropdown');
  if (dd) dd.classList.toggle('show');
}
function ch1OrgCheckAll(allCb) {
  document.querySelectorAll('#ch1-org-list input[type="checkbox"]').forEach(cb => cb.checked = allCb.checked);
  ch1UpdateOrgLabel();
  renderCh1Summary();
}
function ch1OrgCheckOne() {
  const boxes = [...document.querySelectorAll('#ch1-org-list input[type="checkbox"]')];
  const allCb = document.querySelector('#ch1-org-dropdown > label input[type="checkbox"]');
  if (allCb) allCb.checked = boxes.length > 0 && boxes.every(cb => cb.checked);
  ch1UpdateOrgLabel();
  renderCh1Summary();
}
function ch1UpdateOrgLabel() {
  const btn = document.getElementById('ch1-org-toggle');
  if (!btn) return;
  const sel = ch1GetSelectedOrgs();
  if (!sel) btn.textContent = 'ทุกองค์กร ▾';
  else if (sel.length === 0) btn.textContent = '(ไม่ได้เลือก) ▾';
  else if (sel.length === 1) btn.textContent = sel[0] + ' ▾';
  else btn.textContent = sel.length + ' องค์กร ▾';
}
function ch1GetSelectedOrgs() {
  const allCb = document.querySelector('#ch1-org-dropdown > label input[type="checkbox"]');
  if (allCb && allCb.checked) return null;
  return [...document.querySelectorAll('#ch1-org-list input[type="checkbox"]:checked')].map(cb => cb.value);
}

function ch1VisibleRows() {
  const sel = ch1GetSelectedOrgs();
  if (!sel) return state.ch1Rows;
  if (!sel.length) return [];
  const orgSet = new Set(sel);
  return state.ch1Rows.filter(row => orgSet.has(getCh1Org(row)));
}

// ─── CH1 Summary Calculation Helpers ──────────────────────────────────────────

function ch1ToNumber(row, fields) {
  const list = Array.isArray(fields) ? fields : [fields];
  for (const field of list) {
    const value = ch1v(row, field);
    if (value === null || value === undefined || value === '') continue;
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return null;
}

function ch1Sum(rows, fields) {
  return rows.reduce((sum, row) => sum + (ch1ToNumber(row, fields) || 0), 0);
}

function ch1Avg(rows, fields) {
  const values = rows.map((row) => ch1ToNumber(row, fields)).filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ch1RateNum(row, year) {
  const raw = ch1Rate(row, year);
  if (!raw || raw === '—') return null;
  const num = Number(String(raw).replace('%', ''));
  return Number.isNaN(num) ? null : num;
}

function ch1AvgRate(rows, year) {
  const values = rows.map((row) => ch1RateNum(row, year)).filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ch1Pct(num, den) {
  if (!den) return null;
  return (num / den) * 100;
}

function ch1ShortText(value, maxLen = 90) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '—';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

function ch1TextSummary(rows, field) {
  const values = rows
    .map((row) => ch1v(row, field))
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value ?? '').trim())
    .filter(Boolean);
  if (!values.length) return { value: 'ยังไม่มีข้อมูล', note: '—' };
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const summary = top.map(([text, count]) => `${ch1ShortText(text, 34)}${count > 1 ? ` (${count})` : ''}`).join(' · ');
  return { value: `${fmtNum(values.length)} รายการ / ${fmtNum(rows.length)} องค์กร`, note: `ตัวอย่าง: ${summary}` };
}

function ch1FileSummary(rows, field) {
  const count = rows.filter((row) => !!ch1v(row, field)).length;
  return { value: `${fmtNum(count)} / ${fmtNum(rows.length)} องค์กร`, note: count ? 'มีไฟล์แนบพร้อมใช้งาน' : 'ยังไม่มีไฟล์แนบ' };
}

function ch1MetricSummary(rows, item) {
  const unit = item.unit || '';
  if (item.type === 'sum') {
    const total = ch1Sum(rows, item.fields || item.field);
    return { value: `${fmtNum(total)}${unit ? ` ${unit}` : ''}`, note: `รวมจาก ${fmtNum(rows.length)} องค์กร` };
  }
  if (item.type === 'avg') {
    const avg = ch1Avg(rows, item.fields || item.field);
    return { value: avg == null ? '—' : `${fmtNum(avg, item.digits ?? 1)}${unit ? ` ${unit}` : ''}`, note: avg == null ? 'ยังไม่มีข้อมูล' : `เฉลี่ยจาก ${fmtNum(rows.length)} องค์กร` };
  }
  if (item.type === 'rate') {
    const avg = ch1AvgRate(rows, item.year);
    return { value: avg == null ? '—' : `${fmtNum(avg, 1)}%`, note: avg == null ? 'ยังไม่มีข้อมูล' : `ค่าเฉลี่ยอัตราออกปี ${item.year}` };
  }
  if (item.type === 'ratio') {
    const value = item.calc ? item.calc(rows) : null;
    return { value: value == null ? '—' : `${fmtNum(value, item.digits ?? 1)}%`, note: value == null ? 'ยังไม่มีข้อมูล' : item.note || 'คำนวณจากข้อมูลทั้งหมด' };
  }
  if (item.type === 'text') return ch1TextSummary(rows, item.field);
  if (item.type === 'file') return ch1FileSummary(rows, item.field);
  return { value: '—', note: '—' };
}

function ch1DecodeHtml(value) {
  const div = document.createElement('div');
  div.innerHTML = String(value ?? '');
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

function ch1NumericFromText(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text || text === '—') return null;
  const cleaned = text.replace(/,/g, '').replace(/%/g, '').trim();
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function ch1FileFieldFromColumn(col) {
  if (col.key === '_strategy_file') return ['strategy_file_url'];
  if (col.key === '_orgstruct_file') return ['org_structure_file_url'];
  if (col.key === '_hrd_file') return ['hrd_plan_file_url', 'hrd_plan_url'];
  return null;
}

function ch1TopText(values, limit = 3) {
  if (!values.length) return '—';
  const counts = new Map();
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text, count]) => `${ch1ShortText(text, 38)}${count > 1 ? ` (${count})` : ''}`)
    .join(' · ');
}

function ch1ColumnSummary(rows, col) {
  const fileFields = ch1FileFieldFromColumn(col);
  if (fileFields) {
    const fileValues = rows.map((row) => fileFields.map((f) => ch1v(row, f)).find(Boolean)).filter(Boolean).map((v) => String(v));
    return {
      question: col.label,
      value: `${fmtNum(fileValues.length)} / ${fmtNum(rows.length)} องค์กร`,
      note: fileValues.length ? `ตัวอย่างไฟล์: ${ch1TopText(fileValues.map((v) => v.split('/').pop() || v), 2)}` : 'ยังไม่มีไฟล์แนบ',
    };
  }
  const rawValues = rows.map((row) => ch1DecodeHtml(col.get(row))).filter((v) => v && v !== '—');
  if (!rawValues.length) return { question: col.label, value: 'ยังไม่มีข้อมูล', note: '—' };
  const numericValues = rawValues.map(ch1NumericFromText).filter((v) => Number.isFinite(v));
  const numericEnough = numericValues.length >= Math.max(2, Math.floor(rawValues.length * 0.7));
  if (numericEnough) {
    const total = numericValues.reduce((s, v) => s + v, 0);
    const avg = numericValues.reduce((s, v) => s + v, 0) / numericValues.length;
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const isPct = col.label.includes('(%)') || col.label.includes('อัตรา');
    const suffix = isPct ? '%' : '';
    return {
      question: col.label,
      value: `รวม ${fmtNum(total, 1)}${suffix} · เฉลี่ย ${fmtNum(avg, 1)}${suffix}`,
      note: `ต่ำสุด ${fmtNum(min, 1)}${suffix} · สูงสุด ${fmtNum(max, 1)}${suffix} · กรอก ${fmtNum(rawValues.length)}/${fmtNum(rows.length)} องค์กร`,
    };
  }
  return {
    question: col.label,
    value: `กรอก ${fmtNum(rawValues.length)}/${fmtNum(rows.length)} องค์กร`,
    note: `พบบ่อย: ${ch1TopText(rawValues)}`,
  };
}

function buildCh1QuestionSummaries(rows) {
  const excluded = new Set(['_org', 'submitted_at', '_email']);
  return CH1_COLUMNS.filter((col) => !excluded.has(col.key)).map((col) => ch1ColumnSummary(rows, col));
}

function ch1IsEmptyQuestionSummary(item) {
  const value = String(item?.value || '').trim();
  if (!value || value === 'ยังไม่มีข้อมูล' || value === '—') return true;
  if (/^กรอก\s*0\s*\/\s*\d+\s*องค์กร$/.test(value)) return true;
  if (/^0\s*\/\s*\d+\s*องค์กร$/.test(value)) return true;
  return false;
}

// ─── Chart Helpers ────────────────────────────────────────────────────────────

function renderMiniBars(el, items) {
  if (!el) return;
  const max = Math.max(...items.map((item) => item.value), 1);
  el.innerHTML = items.length
    ? `<div class="summary-mini">${items.map((item) => {
      const pct = max ? Math.max(6, (item.value / max) * 100) : 6;
      return `<div class="summary-mini-row"><div class="summary-mini-label">${esc(item.label)}</div><div class="summary-mini-bar"><span style="width:${pct}%"></span></div><div class="summary-mini-val">${esc(item.display)}</div></div>`;
    }).join('')}</div>`
    : '<div class="summary-empty">ยังไม่มีข้อมูล</div>';
}

let CH1_TREND_UID = 0;
function nextCh1TrendUid(prefix = 'ch1-trend') {
  CH1_TREND_UID += 1;
  return `${prefix}-${CH1_TREND_UID}`;
}

function ch1TrendTooltipShow(target, event) {
  const wrap = target?.closest('.trend-wrap');
  if (!wrap) return;
  const tooltip = wrap.querySelector('.trend-tooltip');
  if (!tooltip) return;
  tooltip.textContent = target.dataset.tip || '';
  const rect = wrap.getBoundingClientRect();
  tooltip.style.left = `${Math.max(10, Math.min(rect.width - 10, event.clientX - rect.left))}px`;
  tooltip.style.top = `${Math.max(10, event.clientY - rect.top)}px`;
  tooltip.classList.add('show');
}

function ch1TrendTooltipHide(target) {
  const wrap = target?.closest('.trend-wrap');
  if (!wrap) return;
  const tooltip = wrap.querySelector('.trend-tooltip');
  if (!tooltip) return;
  tooltip.classList.remove('show');
}

function ch1Clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function renderTrendLine(el, items, opts = {}) {
  if (!el) return;
  if (!items || !items.length) { el.innerHTML = '<div class="summary-empty">ยังไม่มีข้อมูล</div>'; return; }
  const width = 620, height = 234;
  const pad = { top: 28, right: 20, bottom: 42, left: 50 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const values = items.map((item) => Number(item.value) || 0);
  const minV = Math.max(0, Math.floor((Math.min(...values) - 1) * 10) / 10);
  const maxV = Math.ceil((Math.max(...values) + 1) * 10) / 10;
  const range = Math.max(maxV - minV, 1);
  const x = (i) => pad.left + (items.length === 1 ? chartW / 2 : (i / (items.length - 1)) * chartW);
  const y = (v) => ch1Clamp(pad.top + (1 - (v - minV) / range) * chartH, pad.top, pad.top + chartH);
  const points = items.map((item, i) => ({ label: item.label, value: Number(item.value) || 0, x: x(i), y: y(Number(item.value) || 0) }));
  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${pad.left},${pad.top + chartH} ${polyline} ${pad.left + chartW},${pad.top + chartH}`;
  const clipId = nextCh1TrendUid('clip-one');
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const yy = pad.top + t * chartH; const v = maxV - t * range;
    return `<g><line x1="${pad.left}" y1="${yy}" x2="${pad.left + chartW}" y2="${yy}" stroke="#E6EDF6" stroke-width="1" /><text x="${pad.left - 8}" y="${yy + 4}" text-anchor="end" font-size="10" fill="#7A8EA6">${v.toFixed(1)}${opts.unit || ''}</text></g>`;
  }).join('');
  const circleEls = points.map((p) => `<g><circle cx="${p.x}" cy="${p.y}" r="4" fill="#0F4C81" /><circle class="trend-dot-hit" cx="${p.x}" cy="${p.y}" r="10" fill="transparent" data-tip="${esc(`${p.label}: ${p.value.toFixed(2)}${opts.unit || ''}`)}" onmousemove="ch1TrendTooltipShow(this,event)" onmouseenter="ch1TrendTooltipShow(this,event)" onmouseleave="ch1TrendTooltipHide(this)"><title>${p.label}: ${p.value.toFixed(2)}${opts.unit || ''}</title></circle></g>`).join('');
  const valueLabelEls = points.map((p) => `<text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="10" fill="#35506F">${p.value.toFixed(2)}${opts.unit || ''}</text>`).join('');
  const xLabelEls = points.map((p) => `<text x="${p.x}" y="${pad.top + chartH + 18}" text-anchor="middle" font-size="10" fill="#6B7F95">${p.label}</text>`).join('');
  const trend = points.length >= 2 ? (points[points.length - 1].value - points[0].value) : 0;
  const trendText = trend > 0 ? `แนวโน้มเพิ่มขึ้น +${trend.toFixed(2)}${opts.unit || ''}` : trend < 0 ? `แนวโน้มลดลง ${trend.toFixed(2)}${opts.unit || ''}` : 'แนวโน้มคงที่';
  const trendColor = trend > 0 ? '#B42318' : trend < 0 ? '#027A48' : '#6B7280';
  el.innerHTML = `<div class="trend-wrap"><div class="trend-tooltip" aria-hidden="true"></div><svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;overflow:hidden" role="img" aria-label="กราฟแนวโน้ม"><defs><clipPath id="${clipId}"><rect x="${pad.left}" y="${pad.top}" width="${chartW}" height="${chartH}" /></clipPath></defs>${grid}<g clip-path="url(#${clipId})"><polygon points="${area}" fill="rgba(15, 76, 129, 0.08)" /><polyline points="${polyline}" fill="none" stroke="#0F4C81" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />${circleEls}</g>${valueLabelEls}${xLabelEls}<line x1="${pad.left}" y1="${pad.top + chartH}" x2="${pad.left + chartW}" y2="${pad.top + chartH}" stroke="#C8D7E8" stroke-width="1" /><line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="#C8D7E8" stroke-width="1" /></svg><div style="font-size:11.5px;color:${trendColor};font-weight:700;margin-top:4px">${trendText}</div></div>`;
}

function renderTrendLines(el, labels, series) {
  if (!el) return;
  const validSeries = (series || []).filter((s) => Array.isArray(s.values) && s.values.length === labels.length);
  if (!labels?.length || !validSeries.length) { el.innerHTML = '<div class="summary-empty">ยังไม่มีข้อมูล</div>'; return; }
  const width = 640, height = 250;
  const pad = { top: 28, right: 22, bottom: 42, left: 54 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const allValues = validSeries.flatMap((s) => s.values.map((v) => Number(v) || 0));
  const minV = Math.max(0, Math.floor((Math.min(...allValues) - 1) * 10) / 10);
  const maxV = Math.ceil((Math.max(...allValues) + 1) * 10) / 10;
  const range = Math.max(maxV - minV, 1);
  const x = (i) => pad.left + (labels.length === 1 ? chartW / 2 : (i / (labels.length - 1)) * chartW);
  const y = (v) => ch1Clamp(pad.top + (1 - ((Number(v) || 0) - minV) / range) * chartH, pad.top, pad.top + chartH);
  const clipId = nextCh1TrendUid('clip-multi');
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const yy = pad.top + t * chartH; const val = maxV - t * range;
    return `<g><line x1="${pad.left}" y1="${yy}" x2="${pad.left + chartW}" y2="${yy}" stroke="#E6EDF6" stroke-width="1"/><text x="${pad.left - 8}" y="${yy + 4}" text-anchor="end" font-size="10" fill="#7A8EA6">${fmtNum(val, 1)}</text></g>`;
  }).join('');
  const lineEls = validSeries.map((s) => {
    const pts = s.values.map((v, i) => ({ x: x(i), y: y(v), v: Number(v) || 0, label: labels[i] }));
    const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const dots = pts.map((p) => `<g><circle cx="${p.x}" cy="${p.y}" r="3.8" fill="${s.color}" /><circle class="trend-dot-hit" cx="${p.x}" cy="${p.y}" r="10" fill="transparent" data-tip="${esc(`${s.name} ${p.label}: ${fmtNum(p.v, 2)}`)}" onmousemove="ch1TrendTooltipShow(this,event)" onmouseenter="ch1TrendTooltipShow(this,event)" onmouseleave="ch1TrendTooltipHide(this)"><title>${s.name} ${p.label}: ${fmtNum(p.v, 2)}</title></circle></g>`).join('');
    return `<g><polyline points="${polyline}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />${dots}</g>`;
  }).join('');
  const xLabels = labels.map((lb, i) => `<text x="${x(i)}" y="${pad.top + chartH + 18}" text-anchor="middle" font-size="10" fill="#6B7F95">${lb}</text>`).join('');
  const legend = validSeries.map((s) => `<div style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:99px;background:${s.color};display:inline-block"></span><span>${esc(s.name)}</span></div>`).join('');
  el.innerHTML = `<div class="trend-wrap"><div class="trend-tooltip" aria-hidden="true"></div><svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="display:block;overflow:hidden" role="img" aria-label="กราฟเส้นแนวโน้มรายปี"><defs><clipPath id="${clipId}"><rect x="${pad.left}" y="${pad.top}" width="${chartW}" height="${chartH}" /></clipPath></defs>${grid}<g clip-path="url(#${clipId})">${lineEls}</g>${xLabels}<line x1="${pad.left}" y1="${pad.top + chartH}" x2="${pad.left + chartW}" y2="${pad.top + chartH}" stroke="#C8D7E8" stroke-width="1" /><line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + chartH}" stroke="#C8D7E8" stroke-width="1" /></svg><div style="display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:#4D6078;margin-top:4px">${legend}</div></div>`;
}

function renderCh1SummaryChart(el, items, formatter = (item) => fmtNum(item.value)) {
  renderMiniBars(el, items.map((item) => ({ label: item.label, value: item.value, display: formatter(item) })));
}

// ─── CH1_COLUMNS ──────────────────────────────────────────────────────────────

const CH1_COLUMNS = [
  { key: '_org', label: 'องค์กร', get: (row) => getCh1Org(row) },
  { key: 'submitted_at', label: 'วันที่ส่ง', get: (row) => fmtDate(getRowDate(row), true) },
  { key: '_email', label: 'อีเมลผู้กรอก', get: (row) => esc(ch1v(row,'respondent_email') || '—') },
  { key: 'total_staff', label: 'บุคลากรทั้งหมด (คน)', get: (row) => fmtNum(ch1v(row,'total_staff') ?? ch1v(row,'total_personnel')) },
  { key: 'strategic_overview', label: 'ภาพรวมยุทธศาสตร์', get: (row) => esc(ch1v(row,'strategic_overview') || '—') },
  { key: 'org_structure', label: 'โครงสร้างองค์กร', get: (row) => esc(ch1v(row,'org_structure') || '—') },
  { key: '_strategy_file', label: 'ไฟล์ยุทธศาสตร์', get: (row) => ch1FileLink(ch1v(row,'strategy_file_url')) },
  { key: '_orgstruct_file', label: 'ไฟล์โครงสร้างองค์กร', get: (row) => ch1FileLink(ch1v(row,'org_structure_file_url')) },
  { key: 'type_official', label: 'ข้าราชการ (คน)', get: (row) => fmtNum(ch1v(row,'type_official')) },
  { key: 'type_employee', label: 'พนักงานราชการ (คน)', get: (row) => fmtNum(ch1v(row,'type_employee')) },
  { key: 'type_contract', label: 'ลูกจ้าง (คน)', get: (row) => fmtNum(ch1v(row,'type_contract')) },
  { key: 'type_other', label: 'บุคลากรอื่นๆ (คน)', get: (row) => fmtNum(ch1v(row,'type_other')) },
  { key: 'age_u30', label: 'อายุ ≤30 ปี (คน)', get: (row) => fmtNum(ch1v(row,'age_u30') ?? ch1v(row,'age_under30')) },
  { key: 'age_31_40', label: 'อายุ 31–40 ปี (คน)', get: (row) => fmtNum(ch1v(row,'age_31_40')) },
  { key: 'age_41_50', label: 'อายุ 41–50 ปี (คน)', get: (row) => fmtNum(ch1v(row,'age_41_50')) },
  { key: 'age_51_60', label: 'อายุ 51–60 ปี (คน)', get: (row) => fmtNum(ch1v(row,'age_51_60')) },
  { key: 'service_u1', label: 'อายุราชการ <1 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_u1')) },
  { key: 'service_1_5', label: 'อายุราชการ 1–5 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_1_5')) },
  { key: 'service_6_10', label: 'อายุราชการ 6–10 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_6_10')) },
  { key: 'service_11_15', label: 'อายุราชการ 11–15 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_11_15')) },
  { key: 'service_16_20', label: 'อายุราชการ 16–20 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_16_20')) },
  { key: 'service_21_25', label: 'อายุราชการ 21–25 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_21_25')) },
  { key: 'service_26_30', label: 'อายุราชการ 26–30 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_26_30')) },
  { key: 'service_over30', label: 'อายุราชการ >30 ปี (คน)', get: (row) => fmtNum(ch1v(row,'service_over30')) },
  { key: 'pos_o1', label: 'ทั่วไป O1 (คน)', get: (row) => fmtNum(ch1v(row,'pos_o1')) },
  { key: 'pos_o2', label: 'ทั่วไป O2 (คน)', get: (row) => fmtNum(ch1v(row,'pos_o2')) },
  { key: 'pos_o3', label: 'ทั่วไป O3 (คน)', get: (row) => fmtNum(ch1v(row,'pos_o3')) },
  { key: 'pos_o4', label: 'ทั่วไป O4 (คน)', get: (row) => fmtNum(ch1v(row,'pos_o4')) },
  { key: 'pos_k1', label: 'วิชาการ K1 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k1')) },
  { key: 'pos_k2', label: 'วิชาการ K2 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k2')) },
  { key: 'pos_k3', label: 'วิชาการ K3 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k3')) },
  { key: 'pos_k4', label: 'วิชาการ K4 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k4')) },
  { key: 'pos_k5', label: 'วิชาการ K5 (คน)', get: (row) => fmtNum(ch1v(row,'pos_k5')) },
  { key: 'pos_m1', label: 'อำนวยการ M1 (คน)', get: (row) => fmtNum(ch1v(row,'pos_m1')) },
  { key: 'pos_m2', label: 'อำนวยการ M2 (คน)', get: (row) => fmtNum(ch1v(row,'pos_m2')) },
  { key: 'pos_s1', label: 'บริหาร S1 (คน)', get: (row) => fmtNum(ch1v(row,'pos_s1')) },
  { key: 'pos_s2', label: 'บริหาร S2 (คน)', get: (row) => fmtNum(ch1v(row,'pos_s2')) },
  { key: 'begin_2564', label: 'ต้นปี 2564 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2564')) },
  { key: 'end_2564', label: 'ปลายปี 2564 (คน)', get: (row) => fmtNum(ch1v(row,'end_2564')) },
  { key: 'leave_2564', label: 'ลาออก/โอนย้าย 2564', get: (row) => fmtNum(ch1v(row,'leave_2564')) },
  { key: 'rate_2564', label: 'อัตราลาออก 2564 (%)', get: (row) => ch1Rate(row,'2564') },
  { key: 'begin_2565', label: 'ต้นปี 2565 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2565')) },
  { key: 'end_2565', label: 'ปลายปี 2565 (คน)', get: (row) => fmtNum(ch1v(row,'end_2565')) },
  { key: 'leave_2565', label: 'ลาออก/โอนย้าย 2565', get: (row) => fmtNum(ch1v(row,'leave_2565')) },
  { key: 'rate_2565', label: 'อัตราลาออก 2565 (%)', get: (row) => ch1Rate(row,'2565') },
  { key: 'begin_2566', label: 'ต้นปี 2566 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2566')) },
  { key: 'end_2566', label: 'ปลายปี 2566 (คน)', get: (row) => fmtNum(ch1v(row,'end_2566')) },
  { key: 'leave_2566', label: 'ลาออก/โอนย้าย 2566', get: (row) => fmtNum(ch1v(row,'leave_2566')) },
  { key: 'rate_2566', label: 'อัตราลาออก 2566 (%)', get: (row) => ch1Rate(row,'2566') },
  { key: 'begin_2567', label: 'ต้นปี 2567 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2567')) },
  { key: 'end_2567', label: 'ปลายปี 2567 (คน)', get: (row) => fmtNum(ch1v(row,'end_2567')) },
  { key: 'leave_2567', label: 'ลาออก/โอนย้าย 2567', get: (row) => fmtNum(ch1v(row,'leave_2567')) },
  { key: 'rate_2567', label: 'อัตราลาออก 2567 (%)', get: (row) => ch1Rate(row,'2567') },
  { key: 'begin_2568', label: 'ต้นปี 2568 (คน)', get: (row) => fmtNum(ch1v(row,'begin_2568')) },
  { key: 'end_2568', label: 'ปลายปี 2568 (คน)', get: (row) => fmtNum(ch1v(row,'end_2568')) },
  { key: 'leave_2568', label: 'ลาออก/โอนย้าย 2568', get: (row) => fmtNum(ch1v(row,'leave_2568')) },
  { key: 'rate_2568', label: 'อัตราลาออก 2568 (%)', get: (row) => ch1Rate(row,'2568') },
  { key: 'related_policies', label: 'นโยบายที่เกี่ยวข้อง', get: (row) => esc(ch1v(row,'related_policies') || '—') },
  { key: 'context_challenges', label: 'บริบทภายนอก/ความท้าทาย', get: (row) => esc(ch1v(row,'context_challenges') || '—') },
  { key: 'disease_report_type', label: 'ประเภทรายงานโรค', get: (row) => esc(ch1v(row,'disease_report_type') || '—') },
  { key: 'disease_diabetes', label: 'เบาหวาน (คน)', get: (row) => fmtNum(ch1v(row,'disease_diabetes')) },
  { key: 'disease_hypertension', label: 'ความดันโลหิตสูง (คน)', get: (row) => fmtNum(ch1v(row,'disease_hypertension')) },
  { key: 'disease_cardiovascular', label: 'โรคหัวใจและหลอดเลือด (คน)', get: (row) => fmtNum(ch1v(row,'disease_cardiovascular')) },
  { key: 'disease_kidney', label: 'โรคไต (คน)', get: (row) => fmtNum(ch1v(row,'disease_kidney')) },
  { key: 'disease_liver', label: 'โรคตับ (คน)', get: (row) => fmtNum(ch1v(row,'disease_liver')) },
  { key: 'disease_cancer', label: 'โรคมะเร็ง (คน)', get: (row) => fmtNum(ch1v(row,'disease_cancer')) },
  { key: 'disease_obesity', label: 'ภาวะอ้วน/น้ำหนักเกิน (คน)', get: (row) => fmtNum(ch1v(row,'disease_obesity')) },
  { key: 'disease_other_count', label: 'โรคอื่นๆ (คน)', get: (row) => fmtNum(ch1v(row,'disease_other_count')) },
  { key: 'disease_other_detail', label: 'โรคอื่นๆ (ระบุ)', get: (row) => esc(ch1v(row,'disease_other_detail') || '—') },
  { key: 'ncd_count', label: 'NCD รวม (คน)', get: (row) => fmtNum(ch1v(row,'ncd_count')) },
  { key: 'ncd_ratio_pct', label: 'NCD ต่อบุคลากร (%)', get: (row) => { const v = ch1v(row,'ncd_ratio_pct'); return v != null ? fmtNum(parseFloat(v),2)+'%' : '—'; } },
  { key: 'sick_leave_report_type', label: 'ประเภทรายงานลาป่วย', get: (row) => esc(ch1v(row,'sick_leave_report_type') || '—') },
  { key: 'sick_leave_days', label: 'วันลาป่วยรวม/ปี', get: (row) => fmtNum(ch1v(row,'sick_leave_days')) },
  { key: 'sick_leave_avg', label: 'วันลาป่วยเฉลี่ย/คน/ปี', get: (row) => { const v = ch1v(row,'sick_leave_avg'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'clinic_report_type', label: 'ประเภทรายงานคลินิก', get: (row) => esc(ch1v(row,'clinic_report_type') || '—') },
  { key: 'clinic_users_per_year', label: 'ผู้ใช้คลินิก/ปี (คน)', get: (row) => fmtNum(ch1v(row,'clinic_users_per_year')) },
  { key: 'clinic_top_symptoms', label: 'อาการที่พบมากสุด', get: (row) => esc(ch1v(row,'clinic_top_symptoms') || '—') },
  { key: 'clinic_top_medications', label: 'ยาที่ใช้มากสุด', get: (row) => esc(ch1v(row,'clinic_top_medications') || '—') },
  { key: 'mental_health_report_type', label: 'ประเภทรายงานสุขภาพจิต', get: (row) => esc(ch1v(row,'mental_health_report_type') || '—') },
  { key: 'mental_stress', label: 'ภาวะเครียดเรื้อรัง', get: (row) => esc(ch1v(row,'mental_stress') || '—') },
  { key: 'mental_anxiety', label: 'ภาวะวิตกกังวล', get: (row) => esc(ch1v(row,'mental_anxiety') || '—') },
  { key: 'mental_sleep', label: 'ปัญหาการนอนหลับ', get: (row) => esc(ch1v(row,'mental_sleep') || '—') },
  { key: 'mental_burnout', label: 'ภาวะหมดไฟ (Burnout)', get: (row) => esc(ch1v(row,'mental_burnout') || '—') },
  { key: 'mental_depression', label: 'ภาวะซึมเศร้า', get: (row) => esc(ch1v(row,'mental_depression') || '—') },
  { key: 'engagement_score_2568', label: 'Engagement 2568', get: (row) => { const v = ch1v(row,'engagement_score_2568'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_score_2567', label: 'Engagement 2567', get: (row) => { const v = ch1v(row,'engagement_score_2567'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_score_2566', label: 'Engagement 2566', get: (row) => { const v = ch1v(row,'engagement_score_2566'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_score_2565', label: 'Engagement 2565', get: (row) => { const v = ch1v(row,'engagement_score_2565'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_score_2564', label: 'Engagement 2564', get: (row) => { const v = ch1v(row,'engagement_score_2564'); return v != null ? fmtNum(parseFloat(v),2) : '—'; } },
  { key: 'engagement_low_areas', label: 'ประเด็น Engagement คะแนนต่ำ', get: (row) => esc(ch1v(row,'engagement_low_areas') || '—') },
  { key: 'other_wellbeing_surveys', label: 'ผลสำรวจสุขภาวะอื่นๆ', get: (row) => esc(ch1v(row,'other_wellbeing_surveys') || '—') },
  { key: 'mentoring_system', label: 'ระบบพี่เลี้ยง (Mentoring)', get: (row) => { const v = ch1v(row,'mentoring_system'); return v === 'full' ? '✅ มีตามแผน' : v === 'partial' ? '⚠️ มีไม่ครบตามแผน' : v === 'none' ? '❌ ไม่มี' : esc(v || '—'); } },
  { key: 'job_rotation', label: 'ระบบหมุนเวียนงาน (Job Rotation)', get: (row) => { const v = ch1v(row,'job_rotation'); return v === 'full' ? '✅ มีตามแผน' : v === 'partial' ? '⚠️ มีไม่ครบตามแผน' : v === 'none' ? '❌ ไม่มี' : esc(v || '—'); } },
  { key: 'idp_system', label: 'แผนพัฒนารายบุคคล (IDP)', get: (row) => { const v = ch1v(row,'idp_system'); return v === 'full' ? '✅ มีตามแผน' : v === 'partial' ? '⚠️ มีไม่ครบตามแผน' : v === 'none' ? '❌ ไม่มี' : esc(v || '—'); } },
  { key: 'career_path_system', label: 'เส้นทางความก้าวหน้า (Career Path)', get: (row) => { const v = ch1v(row,'career_path_system'); return v === 'full' ? '✅ มีตามแผน' : v === 'partial' ? '⚠️ มีไม่ครบตามแผน' : v === 'none' ? '❌ ไม่มี' : esc(v || '—'); } },
  { key: 'training_hours', label: 'ชั่วโมงอบรมเฉลี่ย/คน/ปี', get: (row) => esc(ch1v(row,'training_hours') || '—') },
  { key: 'digital_systems', label: 'ระบบดิจิทัลที่มี', get: (row) => { const v = ch1v(row,'digital_systems'); return v ? esc(Array.isArray(v) ? v.join(', ') : String(v)) : '—'; } },
  { key: 'ergonomics_status', label: 'สถานะ Ergonomics', get: (row) => esc(ch1v(row,'ergonomics_status') || '—') },
  { key: 'ergonomics_detail', label: 'รายละเอียด Ergonomics', get: (row) => esc(ch1v(row,'ergonomics_detail') || '—') },
  { key: 'strategic_priority_rank1', label: 'จุดเน้น อันดับ 1', get: (row) => esc(ch1v(row,'strategic_priority_rank1') || '—') },
  { key: 'strategic_priority_rank2', label: 'จุดเน้น อันดับ 2', get: (row) => esc(ch1v(row,'strategic_priority_rank2') || '—') },
  { key: 'strategic_priority_rank3', label: 'จุดเน้น อันดับ 3', get: (row) => esc(ch1v(row,'strategic_priority_rank3') || '—') },
  { key: 'strategic_priority_other', label: 'จุดเน้น อื่นๆ (ระบุ)', get: (row) => esc(ch1v(row,'strategic_priority_other') || '—') },
  { key: 'intervention_packages_feedback', label: 'ข้อเสนอแนะ Intervention Packages', get: (row) => esc(ch1v(row,'intervention_packages_feedback') || '—') },
  { key: 'hrd_plan_results', label: 'ผลการปฏิบัติตามแผน HRD', get: (row) => esc(ch1v(row,'hrd_plan_results') || '—') },
  { key: '_hrd_file', label: 'ไฟล์ HRD PLAN', get: (row) => ch1FileLink(ch1v(row,'hrd_plan_file_url') || ch1v(row,'hrd_plan_url')) },
];

// ─── CH1_SUMMARY_SECTIONS ─────────────────────────────────────────────────────

const CH1_SUMMARY_SECTIONS = [
  { title: 'โครงสร้างบุคลากร', badge: 'จำนวนและอายุ', items: [
    { label: 'บุคลากรรวม', type: 'sum', fields: ['total_staff', 'total_personnel'], unit: 'คน' },
    { label: 'ข้าราชการ', type: 'sum', field: 'type_official', unit: 'คน' },
    { label: 'พนักงานราชการ', type: 'sum', field: 'type_employee', unit: 'คน' },
    { label: 'ลูกจ้าง', type: 'sum', field: 'type_contract', unit: 'คน' },
    { label: 'บุคลากรอื่น ๆ', type: 'sum', field: 'type_other', unit: 'คน' },
    { label: 'อายุ ≤30 ปี', type: 'sum', fields: ['age_u30', 'age_under30'], unit: 'คน' },
    { label: 'อายุ 31–40 ปี', type: 'sum', field: 'age_31_40', unit: 'คน' },
    { label: 'อายุ 41–50 ปี', type: 'sum', field: 'age_41_50', unit: 'คน' },
    { label: 'อายุ 51–60 ปี', type: 'sum', field: 'age_51_60', unit: 'คน' },
  ] },
  { title: 'อายุราชการและตำแหน่ง', badge: 'เส้นทางอาชีพ', items: [
    { label: 'อายุราชการ <1 ปี', type: 'sum', field: 'service_u1', unit: 'คน' },
    { label: 'อายุราชการ 1–5 ปี', type: 'sum', field: 'service_1_5', unit: 'คน' },
    { label: 'อายุราชการ 6–10 ปี', type: 'sum', field: 'service_6_10', unit: 'คน' },
    { label: 'อายุราชการ 11–15 ปี', type: 'sum', field: 'service_11_15', unit: 'คน' },
    { label: 'อายุราชการ 16–20 ปี', type: 'sum', field: 'service_16_20', unit: 'คน' },
    { label: 'อายุราชการ 21–25 ปี', type: 'sum', field: 'service_21_25', unit: 'คน' },
    { label: 'อายุราชการ 26–30 ปี', type: 'sum', field: 'service_26_30', unit: 'คน' },
    { label: 'อายุราชการ >30 ปี', type: 'sum', field: 'service_over30', unit: 'คน' },
  ] },
  { title: 'การลาออก / โอนย้ายย้อนหลัง', badge: '5 ปี', items: [
    { label: 'อัตราออกปี 2564', type: 'rate', year: '2564' },
    { label: 'อัตราออกปี 2565', type: 'rate', year: '2565' },
    { label: 'อัตราออกปี 2566', type: 'rate', year: '2566' },
    { label: 'อัตราออกปี 2567', type: 'rate', year: '2567' },
    { label: 'อัตราออกปี 2568', type: 'rate', year: '2568' },
    { label: 'ภาพรวมยุทธศาสตร์', type: 'text', field: 'strategic_overview' },
    { label: 'โครงสร้างองค์กร', type: 'text', field: 'org_structure' },
  ] },
  { title: 'สุขภาพกาย / NCD', badge: 'โรคและการใช้บริการ', items: [
    { label: 'โรคเบาหวาน', type: 'sum', field: 'disease_diabetes', unit: 'คน' },
    { label: 'ความดันโลหิตสูง', type: 'sum', field: 'disease_hypertension', unit: 'คน' },
    { label: 'โรคหัวใจและหลอดเลือด', type: 'sum', field: 'disease_cardiovascular', unit: 'คน' },
    { label: 'โรคไต', type: 'sum', field: 'disease_kidney', unit: 'คน' },
    { label: 'โรคตับ', type: 'sum', field: 'disease_liver', unit: 'คน' },
    { label: 'โรคมะเร็ง', type: 'sum', field: 'disease_cancer', unit: 'คน' },
    { label: 'ภาวะอ้วน/น้ำหนักเกิน', type: 'sum', field: 'disease_obesity', unit: 'คน' },
    { label: 'NCD รวม', type: 'sum', field: 'ncd_count', unit: 'คน' },
    { label: 'NCD ต่อบุคลากร', type: 'ratio', digits: 2, calc: (rows) => ch1Pct(ch1Sum(rows, 'ncd_count'), ch1Sum(rows, ['total_staff', 'total_personnel'])), note: 'สัดส่วนรวมจากยอด NCD / บุคลากรรวม' },
    { label: 'วันลาป่วยรวม', type: 'sum', field: 'sick_leave_days', unit: 'วัน' },
    { label: 'วันลาป่วยเฉลี่ย/คน/ปี', type: 'avg', field: 'sick_leave_avg', unit: 'วัน' },
    { label: 'ผู้ใช้คลินิก/ปี', type: 'sum', field: 'clinic_users_per_year', unit: 'คน' },
  ] },
  { title: 'สุขภาพจิต / ความผูกพัน', badge: 'Wellbeing', items: [
    { label: 'ภาวะเครียดเรื้อรัง', type: 'text', field: 'mental_stress' },
    { label: 'ภาวะวิตกกังวล', type: 'text', field: 'mental_anxiety' },
    { label: 'ปัญหาการนอนหลับ', type: 'text', field: 'mental_sleep' },
    { label: 'ภาวะหมดไฟ', type: 'text', field: 'mental_burnout' },
    { label: 'ภาวะซึมเศร้า', type: 'text', field: 'mental_depression' },
    { label: 'Engagement Score', type: 'avg', field: 'engagement_score', unit: 'คะแนน', digits: 1 },
    { label: 'ความพึงพอใจงาน', type: 'text', field: 'job_satisfaction' },
    { label: 'ปัญหาสำคัญสุด', type: 'text', field: 'main_problem' },
  ] },
  { title: 'นโยบาย / บริบท / เอกสารแนบ', badge: 'ข้อความอธิบาย', items: [
    { label: 'นโยบายที่เกี่ยวข้อง', type: 'text', field: 'related_policies' },
    { label: 'บริบทภายนอก / ความท้าทาย', type: 'text', field: 'context_challenges' },
    { label: 'ไฟล์ยุทธศาสตร์', type: 'file', field: 'strategy_file_url' },
    { label: 'ไฟล์โครงสร้างองค์กร', type: 'file', field: 'org_structure_file_url' },
    { label: 'ผลสำรวจสุขภาพจิต', type: 'text', field: 'mental_health_report_type' },
    { label: 'ผลสำรวจ NCD', type: 'text', field: 'disease_report_type' },
    { label: 'ผลการลาป่วย', type: 'text', field: 'sick_leave_report_type' },
    { label: 'ผลการคลินิก', type: 'text', field: 'clinic_report_type' },
  ] },
];

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.org-multi-wrap')) {
    const dd = document.getElementById('ch1-org-dropdown');
    if (dd) dd.classList.remove('show');
  }
});
