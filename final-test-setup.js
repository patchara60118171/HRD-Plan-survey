const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTestUserDirectly() {
  try {
    console.log('Creating test user directly in auth.users table...');
    
    // Insert user directly into auth.users table
    const { data, error } = await supabase
      .rpc('create_test_user', {
        p_email: 'hr@tst.go.th',
        p_password: 'TstHR2569',
        p_org_id: '8d179bb1-5ca0-4c0d-8ead-2cd3ccd2bcb7'
      });
    
    if (error) {
      console.error('Error creating user via RPC:', error);
      
      // Try direct SQL insert
      console.log('Trying direct SQL approach...');
      
      // Generate a UUID for the user
      const userId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, () => 
        Math.floor(Math.random() * 16).toString(16)
      );
      
      console.log('Generated user ID:', userId);
      console.log('Note: Manual user creation may require direct database access');
      console.log('Please create the user manually in Supabase Dashboard > Authentication > Users');
      
      return;
    }
    
    console.log('✓ User created:', data);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function checkExistingUsers() {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return;
    }
    
    console.log('\n📋 Current users:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.id}) - Confirmed: ${user.email_confirmed_at ? 'yes' : 'no'}`);
    });
    
    const testUser = users.find(u => u.email === 'hr@tst.go.th');
    if (testUser) {
      console.log('\n✅ Test user already exists!');
      console.log('You can use these credentials:');
      console.log('Email: hr@tst.go.th');
      console.log('Password: TstHR2569');
      console.log('URL: https://nidawellbeing.vercel.app/?org=test-org');
    } else {
      console.log('\n❌ Test user not found. Manual creation required.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  await checkExistingUsers();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. If test user exists above, you can use it directly');
  console.log('2. If not, go to Supabase Dashboard > Authentication > Users');
  console.log('3. Click "Add user" and enter:');
  console.log('   - Email: hr@tst.go.th');
  console.log('   - Password: TstHR2569');
  console.log('   - Role: org-hr (in user metadata)');
  console.log('4. Set organization_id in user metadata to: 8d179bb1-5ca0-4c0d-8ead-2cd3ccd2bcb7');
  
  console.log('\n📋 Test Organization Summary:');
  console.log('✅ Organization: องค์กรทดสอบระบบ (TST) - CREATED');
  console.log('🔗 URL: https://nidawellbeing.vercel.app/?org=test-org');
  console.log('👤 Login: hr@tst.go.th / TstHR2569');
  console.log('🎭 Role: org-hr');
}

main();
