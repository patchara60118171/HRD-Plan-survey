const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTestUser() {
  try {
    console.log('Creating test user with signup...');
    
    // Try using signup instead of admin create
    const { data, error } = await supabase.auth.signUp({
      email: 'hr@tst.go.th',
      password: 'TstHR2569',
      options: {
        data: {
          role: 'org-hr',
          organization_id: '8d179bb1-5ca0-4c0d-8ead-2cd3ccd2bcb7',
          organization_code: 'TST'
        }
      }
    });
    
    if (error) {
      console.error('Error creating user:', error);
      
      // If user already exists, try to update their metadata
      if (error.message.includes('already registered')) {
        console.log('User already exists, trying to get user info...');
        
        // List users to find the user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.error('Error listing users:', listError);
          return;
        }
        
        const testUser = users.find(u => u.email === 'hr@tst.go.th');
        if (testUser) {
          console.log('✓ Found existing user:', testUser.email);
          console.log('  - ID:', testUser.id);
          console.log('  - Created:', testUser.created_at);
          console.log('  - Confirmed:', testUser.email_confirmed_at ? 'yes' : 'no');
          console.log('  - Metadata:', testUser.user_metadata);
        } else {
          console.log('User not found in list');
        }
      }
      return;
    }
    
    console.log('✓ User created successfully:', data.user.email);
    console.log('  - ID:', data.user.id);
    console.log('  - Confirmed:', data.user.email_confirmed_at ? 'yes' : 'no');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function verifyOrgExists() {
  try {
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('org_code', 'TST')
      .single();
    
    if (error) {
      console.error('Error finding organization:', error);
      return;
    }
    
    console.log('✓ Organization exists:', org.org_name_th);
    console.log('  - ID:', org.id);
    console.log('  - Code:', org.org_code);
    console.log('  - Active:', org.is_active);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  await verifyOrgExists();
  await createTestUser();
  
  console.log('\n📋 Test Organization Summary:');
  console.log('Organization: องค์กรทดสอบระบบ (TST)');
  console.log('URL: https://nidawellbeing.vercel.app/?org=test-org');
  console.log('Login: hr@tst.go.th / TstHR2569');
  console.log('Role: org-hr');
}

main();
