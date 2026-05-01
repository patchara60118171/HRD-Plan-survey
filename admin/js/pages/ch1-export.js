/**
 * ch1-export.js — CH1 Export functions: Excel, PDF, summary report
 * Split from ch1.js (H6 fix). Depends on: config.js, utils.js, export.js, ch1-helpers.js
 * All function names preserved for admin.html global onclick compatibility (rule 9).
 */

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
    downloadWorkbook(
        `ch1_summary_${selOrgs ? selOrgs.join('_') : 'all'}.xlsx`,
        'Ch1_Summary',
        exportRows
    );
    showToast('Export สรุป Ch1 สำเร็จ ✅', 'success');
}

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
    const selectedOrg = !selOrgs
        ? 'ทุกองค์กร'
        : selOrgs.length === 1
          ? selOrgs[0]
          : `${selOrgs.length} องค์กร`;
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

function goCh1Preview(index) {
    const row = state.ch1Rows[index];
    if (!row) {
        showToast('ไม่พบข้อมูลในตำแหน่งนี้', 'warn');
        return;
    }
    const orgCode =
        String(row.org_code || row.form_data?.org_code || '')
            .trim()
            .toLowerCase() || 'unknown';
    const qs = new URLSearchParams({ org: orgCode, id: String(row.id || '') });
    window.open(`/ch1-preview?${qs.toString()}`, '_blank');
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
    if (!state.ch1Rows.length) {
        showToast('ยังไม่มีข้อมูล Ch1 ในระบบ', 'warn');
        return;
    }
    const stripHtml = s => {
        if (s == null) return '';
        return String(s)
            .replace(/<[^>]*>/g, '')
            .replace(/📎 ดูไฟล์/g, '')
            .trim();
    };
    const rows = state.ch1Rows.map((row, i) => {
        const obj = { '#': i + 1 };
        CH1_COLUMNS.forEach(col => {
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
    const rows = orgFilter ? state.ch1Rows.filter(r => getCh1Org(r) === orgFilter) : state.ch1Rows;
    if (!rows.length) {
        showToast('ไม่มีข้อมูลสำหรับองค์กรที่เลือก', 'warn');
        return;
    }
    downloadWorkbook(
        `ch1_${orgFilter || 'all'}.xlsx`,
        'Ch1',
        rows.map((row, i) => ({
            index: i + 1,
            organization: getCh1Org(row),
            submitted_at: getRowDate(row),
            total_personnel:
                row.total_personnel || row.total_staff || row.form_data?.total_personnel,
            engagement_score: row.engagement_score || row.form_data?.engagement_score,
        }))
    );
}

// ─── showCh1RowDetail (M6: focus trap added) ─────────────────────────────────

function showCh1RowDetail(index) {
    const row = state.ch1Rows[index];
    if (!row) return;
    const fd = row.form_data || row;
    const org = getCh1Org(row);
    const dateStr = fmtDate(getRowDate(row), true);

    const v = k => {
        const val = fd[k] ?? row[k];
        return val !== undefined && val !== null ? val : '';
    };
    const n = (k, d) => fmtNum(parseFloat(v(k)) || 0, d !== undefined ? d : 0);
    const s = k => esc(v(k) || '—');
    const yn = k => {
        const val = v(k);
        if (val === true || val === 1 || val === 'true' || val === '1' || val === 'yes')
            return '✓ มี';
        if (val === false || val === 0 || val === 'false' || val === '0' || val === 'no')
            return '✗ ไม่มี';
        return val ? esc(String(val)) : '—';
    };
    const fmtSupport = k => {
        const val = v(k);
        if (val === 'full') return 'มีตามแผน';
        if (val === 'partial') return 'มีไม่ครบตามแผน';
        if (val === 'none') return 'ไม่มี';
        return val ? esc(String(val)) : '—';
    };
    const fmtReportType = k => {
        const val = v(k);
        return val === 'actual'
            ? 'ข้อมูลจริง'
            : val === 'estimated'
              ? 'ประมาณการ'
              : val === 'none'
                ? 'ไม่มีข้อมูล'
                : val === 'official_only'
                  ? 'เฉพาะข้าราชการ'
                  : val
                    ? esc(String(val))
                    : '—';
    };
    const DIGITAL_LABELS_MAP = {
        e_doc: 'ระบบเอกสารอิเล็กทรอนิกส์',
        e_sign: 'ระบบลงนามอิเล็กทรอนิกส์ (E-signature)',
        cloud: 'ระบบ Cloud',
        hr_digital: 'ระบบ HR Digital',
        health_db: 'ระบบฐานข้อมูลสุขภาพ',
        none: 'ไม่มีระบบดังกล่าว',
    };
    const fmtDigital = k => {
        const val = v(k);
        if (!val) return '—';
        const arr = Array.isArray(val)
            ? val
            : String(val)
                  .split(',')
                  .map(x => x.trim())
                  .filter(Boolean);
        return esc(arr.map(code => DIGITAL_LABELS_MAP[code] || code).join(', '));
    };
    const fmtErgonomics = k => {
        const val = v(k);
        return val === 'none'
            ? 'ยังไม่มี'
            : val === 'planned'
              ? 'มีแผนแต่ยังไม่ดำเนินการ'
              : val === 'in_progress'
                ? 'อยู่ระหว่างดำเนินการ'
                : val === 'done'
                  ? 'ดำเนินการแล้ว'
                  : val
                    ? esc(String(val))
                    : '—';
    };

    const histRows =
        ['2564', '2565', '2566', '2567', '2568']
            .map(yr => {
                const bg = v(`begin_count_${yr}`);
                const end = v(`end_count_${yr}`);
                const lv = v(`leave_count_${yr}`);
                const rt = v(`turnover_rate_${yr}`);
                if (!bg && !end && !lv && !rt) return '';
                return `<tr><td>${yr}</td><td>${fmtNum(parseFloat(bg) || 0)}</td><td>${fmtNum(parseFloat(end) || 0)}</td><td>${fmtNum(parseFloat(lv) || 0)}</td><td>${fmtNum(parseFloat(rt) || 0, 1)}%</td></tr>`;
            })
            .filter(Boolean)
            .join('') || '<tr><td colspan="5" style="color:#9CA3AF;text-align:center">—</td></tr>';

    const reportContent = `
<div style="font-family:'Sarabun',sans-serif;color:#1A2433;font-size:13px;line-height:1.75">
<style>#ch1-detail-inner h1{font-size:19px;color:#0F4C81;margin-bottom:4px}#ch1-detail-inner h2{font-size:13.5px;color:#0F4C81;margin:20px 0 6px;border-bottom:2px solid #E8F1FB;padding-bottom:5px;font-weight:700}#ch1-detail-inner h3{font-size:12px;color:#374151;margin:12px 0 4px;font-weight:600}#ch1-detail-inner .meta{font-size:11.5px;color:#6B7280;margin-bottom:18px}#ch1-detail-inner table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:12px}#ch1-detail-inner th,#ch1-detail-inner td{padding:6px 10px;border:1px solid #D8DCE3;text-align:left}#ch1-detail-inner th{background:#F4F6F9;font-weight:600;color:#374151;width:44%}#ch1-detail-inner td.c{text-align:center;width:auto}#ch1-detail-inner .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}#ch1-detail-inner .kpi{background:#F4F6F9;border:1px solid #D8DCE3;border-radius:8px;padding:9px 12px;text-align:center}#ch1-detail-inner .kpi-val{font-size:20px;font-weight:700;color:#0F4C81}#ch1-detail-inner .kpi-label{font-size:10.5px;color:#6B7280;margin-top:2px}#ch1-detail-inner .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}</style>
<h1>📋 รายงาน Ch1 — ข้อมูลสุขภาวะองค์กร</h1>
<div class="meta">องค์กร: <b>${org}</b> &nbsp;|&nbsp; วันที่ส่ง: <b>${dateStr}</b> &nbsp;|&nbsp; ระบบ Admin Portal Well-being Survey</div>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-val">${n('total_personnel')}</div><div class="kpi-label">บุคลากรทั้งหมด (คน)</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('mental_burnout')) || 0, 1)}%</div><div class="kpi-label">Burnout Rate</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('engagement_score')) || 0, 1)}</div><div class="kpi-label">Engagement Score</div></div>
  <div class="kpi"><div class="kpi-val">${fmtNum(parseFloat(v('sick_leave_days')) || 0, 1)}</div><div class="kpi-label">วันลาป่วยเฉลี่ย/คน/ปี</div></div>
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
<h2>ส่วนที่ 2: บริบทและนโยบาย</h2>
<table>
  <tr><th>นโยบายที่เกี่ยวข้อง</th><td>${s('related_policies')}</td></tr>
  <tr><th>บริบทและความท้าทาย</th><td>${s('context_challenges')}</td></tr>
</table>
<h2>ส่วนที่ 3: สุขภาวะบุคลากร</h2>
<h2>ส่วนที่ 4: ระบบการบริหารและพัฒนาบุคลากร</h2>
<div class="two-col">
  <div>
    <h3>ระบบพัฒนาบุคลากร</h3>
    <table>
      <tr><th>ระบบพี่เลี้ยง (Mentoring)</th><td>${fmtSupport('mentoring_system')}</td></tr>
      <tr><th>หมุนเวียนงาน (Job Rotation)</th><td>${fmtSupport('job_rotation')}</td></tr>
      <tr><th>แผนพัฒนารายบุคคล (IDP)</th><td>${fmtSupport('idp_system')}</td></tr>
      <tr><th>เส้นทางความก้าวหน้า (Career Path)</th><td>${fmtSupport('career_path_system')}</td></tr>
      <tr><th>ชั่วโมงฝึกอบรมเฉลี่ย/คน/ปี</th><td>${fmtNum(parseFloat(v('training_hours')) || 0, 1)} ชั่วโมง</td></tr>
      <tr><th>สภาพแวดล้อมการทำงาน (Ergonomics)</th><td>${fmtErgonomics('ergonomics_status')}</td></tr>
    </table>
  </div>
</div>
<h2>ส่วนที่ 5: ทิศทางและเป้าหมายสุขภาวะ</h2>
<table>
  <tr><th>อันดับ 1</th><td>${s('strategic_priority_rank1')}</td></tr>
  <tr><th>อันดับ 2</th><td>${s('strategic_priority_rank2')}</td></tr>
  <tr><th>อันดับ 3</th><td>${s('strategic_priority_rank3')}</td></tr>
</table>
</div>`;

    const existing = document.getElementById('ch1-detail-modal');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'ch1-detail-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `รายละเอียด Ch1 — ${org}`);
    overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:20px;overflow-y:auto';
    overlay.innerHTML = `<div id="ch1-detail-inner" style="background:#fff;border-radius:16px;padding:28px 32px;max-width:920px;width:100%;margin:auto;box-shadow:0 24px 60px rgba(0,0,0,.25)">
    ${reportContent}
    <div style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end;border-top:1px solid #E5E7EB;padding-top:14px">
      <button id="ch1-detail-pdf-btn" class="btn b-blue" onclick="showCh1PDF(${index})">📄 พิมพ์/ดู PDF</button>
      <button id="ch1-detail-close-btn" class="btn b-gray" onclick="document.getElementById('ch1-detail-modal').remove()">✕ ปิด</button>
    </div>
  </div>`;
    document.body.appendChild(overlay);

    // M6: focus trap
    const focusableSelectors =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () =>
        [...overlay.querySelectorAll(focusableSelectors)].filter(el => !el.disabled);
    overlay.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            overlay.remove();
            return;
        }
        if (e.key !== 'Tab') return;
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0],
            last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
    });

    // Auto-focus close button
    requestAnimationFrame(() => {
        const closeBtn = document.getElementById('ch1-detail-close-btn');
        if (closeBtn) closeBtn.focus();
    });
}

// ─── showCh1PDF ───────────────────────────────────────────────────────────────

function showCh1PDF(index) {
    const row = state.ch1Rows[index];
    if (!row) {
        showToast('ไม่พบข้อมูลในตำแหน่งนี้', 'warn');
        return;
    }
    const orgCode =
        String(row.org_code || row.form_data?.org_code || '')
            .trim()
            .toLowerCase() || 'unknown';
    const qs = new URLSearchParams({
        org: orgCode,
        id: String(row.id || ''),
        export: 'pdf',
        autoclose: '1',
    });
    const win = window.open(`/ch1-preview?${qs.toString()}`, '_blank');
    if (!win) showToast('กรุณาอนุญาต Popup เพื่อดาวน์โหลด PDF', 'warn');
}
