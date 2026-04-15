// =============================================
// Check Supabase Setup - ตรวจสอบการตั้งค่า Supabase
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// สร้าง Admin Client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://fgdommhiqhzvsedfzyrr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkDatabase() {
  console.log('\n📊 ตรวจสอบฐานข้อมูล...\n');
  
  try {
    // 1. ตรวจสอบตาราง hrd_ch1_responses
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('❌ ไม่พบตาราง hrd_ch1_responses:', tableError.message);
      return false;
    }
    
    console.log('✅ ตาราง hrd_ch1_responses พบแล้ว');
    console.log(`   จำนวน records: ${tableData || 0}`);
    
    // 2. ตรวจสอบ columns ที่จำเป็น
    const requiredColumns = [
      'respondent_email',
      'organization',
      'total_staff',
      'strategy_file_path',
      'strategy_file_url',
      'strategy_file_name',
      'org_structure_file_path',
      'org_structure_file_url',
      'org_structure_file_name',
      'hrd_plan_file_path',
      'hrd_plan_file_url',
      'hrd_plan_file_name',
      'strategic_priority_rank1',
      'strategic_priority_rank2',
      'strategic_priority_rank3',
      'intervention_packages_feedback'
    ];
    
    console.log('\n📋 ตรวจสอบ columns...');
    
    // Query ข้อมูล 1 record เพื่อดู structure
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.warn('⚠️  ไม่สามารถดึงข้อมูลตัวอย่างได้:', sampleError.message);
    } else if (sampleData && sampleData.length > 0) {
      const existingColumns = Object.keys(sampleData[0]);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('\n❌ ขาด columns ต่อไปนี้:');
        missingColumns.forEach(col => console.log(`   - ${col}`));
        console.log('\n💡 แนะนำ: รัน migration v4 ใน Supabase SQL Editor');
        console.log('   ไฟล์: supabase/migrations/20250305_update_schema_v4.sql');
        return false;
      } else {
        console.log('✅ columns ครบถ้วน');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    return false;
  }
}

async function checkStorage() {
  console.log('\n🗂️  ตรวจสอบ Storage Buckets...\n');
  
  try {
    // 1. ตรวจสอบ bucket 'survey-attachments'
    const { data: buckets, error: bucketsError } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('❌ ไม่สามารถดึงรายการ buckets ได้:', bucketsError.message);
      return false;
    }
    
    const surveyBucket = buckets.find(b => b.name === 'survey-attachments');
    
    if (!surveyBucket) {
      console.log('❌ ไม่พบ bucket "survey-attachments"');
      console.log('\n💡 สร้าง bucket ด้วยคำสั่ง:');
      console.log('   await supabaseAdmin.storage.createBucket("survey-attachments", {');
      console.log('     public: true,');
      console.log('     fileSizeLimit: 524288 // 512KB');
      console.log('   })');
      
      // พยายามสร้าง bucket
      console.log('\n🔧 กำลังสร้าง bucket...');
      const { data: newBucket, error: createError } = await supabaseAdmin
        .storage
        .createBucket('survey-attachments', {
          public: true,
          fileSizeLimit: 524288, // 512KB
          allowedMimeTypes: ['application/pdf']
        });
      
      if (createError) {
        console.error('❌ ไม่สามารถสร้าง bucket ได้:', createError.message);
        return false;
      }
      
      console.log('✅ สร้าง bucket "survey-attachments" สำเร็จ');
    } else {
      console.log('✅ พบ bucket "survey-attachments"');
      console.log(`   Public: ${surveyBucket.public ? 'Yes' : 'No'}`);
      console.log(`   File size limit: ${surveyBucket.file_size_limit ? (surveyBucket.file_size_limit / 1024) + ' KB' : 'ไม่จำกัด'}`);
    }
    
    // 2. ทดสอบการอัปโหลดไฟล์
    console.log('\n🧪 ทดสอบการอัปโหลดไฟล์...');
    
    const testContent = 'Test PDF content';
    const testPath = 'test/test-upload.txt';
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('survey-attachments')
      .upload(testPath, testContent, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ ไม่สามารถอัปโหลดไฟล์ทดสอบได้:', uploadError.message);
      return false;
    }
    
    console.log('✅ อัปโหลดไฟล์ทดสอบสำเร็จ');
    
    // ลบไฟล์ทดสอบ
    await supabaseAdmin.storage.from('survey-attachments').remove([testPath]);
    console.log('✅ ลบไฟล์ทดสอบสำเร็จ');
    
    return true;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    return false;
  }
}

async function checkRLSPolicies() {
  console.log('\n🔒 ตรวจสอบ RLS Policies...\n');
  
  try {
    // Query policies จาก pg_policies
    const { data, error } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
          FROM pg_policies
          WHERE tablename = 'hrd_ch1_responses'
          ORDER BY policyname;
        `
      });
    
    if (error) {
      console.warn('⚠️  ไม่สามารถดึงข้อมูล RLS policies ได้:', error.message);
      console.log('💡 อาจต้องรัน SQL script ใน Supabase SQL Editor');
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('❌ ไม่พบ RLS policies สำหรับตาราง hrd_ch1_responses');
      console.log('\n💡 แนะนำ: รัน RLS policies script');
      console.log('   ไฟล์: supabase/rls-policies.sql');
      return false;
    }
    
    console.log(`✅ พบ ${data.length} RLS policies`);
    data.forEach(policy => {
      console.log(`   - ${policy.policyname} (${policy.cmd})`);
    });
    
    return true;
  } catch (error) {
    console.warn('⚠️  ไม่สามารถตรวจสอบ RLS policies ได้:', error.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 ตรวจสอบการตั้งค่า Supabase');
  console.log('='.repeat(60));
  
  if (!process.env.SUPABASE_URL && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n⚠️  ไม่พบ environment variables');
    console.log('กรุณาสร้างไฟล์ .env.local และใส่:');
    console.log('  SUPABASE_URL=https://fgdommhiqhzvsedfzyrr.supabase.co');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    console.log('\nหรือใช้ SUPABASE_ANON_KEY สำหรับการทดสอบ');
    process.exit(1);
  }
  
  const dbOk = await checkDatabase();
  const storageOk = await checkStorage();
  const rlsOk = await checkRLSPolicies();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 สรุปผลการตรวจสอบ');
  console.log('='.repeat(60));
  console.log(`Database:     ${dbOk ? '✅ OK' : '❌ มีปัญหา'}`);
  console.log(`Storage:      ${storageOk ? '✅ OK' : '❌ มีปัญหา'}`);
  console.log(`RLS Policies: ${rlsOk ? '✅ OK' : '⚠️  ตรวจสอบไม่ได้'}`);
  console.log('='.repeat(60));
  
  if (dbOk && storageOk) {
    console.log('\n✅ ระบบพร้อมใช้งาน!');
  } else {
    console.log('\n❌ พบปัญหา กรุณาแก้ไขตามคำแนะนำด้านบน');
  }
}

main().catch(console.error);
