const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testAlternativeEmails() {
  try {
    console.log('🔧 Testing alternative email formats...');
    
    const testEmails = [
      'hr-test@tst.go.th',
      'tst-hr@tst.go.th', 
      'test-org@tst.go.th',
      'hr.tst@tst.go.th',
      'test.hr@tst.go.th'
    ];
    
    for (const email of testEmails) {
      console.log(`\n📧 Testing: ${email}`);
      
      // Try to create user
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: 'TstHR2569',
        email_confirm: true,
        user_metadata: {
          role: 'org-hr',
          organization_id: '8d179bb1-5ca0-4c0d-8ead-2cd3ccd2bcb7',
          organization_code: 'TST'
        }
      });
      
      if (error) {
        console.log(`❌ Failed: ${error.message}`);
      } else {
        console.log(`✅ Success! User created: ${data.user.email}`);
        console.log(`🎉 Use this email instead: ${email}`);
        console.log(`🔗 Login: http://localhost:3000/org-portal`);
        console.log(`👤 Password: TstHR2569`);
        
        // Test login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: 'TstHR2569'
        });
        
        if (loginError) {
          console.log(`❌ Login test failed: ${loginError.message}`);
        } else {
          console.log(`✅ Login test successful!`);
        }
        
        return email; // Found working email
      }
    }
    
    console.log('\n❌ All email formats failed');
    console.log('🔧 Alternative solutions:');
    console.log('1. Try using a different domain (e.g., @test.org)');
    console.log('2. Check if there are RLS policies blocking user creation');
    console.log('3. Try restarting Supabase project');
    console.log('4. Use existing user and update their metadata');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAlternativeEmails();
