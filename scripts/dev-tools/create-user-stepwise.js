const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createTestUserStepByStep() {
  try {
    console.log('🎯 Creating test user step by step...');
    
    // Step 1: Create user without metadata
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'hr@tst.go.th',
      password: 'TstHR2569',
      email_confirm: true
    });
    
    if (userError) {
      console.error('❌ User creation failed:', userError.message);
      return;
    }
    
    console.log('✅ User created successfully!');
    console.log('Email:', userData.user.email);
    console.log('ID:', userData.user.id);
    
    // Step 2: Try to update metadata
    console.log('\n🔧 Updating user metadata...');
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      {
        user_metadata: {
          role: 'org-hr',
          organization_id: '8d179bb1-5ca0-4c0d-8ead-2cd3ccd2bcb7',
          organization_code: 'TST'
        }
      }
    );
    
    if (updateError) {
      console.error('❌ Metadata update failed:', updateError.message);
      console.log('User created but metadata not set');
      console.log('You can manually set metadata in Supabase Dashboard');
    } else {
      console.log('✅ Metadata updated successfully!');
    }
    
    // Step 3: Test login
    console.log('\n🔍 Testing login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'hr@tst.go.th',
      password: 'TstHR2569'
    });
    
    if (signInError) {
      console.error('❌ Login test failed:', signInError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('User role:', signInData.user.user_metadata?.role || 'not set');
    }
    
    console.log('\n🎉 Test user setup complete!');
    console.log('📋 Login credentials:');
    console.log('Email: hr@tst.go.th');
    console.log('Password: TstHR2569');
    console.log('URL: http://localhost:3000/org-portal');
    
    if (updateError) {
      console.log('\n⚠️  Note: Metadata not set automatically');
      console.log('Set metadata manually in Supabase Dashboard > Authentication > Users > Edit');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUserStepByStep();
