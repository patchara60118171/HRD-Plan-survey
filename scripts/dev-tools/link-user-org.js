const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6vnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function linkUserToOrganization() {
  try {
    console.log('🔍 Checking user and organization...');
    
    // 1. Get the user
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error getting users:', userError);
      return;
    }
    
    const testUser = users.find(u => u.email === 'hr-test@tst.go.th');
    
    if (!testUser) {
      console.log('❌ User hr-test@tst.go.th not found');
      return;
    }
    
    console.log('✅ User found:', testUser.email);
    console.log('Current metadata:', JSON.stringify(testUser.user_metadata, null, 2));
    
    // 2. Get organizations
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (orgError) {
      console.error('Error getting organizations:', orgError);
      return;
    }
    
    console.log('\n📋 Available organizations:');
    orgs.forEach((org, index) => {
      console.log(`${index + 1}. ${org.org_name_th} (${org.org_code})`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Active: ${org.is_active}`);
    });
    
    // 3. Find test organization (TST or test-org)
    const testOrg = orgs.find(o => 
      o.org_code === 'TST' || 
      o.org_code === 'test-org' ||
      o.org_name_th?.includes('ทดสอบ')
    );
    
    if (!testOrg) {
      console.log('\n❌ No test organization found');
      console.log('Please create a test organization first');
      return;
    }
    
    console.log('\n✅ Found test organization:');
    console.log('Name:', testOrg.org_name_th);
    console.log('Code:', testOrg.org_code);
    console.log('ID:', testOrg.id);
    
    // 4. Update user metadata with correct organization
    console.log('\n🔧 Updating user metadata...');
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      testUser.id,
      {
        user_metadata: {
          role: 'org-hr',
          organization_id: testOrg.id,
          organization_code: testOrg.org_code || 'TST'
        }
      }
    );
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }
    
    console.log('✅ User metadata updated successfully!');
    console.log('New metadata:', JSON.stringify(updateData.user.user_metadata, null, 2));
    
    // 5. Test login
    console.log('\n🔍 Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'hr-test@tst.go.th',
      password: 'TstHR2569'
    });
    
    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('User:', loginData.user.email);
      console.log('Organization ID:', loginData.user.user_metadata?.organization_id);
      console.log('Organization Code:', loginData.user.user_metadata?.organization_code);
    }
    
    console.log('\n🎉 Ready to use!');
    console.log('📋 Login credentials:');
    console.log('   Email: hr-test@tst.go.th');
    console.log('   Password: TstHR2569');
    console.log('   URL: http://localhost:3000/org-portal');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

linkUserToOrganization();
