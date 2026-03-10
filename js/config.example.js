// ========================================
// Configuration Template - DO NOT COMMIT WITH REAL KEYS
// ========================================
// SECURITY NOTE: Use environment variables in production
// Copy to config.js and add your actual keys

const CONFIG = {
    // Google OAuth Client ID
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',

    // Google Apps Script URL for backup storage
    GOOGLE_SCRIPT_URL: process.env.GOOGLE_SCRIPT_URL || 'YOUR_GOOGLE_SCRIPT_URL',

    // Supabase Configuration - Use environment variables
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',

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
