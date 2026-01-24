// ========================================
// UI Components
// ========================================

// Render Welcome Screen
function renderWelcome() {
    return `
        <div class="welcome-screen fade-in">
            <div class="welcome-icon">🌿</div>
            <h1 class="welcome-title">แบบสำรวจสุขภาวะบุคลากร</h1>
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
                    <div class="info-desc">ความสัมพันธ์ การเรียนรู้ การพัฒนาตนเอง</div>
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
            
            <button class="btn-start" onclick="app.startSurvey()">
                เริ่มทำแบบสำรวจ <span>→</span>
            </button>
        </div>
    `;
}

// Render Section Header
function renderSectionHeader(section) {
    const icons = { physical: '💪', mental: '🧠', social: '👥', environment: '🏢' };
    const names = { physical: 'สุขภาวะทางกาย', mental: 'สุขภาวะทางใจ', social: 'สุขภาวะทางสังคม', environment: 'สุขภาวะทางสภาพแวดล้อม' };

    return `
        <div class="section-header fade-in">
            <div class="section-badge ${section.type}">
                <span>${icons[section.type]}</span>
                <span>${names[section.type]}</span>
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
                   value="${i + 1}"
                   ${value === String(i + 1) ? 'checked' : ''}
                   onchange="app.handleChange('${question.id}', this.value)">
            <label for="${question.id}_${i}">
                <span class="scale-value">${i + 1}</span>
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

// Render Time Input
function renderTime(question, value) {
    return `
        <div class="time-input">
            <input type="time" 
                   class="input-field" 
                   id="${question.id}"
                   value="${value || ''}"
                   onchange="app.handleChange('${question.id}', this.value)">
        </div>
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
            <div>ดัชนีมวลกาย (BMI) ของท่าน:</div>
            <div class="bmi-value">${bmi}</div>
            <div class="bmi-category ${info.class}">${info.emoji} ${info.category}</div>
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

// Render Results Screen
function renderResults(responses, userInfo) {
    const height = parseFloat(responses.height);
    const weight = parseFloat(responses.weight);
    const bmi = calculateBMI(height, weight);
    const bmiInfo = getBMICategory(bmi);
    const depressionScore = calculateDepressionScore(responses);
    const depressionInfo = getDepressionLevel(depressionScore);

    return `
        <div class="results-screen fade-in">
            <div class="results-header">
                <div class="results-icon">🎉</div>
                <h1 class="results-title">ขอบคุณที่ทำแบบสำรวจ!</h1>
                <p class="results-subtitle">สรุปผลสุขภาวะของท่าน</p>
            </div>
            
            <div class="results-grid">
                <div class="result-card physical">
                    <div class="result-icon">💪</div>
                    <div class="result-title">สุขภาวะทางกาย</div>
                    <div class="result-status complete">✓ เสร็จสิ้น</div>
                </div>
                <div class="result-card mental">
                    <div class="result-icon">🧠</div>
                    <div class="result-title">สุขภาวะทางใจ</div>
                    <div class="result-status complete">✓ เสร็จสิ้น</div>
                </div>
                <div class="result-card social">
                    <div class="result-icon">👥</div>
                    <div class="result-title">สุขภาวะทางสังคม</div>
                    <div class="result-status complete">✓ เสร็จสิ้น</div>
                </div>
                <div class="result-card environment">
                    <div class="result-icon">🏢</div>
                    <div class="result-title">สภาพแวดล้อม</div>
                    <div class="result-status complete">✓ เสร็จสิ้น</div>
                </div>
            </div>
            
            <div class="special-results">
                ${bmi ? `
                <div class="special-card">
                    <div class="special-card-title">ดัชนีมวลกาย (BMI)</div>
                    <div class="bmi-value">${bmi}</div>
                    <div class="bmi-category ${bmiInfo.class}">${bmiInfo.emoji} ${bmiInfo.category}</div>
                </div>
                ` : ''}
                
                <div class="special-card">
                    <div class="special-card-title">ผลประเมินภาวะซึมเศร้า</div>
                    <div class="score-value">${depressionScore}<span class="score-max"> / 33</span></div>
                    <div class="score-level ${depressionInfo.class}">${depressionInfo.emoji} ${depressionInfo.level}</div>
                </div>
            </div>
            
            <div class="results-actions">
                <button class="btn-action" onclick="app.editResponses()">
                    <span class="btn-action-icon">✏️</span> แก้ไขคำตอบ
                </button>
                <button class="btn-action" onclick="exportToExcel(app.responses, app.userInfo)">
                    <span class="btn-action-icon">📊</span> ดาวน์โหลด Excel
                </button>
                ${app.accessToken ? `
                <button class="btn-action" onclick="exportToGoogleSheets(app.responses, app.accessToken)">
                    <span class="btn-action-icon">📋</span> บันทึกใน Google Sheets
                </button>
                ` : ''}
                <button class="btn-action primary" onclick="app.startNew()">
                    <span class="btn-action-icon">🔄</span> เริ่มใหม่
                </button>
            </div>
        </div>
    `;
}

// Render Login Button
function renderLoginButton() {
    return `
        <button class="btn-login" onclick="app.googleLogin()">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
            เข้าสู่ระบบ
        </button>
    `;
}

// Render User Profile
function renderUserProfile(user) {
    return `
        <div class="user-profile">
            <img src="${user.picture}" alt="${user.name}">
            <div class="user-info-text">
                <span class="user-name">${user.name}</span>
                <div class="user-actions">
                    <button onclick="app.viewHistory()" class="btn-text" style="font-size: 0.8rem; margin-right: 8px;">📜 ประวัติ</button>
                    <button onclick="app.logout()" class="btn-text" style="font-size: 0.8rem; color: #ef4444;">ออกจากระบบ</button>
                </div>
            </div>
        </div>
    `;
}
