const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
// Use service role key for admin operations
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6vnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createNewOrganization(orgData) {
  try {
    console.log(`🏢 Creating organization: ${orgData.name_th}`);
    
    // 1. Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        org_code: orgData.code,
        org_name_th: orgData.name_th,
        org_name_en: orgData.name_en,
        abbr_th: orgData.abbr_th,
        abbr_en: orgData.abbr_en,
        org_type: orgData.type || 'government',
        contact_email: orgData.contact_email,
        is_active: true,
        is_test: orgData.is_test || false
      })
      .select()
      .single();
    
    if (orgError) {
      console.error('❌ Error creating organization:', orgError);
      return null;
    }
    
    console.log('✅ Organization created:', org.org_name_th);
    console.log('  ID:', org.id);
    console.log('  Code:', org.org_code);
    
    // 2. Create user account
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: orgData.user_email,
      password: orgData.user_password,
      email_confirm: true,
      user_metadata: {
        role: 'org-hr',
        organization_id: org.id,
        organization_code: orgData.code
      }
    });
    
    if (userError) {
      console.error('❌ Error creating user:', userError.message);
      console.log('🔧 Try creating user manually in Dashboard');
      return org;
    }
    
    console.log('✅ User created:', user.user.email);
    
    // 3. Create form links (if forms exist)
    try {
      const { data: forms } = await supabase
        .from('survey_forms')
        .select('id, form_key');
      
      if (forms && forms.length > 0) {
        console.log('🔗 Creating form links...');
        for (const form of forms) {
          await supabase
            .from('org_form_links')
            .insert({
              organization_id: org.id,
              form_id: form.id,
              is_active: true,
              created_by: user.user.id
            });
        }
        console.log(`✅ Created ${forms.length} form links`);
      }
    } catch (linkErr) {
      console.log('⚠️  Form links skipped (table may not exist)');
    }
    
    console.log('\n🎉 Organization setup complete!');
    console.log(`📋 Login credentials:`);
    console.log(`   Email: ${orgData.user_email}`);
    console.log(`   Password: ${orgData.user_password}`);
    console.log(`   URL: https://nidawellbeing.vercel.app/?org=${orgData.url_param}`);
    
    return org;
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

// Example usage - create multiple organizations
async function createMultipleOrgs() {
  const organizations = [
    {
      name_th: 'กรมทดสอบที่ 1',
      name_en: 'Test Department 1',
      code: 'TST1',
      abbr_th: 'ทดสอบ1',
      abbr_en: 'test1',
      type: 'test',
      contact_email: 'hr@tst1.go.th',
      user_email: 'hr@tst1.go.th',
      user_password: 'Tst1HR2569',
      url_param: 'test-org-1',
      is_test: true
    },
    {
      name_th: 'กรมทดสอบที่ 2',
      name_en: 'Test Department 2',
      code: 'TST2',
      abbr_th: 'ทดสอบ2',
      abbr_en: 'test2',
      type: 'test',
      contact_email: 'hr@tst2.go.th',
      user_email: 'hr@tst2.go.th',
      user_password: 'Tst2HR2569',
      url_param: 'test-org-2',
      is_test: true
    }
  ];
  
  for (const org of organizations) {
    await createNewOrganization(org);
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// Run the function
createMultipleOrgs();
