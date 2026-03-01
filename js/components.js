// ========================================
// UI Components
// ========================================

// Render Login Screen (ChatGPT Style)
function renderLoginScreen() {
    // Google "G" Logo SVG (inline to avoid loading issues)
    const googleIconSvg = `<svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>`;

    return `
        <div class="login-screen fade-in">
            <div class="login-card">
                <div class="login-logo">🌿</div>
                <h2 class="login-title">ยินดีต้อนรับ</h2>
                <p class="login-subtitle">ลงชื่อเข้าใช้เพื่อทำแบบสำรวจ</p>
                
                <button class="google-login-btn" onclick="app.googleLogin()">
                    ${googleIconSvg}
                    ดำเนินการต่อด้วย Google
                </button>
                
                <div class="login-footer">
                    โดยการดำเนินการต่อท่านยอมรับ <a href="#">ข้อกำหนด</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a>
                </div>
            </div>
        </div>
    `;
}

// Render Welcome Screen
function renderWelcome() {
    // Check if user has entered email
    const hasEmail = app.userInfo && app.userInfo.email;

    // Email input form (only show if no email yet)
    const emailForm = !hasEmail
        ? `
            <div class="email-input-container">
                <input type="email" 
                       id="user-email-input" 
                       class="input-field" 
                       placeholder="กรุณากรอกอีเมลของท่าน..." 
                       style="width: 300px; margin-bottom: 1rem;">
                <button class="btn btn-primary" onclick="app.setEmail()" style="width: 300px;">
                    ยืนยันอีเมล <span>→</span>
                </button>
            </div>
        `
        : '';

    // Start button (show only if email is entered)
    const startButton = hasEmail
        ? `<button class="btn-start" onclick="app.startSurvey()">
            เริ่มทำแบบสำรวจ <span>→</span>
        </button>`
        : '';

    // Organization display
    const orgDisplay = app.organization 
        ? `<div style="background: #E0F2FE; color: #0369A1; padding: 0.5rem 1rem; border-radius: 8px; margin-top: 0.5rem; margin-bottom: 1rem; display: inline-block; font-weight: 600; font-size: 0.95rem; border: 1px solid #BAE6FD;">
             🏢 สำหรับบุคลากร: ${app.organization}
           </div>`
        : '';

    return `
        <div class="welcome-screen fade-in">
            <div class="welcome-icon">🌿</div>
            <h1 class="welcome-title">แบบสำรวจสุขภาวะบุคลากร</h1>
            ${orgDisplay}
            <p class="welcome-subtitle">
                แบบสำรวจนี้จะช่วยให้เราเข้าใจสุขภาวะของท่านในด้านต่างๆ 
                เพื่อนำไปพัฒนาและสนับสนุนให้ท่านมีคุณภาพชีวิตที่ดีขึ้น
            </p>
            
            <div class="welcome-info">
                <div class="info-card physical">
                    <div class="info-icon">💪</div>
                    <div class="info-title">สุขภาวะทางกาย</div>
                    <div class="info-desc">สุขภาพร่างกาย การออกกำลังกาย อาหาร การนอน</div>
                </div>
                <div class="info-card mental">
                    <div class="info-icon">🧠</div>
                    <div class="info-title">สุขภาวะทางใจ</div>
                    <div class="info-desc">ความเครียด อารมณ์ จิตใจ ความกังวล</div>
                </div>
                <div class="info-card social">
                    <div class="info-icon">👥</div>
                    <div class="info-title">สุขภาวะทางสังคม</div>
                    <div class="info-desc">ความสัมพันธ์ ความเหงา การเข้าสังคม</div>
                </div>
                <div class="info-card environment">
                    <div class="info-icon">🏢</div>
                    <div class="info-title">สภาพแวดล้อม</div>
                    <div class="info-desc">สถานที่ทำงาน ความปลอดภัย บรรยากาศ</div>
                </div>
            </div>
            
            <div class="welcome-time">
                <span>⏱️</span>
                <span>ใช้เวลาประมาณ 30-45 นาที</span>
            </div>
            
            <div class="welcome-buttons">
                ${emailForm}
                ${startButton}
            </div>
        </div>
    `;
}

// Render Section Header
function renderSectionHeader(section) {
    const icons = { physical: '💪', mental: '🧠', social: '👥', consumption: '🍷', nutrition: '🥗', safety: '⛑️', activity: '🏃', environment: '🌳' };
    const names = {
        physical: 'ข้อมูลส่วนบุคคล/ร่างกาย',
        mental: 'สุขภาพจิต',
        social: 'มิติทางสังคม',
        consumption: 'พฤติกรรมเสี่ยง',
        nutrition: 'โภชนาการ',
        safety: 'ความปลอดภัย',
        activity: 'กิจกรรมทางกาย',
        environment: 'สิ่งแวดล้อม'
    };

    return `
        <div class="section-header fade-in">
            <div class="section-badge ${section.type}">
                <span>${icons[section.type] || icons.physical}</span>
                <span>${names[section.type] || section.title}</span>
            </div>
            <h2 class="section-title">${section.title}</h2>
            <p class="section-desc">${section.description || ''}</p>
        </div>
    `;
}

// Render Subsection Title
function renderSubsectionTitle(title) {
    return `<h3 class="subsection-title">${title}</h3>`;
}

// Render Radio Question
function renderRadio(question, value) {
    const options = question.options.map((opt, i) => `
        <div class="option-item">
            <input type="radio" 
                   class="option-input" 
                   id="${question.id}_${i}" 
                   name="${question.id}" 
                   value="${opt.value !== undefined ? opt.value : opt}"
                   ${value === (opt.value !== undefined ? String(opt.value) : opt) ? 'checked' : ''}
                   onchange="app.handleChange('${question.id}', this.value)">
            <label class="option-label" for="${question.id}_${i}">
                <span class="option-indicator"></span>
                <span class="option-text">${opt.label || opt}</span>
            </label>
        </div>
    `).join('');

    return `<div class="options-list">${options}</div>`;
}

// Render Checkbox Question
function renderCheckbox(question, value) {
    const selected = Array.isArray(value) ? value : [];
    const options = question.options.map((opt, i) => {
        const optValue = opt.value !== undefined ? opt.value : opt;
        return `
            <div class="option-item">
                <input type="checkbox" 
                       class="option-input" 
                       id="${question.id}_${i}" 
                       name="${question.id}" 
                       value="${optValue}"
                       ${selected.includes(optValue) ? 'checked' : ''}
                       onchange="app.handleCheckbox('${question.id}', '${optValue}', this.checked, ${question.maxSelect || 99})">
                <label class="option-label" for="${question.id}_${i}">
                    <span class="option-indicator"></span>
                    <span class="option-text">${opt.label || opt}</span>
                </label>
            </div>
        `;
    }).join('');

    const hint = question.maxSelect ? `<small style="color: var(--text-muted);">เลือกได้ไม่เกิน ${question.maxSelect} ข้อ</small>` : '';
    return `${hint}<div class="options-list">${options}</div>`;
}

// Render Scale (Likert)
function renderScale(question, value) {
    const labels = question.labels || ['น้อยที่สุด', 'น้อย', 'ปานกลาง', 'มาก', 'มากที่สุด'];
    const options = labels.map((label, i) => `
        <div class="scale-option">
            <input type="radio" 
                   id="${question.id}_${i}" 
                   name="${question.id}" 
                   value="${i}"
                   ${value === String(i) ? 'checked' : ''}
                   onchange="app.handleChange('${question.id}', this.value)">
            <label for="${question.id}_${i}">
                <span class="scale-value">${i}</span>
                <span class="scale-text">${label}</span>
            </label>
        </div>
    `).join('');

    return `<div class="scale-container"><div class="scale-options">${options}</div></div>`;
}

// Render Number Input
function renderNumber(question, value) {
    return `
        <div class="input-group">
            <input type="number" 
                   class="input-field" 
                   id="${question.id}"
                   value="${value || ''}"
                   placeholder="${question.placeholder || ''}"
                   min="${question.min || ''}"
                   max="${question.max || ''}"
                   onchange="app.handleChange('${question.id}', this.value)">
            ${question.unit ? `<span class="input-unit">${question.unit}</span>` : ''}
        </div>
    `;
}

// Render Text Input
function renderText(question, value) {
    return `
        <input type="text" 
               class="input-field" 
               id="${question.id}"
               value="${value || ''}"
               placeholder="${question.placeholder || 'พิมพ์คำตอบ...'}"
               onchange="app.handleChange('${question.id}', this.value)">
    `;
}

// Render Time Input (24-hour format)
function renderTime(question, value) {
    const [savedHour, savedMinute] = (value || ':').split(':');

    // Generate Hours 00-23
    let hourOptions = '<option value="" disabled selected>ชม.</option>';
    for (let i = 0; i < 24; i++) {
        const h = String(i).padStart(2, '0');
        const selected = savedHour === h ? 'selected' : '';
        hourOptions += `<option value="${h}" ${selected}>${h}</option>`;
    }

    // Generate Minutes 00, 15, 30, 45 (as requested)
    let minuteOptions = '';
    const minuteSteps = [0, 15, 30, 45];

    for (const i of minuteSteps) {
        const m = String(i).padStart(2, '0');
        // Default to 00 if no saved value, otherwise match saved value
        const isDefault = !savedMinute && m === '00';
        const isSaved = savedMinute === m;
        const selected = (isSaved || isDefault) ? 'selected' : '';
        minuteOptions += `<option value="${m}" ${selected}>${m}</option>`;
    }

    return `
        <div class="time-input-group">
            <select class="input-field time-select" 
                    id="${question.id}_hour"
                    onchange="app.handleTimeChange('${question.id}')">
                ${hourOptions}
            </select>
            <span class="time-separator">:</span>
            <select class="input-field time-select" 
                    id="${question.id}_minute"
                    onchange="app.handleTimeChange('${question.id}')">
                ${minuteOptions}
            </select>
            <span class="time-unit">ชม./นาที</span>
        </div>
        <input type="hidden" id="${question.id}" value="${value || ''}">
    `;
}

// Render Question Card
function renderQuestion(question, value, number) {
    let inputHtml = '';
    switch (question.type) {
        case 'radio': inputHtml = renderRadio(question, value); break;
        case 'checkbox': inputHtml = renderCheckbox(question, value); break;
        case 'scale': inputHtml = renderScale(question, value); break;
        case 'number': inputHtml = renderNumber(question, value); break;
        case 'text': inputHtml = renderText(question, value); break;
        case 'time': inputHtml = renderTime(question, value); break;
        default: inputHtml = renderRadio(question, value);
    }

    return `
        <div class="question-card fade-in" id="card_${question.id}">
            <div>
                <span class="question-number">${number}</span>
                <span class="question-text">${question.text}</span>
                ${question.required ? '<span class="question-required">*</span>' : ''}
            </div>
            ${question.hint ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0.5rem 0;">${question.hint}</p>` : ''}
            ${inputHtml}
        </div>
    `;
}

// Render BMI Result
function renderBMIResult(height, weight) {
    if (!height || !weight) return '';
    const bmi = calculateBMI(height, weight);
    const info = getBMICategory(bmi);
    if (!bmi || !info) return '';

    return `
        <div class="bmi-result fade-in">
            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">📊 ผลการคำนวณ BMI</div>
            <div class="bmi-value">${bmi}</div>
            <div class="bmi-category ${info.class}">${info.emoji} ${info.category}</div>
            <div style="background: #F1F5F9; padding: 0.75rem; border-radius: 8px; margin-top: 1rem; font-size: 0.8rem; color: var(--text-secondary);">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">📋 เกณฑ์ที่ใช้ (WHO สากล):</div>
                <div>• น้ำหนักน้อย: BMI < 18.5</div>
                <div>• น้ำหนักปกติ: BMI 18.5 - 24.9</div>
                <div>• น้ำหนักเกิน: BMI 25.0 - 29.9</div>
                <div>• อ้วน: BMI ≥ 30.0</div>
                <div style="margin-top: 0.5rem; font-style: italic;">*สูตร: น้ำหนัก(กก.) ÷ ส่วนสูง(ม.)²</div>
            </div>
        </div>
    `;
}

// Render Depression Score
function renderDepressionScore(score) {
    const info = getDepressionLevel(score);
    return `
        <div class="score-result fade-in">
            <div style="color: var(--text-secondary);">คะแนนรวม</div>
            <div class="score-value">${score}<span class="score-max"> / 33</span></div>
            <div class="score-level ${info.class}">${info.emoji} ${info.level}</div>
        </div>
    `;
}

// Render Review Screen
function renderReviewScreen(responses) {
    let html = `
        <div class="review-screen fade-in">
            <h2 class="section-title">ตรวจสอบคำตอบของท่าน</h2>
            <p class="section-desc">โปรดตรวจสอบข้อมูลก่อนยืนยันการส่งแบบสำรวจ</p>
    `;

    SECTIONS_ORDER.forEach(sectionKey => {
        const section = SURVEY_DATA[sectionKey];
        html += `<div class="review-section">
            <h3 class="review-section-title">${section.title}</h3>
            <div class="review-list">`;

        section.subsections.forEach(sub => {
            sub.questions.forEach(q => {
                let answer = responses[q.id];
                let displayAnswer = '-';

                if (answer) {
                    if (q.type === 'radio' || q.type === 'scale') {
                        // Find label if possible
                        if (q.options) {
                            const opt = q.options.find(o => (o.value || o) == answer || (o.value || o) === answer); // Loose comparison for numbers
                            displayAnswer = opt ? (opt.label || opt) : answer;
                        } else if (q.labels) {
                            displayAnswer = `${answer} (${q.labels[parseInt(answer) - 1] || ''})`;
                        } else {
                            displayAnswer = answer;
                        }
                    } else if (q.type === 'checkbox') {
                        displayAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
                    } else if (q.type === 'time') {
                        displayAnswer = answer + ' น.';
                    } else {
                        displayAnswer = answer;
                    }
                }

                html += `
                    <div class="review-item">
                        <div class="review-label">${q.id === 'title' ? 'คำนำหน้า' : q.text}</div>
                        <div class="review-value">${displayAnswer}</div>
                    </div>
                `;
            });
        });

        html += `</div></div>`;
    });

    html += `
            <div class="review-actions">
                <button class="btn btn-secondary" onclick="app.editResponses()">
                    <span class="btn-icon">✏️</span> แก้ไขข้อมูล
                </button>
                <button class="btn btn-primary" onclick="app.submitSurvey()">
                    ยืนยันและส่งข้อมูล <span class="btn-icon">✓</span>
                </button>
            </div>
        </div>
    `;
    return html;
}

// Render Results Screen
function renderResults(responses, userInfo) {
    const height = parseFloat(responses.height);
    const weight = parseFloat(responses.weight);
    const bmi = calculateBMI(height, weight);
    const bmiInfo = getBMICategory(bmi);

    // Updated: TMHI-15 instead of Depression
    const tmhiScore = calculateTMHIScore(responses);
    const tmhiInfo = getTMHILevel(tmhiScore);

    return `
        <div class="results-screen fade-in">
            <div class="results-header">
                <div class="results-icon">🎉</div>
                <h1 class="results-title">ขอบคุณที่ทำแบบสำรวจ!</h1>
                <p class="results-subtitle">สรุปผลสุขภาวะของท่าน</p>
                <div style="margin-top: 10px; color: var(--primary-teal); font-weight: 500;">
                    ✓ บันทึกข้อมูลเรียบร้อยแล้ว
                </div>
            </div>
            
            <div class="results-grid">
                <div class="result-card physical">
                    <div class="result-icon">💪</div>
                    <div class="result-title">สุขภาวะทางกาย</div>
                    <div class="result-status complete">✓ บันทึกแล้ว</div>
                </div>
                <div class="result-card mental">
                    <div class="result-icon">🧠</div>
                    <div class="result-title">สุขภาพจิต</div>
                    <div class="result-status complete">✓ บันทึกแล้ว</div>
                </div>
                <div class="result-card social">
                    <div class="result-icon">👥</div>
                    <div class="result-title">สุขภาวะทางสังคม</div>
                    <div class="result-status complete">✓ บันทึกแล้ว</div>
                </div>
                <div class="result-card environment">
                    <div class="result-icon">🛡️</div>
                    <div class="result-title">ความปลอดภัย/สิ่งแวดล้อม</div>
                    <div class="result-status complete">✓ บันทึกแล้ว</div>
                </div>
            </div>
            
            <!-- BMI & Mental Health Results -->
            <div class="special-results">
                ${bmi ? `
                <div class="special-card">
                    <div class="special-card-title">ดัชนีมวลกาย (BMI)</div>
                    <div class="bmi-value" style="font-size: 2.5rem; font-weight: 700; color: #1E293B; margin-bottom: 5px;">${bmi}</div>
                    <div class="bmi-category ${bmiInfo.class}" style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600;">
                        ${bmiInfo.emoji} ${bmiInfo.category}
                    </div>
                </div>
                ` : ''}
                
                <div class="special-card">
                    <div class="special-card-title">คะแนนสุขภาพจิต (TMHI-15)</div>
                    <div class="score-value" style="font-size: 2.5rem; font-weight: 700; color: #1E293B; margin-bottom: 5px;">
                        ${tmhiScore}<span class="score-max" style="font-size: 1.25rem; color: #94A3B8; font-weight: 400;"> / 60</span>
                    </div>
                    <div class="score-level ${tmhiInfo.class}" style="display: inline-flex; align-items: center; gap: 5px; font-weight: 600;">
                        ${tmhiInfo.emoji} ${tmhiInfo.level}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render User Profile
function renderUserProfile(user) {
    return `
        <div class="user-profile-container">
            <div class="user-profile" onclick="toggleProfileMenu()">
                <div class="user-avatar">👤</div>
                <span class="user-name">${user.email}</span>
                <span class="dropdown-arrow">▼</span>
            </div>
            <div class="profile-dropdown" id="profile-dropdown">
                <div class="dropdown-header">
                    <div class="user-avatar">👤</div>
                    <div>
                        <div class="dropdown-name">ผู้ใช้งาน</div>
                        <div class="dropdown-email">${user.email || ''}</div>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <button onclick="app.viewHistory(); toggleProfileMenu();" class="dropdown-item">📜 ประวัติ</button>
                <button onclick="exportToExcel(app.responses, app.userInfo); toggleProfileMenu();" class="dropdown-item">📊 ดาวน์โหลด Excel</button>
                <button onclick="app.startNew(); toggleProfileMenu();" class="dropdown-item">🔄 ทำแบบสำรวจใหม่</button>
                <div class="dropdown-divider"></div>
                <button onclick="app.logout()" class="dropdown-item logout">🚪 ออกจากระบบ</button>
            </div>
        </div>
    `;
}
