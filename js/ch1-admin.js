// =============================================
// js/ch1-admin.js — HRD Ch1 Admin Dashboard v2
// =============================================

const ch1Admin = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORGANIZATIONS = [
    'กรมอนามัย', 'กรมควบคุมโรค', 'กรมการแพทย์', 'กรมสุขภาพจิต',
    'กรมวิทยาศาสตร์การแพทย์', 'สำนักงานคณะกรรมการอาหารและยา',
    'กรมสนับสนุนบริการสุขภาพ', 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
    'สถาบันการแพทย์ฉุกเฉินแห่งชาติ', 'สำนักงานหลักประกันสุขภาพแห่งชาติ',
    'สำนักงานประกันสังคม', 'กรมพัฒนาฝีมือแรงงาน',
    'กรมสวัสดิการและคุ้มครองแรงงาน', 'สำนักงานปลัดกระทรวงสาธารณสุข',
    'สำนักงานปลัดกระทรวงแรงงาน',
];

const TRAINING_LABELS = {
    over40: '> 40 ชม.', '30_40': '30–40 ชม.', '20_29': '20–29 ชม.',
    '10_19': '10–19 ชม.', under10: '< 10 ชม.', no_data: 'ไม่มีข้อมูล',
};
const HRD_OPP_LABELS = {
    strategic_align: 'สอดคล้องเชิงยุทธศาสตร์', tna: 'TNA',
    eval: 'ติดตามผล', wellbeing: 'บูรณาการสุขภาวะ',
    career: 'Career Path', leader: 'พัฒนาผู้นำ', digital: 'ดิจิทัล/E-learning', other: 'อื่นๆ',
};
const DIGITAL_LABELS = {
    e_doc: 'เอกสารอิเล็กทรอนิกส์', e_sign: 'E-Signature', cloud: 'Cloud',
    hr_digital: 'HR Digital', health_db: 'ฐานข้อมูลสุขภาพ', none: 'ไม่มี', other: 'อื่นๆ',
};
const SUPPORT_LABELS = { full: 'ครบ', partial: 'บางส่วน', none: 'ไม่มี' };

let allResponses = [];
let filteredResponses = [];
let chartInstances = {};
let currentPage = 1;
const PAGE_SIZE = 10;

// =============================================
// SESSION GUARD
// =============================================
(async () => {
    const { data: { session } } = await ch1Admin.auth.getSession();
    if (!session) { window.location.href = 'admin-login.html'; return; }
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    await initDashboard();
})();

async function logout() {
    await ch1Admin.auth.signOut();
    window.location.href = 'admin-login.html';
}

// =============================================
// TAB
// =============================================
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tabId}`));
    // Lazy-render new tabs on first visit
    if (tabId === 'workforce' && !chartInstances['age-donut']) renderWorkforceTab();
    if (tabId === 'hrd' && !chartInstances['support-systems']) renderHRDTab();
}

// =============================================
// INIT
// =============================================
async function initDashboard() {
    try {
        await loadAllData();
        renderOverview();
        renderOrgTable();
        renderHealthTab();
        renderPlansTab();
        renderExportTab();
    } catch (err) {
        console.error('[ch1-admin] init error:', err);
    }
}

async function loadAllData() {
    console.log('[ch1-admin] Fetching all responses...');
    const { data, error } = await ch1Admin
        .from('hrd_ch1_responses')
        .select('*')
        .order('submitted_at', { ascending: false });
    if (error) throw error;
    allResponses = data || [];
    filteredResponses = [...allResponses];
    console.log('[ch1-admin] Loaded', allResponses.length, 'records');
}

// =============================================
// OVERVIEW
// =============================================
function renderOverview() {
    const submitted = [...new Set(allResponses.map(r => r.organization))];
    const pending = ORGANIZATIONS.filter(o => !submitted.includes(o));
    const totalStaff = allResponses.reduce((s, r) => s + (r.total_staff || 0), 0);
    const ncdVals = allResponses.filter(r => r.ncd_ratio_pct != null).map(r => r.ncd_ratio_pct);
    const avgNcd = ncdVals.length ? (ncdVals.reduce((a, b) => a + b, 0) / ncdVals.length).toFixed(1) : '—';

    // Turnover KPI
    const tvVals = allResponses.filter(r => r.turnover_rate != null).map(r => parseFloat(r.turnover_rate));
    const avgTv = tvVals.length ? (tvVals.reduce((a, b) => a + b, 0) / tvVals.length).toFixed(1) : '—';

    // Training Mode KPI
    const trainingArr = allResponses.filter(r => r.training_hours_range).map(r => r.training_hours_range);
    const modeTraining = mode(trainingArr);
    const modeLabel = modeTraining ? (TRAINING_LABELS[modeTraining] || modeTraining) : '—';

    document.getElementById('kpi-submitted').textContent = submitted.length;
    document.getElementById('kpi-pending').textContent = pending.length;
    document.getElementById('kpi-staff').textContent = totalStaff.toLocaleString();
    document.getElementById('kpi-ncd').textContent = avgNcd + (avgNcd !== '—' ? '%' : '');
    document.getElementById('kpi-turnover').textContent = avgTv + (avgTv !== '—' ? '%' : '');
    document.getElementById('kpi-training').textContent = modeLabel;

    // Org progress list
    const items = ORGANIZATIONS.map(org => {
        const rec = allResponses.find(r => r.organization === org);
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:.6rem 0;border-bottom:1px solid #f1f5f9;">
      <span style="font-size:.9rem;">${org}</span>
      ${rec
                ? `<span style="background:#D1FAE5;color:#065F46;font-size:.75rem;padding:.2rem .6rem;border-radius:50px;font-weight:600;">✓ ส่งแล้ว</span>`
                : `<span style="background:#FEE2E2;color:#991B1B;font-size:.75rem;padding:.2rem .6rem;border-radius:50px;font-weight:600;">รอ</span>`
            }
    </div>`;
    }).join('');
    document.getElementById('org-progress-items').innerHTML = items;
}

// =============================================
// ORG TABLE (with search + pagination)
// =============================================
function renderOrgTable() {
    currentPage = 1;
    renderTablePage();
    renderPagination();
}

function renderTablePage() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const rows = filteredResponses.slice(start, start + PAGE_SIZE);
    const tbody = document.getElementById('org-table-body');
    if (!rows.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#94A3B8;">ไม่พบข้อมูล</td></tr>`; return; }
    tbody.innerHTML = rows.map((r, i) => `
    <tr onclick="showDetail(${allResponses.indexOf(r)})" style="cursor:pointer;">
      <td>${r.organization || '—'}</td>
      <td>${(r.total_staff || 0).toLocaleString()}</td>
      <td>${r.ncd_count || 0}</td>
      <td>${r.ncd_ratio_pct != null ? r.ncd_ratio_pct + '%' : '—'}</td>
      <td>${r.turnover_rate != null ? r.turnover_rate + '%' : '—'}</td>
      <td>${TRAINING_LABELS[r.training_hours_range] || r.training_hours_range || '—'}</td>
      <td style="font-size:.8rem;">${r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('th-TH') : '—'}</td>
    </tr>`).join('');

    const total = filteredResponses.length;
    const end = Math.min(start + PAGE_SIZE, total);
    document.getElementById('table-info').textContent = total ? `แสดง ${start + 1}–${end} จาก ${total} รายการ` : '';
    document.getElementById('page-info').textContent = total ? `แสดง ${start + 1}–${end} จาก ${total} รายการ` : '';
}

function renderPagination() {
    const total = filteredResponses.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const btns = document.getElementById('page-buttons');
    if (totalPages <= 1) { btns.innerHTML = ''; return; }

    let html = `<button onclick="goToPage(1)" style="${pgStyle(currentPage === 1)}">«</button>
              <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} style="${pgStyle(false)}">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
            html += `<button onclick="goToPage(${i})" style="${pgStyle(i === currentPage)}">${i}</button>`;
        } else if (Math.abs(i - currentPage) === 2) {
            html += `<span style="padding:.4rem;">…</span>`;
        }
    }
    html += `<button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} style="${pgStyle(false)}">›</button>
           <button onclick="goToPage(${totalPages})" style="${pgStyle(currentPage === totalPages)}">»</button>`;
    btns.innerHTML = html;
}

function pgStyle(active) {
    return `border:1px solid ${active ? 'var(--primary)' : 'var(--border)'};background:${active ? 'var(--primary)' : 'white'};color:${active ? 'white' : 'var(--text)'};border-radius:8px;padding:.35rem .65rem;cursor:pointer;font-family:inherit;font-size:.85rem;`;
}

function goToPage(p) {
    const totalPages = Math.ceil(filteredResponses.length / PAGE_SIZE);
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    renderTablePage();
    renderPagination();
}

function filterTable() {
    const q = document.getElementById('search-org').value.toLowerCase().trim();
    filteredResponses = q ? allResponses.filter(r => r.organization?.toLowerCase().includes(q)) : [...allResponses];
    currentPage = 1;
    renderTablePage();
    renderPagination();
}

// =============================================
// DETAIL MODAL
// =============================================
function showDetail(i) {
    const r = allResponses[i];
    if (!r) return;
    const wrap = id => `<div class="modal-row"><span class="lbl">${id[0]}</span><span class="val">${id[1] ?? '—'}</span></div>`;
    const html = `
    <button class="modal-close" onclick="document.getElementById('detail-modal').classList.remove('show')">✕</button>
    <div class="modal-title">🏢 ${r.organization}</div>
    ${wrap(['วันที่ส่ง', r.submitted_at ? new Date(r.submitted_at).toLocaleString('th-TH') : null])}
    ${wrap(['บุคลากรรวม', r.total_staff ? r.total_staff.toLocaleString() + ' คน' : null])}
    ${wrap(['NCD รวม', r.ncd_count ? r.ncd_count + ' คน (' + (r.ncd_ratio_pct || 0) + '%)' : null])}
    ${wrap(['อัตราลาออก', r.turnover_rate != null ? r.turnover_rate + '%' : null])}
    ${wrap(['ชั่วโมงอบรม', TRAINING_LABELS[r.training_hours_range] || r.training_hours_range])}
    ${wrap(['ระบบพี่เลี้ยง', SUPPORT_LABELS[r.mentoring_system] || r.mentoring_system])}
    ${wrap(['Job Rotation', SUPPORT_LABELS[r.job_rotation] || r.job_rotation])}
    ${wrap(['IDP', SUPPORT_LABELS[r.idp_system] || r.idp_system])}
    ${wrap(['Career Path', SUPPORT_LABELS[r.career_path_system] || r.career_path_system])}
    ${wrap(['Ergonomics', r.ergonomics_status])}
    ${wrap(['version', r.form_version])}
    ${r.strategic_priorities ? `<div class="modal-row"><span class="lbl">ยุทธศาสตร์</span><span class="val">${(r.strategic_priorities).map(p => p.rank + '. ' + p.label).join(', ')}</span></div>` : ''}
  `;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('detail-modal').classList.add('show');
}
document.getElementById('detail-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('detail-modal')) document.getElementById('detail-modal').classList.remove('show');
});

// =============================================
// HEALTH TAB (existing)
// =============================================
function renderHealthTab() {
    const diseases = ['disease_diabetes', 'disease_hypertension', 'disease_cardiovascular', 'disease_kidney', 'disease_liver', 'disease_cancer', 'disease_obesity'];
    const labels = ['เบาหวาน', 'ความดัน', 'หัวใจ', 'ไต', 'ตับ', 'มะเร็ง', 'อ้วน'];
    const totals = diseases.map(d => allResponses.reduce((s, r) => s + (r[d] || 0), 0));

    destroyChart('ncd-bar');
    chartInstances['ncd-bar'] = new Chart(document.getElementById('chart-issues'), {
        type: 'bar',
        data: { labels, datasets: [{ label: 'จำนวนคน', data: totals, backgroundColor: '#0F4C81', borderRadius: 6 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    const ncdTotals = allResponses.map(r => r.ncd_count || 0);
    const labels2 = allResponses.map(r => r.organization?.substring(0, 6) || '—');
    destroyChart('ncd-severity');
    chartInstances['ncd-severity'] = new Chart(document.getElementById('chart-severity'), {
        type: 'bar',
        data: { labels: labels2, datasets: [{ label: 'NCD (คน)', data: ncdTotals, backgroundColor: '#00A86B', borderRadius: 4 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Heatmap: org × disease
    const matrix = document.getElementById('health-matrix');
    const header = `<tr><th></th>${labels.map(l => `<th>${l}</th>`).join('')}</tr>`;
    const body = allResponses.map(r => `
    <tr><td>${r.organization?.substring(0, 8) || '—'}</td>
    ${diseases.map(d => { const v = r[d] || 0; return `<td class="${v > 20 ? 'yes' : v > 0 ? '' : 'unknown'}">${v || 0}</td>`; }).join('')}
    </tr>`).join('');
    matrix.innerHTML = header + body;
}

// =============================================
// PLANS TAB (existing — kept simple)
// =============================================
function renderPlansTab() {
    const priority_counts = {};
    allResponses.forEach(r => {
        (r.strategic_priorities || []).forEach(p => {
            priority_counts[p.label] = (priority_counts[p.label] || 0) + 1;
        });
    });
    const entries = Object.entries(priority_counts).sort((a, b) => b[1] - a[1]);
    document.getElementById('plans-progress').innerHTML = entries.length
        ? entries.map(([label, count]) => `
      <div style="margin-bottom:.75rem;">
        <div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:.25rem;">
          <span>${label}</span><span><b>${count}</b> หน่วยงาน</span>
        </div>
        <div style="background:#e2e8f0;border-radius:99px;height:8px;">
          <div style="background:#0F4C81;border-radius:99px;height:8px;width:${Math.round(count / Math.max(allResponses.length, 1) * 100)}%;"></div>
        </div>
      </div>`).join('')
        : '<p style="color:#94A3B8;font-size:.9rem;">ยังไม่มีข้อมูลยุทธศาสตร์</p>';

    document.getElementById('hrd-status-summary').innerHTML = '<p style="color:#94A3B8;font-size:.9rem;">ข้อมูลจะแสดงเมื่อมีการส่งแบบฟอร์ม v2</p>';
    document.getElementById('plans-matrix').innerHTML = '';
}

// =============================================
// WORKFORCE TAB (NEW)
// =============================================
function renderWorkforceTab() {
    // Age donut
    const ageSums = { '≤30': 0, '31–40': 0, '41–50': 0, '51–60': 0, '>60': 0 };
    allResponses.forEach(r => {
        ageSums['≤30'] += r.age_u30 || r.age_u30 || 0;
        ageSums['31–40'] += r.age_31_40 || r.age_30_39 || 0;
        ageSums['41–50'] += r.age_41_50 || r.age_40_49 || 0;
        ageSums['51–60'] += r.age_51_60 || r.age_50_plus || 0;
        ageSums['>60'] += r.age_over60 || 0;
    });
    destroyChart('age-donut');
    chartInstances['age-donut'] = new Chart(document.getElementById('chart-age-donut'), {
        type: 'doughnut',
        data: { labels: Object.keys(ageSums), datasets: [{ data: Object.values(ageSums), backgroundColor: ['#0F4C81', '#1a73c8', '#3b82f6', '#60a5fa', '#93c5fd'], borderWidth: 2 }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Service donut
    const svcSums = { '≤ 5 ปี': 0, '6–10 ปี': 0, '> 10 ปี': 0 };
    allResponses.forEach(r => {
        svcSums['≤ 5 ปี'] += r.service_u5 || 0;
        svcSums['6–10 ปี'] += r.service_6_10 || 0;
        svcSums['> 10 ปี'] += r.service_over10 || 0;
    });
    destroyChart('service-donut');
    chartInstances['service-donut'] = new Chart(document.getElementById('chart-service-donut'), {
        type: 'doughnut',
        data: { labels: Object.keys(svcSums), datasets: [{ data: Object.values(svcSums), backgroundColor: ['#00A86B', '#34d399', '#6ee7b7'], borderWidth: 2 }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Engagement line (aggregate by year)
    const yearScores = {};
    const yearCounts = {};
    allResponses.forEach(r => {
        (r.engagement_data || []).forEach(e => {
            if (e.year && e.score != null) {
                yearScores[e.year] = (yearScores[e.year] || 0) + e.score;
                yearCounts[e.year] = (yearCounts[e.year] || 0) + 1;
            }
        });
    });
    const years = Object.keys(yearScores).sort();
    const avgScores = years.map(y => +(yearScores[y] / yearCounts[y]).toFixed(1));
    destroyChart('engagement-line');
    chartInstances['engagement-line'] = new Chart(document.getElementById('chart-engagement-line'), {
        type: 'line',
        data: { labels: years, datasets: [{ label: 'คะแนน Engagement เฉลี่ย', data: avgScores, borderColor: '#0F4C81', backgroundColor: 'rgba(15,76,129,0.1)', tension: 0.4, fill: true, pointRadius: 5 }] },
        options: { responsive: true, scales: { y: { min: 0, max: 100 } }, plugins: { legend: { display: false } } }
    });
}

// =============================================
// HRD TAB (NEW)
// =============================================
function renderHRDTab() {
    const systems = [
        { key: 'mentoring_system', label: 'พี่เลี้ยง' },
        { key: 'job_rotation', label: 'Job Rotation' },
        { key: 'idp_system', label: 'IDP' },
        { key: 'career_path_system', label: 'Career Path' },
    ];
    const fullData = systems.map(s => allResponses.filter(r => r[s.key] === 'full').length);
    const partialData = systems.map(s => allResponses.filter(r => r[s.key] === 'partial').length);
    const noneData = systems.map(s => allResponses.filter(r => r[s.key] === 'none').length);
    destroyChart('support-systems');
    chartInstances['support-systems'] = new Chart(document.getElementById('chart-support-systems'), {
        type: 'bar',
        data: {
            labels: systems.map(s => s.label),
            datasets: [
                { label: 'ครบ', data: fullData, backgroundColor: '#00A86B', borderRadius: 4 },
                { label: 'บางส่วน', data: partialData, backgroundColor: '#F59E0B', borderRadius: 4 },
                { label: 'ไม่มี', data: noneData, backgroundColor: '#EF4444', borderRadius: 4 },
            ]
        },
        options: { responsive: true, scales: { x: { stacked: false }, y: { beginAtZero: true, max: Math.max(allResponses.length, 5) } }, plugins: { legend: { position: 'top' } } }
    });

    // HRD Opportunities frequency
    const oppCounts = {};
    allResponses.forEach(r => (r.hrd_opportunities || []).forEach(o => { oppCounts[o] = (oppCounts[o] || 0) + 1; }));
    const oppEntries = Object.entries(oppCounts).sort((a, b) => b[1] - a[1]);
    destroyChart('hrd-opps');
    chartInstances['hrd-opps'] = new Chart(document.getElementById('chart-hrd-opps'), {
        type: 'bar',
        data: { labels: oppEntries.map(([k]) => HRD_OPP_LABELS[k] || k), datasets: [{ data: oppEntries.map(([, v]) => v), backgroundColor: '#0F4C81', borderRadius: 4 }] },
        options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
    });

    // Digital systems pie
    const digCounts = {};
    allResponses.forEach(r => (r.digital_systems || []).forEach(d => { digCounts[d] = (digCounts[d] || 0) + 1; }));
    const digEntries = Object.entries(digCounts).sort((a, b) => b[1] - a[1]);
    const COLORS = ['#0F4C81', '#1a73c8', '#3b82f6', '#00A86B', '#34d399', '#F59E0B', '#EF4444'];
    destroyChart('digital');
    chartInstances['digital'] = new Chart(document.getElementById('chart-digital'), {
        type: 'pie',
        data: { labels: digEntries.map(([k]) => DIGITAL_LABELS[k] || k), datasets: [{ data: digEntries.map(([, v]) => v), backgroundColor: COLORS }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

// =============================================
// EXPORT TAB
// =============================================
function renderExportTab() {
    const today = new Date().toLocaleDateString('th-TH');
    document.getElementById('export-info').innerHTML = `
    <span class="export-stat">จำนวน <strong>${allResponses.length}</strong> รายการ</span>
    <span class="export-stat">ส่งล่าสุด: <strong>${allResponses[0]?.submitted_at ? new Date(allResponses[0].submitted_at).toLocaleString('th-TH') : '—'}</strong></span>
    <span class="export-stat">วันที่ export: <strong>${today}</strong></span>`;
}

function flattenRecord(r) {
    return {
        'หน่วยงาน': r.organization,
        'บุคลากรรวม': r.total_staff,
        'วันที่ส่ง': r.submitted_at ? new Date(r.submitted_at).toLocaleString('th-TH') : '',
        'เบาหวาน': r.disease_diabetes || 0,
        'ความดัน': r.disease_hypertension || 0,
        'หัวใจ': r.disease_cardiovascular || 0,
        'ไต': r.disease_kidney || 0,
        'ตับ': r.disease_liver || 0,
        'มะเร็ง': r.disease_cancer || 0,
        'อ้วน': r.disease_obesity || 0,
        'NCD รวม': r.ncd_count || 0,
        'NCD%': r.ncd_ratio_pct || '',
        'อัตราลาออก%': r.turnover_rate || '',
        'อัตราโอนย้าย%': r.transfer_rate || '',
        'ระบบพี่เลี้ยง': SUPPORT_LABELS[r.mentoring_system] || '',
        'Job Rotation': SUPPORT_LABELS[r.job_rotation] || '',
        'IDP': SUPPORT_LABELS[r.idp_system] || '',
        'Career Path': SUPPORT_LABELS[r.career_path_system] || '',
        'ชั่วโมงอบรม': TRAINING_LABELS[r.training_hours_range] || '',
        'Ergonomics': r.ergonomics_status || '',
        'ระบบดิจิทัล': (r.digital_systems || []).join(', '),
        'ยุทธศาสตร์': (r.strategic_priorities || []).map(p => p.rank + '.' + p.label).join(' | '),
        'form_version': r.form_version || '',
    };
}

function exportCSV() {
    const rows = allResponses.map(flattenRecord);
    if (!rows.length) { alert('ไม่มีข้อมูล'); return; }
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `hrd_ch1_${today()}.csv`);
}

function exportJSON() {
    const blob = new Blob([JSON.stringify(allResponses, null, 2)], { type: 'application/json' });
    downloadFile(blob, `hrd_ch1_${today()}.json`);
}

function exportExcel() {
    if (!window.XLSX) { alert('กำลังโหลด SheetJS...'); return; }
    const rows = allResponses.map(flattenRecord);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HRD Ch1');
    XLSX.writeFile(wb, `hrd_ch1_${today()}.xlsx`);
}

function downloadFile(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

// =============================================
// UTILS
// =============================================
function destroyChart(key) {
    if (chartInstances[key]) { chartInstances[key].destroy(); delete chartInstances[key]; }
}

function mode(arr) {
    if (!arr.length) return null;
    const freq = {};
    arr.forEach(v => (freq[v] = (freq[v] || 0) + 1));
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}
