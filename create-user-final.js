const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Try admin.createUser again
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'hr@tst.go.th',
      password: 'TstHR2569',
      email_confirm: true,
      user_metadata: {
        role: 'org-hr',
        organization_id: '8d179bb1-5ca0-4c0d-8ead-2cd3ccd2bcb7',
        organization_code: 'TST'
      }
    });
    
    if (error) {
      console.error('Error creating user:', error);
      console.log('Trying alternative method...');
      
      // Try signup method
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
      
      if (signUpError) {
        console.error('Signup also failed:', signUpError);
        console.log('\n🔧 Manual creation required:');
        console.log('1. Go to: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr/auth/users');
        console.log('2. Click "Add user"');
        console.log('3. Email: hr@tst.go.th');
        console.log('4. Password: TstHR2569');
        console.log('5. User metadata:');
        console.log('   {"role": "org-hr", "organization_id": "8d179bb1-5ca0-4c0d-8ead-2cd3ccd2bcb7", "organization_code": "TST"}');
        return;
      }
      
      console.log('✅ User created via signup!');
      console.log('Email:', signUpData.user.email);
      console.log('ID:', signUpData.user.id);
      
    } else {
      console.log('✅ User created via admin!');
      console.log('Email:', data.user.email);
      console.log('ID:', data.user.id);
    }
    
    // Test login immediately
    console.log('\n🔍 Testing login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'hr@tst.go.th',
      password: 'TstHR2569'
    });
    
    if (signInError) {
      console.error('❌ Login test failed:', signInError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('Ready to use at: http://localhost:3000/org-portal');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUser();
