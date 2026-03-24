const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 กำลังเชื่อมต่อ User กับ Organization ผ่าน Supabase CLI...');

try {
  // สร้าง SQL สำหรับการเชื่อมต่อ
  const sql = `
-- เชื่อมต่อ User กับ Organization
UPDATE admin_user_roles 
SET 
    org_code = 'test',
    org_name = 'สอบระบบ',
    updated_at = NOW()
WHERE id = '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003';

-- ตรวจสอบผลลัพธ์
SELECT id, email, role, org_name, org_code, is_active
FROM admin_user_roles 
WHERE id = '5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003';
`;

  // เขียน SQL ลงไฟล์
  fs.writeFileSync('temp-connect.sql', sql);
  
  console.log('✅ สร้าง SQL สำเร็จ');
  console.log('📋 ข้อมูลที่จะอัปเดต:');
  console.log('   - User Role ID: 5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003');
  console.log('   - Organization ID: d46edda4-d874-4ff3-ac10-5f1a8ce241ae');
  console.log('   - org_code: test');
  console.log('   - org_name: สอบระบบ');
  
  console.log('\n🔧 รัน SQL ผ่าน Supabase CLI...');
  
  // ใช้ supabase db shell ถ้ามี
  try {
    const result = execSync('supabase db shell --file temp-connect.sql', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ SQL รันสำเร็จ!');
    console.log('ผลลัพธ์:', result);
  } catch (shellError) {
    console.log('⚠️  supabase db shell ไม่สามารถใช้ได้');
    console.log('🔧 ใช้วิธีอื่นแทน...');
  }
  
  // ลบไฟล์ชั่วคราว
  try {
    fs.unlinkSync('temp-connect.sql');
  } catch (e) {
    // ignore
  }
  
  console.log('\n🎯 ถ้า SQL รันสำเร็จ:');
  console.log('   - User จะถูกผูกกับ organization "สอบระบบ"');
  console.log('   - สามารถ login ได้ที่: http://localhost:3000/org-portal');
  console.log('   - ใช้: hr-test@tst.go.th / TstHR2569');
  
  console.log('\n📋 ถ้ายังไม่สำเร็จ ให้ทำตามขั้นตอน manual:');
  console.log('1. เปิด: https://app.supabase.com/project/fgdommhiqhzvsedfzyrr');
  console.log('2. ไปที่ Table Editor → admin_user_roles');
  console.log('3. หา ID: 5c7fbe3b-2d64-41f5-ad04-5f8a42fb5003');
  console.log('4. อัปเดต: org_code=test, org_name=สอบระบบ');
  console.log('5. บันทึก');
  
} catch (error) {
  console.error('❌ เกิดข้อผิดพลาด:', error.message);
}
