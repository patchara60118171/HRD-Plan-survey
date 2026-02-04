// Admin Dashboard Logic

// Admin Password (Client-side simple check)
const ADMIN_PASS = "admin";

// Initialize Supabase Helper
let supabaseAdmin = null;
function initSupabaseAdmin() {
    if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined') {
        supabaseAdmin = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}

// Check if logged in
if (localStorage.getItem('admin_logged_in') === 'true') {
    showDashboard();
}

function adminLogin() {
    const input = document.getElementById('admin-pass').value;
    if (input === ADMIN_PASS) {
        localStorage.setItem('admin_logged_in', 'true');
        showDashboard();
    } else {
        alert('รหัสผ่านไม่ถูกต้อง');
    }
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'block';

    // Init Supabase if not already
    initSupabaseAdmin();

    fetchData();
}

function logout() {
    localStorage.removeItem('admin_logged_in');
    location.reload();
}

// Fetch Data from Supabase
async function fetchData() {
    if (!supabaseAdmin) {
        initSupabaseAdmin();
        if (!supabaseAdmin) {
            alert('Supabase Client initialization failed. Check config.');
            return;
        }
    }

    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('table-body');
    loading.style.display = 'block';
    tableBody.innerHTML = '';

    try {
        // Fetch ALL data from Supabase
        // Ordering by submitted_at desc (or timestamp)
        const { data, error } = await supabaseAdmin
            .from('survey_responses')
            .select('*')
            .order('timestamp', { ascending: false });

        loading.style.display = 'none';

        if (error) {
            console.error('Supabase Error:', error);
            alert('Error fetching data: ' + error.message);
            return;
        }

        loading.style.display = 'none';

        // 1. Check Data Quality
        console.log('Fetched Data:', data.length);

        renderTable(data);
        window.originalData = data;
        window.currentData = data;

        updateFilterCounts();

        // 2. Process Logic (Separate Try-Catch)
        try {
            processAdvancedStats(window.currentData);
        } catch (processError) {
            console.error('Processing Stats Error:', processError);
            alert('เกิดข้อผิดพลาดในการคำนวณสถิติ: ' + processError.message);
        }

    } catch (e) {
        loading.style.display = 'none';
        console.error('Fetch Exception:', e);
        alert('Failed to fetch data: ' + e.message);
    }
}

// ========================================
// Filter Logic
// ========================================
function applyFilters() {
    const gender = document.getElementById('filter-gender').value;
    const ageGroup = document.getElementById('filter-age').value;
    // const region = document.getElementById('filter-region').value; // Removed

    let filtered = window.originalData.filter(row => {
        let pass = true;
        // Gender Filter
        if (gender !== 'all') {
            if (row.raw_responses?.gender !== gender && row.gender !== gender) pass = false;
        }
        // Region Filter Removed
        // if (region !== 'all') { ... }
        // Age Group Filter
        if (ageGroup !== 'all') {
            const age = parseInt(row.age || row.raw_responses?.age || 0);
            if (ageGroup === 'GenZ' && age >= 27) pass = false; // < 27
            else if (ageGroup === 'GenY' && (age < 27 || age > 42)) pass = false;
            else if (ageGroup === 'GenX' && (age < 43 || age > 58)) pass = false;
            else if (ageGroup === 'BabyBoomer' && age <= 58) pass = false;
        }
        return pass;
    });

    window.currentData = filtered;
    updateFilterCounts();
    renderTable(filtered);
    processAdvancedStats(filtered);
}

function updateFilterCounts() {
    document.getElementById('filtered-count').innerText = window.currentData.length.toLocaleString();
}

// ========================================
// Advanced Statistics Processing
// ========================================
let charts = {}; // Store chart instances

function processAdvancedStats(data) {
    if (!data) return;
    console.log('Processing Stats for', data.length, 'rows');

    // --- 1. Overview Stats ---
    let totalBMI = 0, totalTMHI = 0, riskCount = 0;
    let validBMI = 0, validTMHI = 0, totalAge = 0, validAge = 0;

    // Aggregation Containers
    let counts = {
        gender: {}, ageGroup: {},
        tmhiLevel: { 'Excellent': 0, 'Good': 0, 'Fair': 0, 'Poor': 0 },
        bmi: { 'Underweight': 0, 'Normal': 0, 'Overweight': 0, 'Obese': 0 },
        smoke: { 'Never': 0, 'Regular': 0, 'Occasional': 0 },
        alcohol: { 'Never': 0, 'Regular': 0, 'Occasional': 0 },
        pm25Impact: {},
        envImpact: { glare: 0, noise: 0, smell: 0, smoke: 0, posture: 0 },
        diseases: {},
        dietRisk: {} // Will count frequency of "Everyday" answers
    };

    data.forEach(row => {
        const r = row.raw_responses || {}; // Shortcut to raw answers

        // Age
        const age = parseInt(row.age || r.age || 0);
        if (age > 0) { totalAge += age; validAge++; }

        // Age Group
        let ag = 'Unknown';
        if (age < 27) ag = 'Gen Z';
        else if (age <= 42) ag = 'Gen Y';
        else if (age <= 58) ag = 'Gen X';
        else ag = 'Baby Boomer';
        counts.ageGroup[ag] = (counts.ageGroup[ag] || 0) + 1;

        // Gender & Region
        const g = row.gender || r.gender || 'ไม่ระบุ';
        counts.gender[g] = (counts.gender[g] || 0) + 1;

        // Region Removed
        // const reg = row.region || r.region || 'ไม่ระบุ';
        // counts.region[reg] = (counts.region[reg] || 0) + 1;

        // BMI
        const bmi = parseFloat(row.bmi);
        if (!isNaN(bmi)) {
            totalBMI += bmi; validBMI++;
            if (bmi < 18.5) counts.bmi.Underweight++;
            else if (bmi < 25) counts.bmi.Normal++;
            else if (bmi < 30) counts.bmi.Overweight++;
            else counts.bmi.Obese++;
        }

        // TMHI
        const tmhi = parseFloat(row.tmhi_score);
        if (!isNaN(tmhi)) {
            totalTMHI += tmhi; validTMHI++;
            if (tmhi >= 52) counts.tmhiLevel.Excellent++;
            else if (tmhi >= 44) counts.tmhiLevel.Good++;
            else if (tmhi >= 33) counts.tmhiLevel.Fair++;
            else counts.tmhiLevel.Poor++;
        }

        // Risk (BMI Obese OR Mental Poor)
        if ((bmi >= 30) || (tmhi <= 32)) riskCount++;

        // Health Behaviors
        // Smoking (q2001)
        const smoke = r.q2001 || 'ไม่เคยสูบ';
        if (smoke.includes('ไม่เคย')) counts.smoke.Never++;
        else if (smoke.includes('ประจำ')) counts.smoke.Regular++;
        else counts.smoke.Occasional++;

        // Alcohol (q2003)
        const alc = r.q2003 || 'ไม่เคยดื่ม';
        if (alc.includes('ไม่เคย')) counts.alcohol.Never++;
        else if (alc.includes('ประจำ')) counts.alcohol.Regular++;
        else counts.alcohol.Occasional++;

        // Diet Risks (Count "Everyday" answers)
        // Check sweet_1..5, fat_1..5, salt_1..5
        ['sweet', 'fat', 'salt'].forEach(cat => {
            for (let i = 1; i <= 5; i++) {
                // SKIP Good Behaviors (Not Risk)
                // sweet_1: Water/Black Coffee
                // salt_1: Taste before seasoning
                // salt_2: Use herbs
                if (cat === 'sweet' && i === 1) continue;
                if (cat === 'salt' && (i === 1 || i === 2)) continue;

                const key = `${cat}_${i}`;
                const val = r[key];
                if (val && (val.includes('ทุกวัน') || val.includes('ประจำ'))) {
                    // Map key to label? (Optional, simplified for now)
                    counts.dietRisk[key] = (counts.dietRisk[key] || 0) + 1;
                }
            }
        });



        // Environment (check for "ใช่ (มีตอสุขภาพ)")
        if (r.env_glare?.includes('มีผล')) counts.envImpact.glare++;
        if (r.env_noise?.includes('มีผล')) counts.envImpact.noise++;
        if (r.env_smell?.includes('มีผล')) counts.envImpact.smell++;
        if (r.env_smoke?.includes('มีผล')) counts.envImpact.smoke++;
        if (r.env_posture?.includes('มีผล') || r.env_awkward?.includes('มีผล')) counts.envImpact.posture++;

        // PM2.5
        const pm = r.pm25_impact || 'ไม่ระบุ';
        counts.pm25Impact[pm] = (counts.pm25Impact[pm] || 0) + 1;

        // Diseases
        if (Array.isArray(r.diseases)) {
            r.diseases.forEach(d => {
                if (d !== 'ไม่มี') counts.diseases[d] = (counts.diseases[d] || 0) + 1;
            });
        }
    });

    // Update Cards
    document.getElementById('stat-total').innerText = data.length.toLocaleString();
    document.getElementById('stat-age').innerText = validAge ? (totalAge / validAge).toFixed(1) : '-';
    document.getElementById('stat-bmi').innerText = validBMI ? (totalBMI / validBMI).toFixed(1) : '-';
    // Count TMHI avg
    const avgTMHI = validTMHI ? (totalTMHI / validTMHI).toFixed(1) : 0; // Don't set text here, will use in gauge chart

    // Risk percent
    const riskPct = data.length ? ((riskCount / data.length) * 100).toFixed(1) : 0;
    document.getElementById('stat-risk').innerText = `${riskPct}%`;

    console.log('Rendering Charts with counts:', counts);
    // --- Render Charts ---
    renderAllCharts(counts, avgTMHI);
}

function renderAllCharts(counts, avgTMHI) {
    // Helper colors
    const colors = {
        primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
        risk: ['#22C55E', '#EAB308', '#F97316', '#EF4444'], // Good -> Bad
        gender: ['#3B82F6', '#EC4899', '#94A3B8']
    };

    // 1. Gender (Doughnut)
    createChart('chart-gender', 'doughnut', {
        labels: Object.keys(counts.gender),
        datasets: [{ data: Object.values(counts.gender), backgroundColor: colors.gender }]
    });

    // 2. Age Group (Bar)
    createChart('chart-age-group', 'bar', {
        labels: Object.keys(counts.ageGroup),
        datasets: [{ label: 'จำนวนคน', data: Object.values(counts.ageGroup), backgroundColor: '#8B5CF6' }]
    });

    // 3. Region Chart Removed
    // createChart('chart-region', ...);

    // 4. TMHI Gauge (Doughnut - workaround)
    // We simulate a gauge by showing "Score" vs "Remaining"
    // Max score 60.
    const score = parseFloat(avgTMHI);
    const empty = 60 - score;
    let gaugeColor = score > 43 ? '#22C55E' : (score > 33 ? '#EAB308' : '#EF4444');

    // Destroy manually to customize center text later if needed
    if (charts['chart-tmhi-gauge']) charts['chart-tmhi-gauge'].destroy();
    charts['chart-tmhi-gauge'] = new Chart(document.getElementById('chart-tmhi-gauge'), {
        type: 'doughnut',
        data: {
            labels: ['คะแนนเฉลี่ย', 'ส่วนที่เหลือ'],
            datasets: [{ data: [score, empty], backgroundColor: [gaugeColor, '#E2E8F0'], cutout: '70%' }]
        },
        options: {
            rotation: -90, circumference: 180, // Half circle
            plugins: {
                legend: { display: false },
                title: { display: true, text: `${score} / 60`, position: 'bottom', font: { size: 24 } }
            }
        }
    });

    // 5. TMHI Levels (Bar)
    createChart('chart-tmhi-levels', 'bar', {
        labels: ['ดีมาก', 'ปกติ', 'ปานกลาง', 'ควรปรับปรุง'],
        datasets: [{
            label: 'จำนวนคน',
            data: [counts.tmhiLevel.Excellent, counts.tmhiLevel.Good, counts.tmhiLevel.Fair, counts.tmhiLevel.Poor],
            backgroundColor: ['#22C55E', '#3B82F6', '#EAB308', '#EF4444']
        }]
    });

    // 6. Smoking & Alcohol (Bar)
    createChart('chart-smoke', 'bar', {
        labels: ['ไม่เคย', 'ประจำ', 'นานๆครั้ง'],
        datasets: [{ label: 'จำนวนคน', data: [counts.smoke.Never, counts.smoke.Regular, counts.smoke.Occasional], backgroundColor: ['#10B981', '#EF4444', '#F59E0B'] }]
    });
    createChart('chart-alcohol', 'bar', {
        labels: ['ไม่เคย', 'ประจำ', 'นานๆครั้ง'],
        datasets: [{ label: 'จำนวนคน', data: [counts.alcohol.Never, counts.alcohol.Regular, counts.alcohol.Occasional], backgroundColor: ['#10B981', '#EF4444', '#F59E0B'] }]
    });

    // 7. Activity vs Screen Time (Bar - Mock data mapping needed, using placeholders for now as strict data structure might vary)
    // For now, let's visualize just BMI Categories here as proxy or skip specific time calc if complex
    // Actually, let's put BMI Categories here as it fits "Physical Body"
    const ctxActivity = document.getElementById('chart-activity');
    if (ctxActivity) {
        createChart('chart-activity', 'bar', {
            labels: ['ผอม', 'ปกติ', 'ท้วม', 'อ้วน'],
            datasets: [{ label: 'BMI Categories', data: Object.values(counts.bmi), backgroundColor: ['#60A5FA', '#22C55E', '#EAB308', '#EF4444'] }]
        });
    }

    // 8. Diet Risk (Horizontal Bar)
    // Top 5 risks
    const sortedRisks = Object.entries(counts.dietRisk)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    createChart('chart-diet-risk', 'bar', {
        labels: sortedRisks.map(i => mapDietLabel(i[0])),
        datasets: [{ label: 'จำนวนคนที่ทานทุกวัน', data: sortedRisks.map(i => i[1]), backgroundColor: '#F43F5E' }]
    }, { indexAxis: 'y' });

    // 9. Environment Radar
    createChart('chart-env-radar', 'radar', {
        labels: ['แสงจ้า', 'เสียงดัง', 'กลิ่นเหม็น', 'ควัน/ไอระเหย', 'ท่าทางไม่เหมาะสม'],
        datasets: [{
            label: 'ผู้ได้รับผลกระทบ',
            data: [counts.envImpact.glare, counts.envImpact.noise, counts.envImpact.smell, counts.envImpact.smoke, counts.envImpact.posture],
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#EF4444',
            pointBackgroundColor: '#EF4444'
        }]
    });

    // 10. PM2.5 (Bar)
    createChart('chart-pm25', 'bar', {
        labels: Object.keys(counts.pm25Impact),
        datasets: [{ label: 'ระดับผลกระทบ', data: Object.values(counts.pm25Impact), backgroundColor: '#64748B' }]
    });

    // 11. Top Diseases (Bar)
    const sortedDiseases = Object.entries(counts.diseases)
        .sort((a, b) => b[1] - a[1]);

    createChart('chart-diseases', 'bar', {
        labels: sortedDiseases.map(d => d[0]),
        datasets: [{ label: 'จำนวนผู้ป่วย', data: sortedDiseases.map(d => d[1]), backgroundColor: '#8B5CF6' }]
    }, { indexAxis: 'y' });
}

// Chart Helper
function createChart(canvasId, type, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Destroy existing
    if (charts[canvasId]) charts[canvasId].destroy();

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
    };

    charts[canvasId] = new Chart(ctx, {
        type: type,
        data: data,
        options: { ...defaultOptions, ...options }
    });
}

// Helper to map Question ID to readable label
function mapDietLabel(key) {
    const map = {
        'sweet_1': 'ดื่มน้ำ/กาแฟดำ', 'sweet_2': 'เครื่องดื่มหวาน/อัดลม', 'sweet_3': 'น้ำผลไม้กล่อง', 'sweet_4': 'ไอศกรีม/ขนมหวาน', 'sweet_5': 'เติมน้ำตาล/น้ำเชื่อม',
        'fat_1': 'ของมัน/หนังไก่', 'fat_2': 'ของทอด', 'fat_3': 'กะทิ', 'fat_4': 'ครีมเทียม', 'fat_5': 'ราดน้ำแกง',
        'salt_1': 'ปรุงก่อนชิม', 'salt_2': 'ไม่ใช้สมุนไพร', 'salt_3': 'อาหารแปรรูป', 'salt_4': 'บะหมี่กึ่งฯ', 'salt_5': 'ของดอง'
    };
    return map[key] || key;
}

// Render Data Table
function renderTable(data) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">ไม่พบข้อมูล</td></tr>';
        return;
    }

    // Sort by timestamp desc
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        const date = row.timestamp ? new Date(row.timestamp).toLocaleString('th-TH') : '-';
        const raw = row.raw_responses || {};

        let bmi = '-';
        if (row.bmi) bmi = parseFloat(row.bmi).toFixed(1);

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${date}</td>
            <td>${row.name || raw.name || 'ไม่ระบุ'}</td>
            <td>${bmi}</td>
            <td>${row.tmhi_score || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize Headers
// Initialize Headers (Not needed for Supabase)
function initializeHeaders() {
    alert('สำหรับ Supabase ไม่จำเป็นต้องตั้งค่าหัวตารางครับ ข้อมูลจะถูกบันทึกโดยอัตโนมัติ');
}

// Download Excel
// Download Excel
function downloadExcel() {
    if (!window.currentData || window.currentData.length === 0) {
        alert('ไม่มีข้อมูลให้ดาวน์โหลด');
        return;
    }

    // 1. Build Header Map
    const headerMap = {
        'timestamp': 'วัน-เวลาที่บันทึก',
        'created_at': 'วัน-เวลาที่สร้าง',
        'name': 'ชื่อ-สกุล',
        'gender': 'เพศ',
        'age': 'อายุ',
        'height': 'ส่วนสูง',
        'weight': 'น้ำหนัก',
        'waist': 'รอบเอว',
        'bmi': 'BMI',
        'tmhi_score': 'คะแนนสุขภาพจิต (เต็ม 60)'
    };

    // Map Question IDs to Thai Text from SURVEY_DATA
    if (typeof SURVEY_DATA !== 'undefined') {
        Object.values(SURVEY_DATA).forEach(section => {
            if (section.subsections) {
                section.subsections.forEach(sub => {
                    if (sub.questions) {
                        sub.questions.forEach(q => {
                            headerMap[q.id] = q.text;
                        });
                    }
                });
            }
        });
    }

    // 2. Prepare Data for Export
    const exportData = window.currentData.map(row => {
        const raw = row.raw_responses || {};
        const newRow = {};

        // 2.1 Add System Columns First (Ordered)
        newRow['ลำดับ'] = row.id || '-';
        newRow[headerMap['timestamp']] = row.timestamp ? new Date(row.timestamp).toLocaleString('th-TH') : '-';
        newRow[headerMap['name']] = row.name || raw.name || '-';
        newRow[headerMap['bmi']] = row.bmi ? parseFloat(row.bmi).toFixed(1) : '-';
        newRow[headerMap['tmhi_score']] = row.tmhi_score || '-';

        // 2.2 Add Detail Columns (Iterate through map to respect logical order if possible, or just dump raw)
        // To be safe and get all data, we iterate the raw keys
        Object.keys(raw).forEach(key => {
            // Skip if already handled manually above (optional, but good for cleanliness)
            if (['name', 'bmi'].includes(key)) return;

            const thaiHeader = headerMap[key] || key; // Use Thai if available, else key

            // Format arrays (checkboxes)
            const val = Array.isArray(raw[key]) ? raw[key].join(', ') : raw[key];
            newRow[thaiHeader] = val;
        });

        return newRow;
    });

    // 3. Create Workbook & Export
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Survey Data");
    XLSX.writeFile(wb, `WellBeing_Survey_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
