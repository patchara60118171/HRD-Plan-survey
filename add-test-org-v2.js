const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function addTestOrganization() {
  try {
    console.log('Adding test organization...');
    
    // 1. Add organization to organizations table
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        org_code: 'TST',
        org_name_th: 'องค์กรทดสอบระบบ',
        org_name_en: 'Test Organization',
        abbr_th: 'ทดสอบ',
        abbr_en: 'test',
        org_type: 'test',
        contact_email: 'hr@tst.go.th',
        is_active: true,
        is_test: true,
        show_in_dashboard: true,
        display_order: 999,
        sort_order: 999
      })
      .select()
      .single();
    
    if (orgError) {
      console.error('Error adding organization:', orgError);
      return;
    }
    
    console.log('✓ Organization added:', org.org_name_th);
    console.log('  - ID:', org.id);
    console.log('  - Code:', org.org_code);
    
    // 2. Create user account
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'hr@tst.go.th',
      password: 'TstHR2569',
      email_confirm: true,
      user_metadata: {
        role: 'org-hr',
        organization_id: org.id,
        organization_code: 'TST'
      }
    });
    
    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }
    
    console.log('✓ User created:', user.user.email);
    
    // 3. Check if org_form_links table exists and add links
    try {
      const { data: forms, error: formsError } = await supabase
        .from('survey_forms')
        .select('id, form_key');
      
      if (formsError) {
        console.log('Survey forms table not accessible, skipping form links');
      } else {
        console.log('Found forms:', forms.length);
        
        for (const form of forms) {
          const { error: linkError } = await supabase
            .from('org_form_links')
            .insert({
              organization_id: org.id,
              form_id: form.id,
              is_active: true,
              created_by: user.user.id
            });
          
          if (linkError) {
            console.log(`Note: Could not create link for form ${form.form_key}:`, linkError.message);
          } else {
            console.log(`✓ Link created for form: ${form.form_key}`);
          }
        }
      }
    } catch (linkErr) {
      console.log('Form links setup skipped (table may not exist)');
    }
    
    console.log('\n🎉 Test organization setup complete!');
    console.log(`Organization: ${org.org_name_th} (${org.org_code})`);
    console.log(`URL: https://nidawellbeing.vercel.app/?org=test-org`);
    console.log(`Login: hr@tst.go.th / TstHR2569`);
    console.log(`Role: org-hr`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addTestOrganization();
