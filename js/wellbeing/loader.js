const SECTIONS_ORDER = PROJECT_SSOT.wellbeing.sectionsOrder;
const SURVEY_DATA = PROJECT_SSOT.wellbeing.surveyData;

let wellbeingSchemaPromise = null;

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function resetObject(target) {
    Object.keys(target).forEach(key => delete target[key]);
}

function normalizeWellbeingSchema(rawSchema) {
    const sectionsOrder = Array.isArray(rawSchema?.sections_order) ? [...rawSchema.sections_order] : [];
    const surveyData = rawSchema?.sections && typeof rawSchema.sections === 'object'
        ? deepClone(rawSchema.sections)
        : {};

    return {
        sectionsOrder,
        surveyData,
        meta: {
            formId: rawSchema?.form_id || 'wellbeing',
            formVersion: rawSchema?.form_version || null,
            formTitle: rawSchema?.form_title || null,
            formTitleEn: rawSchema?.form_title_en || null,
            dimensions: Array.isArray(rawSchema?.dimensions) ? [...rawSchema.dimensions] : []
        }
    };
}

function hydrateWellbeingGlobals(normalizedSchema) {
    const nextSectionsOrder = normalizedSchema?.sectionsOrder || [];
    const nextSurveyData = normalizedSchema?.surveyData || {};

    SECTIONS_ORDER.splice(0, SECTIONS_ORDER.length, ...nextSectionsOrder);
    resetObject(SURVEY_DATA);
    Object.assign(SURVEY_DATA, nextSurveyData);

    if (typeof PROJECT_SSOT?.setWellbeingSurveyData === 'function') {
        PROJECT_SSOT.setWellbeingSurveyData(SECTIONS_ORDER, SURVEY_DATA);
    } else {
        PROJECT_SSOT.wellbeing = {
            sectionsOrder: SECTIONS_ORDER,
            surveyData: SURVEY_DATA
        };
    }

    PROJECT_SSOT.wellbeing.schemaMeta = normalizedSchema?.meta || {};
}

async function ensureWellbeingSurveyData(forceRefresh = false) {
    if (!forceRefresh && Object.keys(SURVEY_DATA).length > 0 && SECTIONS_ORDER.length > 0) {
        return { sectionsOrder: SECTIONS_ORDER, surveyData: SURVEY_DATA, source: 'memory' };
    }

    if (!forceRefresh && wellbeingSchemaPromise) {
        return wellbeingSchemaPromise;
    }

    wellbeingSchemaPromise = fetch('data/questions-wellbeing.json', { cache: 'no-store' })
        .then(async response => {
            if (!response.ok) {
                throw new Error(`Failed to load wellbeing schema: ${response.status}`);
            }

            const rawSchema = await response.json();
            const normalizedSchema = normalizeWellbeingSchema(rawSchema);
            hydrateWellbeingGlobals(normalizedSchema);
            return { ...normalizedSchema, source: 'json' };
        })
        .catch(error => {
            wellbeingSchemaPromise = null;
            throw error;
        });

    return wellbeingSchemaPromise;
}

window.SECTIONS_ORDER = SECTIONS_ORDER;
window.SURVEY_DATA = SURVEY_DATA;
window.ensureWellbeingSurveyData = ensureWellbeingSurveyData;

ensureWellbeingSurveyData().catch(error => {
    console.warn('[wellbeing-loader] Failed to preload canonical wellbeing schema:', error.message);
});
