const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTestUser() {
  try {
    console.log('Checking if test user exists...');
    
    // List all users and look for test user
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return;
    }
    
    const testUser = users.find(u => u.email === 'hr@tst.go.th');
    
    if (testUser) {
      console.log('✅ Test user found!');
      console.log('Email:', testUser.email);
      console.log('ID:', testUser.id);
      console.log('Created:', testUser.created_at);
      console.log('Confirmed:', testUser.email_confirmed_at ? 'yes' : 'no');
      console.log('Metadata:', JSON.stringify(testUser.user_metadata, null, 2));
    } else {
      console.log('❌ Test user NOT found in auth system');
      console.log('Current users:');
      users.forEach(u => {
        console.log(`- ${u.email}`);
      });
    }
    
    // Try to sign in with test credentials
    console.log('\n🔍 Testing login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'hr@tst.go.th',
      password: 'TstHR2569'
    });
    
    if (signInError) {
      console.error('❌ Login failed:', signInError.message);
      console.error('Error details:', signInError);
    } else {
      console.log('✅ Login successful!');
      console.log('User:', signInData.user.email);
      console.log('Session expires:', signInData.session.expires_at);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTestUser();
