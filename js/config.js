// ========================================
// Configuration File
// ========================================
// SECURITY NOTE: For production, use environment variables or backend proxy
// Do NOT commit this file with real API keys to public repositories

const CONFIG = {
    // Google OAuth Client ID
    GOOGLE_CLIENT_ID: '1089240671162-befa46lipnu4q9a4bokkjbr40qke6tcu.apps.googleusercontent.com',

    // Google Apps Script URL for backup storage
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby30NantvJX36X9ZHIw5DOSi-tMqGAXGoVUh9mWaZCEV5egrWckHgMS6Btw3k37FUtL/exec',

    // Supabase Configuration
    SUPABASE_URL: 'https://fgdommhiqhzvsedfzyrr.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc',

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
