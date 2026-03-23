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
        name_th: 'องค์กรทดสอบระบบ',
        name_en: 'Test Organization',
        abbreviation_th: 'ทดสอบ',
        abbreviation_en: 'test',
        url_param: 'test-org',
        is_active: true
      })
      .select()
      .single();
    
    if (orgError) {
      console.error('Error adding organization:', orgError);
      return;
    }
    
    console.log('✓ Organization added:', org.name_th);
    
    // 2. Create user account
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'hr@tst.go.th',
      password: 'TstHR2569',
      email_confirm: true,
      user_metadata: {
        role: 'org-hr',
        organization_id: org.id
      }
    });
    
    if (userError) {
      console.error('Error creating user:', userError);
      return;
    }
    
    console.log('✓ User created:', user.user.email);
    
    // 3. Add form links for this organization
    const { data: forms, error: formsError } = await supabase
      .from('survey_forms')
      .select('id, form_key');
    
    if (formsError) {
      console.error('Error getting forms:', formsError);
      return;
    }
    
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
        console.error(`Error creating link for form ${form.form_key}:`, linkError);
      } else {
        console.log(`✓ Link created for form: ${form.form_key}`);
      }
    }
    
    console.log('\n🎉 Test organization setup complete!');
    console.log(`URL: https://nidawellbeing.vercel.app/?org=test-org`);
    console.log(`Login: hr@tst.go.th / TstHR2569`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addTestOrganization();
