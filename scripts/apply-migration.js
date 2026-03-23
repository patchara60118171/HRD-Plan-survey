const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

(async () => {
  try {
    const sql = fs.readFileSync('./supabase/migrations/20260324_add_survey_select_policy.sql', 'utf8');
    
    console.log('📝 Running migration: 20260324_add_survey_select_policy.sql');
    console.log('━'.repeat(60));
    
    const { error } = await sb.rpc('exec_sql', { sql });
    
    if (error) {
      // RPC might not exist, try direct query approach
      console.log('⚠️  exec_sql RPC not available, trying alternative method...');
      throw error;
    }
    
    console.log('✅ Migration applied successfully');
    console.log('━'.repeat(60));
  } catch (err) {
    console.log('⚠️  Could not apply via RPC. Instructions for manual application:');
    console.log('');
    console.log('1. Go to: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr/sql');
    console.log('2. Click "New Query"');
    console.log('3. Copy-paste this SQL:');
    console.log('');
    console.log('────────────────────────────────────────────────');
    try {
      const sql = fs.readFileSync('./supabase/migrations/20260324_add_survey_select_policy.sql', 'utf8');
      console.log(sql);
    } catch (e) {
      console.log('Error reading SQL file:', e.message);
    }
    console.log('────────────────────────────────────────────────');
    console.log('');
    console.log('4. Click "RUN"');
  }
})();
