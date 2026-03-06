// ========================================
// Configuration File Example
// ========================================
// Rename this file to config.js and fill in your values
// SECURITY NOTE: For production, use environment variables or backend proxy
// Do NOT commit config.js with real API keys to public repositories

const CONFIG = {
    // Google OAuth Client ID
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',

    // Google Apps Script URL for backup storage
    GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_SCRIPT_URL_HERE',

    // Supabase Configuration
    SUPABASE_URL: 'YOUR_SUPABASE_URL_HERE',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY_HERE',

    // App Settings
    APP_NAME: 'Happy Workplace Survey',
    AUTO_SAVE_DELAY: 2000,  // ms
    MAX_RETRIES: 3,

    // Validation Settings
    VALIDATION: {
        AGE_MIN: 15,
        AGE_MAX: 120,
        HEIGHT_MIN: 50,
        HEIGHT_MAX: 300,
        WEIGHT_MIN: 20,
        WEIGHT_MAX: 500,
        WAIST_MIN: 30,
        WAIST_MAX: 300
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.VALIDATION);
