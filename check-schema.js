const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSchema() {
  try {
    // Check organizations table structure
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'organizations' });
    
    if (error) {
      console.log('Error getting columns, trying alternative method...');
      
      // Alternative: try to describe the table
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);
      
      if (orgError) {
        console.error('Error accessing organizations table:', orgError);
        return;
      }
      
      console.log('Organizations table columns:', Object.keys(orgData[0] || {}));
    } else {
      console.log('Organizations table columns:', columns);
    }
    
    // Check existing organizations
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (orgsError) {
      console.error('Error getting organizations:', orgsError);
    } else {
      console.log('\nExisting organizations:');
      orgs.forEach(org => {
        console.log(`- ${org.name_th || org.name} (${org.url_param || org.abbreviation})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
