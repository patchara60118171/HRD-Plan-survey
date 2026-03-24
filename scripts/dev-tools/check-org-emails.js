const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fgdommhiqhzvsedfzyrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6vnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo'
);

async function getAllOrgsWithEmails() {
  try {
    console.log('=== Organizations with Contact Info ===');
    
    // Get organizations
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .order('id');
    
    if (orgError) {
      console.error('Error fetching organizations:', orgError);
      return;
    }
    
    if (!orgs || orgs.length === 0) {
      console.log('ไม่พบข้อมูลองค์กรในระบบ');
      
      // Try to get from auth users instead
      console.log('\n=== Checking Auth Users ===');
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      if (authUsers && authUsers.users.length > 0) {
        console.log('พบผู้ใช้ในระบบ:');
        authUsers.users.forEach((user, index) => {
          const orgName = user.user_metadata?.organization_code || 'ไม่ระบุ';
          console.log(`${index + 1}\t${orgName}\t\t${user.email}`);
        });
      }
      return;
    }
    
    console.log('ลำดับ\tชื่อส่วนราชการ\t\tอีเมลติดต่อ');
    console.log('====\t========================\t\t==========');
    
    orgs.forEach((org, index) => {
      const email = org.contact_email || org.email || org.hr_email || 'ไม่พบข้อมูล';
      const orgName = org.org_name_th || org.org_name_en || 'ไม่พบชื่อ';
      console.log(`${index + 1}\t${orgName}\t\t${email}`);
    });
    
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

getAllOrgsWithEmails();
