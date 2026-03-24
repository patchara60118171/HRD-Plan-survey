const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkOrganizations() {
  try {
    console.log('🔍 Checking all organizations...');
    
    // Get all organizations
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .order('org_name_th');
    
    if (error) {
      console.error('Error getting organizations:', error);
      return;
    }
    
    console.log(`Found ${orgs.length} organizations:`);
    orgs.forEach((org, index) => {
      console.log(`${index + 1}. ${org.org_name_th} (${org.org_code || org.abbreviation})`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Active: ${org.is_active}`);
    });
    
    // Look for test organization
    const testOrg = orgs.find(o => 
      o.org_code === 'TST' || 
      o.abbreviation === 'ทดสอบ' || 
      o.org_name_th?.includes('ทดสอบ')
    );
    
    if (testOrg) {
      console.log('\n✅ Test organization found:');
      console.log('Name:', testOrg.org_name_th);
      console.log('Code:', testOrg.org_code);
      console.log('ID:', testOrg.id);
      
      // Update user metadata with correct organization ID
      console.log('\n🔧 Updating user metadata...');
      const { data: userData, error: updateError } = await supabase.auth.admin.updateUserById(
        '632c1186-ea3b-411e-a649-6f0bfcc18800',
        {
          user_metadata: {
            role: 'org-hr',
            organization_id: testOrg.id,
            organization_code: testOrg.org_code || 'TST'
          }
        }
      );
      
      if (updateError) {
        console.error('Update failed:', updateError);
      } else {
        console.log('✅ User metadata updated!');
      }
      
    } else {
      console.log('\n❌ Test organization not found');
      console.log('Creating test organization...');
      
      // Create test organization
      const { data: newOrg, error: createError } = await supabase
        .from('organizations')
        .insert({
          org_code: 'TST',
          org_name_th: 'องค์กรทดสอบระบบ',
          org_name_en: 'Test Organization',
          abbr_th: 'ทดสอบ',
          abbr_en: 'test',
          org_type: 'test',
          contact_email: 'hr-test@tst.go.th',
          is_active: true,
          is_test: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Create failed:', createError);
      } else {
        console.log('✅ Test organization created:', newOrg.org_name_th);
        console.log('ID:', newOrg.id);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrganizations();
