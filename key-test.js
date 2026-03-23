const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6vnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testKeys() {
  try {
    console.log('🔍 Testing API keys...');
    
    // Test 1: Service role key (should work)
    console.log('\n1. Testing service role key...');
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6vnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';
    const serviceClient = createClient(SUPABASE_URL, serviceKey);
    
    const { data: serviceData, error: serviceError } = await serviceClient.auth.signInWithPassword({
      email: 'hr-test@tst.go.th',
      password: 'TstHR2569'
    });
    
    if (serviceError) {
      console.error('❌ Service key failed:', serviceError.message);
    } else {
      console.log('✅ Service key works!');
      console.log('User:', serviceData.user.email);
    }
    
    // Test 2: Current anon key
    console.log('\n2. Testing current anon key...');
    const { data: anonData, error: anonError } = await supabase.auth.signInWithPassword({
      email: 'hr-test@tst.go.th',
      password: 'TstHR2569'
    });
    
    if (anonError) {
      console.error('❌ Anon key failed:', anonError.message);
      console.log('Need to get new anon key from Supabase Dashboard');
    } else {
      console.log('✅ Anon key works!');
    }
    
    console.log('\n🔧 Solution:');
    console.log('1. Go to Supabase Dashboard: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr/settings/api');
    console.log('2. Copy the "anon public" key');
    console.log('3. Update js/supabase-config.js with the new key');
    console.log('4. Restart your local server');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testKeys();
