// ========================================
// js/ch1-admin.js — HRD Ch1 Admin Dashboard Logic
// ========================================

const ch1Admin = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ORGANIZATIONS = [
    "กรมกิจการเด็กและเยาวชน",
    "กรมคุมประพฤติ",
    "กรมชลประทาน",
    "กรมทางหลวง",
    "กรมวิทยาศาสตร์บริการ",
    "กรมส่งเสริมวัฒนธรรม",
    "กรมสุขภาพจิต",
    "กรมอุตุนิยมวิทยา",
    "สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ",
    "สำนักงานคณะกรรมการพัฒนาระบบราชการ",
    "สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม",
    "สำนักงานนโยบายและยุทธศาสตร์การค้า",
    "สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา",
    "สำนักงานการวิจัยแห่งชาติ",
    "สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ"
];

const HEALTH_ISSUES_ALL = ['NCD', 'สุขภาพจิต', 'น้ำหนักเกิน', 'การนอนหลับ', 'ออฟฟิศซินโดรม', 'แอลกอฮอล์/บุหรี่'];
const PLANS_ALL = [
    'ยุทธศาสตร์ชาติ 20 ปี',
    'แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ ฉบับที่ 13',
    'แผนแม่บทของกระทรวงที่สังกัด',
    'แผน HRD ของหน่วยงาน',
    'ไม่แน่ใจ / ไม่ทราบ'
];

let allResponses = [];
let chartInstances = {};

// --- Session Guard ---
(async () => {
    const { data: { session } } = await ch1Admin.auth.getSession();
    if (!session) {
        window.location.href = '/admin-login.html';
        return;
    }
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    await initDashboard();
})();

async function logout() {
    await ch1Admin.auth.signOut();
    window.location.href = '/admin-login.html';
}

// --- Tab Switching ---
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tabId}`));
}

// --- Init ---
async function initDashboard() {
    try {
        await loadAllData();
        renderOverview();
        renderOrgTable();
        renderHealthTab();
        renderPlansTab();
        renderExportTab();
    } catch (err) {
        console.error('Dashboard init error:', err);
    }
}

async function loadAllData() {
    const { data, error } = await ch1Admin
        .from('hrd_ch1_responses')
        .select('*')
        .order('submitted_at', { ascending: false });

    if (error) throw error;
    allResponses = data || [];
}

// ========================================
// TAB: Overview
// ========================================
function renderOverview() {
    const submitted = new Set(allResponses.map(r => r.organization));
    const submittedCount = submitted.size;
    const pendingCount = 15 - submittedCount;

    const totalStaff = allResponses.reduce((sum, r) => sum + (r.total_staff || 0), 0);
    const ncdRatios = allResponses.filter(r => r.ncd_ratio_pct != null).map(r => r.ncd_ratio_pct);
    const avgNcd = ncdRatios.length > 0
        ? (ncdRatios.reduce((s, v) => s + Number(v), 0) / ncdRatios.length).toFixed(1)
        : '-';

    document.getElementById('kpi-submitted').textContent = `${submittedCount} / 15`;
    document.getElementById('kpi-pending').textContent = pendingCount;
    document.getElementById('kpi-staff').textContent = totalStaff.toLocaleString();
    document.getElementById('kpi-ncd').textContent = avgNcd === '-' ? '-' : `${avgNcd}%`;

    // Progress list
    const container = document.getElementById('org-progress-items');
    container.innerHTML = ORGANIZATIONS.map(org => {
        const done = submitted.has(org);
        return `
            <div class="org-item">
                <div class="org-status ${done ? 'done' : 'pending'}">${done ? '✅' : '⏳'}</div>
                <span style="flex:1">${org}</span>
                <span style="font-size:0.8rem;color:${done ? '#059669' : '#94A3B8'}">${done ? 'ส่งแล้ว' : 'รอการส่ง'}</span>
            </div>
        `;
    }).join('');
}

// ========================================
// TAB: Organizations Table
// ========================================
function renderOrgTable() {
    const tbody = document.getElementById('org-table-body');
    if (allResponses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#94A3B8;">ยังไม่มีข้อมูล</td></tr>';
        return;
    }

    tbody.innerHTML = allResponses.map((r, i) => {
        const sevBadge = severityBadge(r.severity_score);
        const hrdBadge = hrdStatusBadge(r.hrd_plan_status);
        const topIssues = (r.health_issues || []).slice(0, 2).join(', ');
        const date = new Date(r.submitted_at).toLocaleDateString('th-TH', {
            day: '2-digit', month: 'short', year: 'numeric'
        });

        return `
            <tr style="cursor:pointer" onclick="showDetail(${i})">
                <td style="font-weight:500">${r.organization}</td>
                <td>${(r.total_staff || 0).toLocaleString()}</td>
                <td>${r.ncd_count ?? '-'}</td>
                <td>${r.ncd_ratio_pct != null ? r.ncd_ratio_pct + '%' : '-'}</td>
                <td>${topIssues || '-'}</td>
                <td>${sevBadge}</td>
                <td>${hrdBadge}</td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');
}

function severityBadge(score) {
    if (score == null) return '-';
    if (score <= 2) return `<span class="badge badge-green">${score}/5</span>`;
    if (score === 3) return `<span class="badge badge-yellow">${score}/5</span>`;
    return `<span class="badge badge-red">${score}/5</span>`;
}

function hrdStatusBadge(status) {
    const map = {
        yes: '<span class="badge badge-green">มีแล้ว</span>',
        inprogress: '<span class="badge badge-yellow">กำลังจัดทำ</span>',
        no: '<span class="badge badge-red">ยังไม่มี</span>'
    };
    return map[status] || '-';
}

function showDetail(index) {
    const r = allResponses[index];
    if (!r) return;

    const hrdLabels = { yes: '✅ มีแล้ว', inprogress: '🔄 กำลังจัดทำ', no: '❌ ยังไม่มี' };
    const sevLabels = ['', 'น้อยมาก', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];
    const date = new Date(r.submitted_at).toLocaleString('th-TH');

    let html = `
        <button class="modal-close" onclick="closeModal()">&times;</button>
        <div class="modal-title">🏢 ${r.organization}</div>
        <div class="modal-row"><span class="lbl">บุคลากรทั้งหมด</span><span class="val">${(r.total_staff || 0).toLocaleString()} คน</span></div>
        ${r.age_u30 ? `<div class="modal-row"><span class="lbl">อายุ < 30</span><span class="val">${r.age_u30} คน</span></div>` : ''}
        ${r.age_30_39 ? `<div class="modal-row"><span class="lbl">อายุ 30-39</span><span class="val">${r.age_30_39} คน</span></div>` : ''}
        ${r.age_40_49 ? `<div class="modal-row"><span class="lbl">อายุ 40-49</span><span class="val">${r.age_40_49} คน</span></div>` : ''}
        ${r.age_50_plus ? `<div class="modal-row"><span class="lbl">อายุ 50+</span><span class="val">${r.age_50_plus} คน</span></div>` : ''}
        <div class="modal-row"><span class="lbl">ผู้ป่วย NCD</span><span class="val">${r.ncd_count ?? '-'} คน (${r.ncd_ratio_pct != null ? r.ncd_ratio_pct + '%' : '-'})</span></div>
        <div class="modal-row"><span class="lbl">ค่ารักษาพยาบาล</span><span class="val">${r.med_expense_available === 'yes' ? 'มีข้อมูล' : 'ไม่มีข้อมูล'}</span></div>
        ${r.med_expense_available === 'yes' ? `
        <div class="modal-row"><span class="lbl">ค่ารักษา 2563-2567</span><span class="val">${[r.med_expense_2563, r.med_expense_2564, r.med_expense_2565, r.med_expense_2566, r.med_expense_2567].map(v => v != null ? Number(v).toLocaleString() : '-').join(' / ')}</span></div>
        ` : ''}
        <div style="margin-top:1rem">
            <span class="lbl" style="font-size:0.85rem;color:#64748B;">ปัญหาสุขภาพ</span>
            <div class="modal-tags">${(r.health_issues || []).map(i => `<span class="modal-tag">${i}</span>`).join('')}</div>
            ${r.health_issues_other ? `<div style="margin-top:0.3rem;font-size:0.85rem;color:#64748B;">อื่นๆ: ${r.health_issues_other}</div>` : ''}
        </div>
        <div class="modal-row"><span class="lbl">ความรุนแรง</span><span class="val">${sevLabels[r.severity_score] || '-'} (${r.severity_score}/5)</span></div>
        <div style="margin-top:1rem">
            <span class="lbl" style="font-size:0.85rem;color:#64748B;">แผนที่เชื่อมโยง</span>
            <div class="modal-tags">${(r.linked_plans || []).map(p => `<span class="modal-tag">${p}</span>`).join('')}</div>
        </div>
        <div class="modal-row"><span class="lbl">สถานะ HRD</span><span class="val">${hrdLabels[r.hrd_plan_status] || '-'}</span></div>
        <div class="modal-row"><span class="lbl">วันที่ส่ง</span><span class="val">${date}</span></div>
    `;

    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('detail-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('detail-modal').classList.remove('show');
}

// Close modal on overlay click
document.getElementById('detail-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('detail-modal')) closeModal();
});

// ========================================
// TAB: Health Issues
// ========================================
function renderHealthTab() {
    // Count issues
    const issueCounts = {};
    const issueSeverity = {};
    HEALTH_ISSUES_ALL.forEach(iss => { issueCounts[iss] = 0; issueSeverity[iss] = []; });

    allResponses.forEach(r => {
        (r.health_issues || []).forEach(iss => {
            if (issueCounts[iss] !== undefined) {
                issueCounts[iss]++;
                if (r.severity_score) issueSeverity[iss].push(r.severity_score);
            }
        });
    });

    const labels = HEALTH_ISSUES_ALL;
    const counts = labels.map(l => issueCounts[l]);
    const avgSev = labels.map(l => {
        const arr = issueSeverity[l];
        return arr.length > 0 ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
    });

    // Chart 1: Horizontal bar
    destroyChart('chart-issues');
    chartInstances['chart-issues'] = new Chart(document.getElementById('chart-issues'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'จำนวนหน่วยงาน',
                data: counts,
                backgroundColor: ['#EF4444', '#8B5CF6', '#F59E0B', '#6366F1', '#10B981', '#EC4899'],
                borderRadius: 6,
                barThickness: 28
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, title: { display: true, text: 'จำนวนหน่วยงาน' } }
            }
        }
    });

    // Chart 2: Scatter-like bar
    destroyChart('chart-severity');
    chartInstances['chart-severity'] = new Chart(document.getElementById('chart-severity'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ความรุนแรงเฉลี่ย',
                data: avgSev,
                backgroundColor: avgSev.map(v => v <= 2 ? '#10B981' : v <= 3 ? '#F59E0B' : '#EF4444'),
                borderRadius: 6,
                barThickness: 28
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 5, title: { display: true, text: 'ความรุนแรงเฉลี่ย (1-5)' } }
            }
        }
    });

    // Heatmap Matrix
    renderHealthMatrix();
}

function renderHealthMatrix() {
    const submitted = {};
    allResponses.forEach(r => { submitted[r.organization] = r.health_issues || []; });

    let html = '<thead><tr><th>หน่วยงาน</th>';
    HEALTH_ISSUES_ALL.forEach(iss => { html += `<th>${iss}</th>`; });
    html += '</tr></thead><tbody>';

    ORGANIZATIONS.forEach(org => {
        html += `<tr><td>${org}</td>`;
        const issues = submitted[org];
        HEALTH_ISSUES_ALL.forEach(iss => {
            if (!issues) {
                html += '<td class="unknown">?</td>';
            } else if (issues.includes(iss)) {
                html += '<td class="yes">✅</td>';
            } else {
                html += '<td class="no">─</td>';
            }
        });
        html += '</tr>';
    });
    html += '</tbody>';

    document.getElementById('health-matrix').innerHTML = html;
}

// ========================================
// TAB: Plans
// ========================================
function renderPlansTab() {
    const submitted = {};
    allResponses.forEach(r => {
        submitted[r.organization] = {
            plans: r.linked_plans || [],
            hrdStatus: r.hrd_plan_status
        };
    });

    // Plan counts
    const planCounts = {};
    PLANS_ALL.forEach(p => planCounts[p] = 0);
    allResponses.forEach(r => {
        (r.linked_plans || []).forEach(p => {
            if (planCounts[p] !== undefined) planCounts[p]++;
        });
    });

    // Progress bars
    const progressHtml = PLANS_ALL.map(plan => {
        const count = planCounts[plan];
        const pct = Math.round((count / 15) * 100);
        return `
            <div style="margin-bottom:1rem">
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.3rem">
                    <span>${plan}</span>
                    <span style="font-weight:600">${count}/15 (${pct}%)</span>
                </div>
                <div style="background:#E2E8F0;border-radius:50px;height:12px;overflow:hidden">
                    <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#0D9488,#3B82F6);border-radius:50px;transition:width 0.5s"></div>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('plans-progress').innerHTML = progressHtml;

    // HRD Status
    let yesCount = 0, ipCount = 0, noCount = 0;
    allResponses.forEach(r => {
        if (r.hrd_plan_status === 'yes') yesCount++;
        else if (r.hrd_plan_status === 'inprogress') ipCount++;
        else if (r.hrd_plan_status === 'no') noCount++;
    });
    document.getElementById('hrd-status-summary').innerHTML = `
        <div class="status-card yes-card"><div class="val">${yesCount}</div><div class="lbl">มีแผน HRD แล้ว</div></div>
        <div class="status-card inprogress-card"><div class="val">${ipCount}</div><div class="lbl">กำลังจัดทำ</div></div>
        <div class="status-card no-card"><div class="val">${noCount}</div><div class="lbl">ยังไม่มี</div></div>
    `;

    // Plans Matrix
    let mHtml = '<thead><tr><th>หน่วยงาน</th>';
    PLANS_ALL.forEach(p => { mHtml += `<th style="font-size:0.65rem;">${p}</th>`; });
    mHtml += '<th>HRD</th></tr></thead><tbody>';

    ORGANIZATIONS.forEach(org => {
        const info = submitted[org];
        mHtml += `<tr><td>${org}</td>`;
        PLANS_ALL.forEach(plan => {
            if (!info) {
                mHtml += '<td class="unknown">?</td>';
            } else if (info.plans.includes(plan)) {
                mHtml += '<td class="yes">✅</td>';
            } else {
                mHtml += '<td class="no">❌</td>';
            }
        });
        if (!info) {
            mHtml += '<td class="unknown">?</td>';
        } else {
            const hrdBadge = info.hrdStatus === 'yes' ? '✅' : info.hrdStatus === 'inprogress' ? '🔄' : '❌';
            mHtml += `<td>${hrdBadge}</td>`;
        }
        mHtml += '</tr>';
    });
    mHtml += '</tbody>';
    document.getElementById('plans-matrix').innerHTML = mHtml;
}

// ========================================
// TAB: Export
// ========================================
function renderExportTab() {
    const count = allResponses.length;
    const orgs = new Set(allResponses.map(r => r.organization)).size;
    const latest = allResponses.length > 0
        ? new Date(allResponses[0].submitted_at).toLocaleString('th-TH')
        : '-';

    document.getElementById('export-info').innerHTML = `
        <div class="export-stat">ข้อมูล <strong>${count}</strong> รายการ</div>
        <div class="export-stat"><strong>${orgs}</strong> หน่วยงาน</div>
        <div class="export-stat">อัปเดตล่าสุด: <strong>${latest}</strong></div>
    `;
}

function exportCSV() {
    if (allResponses.length === 0) { alert('ไม่มีข้อมูลให้ export'); return; }

    const BOM = '\uFEFF';
    const headers = [
        'หน่วยงาน', 'บุคลากรรวม',
        'อายุต่ำกว่า30', 'อายุ30-39', 'อายุ40-49', 'อายุ50ขึ้นไป',
        'NCD(คน)', 'NCD(%)', 'มีข้อมูลค่ารักษา',
        'ค่ารักษา2563', 'ค่ารักษา2564', 'ค่ารักษา2565', 'ค่ารักษา2566', 'ค่ารักษา2567',
        'ปัญหาสุขภาพ', 'ปัญหาอื่นๆ', 'ระดับความรุนแรง',
        'แผนชาติที่เชื่อมโยง', 'สถานะHRD', 'วันที่ส่ง'
    ];

    const rows = allResponses.map(r => [
        r.organization, r.total_staff,
        r.age_u30, r.age_30_39, r.age_40_49, r.age_50_plus,
        r.ncd_count, r.ncd_ratio_pct, r.med_expense_available,
        r.med_expense_2563, r.med_expense_2564,
        r.med_expense_2565, r.med_expense_2566, r.med_expense_2567,
        (r.health_issues || []).join('; '),
        r.health_issues_other || '',
        r.severity_score,
        (r.linked_plans || []).join('; '),
        r.hrd_plan_status,
        new Date(r.submitted_at).toLocaleDateString('th-TH')
    ]);

    const csv = BOM + [headers, ...rows]
        .map(row => row.map(v => `"${v ?? ''}"`).join(','))
        .join('\n');

    downloadFile(csv, `HRD_ch1_${todayStr()}.csv`, 'text/csv;charset=utf-8');
}

function exportJSON() {
    if (allResponses.length === 0) { alert('ไม่มีข้อมูลให้ export'); return; }
    downloadFile(
        JSON.stringify(allResponses, null, 2),
        `HRD_ch1_${todayStr()}.json`,
        'application/json'
    );
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// --- Chart helpers ---
function destroyChart(id) {
    if (chartInstances[id]) {
        chartInstances[id].destroy();
        delete chartInstances[id];
    }
}
