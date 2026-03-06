// =============================================
// Supabase Admin Client - สำหรับ Kiro Admin Access
// ใช้ Service Role Key เพื่อเข้าถึงฐานข้อมูลในระดับ admin
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ตรวจสอบว่ามี environment variables ครบ
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials!');
  console.error('Please create .env.local file with:');
  console.error('  SUPABASE_URL=https://xxxxx.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

// สร้าง Admin Client ด้วย Service Role Key
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

console.log('🔐 Supabase Admin Client initialized');
console.log(`📍 URL: ${process.env.SUPABASE_URL}`);

// =============================================
// Helper Functions
// =============================================

/**
 * ทดสอบการเชื่อมต่อกับ Supabase
 */
async function testConnection() {
  try {
    console.log('\n🔍 Testing connection...');
    
    const { count, error } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log('✅ Connected to Supabase successfully!');
    console.log(`📊 Total records in hrd_ch1_responses: ${count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

/**
 * ดูข้อมูลสถิติฐานข้อมูล
 */
async function getDatabaseStats() {
  try {
    console.log('\n📊 Fetching database statistics...');
    
    // นับจำนวน records
    const { count: totalRecords } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*', { count: 'exact', head: true });
    
    // นับจำนวน submitted vs draft
    const { count: submittedCount } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*', { count: 'exact', head: true })
      .not('submitted_at', 'is', null);
    
    const { count: draftCount } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('*', { count: 'exact', head: true })
      .is('submitted_at', null);
    
    // ดู record ล่าสุด
    const { data: latestRecord } = await supabaseAdmin
      .from('hrd_ch1_responses')
      .select('respondent_email, submitted_at, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    console.log('\n📈 Database Statistics:');
    console.log(`  Total Records: ${totalRecords}`);
    console.log(`  Submitted: ${submittedCount}`);
    console.log(`  Drafts: ${draftCount}`);
    console.log(`  Capacity Used: ${((totalRecords / 20) * 100).toFixed(1)}% (${totalRecords}/20)`);
    
    if (latestRecord) {
      console.log(`\n📅 Latest Record:`);
      console.log(`  Email: ${latestRecord.respondent_email}`);
      console.log(`  Created: ${latestRecord.created_at}`);
      console.log(`  Submitted: ${latestRecord.submitted_at || 'Draft'}`);
    }
    
    return {
      totalRecords,
      submittedCount,
      draftCount,
      latestRecord
    };
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error.message);
    return null;
  }
}

/**
 * ดูรายการ Storage Buckets
 */
async function listStorageBuckets() {
  try {
    console.log('\n🗂️  Listing storage buckets...');
    
    const { data: buckets, error } = await supabaseAdmin
      .storage
      .listBuckets();
    
    if (error) throw error;
    
    if (buckets.length === 0) {
      console.log('  No buckets found');
      return [];
    }
    
    console.log(`  Found ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`    - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    return buckets;
  } catch (error) {
    console.error('❌ Failed to list buckets:', error.message);
    return [];
  }
}

/**
 * รัน SQL Query แบบ custom
 */
async function runQuery(sql) {
  try {
    console.log('\n🔍 Running custom query...');
    console.log(`SQL: ${sql.substring(0, 100)}...`);
    
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql });
    
    if (error) throw error;
    
    console.log('✅ Query executed successfully');
    console.log('Result:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    return null;
  }
}

/**
 * ดูรายการ Tables ทั้งหมด
 */
async function listTables() {
  try {
    console.log('\n📋 Listing all tables...');
    
    // Query information_schema
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) throw error;
    
    console.log(`  Found ${data.length} table(s):`);
    data.forEach(table => {
      console.log(`    - ${table.table_name}`);
    });
    
    return data;
  } catch (error) {
    console.error('❌ Failed to list tables:', error.message);
    return [];
  }
}

/**
 * Export ข้อมูลเป็น JSON
 */
async function exportData(tableName = 'hrd_ch1_responses', limit = 100) {
  try {
    console.log(`\n💾 Exporting data from ${tableName}...`);
    
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .limit(limit);
    
    if (error) throw error;
    
    const fs = require('fs');
    const filename = `export_${tableName}_${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    
    console.log(`✅ Exported ${data.length} records to ${filename}`);
    
    return data;
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    return null;
  }
}

// =============================================
// Main Function - รันเมื่อเรียกไฟล์นี้โดยตรง
// =============================================

async function main() {
  console.log('='.repeat(50));
  console.log('🚀 Supabase Admin Tool');
  console.log('='.repeat(50));
  
  // ทดสอบการเชื่อมต่อ
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n❌ Cannot proceed without connection');
    process.exit(1);
  }
  
  // ดูสถิติ
  await getDatabaseStats();
  
  // ดู storage buckets
  await listStorageBuckets();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All checks completed!');
  console.log('='.repeat(50));
  console.log('\n💡 You can now use this client in other scripts:');
  console.log('   const { supabaseAdmin } = require("./supabase-admin");');
  console.log('\n');
}

// Export สำหรับใช้ใน scripts อื่น
module.exports = {
  supabaseAdmin,
  testConnection,
  getDatabaseStats,
  listStorageBuckets,
  runQuery,
  listTables,
  exportData
};

// รัน main ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  main().catch(console.error);
}
