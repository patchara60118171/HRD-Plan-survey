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

        renderTable(data);
        window.currentData = data; // Store for export

        // Update Dashboard Stats & Charts
        processDataForDashboard(data);

    } catch (e) {
        loading.style.display = 'none';
        console.error(e);
        alert('Failed to fetch data');
    }
}

// Calculate and Render Dashboard Stats
function processDataForDashboard(data) {
    if (!data || data.length === 0) return;

    let totalBMI = 0;
    let totalTMHI = 0;
    let riskCount = 0;
    let bmiCounts = { underweight: 0, normal: 0, overweight: 0, obese: 0 };
    let tmhiLevels = { excellent: 0, good: 0, fair: 0, poor: 0 };
    let validBMICount = 0;
    let validTMHICount = 0;

    // Daily Responses Map
    let dateMap = {};

    data.forEach(row => {
        // 1. BMI Stats
        if (row.bmi && !isNaN(row.bmi)) {
            const bmi = parseFloat(row.bmi);
            totalBMI += bmi;
            validBMICount++;

            // Count Categories (Manual check if category is missing)
            if (bmi < 18.5) bmiCounts.underweight++;
            else if (bmi < 25) bmiCounts.normal++;
            else if (bmi < 30) bmiCounts.overweight++;
            else bmiCounts.obese++;
        }

        // 2. TMHI Stats
        if (row.tmhi_score && !isNaN(row.tmhi_score)) {
            const score = parseInt(row.tmhi_score);
            totalTMHI += score;
            validTMHICount++;

            // Levels: Excellent(52-60), Good(44-51), Fair(33-43), Poor(0-32)
            if (score >= 52) tmhiLevels.excellent++;
            else if (score >= 44) tmhiLevels.good++;
            else if (score >= 33) tmhiLevels.fair++;
            else tmhiLevels.poor++;
        }

        // 3. Risk Calculation (Obese OR Poor Mental Health)
        const isObese = row.bmi >= 30;
        const isPoorMental = row.tmhi_score !== null && row.tmhi_score <= 32;
        if (isObese || isPoorMental) {
            riskCount++;
        }

        // 4. Timeline Stats
        if (row.timestamp) {
            const dateKey = new Date(row.timestamp).toISOString().split('T')[0];
            dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
        }
    });

    // Update Cards
    document.getElementById('stat-total').innerText = data.length;
    document.getElementById('stat-bmi').innerText = validBMICount ? (totalBMI / validBMICount).toFixed(1) : '0.0';
    document.getElementById('stat-tmhi').innerText = validTMHICount ? (totalTMHI / validTMHICount).toFixed(1) : '0.0';

    const riskPercent = ((riskCount / data.length) * 100).toFixed(1);
    document.getElementById('stat-risk').innerText = `${riskPercent}%`;

    // Render Charts
    renderCharts(bmiCounts, tmhiLevels, dateMap);
}

let charts = {}; // Store chart instances to destroy before re-creating

function renderCharts(bmiCounts, tmhiLevels, dateMap) {
    // 1. BMI Pie Chart
    const ctxBMI = document.getElementById('chart-bmi').getContext('2d');
    if (charts.bmi) charts.bmi.destroy();

    charts.bmi = new Chart(ctxBMI, {
        type: 'doughnut',
        data: {
            labels: ['น้ำหนักน้อย', 'ปกติ', 'ท้วม', 'อ้วน'],
            datasets: [{
                data: [bmiCounts.underweight, bmiCounts.normal, bmiCounts.overweight, bmiCounts.obese],
                backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#F87171'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 2. TMHI Bar Chart
    const ctxTMHI = document.getElementById('chart-tmhi').getContext('2d');
    if (charts.tmhi) charts.tmhi.destroy();

    charts.tmhi = new Chart(ctxTMHI, {
        type: 'bar',
        data: {
            labels: ['ดีมาก (ใจแกร่ง)', 'ปกติ (ใจแข็งแรง)', 'ปานกลาง (พอไหว)', 'ควรปรับปรุง (อ่อนล้า)'],
            datasets: [{
                label: 'จำนวนคน',
                data: [tmhiLevels.excellent, tmhiLevels.good, tmhiLevels.fair, tmhiLevels.poor],
                backgroundColor: ['#34D399', '#60A5FA', '#FBBF24', '#F87171'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });

    // 3. Timeline Line Chart
    const sortedDates = Object.keys(dateMap).sort();
    const timelineData = sortedDates.map(d => dateMap[d]);
    // Format dates for label
    const dateLabels = sortedDates.map(d => {
        const date = new Date(d);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const ctxTimeline = document.getElementById('chart-timeline').getContext('2d');
    if (charts.timeline) charts.timeline.destroy();

    charts.timeline = new Chart(ctxTimeline, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [{
                label: 'ผู้ตอบแบบสอบถาม (คน)',
                data: timelineData,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

function renderTable(data) {
    const tbody = document.getElementById('table-body');
    const thead = document.getElementById('table-headers');

    // Auto-generate headers based on data keys if needed? 
    // Or stick to fixed columns + expandable details?
    // Let's stick to key columns: Time, Name, BMI, TMHI Score
    // But data is dynamic.

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">ไม่พบข้อมูล</td></tr>';
        return;
    }

    // Sort by timestamp desc
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        const date = row.timestamp ? new Date(row.timestamp).toLocaleString('th-TH') : '-';

        // Calculate Scores on the fly if not in sheet? 
        // Or assume sheet has raw values.
        // Let's try to calculate.
        const height = row.height;
        const weight = row.weight;
        let bmi = '-';
        if (height && weight) {
            bmi = (weight / ((height / 100) ** 2)).toFixed(1);
        }

        // TMHI Score Calculation (need all tmhi_x)
        let tmhi = 0;
        let tmhiCount = 0;
        // Basic check if data has keys like 'tmhi_1'
        // If row is object { header: value }

        // Re-use calculation logic from utils if possible?
        // But utils functions expect pure numbers mostly.
        const tmhiScore = calculateTMHIScore(row); // Should work if row has keys

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${date}</td>
            <td>${row.name || 'Anonymous'}</td>
            <td>${bmi}</td>
            <td>${tmhiScore || '-'}</td>
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
function downloadExcel() {
    if (!window.currentData || window.currentData.length === 0) {
        alert('ไม่มีข้อมูลให้ดาวน์โหลด');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(window.currentData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    XLSX.writeFile(wb, `survey_data_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
