// Admin Dashboard Logic

// Admin Password (Client-side simple check)
const ADMIN_PASS = "admin";

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
    fetchData();
}

function logout() {
    localStorage.removeItem('admin_logged_in');
    location.reload();
}

// Fetch Data
async function fetchData() {
    if (!SCRIPT_URL) {
        alert('Configuration Error: Script URL not found.');
        return;
    }

    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('table-body');
    loading.style.display = 'block';
    tableBody.innerHTML = '';

    try {
        // Use GET with action getAllResponses
        // Since GAS doPost/doGet might be separate, check Setup. 
        // We implemented getAllResponses in doGet.
        const url = `${SCRIPT_URL}?action=getAllResponses&password=${ADMIN_PASS}`;

        const response = await fetch(url);
        const data = await response.json();

        loading.style.display = 'none';

        if (data.result === 'error') {
            alert('Error: ' + data.message);
            return;
        }

        renderTable(data);
        window.currentData = data; // Store for export

    } catch (e) {
        loading.style.display = 'none';
        console.error(e);
        alert('Failed to fetch data');
    }
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
async function initializeHeaders() {
    if (!confirm('ต้องการสร้างหัวตาราง (Columns) ใน Google Sheet หรือไม่?')) return;

    // 1. Collect all Question IDs from SURVEY_DATA
    const keys = ['email', 'timestamp']; // Default keys

    // Traverse SURVEY_DATA
    Object.values(SURVEY_DATA).forEach(section => {
        section.subsections.forEach(sub => {
            sub.questions.forEach(q => {
                keys.push(q.id);
            });
        });
    });

    console.log('Syncing headers:', keys);

    // 2. Send to GAS
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'setupHeaders',
                keys: keys
            })
        });
        const result = await response.json();

        if (result.result === 'success') {
            alert(`สำเร็จ! ${result.message}`);
        } else {
            alert('เกิดข้อผิดพลาด: ' + result.error);
        }

    } catch (e) {
        console.error(e);
        alert('Failed to sync headers');
    }
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
