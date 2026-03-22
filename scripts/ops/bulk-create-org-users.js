
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
let SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY;

const envContent = readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  const key = k?.trim();
  const val = v.join('=').trim();
  if (key === 'SUPABASE_URL') SUPABASE_URL = val;
  if (key === 'SUPABASE_SERVICE_ROLE_KEY') SUPABASE_SERVICE_ROLE_KEY = val;
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const agencies = [
  { name: "กรมกิจการเด็กและเยาวชน", code: "DCY" },
  { name: "กรมคุมประพฤติ", code: "PROB" },
  { name: "กรมชลประทาน", code: "RID" },
  { name: "กรมวิทยาศาสตร์บริการ", code: "DSS" },
  { name: "กรมส่งเสริมวัฒนธรรม", code: "DCP" },
  { name: "กรมสุขภาพจิต", code: "DMH" },
  { name: "กรมอุตุนิยมวิทยา", code: "TMD" },
  { name: "กรมสนับสนุนบริการสุขภาพ", code: "DHSS" },
  { name: "สำนักงาน กพร.", code: "OPDC" },
  { name: "สำนักงานการวิจัยแห่งชาติ", code: "NRCT" },
  { name: "สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม", code: "ONEP" },
  { name: "สำนักงานนโยบายและยุทธศาสตร์การค้า", code: "TPSO" },
  { name: "สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา", code: "MOTS" },
  { name: "สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ", code: "ACFS" },
  { name: "สำนักงานสภาพพัฒนาการเศรษฐกิจและสังคมแห่งชาติ", code: "NESDC" }
];

async function createUsers() {
  console.log('🚀 Starting automated user creation...');
  const results = [];

  for (const agency of agencies) {
    const email = `${agency.code.toLowerCase()}@wellbeing.local`;
    const password = `${agency.code}2569!`;
    const displayName = `HR ${agency.name}`;

    console.log(`Creating user for: ${agency.name} (${email})...`);

    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { display_name: displayName }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`⚠️ User ${email} already exists in Auth. Continuing to update roles...`);
      } else {
        console.error(`❌ Error creating Auth user ${email}:`, authError.message);
        results.push({ agency: agency.name, status: 'failed', error: authError.message });
        continue;
      }
    }

    // 2. Link to admin_user_roles (Manual Upsert)
    const { data: existingRole, error: selectError } = await supabase
      .from('admin_user_roles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      console.error(`❌ Error checking role for ${email}:`, selectError.message);
      results.push({ agency: agency.name, status: 'failed', error: selectError.message });
      continue;
    }

    const roleData = {
      email: email,
      role: 'org_hr',
      org_code: agency.code,
      display_name: displayName,
      is_active: true
    };

    // Only add initial_password if it's likely to exist (we could check but we'll try/catch)
    try {
      roleData.initial_password = password;
    } catch (e) {}

    let roleError;
    if (existingRole) {
      const { error } = await supabase
        .from('admin_user_roles')
        .update(roleData)
        .eq('id', existingRole.id);
      roleError = error;
    } else {
      const { error } = await supabase
        .from('admin_user_roles')
        .insert(roleData);
      roleError = error;
    }

    if (roleError) {
      console.error(`❌ Error saving role for ${email}:`, roleError.message);
      results.push({ agency: agency.name, status: 'failed', error: roleError.message });
    } else {
      console.log(`✅ Successfully created/updated user for ${agency.name}`);
      results.push({ agency: agency.name, email, password, status: 'success' });
    }
  }

  console.log('\n📊 Summary:');
  console.table(results);
}

createUsers();
