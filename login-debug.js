const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkLoginIssue() {
  try {
    console.log('🔍 Checking login issue...');
    
    // Check if user exists
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return;
    }
    
    const testUser = users.find(u => u.email === 'hr-test@tst.go.th');
    
    if (testUser) {
      console.log('✅ User found:', testUser.email);
      console.log('ID:', testUser.id);
      console.log('Confirmed:', testUser.email_confirmed_at ? 'yes' : 'no');
      console.log('Metadata:', JSON.stringify(testUser.user_metadata, null, 2));
      
      // Test login with the exact credentials
      console.log('\n🔍 Testing login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'hr-test@tst.go.th',
        password: 'TstHR2569'
      });
      
      if (signInError) {
        console.error('❌ Login failed:', signInError.message);
        console.error('Error details:', signInError);
      } else {
        console.log('✅ Login successful!');
        console.log('User:', signInData.user.email);
        console.log('Session expires:', new Date(signInData.session.expires_at * 1000));
      }
      
      // Check if organization exists
      console.log('\n🔍 Checking organization...');
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('org_code', 'TST')
        .single();
      
      if (orgError) {
        console.error('Organization error:', orgError);
      } else {
        console.log('✅ Organization found:', org.org_name_th);
        console.log('URL param should be: ?org=test-org');
      }
      
    } else {
      console.log('❌ User not found');
      console.log('Available users:');
      users.forEach(u => {
        if (u.email.includes('tst') || u.email.includes('test')) {
          console.log(`- ${u.email}`);
        }
      });
    }
    
    // Check if there might be a local development issue
    console.log('\n🔧 Debugging tips:');
    console.log('1. Make sure you are using http://localhost:3000/org-portal');
    console.log('2. Check browser console for errors');
    console.log('3. Try clearing browser cache');
    console.log('4. Check if local server is running');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLoginIssue();
