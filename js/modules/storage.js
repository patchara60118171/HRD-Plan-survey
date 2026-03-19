// ========================================
// Storage Module
// ========================================

const Storage = {
    // LocalStorage keys
    KEYS: {
        RESPONSES: 'wellbeing_survey_responses',
        SECTION: 'wellbeing_survey_section',
        TIMESTAMP: 'wellbeing_survey_timestamp',
        USER: 'wellbeing_survey_user'
    },

    // Supabase client instance
    supabaseClient: null,

    // Initialize Supabase
    initSupabase() {
        if (typeof supabase !== 'undefined' && typeof CONFIG !== 'undefined') {
            this.supabaseClient = supabase.createClient(
                CONFIG.SUPABASE_URL,
                CONFIG.SUPABASE_ANON_KEY
            );
            console.log('Supabase initialized');
            return true;
        }
        return false;
    },

    // ========================================
    // Local Storage Operations
    // ========================================

    // Save responses to localStorage
    saveLocal(responses) {
        try {
            localStorage.setItem(this.KEYS.RESPONSES, JSON.stringify(responses));
            localStorage.setItem(this.KEYS.TIMESTAMP, new Date().toISOString());
            return true;
        } catch (e) {
            console.error('LocalStorage save error:', e);
            return false;
        }
    },

    // Load responses from localStorage
    loadLocal() {
        try {
            const saved = localStorage.getItem(this.KEYS.RESPONSES);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('LocalStorage load error:', e);
            return {};
        }
    },

    // Save current section position
    savePosition(sectionIndex, subsectionIndex) {
        localStorage.setItem(this.KEYS.SECTION, JSON.stringify({
            sectionIndex,
            subsectionIndex
        }));
    },

    // Load saved position
    loadPosition() {
        try {
            const saved = localStorage.getItem(this.KEYS.SECTION);
            return saved ? JSON.parse(saved) : { sectionIndex: 0, subsectionIndex: 0 };
        } catch (e) {
            return { sectionIndex: 0, subsectionIndex: 0 };
        }
    },

    // Clear all local data
    clearLocal() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    // Get last update timestamp
    getLastUpdate() {
        return localStorage.getItem(this.KEYS.TIMESTAMP);
    },

    // ========================================
    // Cloud Storage (Supabase) Operations
    // ========================================

    // Save to Supabase
    async saveToCloud(email, responses, isDraft = false) {
        if (!this.supabaseClient || !email) {
            console.warn('Cannot save to cloud: no client or email');
            return false;
        }

        try {
            // Calculate derived values
            const height = parseFloat(responses.height);
            const weight = parseFloat(responses.weight);
            let bmi = null, bmiCategory = '';

            if (height && weight && typeof calculateBMI === 'function') {
                bmi = parseFloat(calculateBMI(height, weight));
                const bmiInfo = typeof getBMICategory === 'function' ? getBMICategory(bmi) : null;
                bmiCategory = bmiInfo ? bmiInfo.category : '';
            }

            // Calculate TMHI score
            let tmhiScore = null, tmhiLevel = '';
            if (typeof calculateTMHIScore === 'function') {
                tmhiScore = calculateTMHIScore(responses);
                const tmhiInfo = typeof getTMHILevel === 'function' ? getTMHILevel(tmhiScore) : null;
                tmhiLevel = tmhiInfo ? tmhiInfo.level : '';
            }

            const dataToSave = {
                email: email,
                name: responses.name || null,
                title: responses.title || null,
                gender: responses.gender || null,
                age: responses.age ? parseInt(responses.age) : null,
                org_type: responses.org_type || null,
                height: height || null,
                weight: weight || null,
                waist: responses.waist ? parseFloat(responses.waist) : null,
                bmi: bmi,
                bmi_category: bmiCategory,
                tmhi_score: tmhiScore || null,
                tmhi_level: tmhiLevel,
                raw_responses: responses,
                is_draft: isDraft,
                submitted_at: isDraft ? null : new Date().toISOString()
            };

            const { data, error } = await this.supabaseClient
                .from('survey_responses')
                .upsert(dataToSave, {
                    onConflict: 'email',
                    ignoreDuplicates: false
                });

            if (error) {
                console.error('Supabase save error:', error);
                // Add to offline queue
                if (typeof ErrorHandler !== 'undefined') {
                    ErrorHandler.addToSyncQueue('save', { email, responses, isDraft });
                }
                return false;
            }

            console.log('Saved to Supabase:', isDraft ? 'draft' : 'submitted');
            return true;

        } catch (e) {
            console.error('Supabase save exception:', e);
            if (typeof ErrorHandler !== 'undefined') {
                ErrorHandler.addToSyncQueue('save', { email, responses, isDraft });
            }
            return false;
        }
    },

    // Load draft from Supabase
    async loadFromCloud(email) {
        if (!this.supabaseClient || !email) return null;

        try {
            const { data, error } = await this.supabaseClient
                .from('survey_responses')
                .select('*')
                .eq('email', email)
                .eq('is_draft', true)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Supabase load error:', error);
                return null;
            }

            if (data && data.raw_responses) {
                console.log('Loaded draft from Supabase');
                return data.raw_responses;
            }

            return null;
        } catch (e) {
            console.error('Supabase load exception:', e);
            return null;
        }
    },

    // ========================================
    // Google Apps Script Operations
    // ========================================

    async saveToGAS(responses, scriptUrl) {
        if (!scriptUrl) return false;

        try {
            const response = await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit',
                    data: responses,
                    timestamp: new Date().toISOString()
                })
            });
            return true;
        } catch (e) {
            console.error('GAS save error:', e);
            return false;
        }
    },

    async loadHistoryFromGAS(email, scriptUrl) {
        if (!scriptUrl || !email) return [];

        try {
            const response = await fetch(`${scriptUrl}?action=history&email=${encodeURIComponent(email)}`);
            const data = await response.json();
            return data.history || [];
        } catch (e) {
            console.error('GAS history load error:', e);
            return [];
        }
    },

    // Check if user has already submitted (not draft)
    async checkDuplicate(email) {
        if (!this.supabaseClient || !email) return false;

        try {
            const { data, error } = await this.supabaseClient
                .from('survey_responses')
                .select('is_draft, submitted_at')
                .eq('email', email)
                .eq('is_draft', false) // Look for completed submissions
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Duplicate check error:', error);
                return false;
            }

            return !!data; // True if data exists (already submitted)
        } catch (e) {
            console.error('Duplicate check exception:', e);
            return false;
        }
    }
};
