// Legacy compatibility shim.
// Canonical wellbeing runtime loader now lives at js/wellbeing/loader.js.

if (typeof window !== 'undefined') {
    window.SECTIONS_ORDER = PROJECT_SSOT.wellbeing.sectionsOrder;
    window.SURVEY_DATA = PROJECT_SSOT.wellbeing.surveyData;

    if (typeof window.ensureWellbeingSurveyData !== 'function') {
        window.ensureWellbeingSurveyData = async function ensureWellbeingSurveyDataShim() {
            return {
                sectionsOrder: window.SECTIONS_ORDER,
                surveyData: window.SURVEY_DATA,
                source: 'compat_shim'
            };
        };
    }

    if (typeof window.applyWellbeingFormConfig !== 'function') {
        window.applyWellbeingFormConfig = function applyWellbeingFormConfigShim() {};
    }
}
