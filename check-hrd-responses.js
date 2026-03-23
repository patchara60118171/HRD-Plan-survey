const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fgdommhiqhzvsedfzyrr.supabase.co',
  'sb_publishable_nn4DqJvk3Kv7OxZbir4vUw_-b-SoRfp'
);

async function checkHRDResponses() {
  try {
    console.log('=== Checking HRD CH1 Responses for Organization Info ===');
    
    const { data, error } = await supabase
      .from('hrd_ch1_responses')
      .select('organization, respondent_email, respondent_name, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('ไม่พบข้อมูลการตอบแบบสอบถาม HRD CH1');
      return;
    }
    
    console.log('พบข้อมูลการตอบแบบสอบถาม:');
    console.log('ลำดับ\tชื่อองค์กร\t\tอีเมลผู้ตอบ\t\tวันที่ตอบ');
    console.log('====\t========\t\t========\t\t========');
    
    const uniqueOrgs = new Map();
    
    data.forEach((response, index) => {
      if (index < 15) { // Show first 15
        console.log(`${index + 1}\t${response.organization || 'ไม่ระบุ'}\t\t${response.respondent_email || 'ไม่ระบุ'}\t\t${response.submitted_at ? new Date(response.submitted_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}`);
      }
      
      // Collect unique organizations with emails
      if (response.organization && response.respondent_email) {
        if (!uniqueOrgs.has(response.organization)) {
          uniqueOrgs.set(response.organization, []);
        }
        if (!uniqueOrgs.get(response.organization).includes(response.respondent_email)) {
          uniqueOrgs.get(response.organization).push(response.respondent_email);
        }
      }
    });
    
    console.log('\n=== สรุปองค์กรและอีเมลที่พบ ===');
    console.log('ลำดับ\tชื่อองค์กร\t\tอีเมลที่พบ');
    console.log('====\t========\t\t========');
    
    let orgIndex = 1;
    uniqueOrgs.forEach((emails, orgName) => {
      console.log(`${orgIndex}\t${orgName}\t\t${emails.join(', ')}`);
      orgIndex++;
    });
    
  } catch (err) {
    console.error('Connection error:', err.message);
  }
}

checkHRDResponses();
