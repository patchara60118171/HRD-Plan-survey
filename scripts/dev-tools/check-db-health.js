const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkDatabaseHealth() {
  try {
    console.log('🔍 Checking database health...');
    
    // Test basic database connection
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }
    
    console.log('✅ Database connection OK');
    
    // Check auth.users table directly
    try {
      const { data: authData, error: authError } = await supabase
        .rpc('check_auth_table');
      
      if (authError) {
        console.log('Cannot check auth table directly');
      } else {
        console.log('Auth table check:', authData);
      }
    } catch (e) {
      console.log('Auth table not accessible via RPC');
    }
    
    // Try to create a simple test user without metadata
    console.log('\n🔧 Trying to create minimal test user...');
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test-simple@example.com',
      password: 'Test123456',
      email_confirm: true
    });
    
    if (userError) {
      console.error('❌ Simple user creation failed:', userError.message);
      console.log('Error details:', userError);
      
      // Suggest alternative solutions
      console.log('\n🔧 Alternative solutions:');
      console.log('1. Check Supabase project status at: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr');
      console.log('2. Go to Settings > Database and check connection');
      console.log('3. Go to Settings > API and check service role key');
      console.log('4. Try restarting the Supabase project');
      console.log('5. Check if there are any active database migrations');
      
    } else {
      console.log('✅ Simple user created successfully!');
      console.log('Email:', userData.user.email);
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(userData.user.id);
      console.log('✅ Test user cleaned up');
      
      // Now try the real user
      console.log('\n🎯 Creating real test user...');
      const { data: realData, error: realError } = await supabase.auth.admin.createUser({
        email: 'hr@tst.go.th',
        password: 'TstHR2569',
        email_confirm: true,
        user_metadata: {
          role: 'org-hr',
          organization_id: '8d179bb1-5ca0-4c0d-8ead-2cd3ccd2bcb7',
          organization_code: 'TST'
        }
      });
      
      if (realError) {
        console.error('❌ Real user creation failed:', realError.message);
        console.log('Try creating without metadata first, then update metadata');
      } else {
        console.log('✅ Real user created successfully!');
        console.log('Ready to login: hr@tst.go.th / TstHR2569');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDatabaseHealth();
