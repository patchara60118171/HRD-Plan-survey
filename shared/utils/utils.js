// ========================================
// Utility Functions
// ========================================

// Toggle Profile Dropdown Menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    const container = document.querySelector('.user-profile-container');
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown && container && !container.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});


// Calculate BMI
function calculateBMI(height, weight) {
    if (!height || !weight || height <= 0 || weight <= 0) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// Get BMI Category
function getBMICategory(bmi) {
    if (!bmi) return null;
    const bmiNum = parseFloat(bmi);
    // WHO International Standard
    if (bmiNum < 18.5) return { category: 'น้ำหนักน้อย', class: 'underweight', emoji: '🔵' };
    if (bmiNum < 25) return { category: 'น้ำหนักปกติ', class: 'normal', emoji: '🟢' };
    if (bmiNum < 30) return { category: 'น้ำหนักเกิน', class: 'overweight', emoji: '🟡' };
    return { category: 'อ้วน', class: 'obese', emoji: '🔴' };
}

// Calculate TMHI-15 Score
// Raw responses are stored as 0-3 (scale index). TMHI requires 1-4 per item,
// so we shift +1 for normal items and invert via 4-val for reverse items
// (tmhi_4, 5, 6). Total range: 15-60.
function calculateTMHIScore(responses) {
    let score = 0;
    const reverseItems = ['tmhi_4', 'tmhi_5', 'tmhi_6'];
    let answered = 0;

    for (let i = 1; i <= 15; i++) {
        const key = `tmhi_${i}`;
        const raw = responses[key];
        if (raw === undefined || raw === null || raw === '') continue;
        const v = parseInt(raw, 10);
        if (isNaN(v) || v < 0 || v > 3) continue;
        answered += 1;

        if (reverseItems.includes(key)) {
            score += (4 - v);
        } else {
            score += (v + 1);
        }
    }
    return answered === 15 ? score : 0;
}

// Get Mental Health Level (TMHI-15)
function getTMHILevel(score) {
    // Criteria:
    // <= 43: Poor (ต่ำกว่าคนทั่วไป)
    // 44 - 50: Average (เท่ากับคนทั่วไป)
    // 51 - 60: Good (สูงกว่าคนทั่วไป)

    if (score === 0) return { level: 'ยังทำไม่ครบ', class: 'none', emoji: '⚪' };
    if (score <= 43) return { level: 'ต่ำกว่าเกณฑ์เฉลี่ย (ควรดูแลใจ)', class: 'poor', emoji: '🌧️' };
    if (score <= 50) return { level: 'เกณฑ์ปกติ (ใจแข็งแรงดี)', class: 'average', emoji: '⛅' };
    return { level: 'สูงกว่าเกณฑ์เฉลี่ย (ใจฟูมาก)', class: 'good', emoji: '☀️' };
}

// Format time
function formatTime(hours, minutes) {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m}`;
}

// Calculate sleep duration
function calculateSleepDuration(bedtime, wakeTime) {
    if (!bedtime || !wakeTime) return null;
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);

    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;

    if (wakeMinutes < bedMinutes) {
        wakeMinutes += 24 * 60;
    }

    return ((wakeMinutes - bedMinutes) / 60).toFixed(1);
}

// Save to localStorage
function saveResponses(responses) {
    localStorage.setItem('wellbeing_survey_responses', JSON.stringify(responses));
    localStorage.setItem('wellbeing_survey_timestamp', new Date().toISOString());
}

// Load from localStorage
function loadResponses() {
    const saved = localStorage.getItem('wellbeing_survey_responses');
    return saved ? JSON.parse(saved) : {};
}

// Clear saved responses
function clearResponses() {
    localStorage.removeItem('wellbeing_survey_responses');
    localStorage.removeItem('wellbeing_survey_timestamp');
    localStorage.removeItem('wellbeing_survey_section');
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Export to Excel
function exportToExcel(responses, userInfo) {
    const data = [];

    // Header Metadata
    data.push(['แบบสำรวจสุขภาวะบุคลากร', '']);
    data.push(['วันที่ทำแบบสำรวจ', new Date().toLocaleString('th-TH')]);
    if (userInfo?.name || userInfo?.email) data.push(['ผู้ตอบ', userInfo.name || userInfo.email]);
    data.push(['', '']);

    // Map Question IDs to Thai Text if available
    const headerMap = {
        'timestamp': 'วัน-เวลาที่บันทึก',
        'name': 'ชื่อ-สกุล',
        'gender': 'เพศ',
        'age': 'อายุ',
        'height': 'ส่วนสูง',
        'weight': 'น้ำหนัก',
        'waist': 'รอบเอว',
        'bmi': 'BMI',
        'tmhi_score': 'คะแนนสุขภาพจิต'
    };

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

    // Add Responses with Thai Headers
    // Prioritize system fields order if desired, or just list all keys
    // For single user export, typically we list "Question | Answer"
    data.push(['คำถาม', 'คำตอบ']); // Column Headers

    // 1. Personal & Physical (explicit check or just iterate)
    Object.entries(responses).forEach(([key, value]) => {
        const thaiHeader = headerMap[key] || key;
        let displayValue = value;
        if (Array.isArray(value)) {
            displayValue = value.join(', ');
        }
        data.push([thaiHeader, displayValue]);
    });

    // 2. Calculated Scores
    const height = parseFloat(responses.height);
    const weight = parseFloat(responses.weight);
    if (height && weight) {
        const bmi = calculateBMI(height, weight);
        const bmiInfo = getBMICategory(bmi);
        data.push(['', '']);
        data.push(['--- ผลการประเมิน ---', '']);
        data.push(['BMI', bmi]);
        data.push(['ระดับ BMI', bmiInfo?.category || '-']);
    }

    // Fix: Use TMHI instead of Depression
    const tmhiScore = calculateTMHIScore(responses);
    const tmhiLevel = getTMHILevel(tmhiScore);

    // Only show if score > 0 (meaning section done)
    if (tmhiScore > 0) {
        data.push(['', '']);
        data.push(['คะแนนสุขภาพจิต (TMHI-15)', tmhiScore]);
        data.push(['ระดับ', tmhiLevel.level]);
        data.push(['คำแนะนำ', tmhiLevel.level.includes('ต่ำกว่า') ? 'ควรปรึกษาผู้เชี่ยวชาญ' : 'รักษาระดับสุขภาพจิตให้ดีต่อไป']);
    }

    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto-width for better readability
    const wscols = [
        { wch: 50 }, // Question width
        { wch: 30 }  // Answer width
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ผลการสำรวจ');

    // Download
    const filename = `wellbeing_survey_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast('ดาวน์โหลด Excel สำเร็จ!', 'success');
}

// Google Sheets Export (requires user to be logged in)
async function exportToGoogleSheets(responses, accessToken) {
    if (!accessToken) {
        showToast('กรุณาเข้าสู่ระบบด้วย Google ก่อน', 'error');
        return;
    }

    try {
        // Create new spreadsheet
        const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    title: `แบบสำรวจสุขภาวะ - ${new Date().toLocaleDateString('th-TH')}`
                }
            })
        });

        if (!createResponse.ok) throw new Error('Failed to create spreadsheet');

        const spreadsheet = await createResponse.json();
        const spreadsheetId = spreadsheet.spreadsheetId;

        // Prepare data
        const values = [
            ['แบบสำรวจสุขภาวะบุคลากร', ''],
            ['วันที่', new Date().toLocaleString('th-TH')],
            ['', '']
        ];

        Object.entries(responses).forEach(([key, value]) => {
            values.push([key, Array.isArray(value) ? value.join(', ') : value]);
        });

        // Update spreadsheet
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:B${values.length}?valueInputOption=RAW`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values })
        });

        // Open spreadsheet
        window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank');
        showToast('สร้าง Google Sheets สำเร็จ!', 'success');

    } catch (error) {
        console.error('Google Sheets export error:', error);
        showToast('ไม่สามารถสร้าง Google Sheets ได้', 'error');
    }
}

// Validate required fields in current section
function validateSection(questions, responses) {
    const missing = [];
    questions.forEach(q => {
        if (q.required && !responses[q.id]) {
            missing.push(q.id);
        }
    });
    return missing;
}

// Submit response to Google Apps Script
async function submitResponseToGAS(data, scriptUrl) {
    if (!scriptUrl) {
        console.warn('Google Script URL is not configured');
        return false;
    }

    try {
        // Use no-cors mode for simple submission
        // Note: We won't get a readable response body in no-cors mode, 
        // but it avoids CORS preflight issues with GAS web apps.
        // Alternatively, we use text/plain to avoid preflight if possible, 
        // but GAS requires specific handling. Standard fetch to GAS usually involves redirects.

        // Strategy: Use standard Fetch with content-type text/plain or similar to avoid complex CORS
        // and handle the opaqueness. 

        // Actually, for GAS `doPost`, the best way is usually Sending Stringified JSON as Body
        // and using text/plain to prevent Preflight (OPTIONS).

        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        // Ensure request was sent (even if we can't fully read response due to CORS sometimes)
        return true;
    } catch (error) {
        console.error('Error submitting to GAS:', error);
        return false;
    }
}

// Get user history from Google Apps Script
async function getUserHistory(email, scriptUrl) {
    if (!scriptUrl || !email) return [];

    try {
        // Use GET request for checking history
        const url = `${scriptUrl}?action=getHistory&email=${encodeURIComponent(email)}`;
        const response = await fetch(url);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

// Debounce function (for auto-saving)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
