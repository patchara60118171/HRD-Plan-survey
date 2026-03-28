console.log(`
🔍 ตรวจสอบสถานะ org-portal:

✅ Logic ถูกต้องแล้ว:
- loadCh1Data() ค้นหาทั้ง org_code และ organization
- portalState.orgName ควรเป็น 'สอบระบบ'
- ข้อมูลใน hrd_ch1_responses มี organization = 'สอบระบบ'

🔧 ทดสอบ:

1. เปิด Console (F12) ใน org-portal
2. พิมพ์: console.log('orgName:', portalState.orgName)
3. พิมพ์: console.log('orgCode:', portalState.orgCode)
4. พิมพ์: loadCh1Data() // เพื่อทดสอบ

🎯 ถ้ายังไม่โชว์ข้อมูล:

1. ตรวจสอบว่า portalState.orgName เป็น 'สอบระบบ' จริงๆ
2. ตรวจสอบว่า loadCh1Data() ถูกเรียกหลัง login
3. ดู Console ว่ามี error อะไรตอน loadCh1Data()

⚠️ ถ้า portalState.orgName ไม่ถูกต้อง:
- ต้องแก้ admin_user_roles.org_name ให้เป็น 'สอบระบบ'
- หรือตรวจสอบว่า organizations.org_name_th ถูกต้อง

✅ 99% น่าจะเป็นเรื่อง portalState.orgName ไม่ตรงกับข้อมูล!
`);

console.log('🚀 ตรวจสอบ org-portal state');
