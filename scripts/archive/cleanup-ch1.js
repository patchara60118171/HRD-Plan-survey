// =============================================
// CH1 Data Cleanup Script - ล้างข้อมูล CH1 ให้เหลือแค่ 16 หน่วยงาน
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ตรวจสอบ credentials
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials!');
  console.error('Please create .env.local file with:');
  console.error('  SUPABASE_URL=https://xxxxx.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 16 หน่วยงานที่ต้องการเก็บ (หน่วยงานละ 1 อัน)
const TARGET_ORGS = [
  'กรมกิจการเด็กและเยาวชน',
  'กรมทางหลวง',
  'กรมวิทยาศาสตร์บริการ',
  'กรมส่งเสริมวัฒนธรรม',
  'กรมสุขภาพจิต',
  'กรมอุตุนิยมวิทยา',
  'กองฝึกอบรม กรมทางหลวง',
  'สำนักงานการวิจัยแห่งชาติ (วช.)',
  'กรมคุมประพฤติ',
  'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม',
  'สำนักงานนโยบายและยุทธศาสตร์การค้า',
  'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา',
  'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ',
  'สำนักงานสภาพพัฒนากาเศรษฐกิจและสังคมแห่งชาติ',
  'สำนักงานคณะกรรมการพัฒนาระบบราชการ (ก.พ.ร.)',
  'กรมชลประทาน'
];

async function cleanupCH1Data() {
  console.log('='.repeat(60));
  console.log('🧹 CH1 Data Cleanup Tool');
  console.log('='.repeat(60));
  console.log(`📋 Target: Keep only 16 organizations (1 record each)`);
  console.log(`📋 Organizations to keep:`);
  TARGET_ORGS.forEach((org, i) => console.log(`   ${i + 1}. ${org}`));
  console.log('='.repeat(60));

  try {
    // 1. ดูข้อมูลทั้งหมดก่อน
    console.log('\n📊 Fetching current data...');
    const { data: allRecords, error: fetchError } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('id, organization, respondent_email, submitted_at');

    if (fetchError) throw fetchError;

    console.log(`📊 Total records: ${allRecords.length}`);

    // 2. แยก record ตาม organization
    const orgMap = new Map();
    const otherRecords = [];

    for (const record of allRecords) {
      const orgName = record.organization;
      if (TARGET_ORGS.includes(orgName)) {
        if (!orgMap.has(orgName)) {
          orgMap.set(orgName, []);
        }
        orgMap.get(orgName).push(record);
      } else {
        otherRecords.push(record);
      }
    }

    // 3. แสดงสถานะ
    console.log('\n📋 Analysis:');
    console.log(`   - Records from target orgs: ${allRecords.length - otherRecords.length}`);
    console.log(`   - Records from other orgs: ${otherRecords.length}`);
    console.log(`   - Target orgs found: ${orgMap.size}/${TARGET_ORGS.length}`);

    // แสดงรายละเอียดแต่ละ org
    console.log('\n📋 Target organizations records:');
    for (const [org, records] of orgMap) {
      console.log(`   ${org}: ${records.length} record(s)`);
    }

    if (otherRecords.length > 0) {
      console.log('\n📋 Other organizations to be deleted:');
      const otherOrgs = [...new Set(otherRecords.map(r => r.organization))];
      otherOrgs.forEach(org => {
        const count = otherRecords.filter(r => r.organization === org).length;
        console.log(`   ${org}: ${count} record(s) ❌`);
      });
    }

    // 4. เตรียมรายการลบ
    const recordsToDelete = [];

    // 4.1 ลบ records จาก org ที่ไม่อยู่ใน list
    recordsToDelete.push(...otherRecords.map(r => r.id));

    // 4.2 ลบ records ที่เกิน 1 อันจากแต่ละ target org (เก็บอันแรก)
    for (const [org, records] of orgMap) {
      if (records.length > 1) {
        // เก็บอันแรก ลบที่เหลือ
        const toDelete = records.slice(1).map(r => r.id);
        recordsToDelete.push(...toDelete);
        console.log(`\n   ${org}: Keeping 1, deleting ${toDelete.length} extra record(s)`);
      }
    }

    // 5. ตรวจสอบ org ที่ไม่มีข้อมูล
    const missingOrgs = TARGET_ORGS.filter(org => !orgMap.has(org));
    if (missingOrgs.length > 0) {
      console.log('\n⚠️  Warning: These target orgs have no records:');
      missingOrgs.forEach(org => console.log(`   - ${org}`));
    }

    // 6. ยืนยันก่อนลบ
    console.log('\n' + '='.repeat(60));
    console.log(`🗑️  Ready to delete ${recordsToDelete.length} records`);
    console.log(`✅ Will keep ${TARGET_ORGS.length - missingOrgs.length} records`);
    console.log('='.repeat(60));

    if (recordsToDelete.length === 0) {
      console.log('\n✅ No records to delete. Data is already clean!');
      return;
    }

    // 7. ลบข้อมูล
    console.log('\n🗑️  Deleting records...');
    
    // ลบทีละ batch (Supabase จำกัด 1000 records ต่อครั้ง)
    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < recordsToDelete.length; i += batchSize) {
      const batch = recordsToDelete.slice(i, i + batchSize);
      
      const { error: deleteError } = await supabaseAdmin
        .from('hrd_ch1_responses')
        .delete()
        .in('id', batch);

      if (deleteError) {
        console.error(`❌ Error deleting batch ${i / batchSize + 1}:`, deleteError.message);
      } else {
        deletedCount += batch.length;
        console.log(`   ✅ Deleted batch ${i / batchSize + 1}: ${batch.length} records`);
      }
    }

    // 8. ตรวจสอบผลลัพธ์
    const { count: finalCount } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*', { count: 'exact', head: true });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Cleanup completed!');
    console.log('='.repeat(60));
    console.log(`🗑️  Deleted: ${deletedCount} records`);
    console.log(`📊 Remaining: ${finalCount} records`);
    console.log(`📋 Expected: ${TARGET_ORGS.length} records (1 per target org)`);

    if (finalCount === TARGET_ORGS.length - missingOrgs.length) {
      console.log('\n🎉 Perfect! Data is now clean.');
    } else {
      console.log('\n⚠️  Note: Some target organizations are missing data.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run cleanup
cleanupCH1Data().catch(console.error);
