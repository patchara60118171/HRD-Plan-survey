const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6vnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFrontendLogin() {
  try {
    console.log('🔍 Testing frontend login with anon key...');
    
    // Test login exactly like frontend does
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'hr-test@tst.go.th',
      password: 'TstHR2569'
    });
    
    if (error) {
      console.error('❌ Frontend-style login failed:', error.message);
      console.error('Error details:', error);
      
      // Try with service role key for comparison
      console.log('\n🔧 Testing with service role key...');
      const { createClient: createServiceClient } = require('@supabase/supabase-js');
      const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6vnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';
      const serviceSupabase = createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      
      const { data: serviceData, error: serviceError } = await serviceSupabase.auth.signInWithPassword({
        email: 'hr-test@tst.go.th',
        password: 'TstHR2569'
      });
      
      if (serviceError) {
        console.error('❌ Service role login also failed:', serviceError.message);
      } else {
        console.log('✅ Service role login successful!');
        console.log('Issue might be with anon key permissions');
      }
      
    } else {
      console.log('✅ Frontend-style login successful!');
      console.log('User:', data.user.email);
      console.log('Session expires:', new Date(data.session.expires_at * 1000));
      
      // Check if user has correct metadata
      console.log('User metadata:', JSON.stringify(data.user.user_metadata, null, 2));
      
      // Check role verification
      const orgId = data.user.user_metadata?.organization_id;
      if (orgId) {
        console.log('\n🔍 Checking organization access...');
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();
        
        if (orgError) {
          console.error('Organization check failed:', orgError.message);
        } else {
          console.log('✅ Organization accessible:', orgData.org_name_th);
        }
      }
    }
    
    console.log('\n🔧 Debugging next steps:');
    console.log('1. Check browser console (F12) for JavaScript errors');
    console.log('2. Verify SUPABASE_URL and SUPABASE_ANON_KEY are loaded correctly');
    console.log('3. Check if there are CORS issues');
    console.log('4. Try clearing browser cache and cookies');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testFrontendLogin();
