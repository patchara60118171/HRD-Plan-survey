(function () {
  function installCh1DetailWrap() {
    const page = document.getElementById('pg-resp-ch1');
    if (!page || document.getElementById('ch1-detail-wrap')) return;
    const referenceCard = page.querySelector('.card');
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.id = 'ch1-detail-wrap';
    wrap.style.display = 'none';
    wrap.style.marginTop = '1rem';
    wrap.innerHTML = `
      <div class="ch" style="align-items:flex-start;flex-wrap:wrap">
        <div>
          <h3 id="ch1-detail-title">รายละเอียดคำตอบ HRD บทที่ 1</h3>
          <div id="ch1-detail-subtitle" style="font-size:.82rem;color:var(--tx2);margin-top:.25rem">—</div>
        </div>
        <div id="ch1-detail-controls" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-left:auto"></div>
      </div>
      <div class="cb" id="ch1-detail-body"></div>
    `;
    if (referenceCard) page.appendChild(wrap);
  }

  function getSchema() {
    return window.HRD_CH1_FIELDS || null;
  }

  function metric(value, suffix) {
    if (value == null || value === '') return '—';
    const num = Number(value);
    const isNumeric = Number.isFinite(num) && String(value).trim() !== '';
    const text = isNumeric
      ? num.toLocaleString('th-TH', {
        minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
        maximumFractionDigits: 2
      })
      : String(value);
    return suffix ? `${text}${suffix}` : text;
  }

  function escapeAttr(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getOrgCode(record) {
    const schema = getSchema();
    if (schema) return schema.resolveOrgCode(record, orgsData) || '—';
    return record && record.org_code ? record.org_code : '—';
  }

  function getContext(record, index) {
    const schema = getSchema();
    if (schema) return schema.getContext(record, index, orgsData);
    const submittedAt = record && record.submitted_at ? new Date(record.submitted_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '—';
    return {
      index: index,
      indexLabel: index + 1,
      orgCode: getOrgCode(record),
      organization: record && record.organization ? record.organization : 'ไม่ระบุ',
      respondentEmail: record && (record.respondent_email || record.email) ? (record.respondent_email || record.email) : '—',
      submittedAt: submittedAt,
      submittedDate: record && record.submitted_at ? new Date(record.submitted_at).toLocaleDateString('th-TH') : '—',
      title: `ผู้ตอบ #${index + 1}`
    };
  }

  function closeCh1Detail() {
    const wrap = document.getElementById('ch1-detail-wrap');
    if (wrap) wrap.style.display = 'none';
  }

  function ensureCh1Index(index) {
    if (!Array.isArray(ch1Filt) || !ch1Filt.length) return 0;
    const max = ch1Filt.length - 1;
    const next = Number(index);
    if (!Number.isFinite(next)) return 0;
    if (next < 0) return 0;
    if (next > max) return max;
    return next;
  }

  function showRaw(raw) {
    let parsed = raw;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (error) {
        parsed = raw;
      }
    }
    const target = document.getElementById('rawp');
    const modal = document.getElementById('raw-bd');
    if (!target || !modal) return;
    target.textContent = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    modal.classList.add('show');
  }

  function closeRaw() {
    const modal = document.getElementById('raw-bd');
    if (modal) modal.classList.remove('show');
  }

  function renderCh1FieldValue(record, field) {
    const schema = getSchema();
    const value = schema ? schema.formatResponseValue(field.key, record ? record[field.key] : null, field) : '—';
    const rawValue = record ? record[field.key] : null;
    if (rawValue && /_url$/.test(field.key)) {
      return `<a href="${escapeAttr(rawValue)}" target="_blank" style="color:#2563eb;text-decoration:none;word-break:break-all">${esc(value)}</a>`;
    }
    return `<div style="font-weight:600;color:var(--tx);white-space:pre-wrap;word-break:break-word">${esc(value)}</div>`;
  }

  function renderCh1DetailControls(record, index) {
    const context = getContext(record, index);
    const title = document.getElementById('ch1-detail-title');
    const subtitle = document.getElementById('ch1-detail-subtitle');
    const controls = document.getElementById('ch1-detail-controls');
    if (!title || !subtitle || !controls) return;
    title.textContent = `${context.title} — ${context.organization} — ${context.submittedDate}`;
    subtitle.textContent = `org_code: ${context.orgCode || '—'} • ผู้ตอบ: ${context.respondentEmail} • ส่งเมื่อ ${context.submittedAt}`;
    controls.innerHTML = `
      <button class="btn bo bsm" onclick="closeCh1Detail()">← กลับ</button>
      <button class="btn bo bsm" onclick="stepCh1Detail(-1)" ${index <= 0 ? 'disabled' : ''}>◀</button>
      <select class="fc fsl" onchange="jumpCh1Detail(this.value)" style="min-width:260px;max-width:380px">
        ${ch1Filt.map((item, itemIndex) => {
          const itemContext = getContext(item, itemIndex);
          return `<option value="${itemIndex}" ${itemIndex === index ? 'selected' : ''}>#${itemIndex + 1} — ${escapeAttr(itemContext.organization)} — ${escapeAttr(itemContext.submittedDate)}</option>`;
        }).join('')}
      </select>
      <button class="btn bo bsm" onclick="stepCh1Detail(1)" ${index >= ch1Filt.length - 1 ? 'disabled' : ''}>▶</button>
      <button class="btn bp bsm" onclick="downloadCh1PDF(${index})">⬇ ดาวน์โหลด PDF รายบุคคล</button>
    `;
  }

  function renderCh1Detail() {
    installCh1DetailWrap();
    const wrap = document.getElementById('ch1-detail-wrap');
    const body = document.getElementById('ch1-detail-body');
    const schema = getSchema();
    if (!wrap || !body || !schema || !Array.isArray(ch1Filt) || !ch1Filt.length) {
      closeCh1Detail();
      return;
    }
    window.ch1DetailIndex = ensureCh1Index(window.ch1DetailIndex || 0);
    const record = ch1Filt[window.ch1DetailIndex];
    const sections = schema.buildSections(record);
    renderCh1DetailControls(record, window.ch1DetailIndex);
    body.innerHTML = `
      <div style="display:grid;gap:1rem">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem">
          <div style="padding:1rem;border:1px solid var(--bdr);border-radius:10px;background:#f8fafc"><div style="color:var(--tx3);font-size:.78rem">ลำดับผู้ตอบ</div><div style="font-weight:700;margin-top:.2rem">#${window.ch1DetailIndex + 1}</div></div>
          <div style="padding:1rem;border:1px solid var(--bdr);border-radius:10px;background:#f8fafc"><div style="color:var(--tx3);font-size:.78rem">สำนัก/กอง</div><div style="font-weight:700;margin-top:.2rem">${esc(record.organization || '—')}</div></div>
          <div style="padding:1rem;border:1px solid var(--bdr);border-radius:10px;background:#f8fafc"><div style="color:var(--tx3);font-size:.78rem">org_code</div><div style="font-weight:700;margin-top:.2rem">${esc(getOrgCode(record))}</div></div>
          <div style="padding:1rem;border:1px solid var(--bdr);border-radius:10px;background:#f8fafc"><div style="color:var(--tx3);font-size:.78rem">อีเมลผู้ตอบ</div><div style="font-weight:700;margin-top:.2rem;word-break:break-word">${esc(schema.getRespondentEmail(record))}</div></div>
          <div style="padding:1rem;border:1px solid var(--bdr);border-radius:10px;background:#f8fafc"><div style="color:var(--tx3);font-size:.78rem">วันที่ส่ง</div><div style="font-weight:700;margin-top:.2rem">${esc(schema.formatDateTime(record.submitted_at))}</div></div>
        </div>
        ${sections.map(section => `
          <div style="border:1px solid var(--bdr);border-radius:14px;overflow:hidden;background:#fff">
            <div style="padding:1rem 1.25rem;background:#eff6ff;color:#1d4ed8;font-weight:700">${esc(section.title)}</div>
            <div style="padding:1rem 1.25rem;display:grid;gap:1rem">
              ${section.groups.map(group => `
                <div style="border:1px solid #e2e8f0;border-radius:12px;background:#fafafa;padding:1rem">
                  <div style="font-weight:700;color:var(--tx);margin-bottom:.85rem">Q${esc(group.questionNo || '—')}. ${esc(group.title)}</div>
                  <div style="display:grid;gap:.65rem">
                    ${group.fields.map(field => `
                      <div style="display:grid;grid-template-columns:minmax(180px,240px) 1fr;gap:1rem;align-items:start;padding-top:.65rem;border-top:1px dashed #e2e8f0">
                        <div style="font-size:.84rem;color:var(--tx2)">${esc(field.label)}</div>
                        ${renderCh1FieldValue(record, field)}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    wrap.style.display = 'block';
  }

  function openCh1Detail(index) {
    window.ch1DetailIndex = ensureCh1Index(index);
    renderCh1Detail();
    const wrap = document.getElementById('ch1-detail-wrap');
    if (wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function stepCh1Detail(delta) {
    openCh1Detail((window.ch1DetailIndex || 0) + delta);
  }

  function jumpCh1Detail(index) {
    openCh1Detail(index);
  }

  function getCh1PdfFileName(record, index) {
    const context = getContext(record, index);
    const orgToken = (context.orgCode || context.organization || 'export')
      .replace(/[^a-zA-Z0-9ก-๙_-]/g, '_')
      .replace(/_+/g, '_');
    const dateToken = (record && record.submitted_at ? record.submitted_at : new Date().toISOString()).slice(0, 10);
    return `HRD_CH1_${orgToken}_${dateToken}.pdf`;
  }

  function buildPrintableMarkup(record, index) {
    const schema = getSchema();
    const context = getContext(record, index);
    const sections = schema.buildSections(record);
    return `
      <div style="width:794px;background:#ffffff;color:#0f172a;font-family:'Sarabun',sans-serif;padding:28px 32px;box-sizing:border-box">
        <div style="border:1px solid #cbd5e1">
          <div style="padding:18px 20px;border-bottom:1px solid #cbd5e1;text-align:center">
            <div style="font-size:24px;font-weight:700;margin-bottom:6px">แบบฟอร์มสำรวจข้อมูล HRD บทที่ 1</div>
            <div style="font-size:16px;font-weight:600;margin-bottom:4px">สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ</div>
            <div style="font-size:14px;color:#475569">แผนพัฒนาฯ ฉบับที่ 13 (พ.ศ. 2566–2570)</div>
          </div>
          <div style="padding:14px 20px;border-bottom:1px solid #cbd5e1;display:grid;gap:8px;font-size:14px">
            <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap">
              <div><strong>ผู้ตอบ:</strong> ${esc(context.respondentEmail)}</div>
              <div><strong>วันที่:</strong> ${esc(context.submittedDate)}</div>
            </div>
            <div><strong>สำนัก/กอง:</strong> ${esc(context.organization)}${context.orgCode ? ` (${esc(context.orgCode)})` : ''}</div>
          </div>
          ${sections.map(section => `
            <div style="padding:0 20px 16px;border-bottom:1px solid #cbd5e1">
              <div style="padding:14px 0 10px;font-size:16px;font-weight:700">${esc(section.title)}</div>
              ${section.groups.map(group => `
                <div style="padding:12px 0;border-top:1px dashed #e2e8f0">
                  <div style="font-size:14px;font-weight:700;margin-bottom:8px">${group.questionNo ? `ข้อ ${esc(group.questionNo)}. ` : ''}${esc(group.title)}</div>
                  <table style="width:100%;border-collapse:collapse;font-size:13px">
                    <tbody>
                      ${group.fields.map(field => `
                        <tr>
                          <td style="width:36%;padding:6px 8px 6px 0;vertical-align:top;color:#475569">${esc(field.label)}</td>
                          <td style="padding:6px 0;vertical-align:top;font-weight:600;word-break:break-word">${esc(schema.formatResponseValue(field.key, record[field.key], field))}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function generateCh1PDF(record, index) {
    if (!record) {
      showToast('ไม่มีข้อมูลสำหรับสร้าง PDF', 'error');
      return;
    }
    if (!window.html2canvas || !window.jspdf) {
      showToast('ไลบรารี PDF ยังโหลดไม่ครบ', 'error');
      return;
    }
    showLoading(true);
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-99999px';
    host.style.top = '0';
    host.style.zIndex = '-1';
    host.innerHTML = buildPrintableMarkup(record, index);
    document.body.appendChild(host);
    try {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const canvas = await window.html2canvas(host.firstElementChild, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;
      const contentWidth = pageWidth - margin * 2;
      const fullHeight = canvas.height * contentWidth / canvas.width;
      const visibleHeight = pageHeight - margin * 2;
      const image = canvas.toDataURL('image/png');
      let offset = 0;
      let page = 0;
      while (offset < fullHeight) {
        if (page > 0) pdf.addPage();
        pdf.addImage(image, 'PNG', margin, margin - offset, contentWidth, fullHeight, undefined, 'FAST');
        offset += visibleHeight;
        page += 1;
      }
      pdf.save(getCh1PdfFileName(record, index));
      showToast('สร้าง PDF รายบุคคลสำเร็จ ✓', 'success');
    } catch (error) {
      console.error(error);
      showToast('ไม่สามารถสร้าง PDF ได้', 'error');
    } finally {
      document.body.removeChild(host);
      showLoading(false);
    }
  }

  function downloadCh1PDF(index) {
    if (!Array.isArray(ch1Filt) || !ch1Filt[index]) {
      showToast('ไม่พบข้อมูลผู้ตอบ', 'warning');
      return;
    }
    generateCh1PDF(ch1Filt[index], index);
  }

  function renderCh1Table() {
    const tb = document.getElementById('c1-tb');
    if (!tb) return;
    const start = (ch1Page - 1) * CH1_PPG;
    const rows = ch1Filt.slice(start, start + CH1_PPG);
    if (!rows.length) {
      tb.innerHTML = '<tr><td colspan="35"><div class="emp"><div class="ei">📋</div><p>ไม่พบข้อมูล</p></div></td></tr>';
      renderPag('c1', ch1Filt.length, ch1Page, CH1_PPG);
      closeCh1Detail();
      return;
    }
    tb.innerHTML = rows.map(function (r, i) {
      const index = start + i;
      return `<tr>
        <td style="color:var(--tx3);font-size:.8rem">${index + 1}</td>
        <td style="font-size:.82rem">${esc(r.submitted_at ? new Date(r.submitted_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }) : '—')}</td>
        <td><code style="font-size:.78rem">${esc(getOrgCode(r))}</code></td>
        <td>${esc(r.organization || '—')}</td>
        <td>${esc(metric(r.total_staff))}</td>
        <td>${esc(metric(r.type_official))}</td>
        <td>${esc(metric(r.type_employee))}</td>
        <td>${esc(metric(r.type_contract))}</td>
        <td>${esc(metric(r.age_u30))}</td>
        <td>${esc(metric(r.age_31_40))}</td>
        <td>${esc(metric(r.age_41_50))}</td>
        <td>${esc(metric(r.age_51_60))}</td>
        <td>${esc(metric(r.turnover_rate, '%'))}</td>
        <td>${esc(metric(r.transfer_rate, '%'))}</td>
        <td>${esc(metric(r.ncd_count))}</td>
        <td>${esc(metric(r.ncd_ratio_pct, '%'))}</td>
        <td>${esc(metric(r.disease_diabetes))}</td>
        <td>${esc(metric(r.disease_hypertension))}</td>
        <td>${esc(metric(r.disease_cardiovascular))}</td>
        <td>${esc(metric(r.disease_kidney))}</td>
        <td>${esc(metric(r.disease_liver))}</td>
        <td>${esc(metric(r.disease_cancer))}</td>
        <td>${esc(metric(r.disease_obesity))}</td>
        <td>${esc(metric(r.sick_leave_days))}</td>
        <td>${esc(metric(r.sick_leave_avg))}</td>
        <td>${esc(metric(r.engagement_score))}</td>
        <td>${esc((window.HRD_CH1_FIELDS && window.HRD_CH1_FIELDS.supportStatusLabels[r.mentoring_system]) || SUP_LABELS[r.mentoring_system] || '—')}</td>
        <td>${esc((window.HRD_CH1_FIELDS && window.HRD_CH1_FIELDS.supportStatusLabels[r.job_rotation]) || SUP_LABELS[r.job_rotation] || '—')}</td>
        <td>${esc((window.HRD_CH1_FIELDS && window.HRD_CH1_FIELDS.supportStatusLabels[r.idp_system]) || SUP_LABELS[r.idp_system] || '—')}</td>
        <td>${esc((window.HRD_CH1_FIELDS && window.HRD_CH1_FIELDS.supportStatusLabels[r.career_path_system]) || SUP_LABELS[r.career_path_system] || '—')}</td>
        <td>${esc(metric(r.training_hours))}</td>
        <td>${esc((window.HRD_CH1_FIELDS && window.HRD_CH1_FIELDS.strategicPriorityLabels[r.strategic_priority_rank1]) || STRATEGIC_LABELS[r.strategic_priority_rank1] || r.strategic_priority_rank1 || '—')}</td>
        <td>${esc((window.HRD_CH1_FIELDS && window.HRD_CH1_FIELDS.strategicPriorityLabels[r.strategic_priority_rank2]) || STRATEGIC_LABELS[r.strategic_priority_rank2] || r.strategic_priority_rank2 || '—')}</td>
        <td>${esc((window.HRD_CH1_FIELDS && window.HRD_CH1_FIELDS.strategicPriorityLabels[r.strategic_priority_rank3]) || STRATEGIC_LABELS[r.strategic_priority_rank3] || r.strategic_priority_rank3 || '—')}</td>
        <td style="display:flex;gap:.25rem;flex-wrap:wrap">
          <button class="btn bp bxs" onclick="openCh1Detail(${index})">👁️ รายละเอียด</button>
          <button class="btn bo bxs" onclick="downloadCh1PDF(${index})">⬇ PDF</button>
          <button class="btn bo bxs" onclick="showRaw(${JSON.stringify(JSON.stringify(r)).replace(/"/g, '&quot;')})">🔍 Raw</button>
        </td>
      </tr>`;
    }).join('');
    renderPag('c1', ch1Filt.length, ch1Page, CH1_PPG);
    if (document.getElementById('ch1-detail-wrap') && document.getElementById('ch1-detail-wrap').style.display !== 'none') {
      renderCh1Detail();
    }
  }

  function filterCh1() {
    const org = v('cof');
    const df = v('cdf');
    const dt = v('cdt');
    ch1Filt = ch1Data.filter(function (record) {
      const recordCode = getOrgCode(record);
      const recordOrg = record.organization || '';
      const matchOrg = !org || recordCode === org || recordOrg === org;
      const matchFrom = !df || ((record.submitted_at || '') >= df);
      const matchTo = !dt || ((record.submitted_at || '') <= dt + 'T23:59:59');
      return matchOrg && matchFrom && matchTo;
    });
    ch1Page = 1;
    renderCh1Table();
  }

  function popCh1Filters() {
    const select = document.getElementById('cof');
    if (!select) return;
    const previous = select.value;
    const options = [];
    const seen = new Set();
    ch1Data.forEach(function (record) {
      const code = getOrgCode(record);
      const name = record.organization || 'ไม่ระบุ';
      const key = `${code}|${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: code !== '—' ? code : name, label: code !== '—' ? `${code} — ${name}` : name });
    });
    select.innerHTML = '<option value="">ทุกองค์กร</option>' + options.map(function (item) {
      return `<option value="${escapeAttr(item.value)}">${esc(item.label)}</option>`;
    }).join('');
    if ([...select.options].some(function (opt) { return opt.value === previous; })) select.value = previous;
  }

  function clrCh1() {
    const org = document.getElementById('cof');
    const from = document.getElementById('cdf');
    const to = document.getElementById('cdt');
    if (org) org.value = '';
    if (from) from.value = '';
    if (to) to.value = '';
    filterCh1();
    closeCh1Detail();
  }

  function expCh1CSV() {
    const schema = getSchema();
    if (!schema) {
      showToast('ไม่พบ schema ของ HRD บทที่ 1', 'error');
      return;
    }
    if (!Array.isArray(ch1Filt) || !ch1Filt.length) {
      showToast('ไม่มีข้อมูลสำหรับส่งออก', 'warning');
      return;
    }
    const rows = ch1Filt.map(function (record, index) {
      return schema.buildWideRow(record, index, orgsData);
    });
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(function (row) {
        return headers.map(function (header) {
          return `"${String(row[header] ?? '').replace(/"/g, '""')}"`;
        }).join(',');
      })
    ].join('\n');
    dlBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv' }), 'HRD_CH1_responses_' + today() + '.csv');
    showToast('Export CSV สำเร็จ ✓', 'success');
  }

  function expCh1XLSX() {
    const schema = getSchema();
    if (!schema) {
      showToast('ไม่พบ schema ของ HRD บทที่ 1', 'error');
      return;
    }
    if (!window.XLSX) {
      showToast('กำลังโหลด SheetJS...', 'info');
      return;
    }
    if (!Array.isArray(ch1Filt) || !ch1Filt.length) {
      showToast('ไม่มีข้อมูลสำหรับส่งออก', 'warning');
      return;
    }
    const summaryData = ch1Filt.map(function (record, index) {
      return schema.buildWideRow(record, index, orgsData);
    });
    const detailData = schema.buildLongRows(ch1Filt, orgsData);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const detailSheet = XLSX.utils.json_to_sheet(detailData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'HRD CH1 Responses');
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Answer Details');
    XLSX.writeFile(workbook, 'HRD_CH1_responses_' + today() + '.xlsx');
    showToast('Export Excel แบบครบทุก field สำเร็จ ✓', 'success');
  }

  function renderCh1Page() {
    installCh1DetailWrap();
    popCh1Filters();
    filterCh1();
  }

  function bindGlobals() {
    window.showRaw = showRaw;
    window.closeRaw = closeRaw;
    window.closeCh1Detail = closeCh1Detail;
    window.openCh1Detail = openCh1Detail;
    window.stepCh1Detail = stepCh1Detail;
    window.jumpCh1Detail = jumpCh1Detail;
    window.downloadCh1PDF = downloadCh1PDF;
    window.generateCh1PDF = generateCh1PDF;
    window.renderCh1Table = renderCh1Table;
    window.filterCh1 = filterCh1;
    window.popCh1Filters = popCh1Filters;
    window.clrCh1 = clrCh1;
    window.expCh1CSV = expCh1CSV;
    window.expCh1XLSX = expCh1XLSX;
    window.renderCh1Page = renderCh1Page;
  }

  function init() {
    installCh1DetailWrap();
    bindGlobals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
