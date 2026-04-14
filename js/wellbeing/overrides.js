const WELLBEING_SURVEY_DATA = PROJECT_SSOT.wellbeing.surveyData;

function applyWellbeingFormConfig(configJson) {
    if (!configJson || typeof configJson !== 'object') return;

    Object.entries(configJson).forEach(([key, value]) => {
        if (!value || !String(value).trim()) return;

        const parts = key.split('.');
        const sectionKey = parts[0];
        const section = WELLBEING_SURVEY_DATA[sectionKey];
        if (!section) return;

        if (parts.length === 2 && parts[1] === 'title') {
            section.title = String(value).trim();
            return;
        }

        if (parts.length === 4 && parts[1] === 'sub' && parts[3] === 'title') {
            const idx = parseInt(parts[2], 10);
            if (section.subsections && section.subsections[idx]) {
                section.subsections[idx].title = String(value).trim();
            }
            return;
        }

        if (parts.length === 3 && parts[1] === 'q' && section.subsections) {
            const qId = parts[2];
            for (const sub of section.subsections) {
                if (!sub.questions) continue;
                const question = sub.questions.find(q => q.id === qId);
                if (question) {
                    question.text = String(value).trim();
                    break;
                }
            }
        }
    });
}

window.applyWellbeingFormConfig = applyWellbeingFormConfig;
