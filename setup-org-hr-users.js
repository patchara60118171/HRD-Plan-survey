/**
 * setup-org-hr-users.js
 * Creates / updates 16 org_hr Supabase Auth accounts.
 *
 * Usage:  node setup-org-hr-users.js
 *
 * What it does:
 *   - For each entry: tries admin.createUser (email_confirm=true)
 *   - If user already exists: resets password via admin.updateUserById
 *   - Prints a summary table when done
 *
 * After running this script, execute the SQL migration in Supabase:
 *   supabase/migrations/20260324_finalize_all_orgs_and_hr_roles.sql
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6' +
  'InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.' +
  'rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

/** Canonical list — matches ตารางส่วนราชการ 16 หน่วยงาน */
const ORG_HR_USERS = [
  { email: 'hr@nesdc.go.th',    password: 'NesdcHR2569', org_code: 'nesdc',    name: 'สำนักงานสภาพัฒนาฯ (สศช.)' },
  { email: 'hr@tpso.go.th',     password: 'TpsoHR2569',  org_code: 'tpso',     name: 'สนค.' },
  { email: 'hr@dss.go.th',      password: 'DssHR2569',   org_code: 'dss',      name: 'กรมวิทยาศาสตร์บริการ (วศ.)' },
  { email: 'hr@dhss.go.th',     password: 'DhssHR2569',  org_code: 'dhss',     name: 'กรมสนับสนุนบริการสุขภาพ (สบส.)' },
  { email: 'hr@tmd.go.th',      password: 'TmdHR2569',   org_code: 'tmd',      name: 'กรมอุตุนิยมวิทยา (อต.)' },
  { email: 'hr@dcp.go.th',      password: 'DcpHR2569',   org_code: 'dcp',      name: 'กรมส่งเสริมวัฒนธรรม (สวธ.)' },
  { email: 'hr@dop.go.th',      password: 'DopHR2569',   org_code: 'dop',      name: 'กรมคุมประพฤติ (คป.)' },
  { email: 'hr@mots.go.th',     password: 'MotsHR2569',  org_code: 'mots',     name: 'สป.กก.' },
  { email: 'hr@dmh.go.th',      password: 'DmhHR2569',   org_code: 'dmh',      name: 'กรมสุขภาพจิต (สจ.)' },
  { email: 'hr@onep.go.th',     password: 'OnepHR2569',  org_code: 'onep',     name: 'สผ.' },
  { email: 'hr@nrct.go.th',     password: 'NrctHR2569',  org_code: 'nrct',     name: 'สำนักงานการวิจัยแห่งชาติ (วช.)' },
  { email: 'hr@acfs.go.th',     password: 'AcfsHR2569',  org_code: 'acfs',     name: 'มกอช.' },
  { email: 'hr@opdc.go.th',     password: 'OpdcHR2569',  org_code: 'opdc',     name: 'สำนักงาน ก.พ.ร.' },
  { email: 'hr@rid.go.th',      password: 'RidHR2569',   org_code: 'rid',      name: 'กรมชลประทาน (ชป.)' },
  { email: 'hr@dcy.go.th',      password: 'DcyHR2569',   org_code: 'dcy',      name: 'กรมกิจการเด็กและเยาวชน (ดย.)' },
  { email: 'hr-test@tst.go.th', password: 'TstHR2569',   org_code: 'test-org', name: 'ทดสอบระบบ' },
];

async function ensureAuthUser(entry) {
  const { email, password, org_code } = entry;

  // Try to create the user
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'org_hr', org_code }
    });

  if (!createErr) {
    return { uid: created.user.id, action: 'created' };
  }

  // User already exists — find and update password
  if (createErr.message?.includes('already been registered') ||
      createErr.status === 422) {
    const { data: { users }, error: listErr } =
      await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) throw new Error('listUsers failed: ' + listErr.message);

    const existing = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!existing) throw new Error(`User ${email} not found after create conflict`);

    const { error: updateErr } =
      await supabase.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { role: 'org_hr', org_code }
      });
    if (updateErr) throw new Error('updateUser failed: ' + updateErr.message);

    return { uid: existing.id, action: 'updated' };
  }

  throw new Error(`createUser(${email}) failed: ${createErr.message}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('  setup-org-hr-users.js — creating 16 org_hr accounts');
  console.log('='.repeat(60));

  const results = [];

  for (const entry of ORG_HR_USERS) {
    process.stdout.write(`  ${entry.email.padEnd(30)} → `);
    try {
      const { action } = await ensureAuthUser(entry);
      console.log(`✓ ${action}`);
      results.push({ ...entry, status: action });
    } catch (err) {
      console.log(`✗ ERROR: ${err.message}`);
      results.push({ ...entry, status: 'ERROR', error: err.message });
    }
  }

  const ok  = results.filter(r => r.status !== 'ERROR').length;
  const bad = results.filter(r => r.status === 'ERROR').length;

  console.log('\n' + '='.repeat(60));
  console.log(`  Done: ${ok} OK, ${bad} errors`);
  console.log('='.repeat(60));

  if (bad > 0) {
    console.log('\nErrors:');
    results.filter(r => r.status === 'ERROR').forEach(r =>
      console.log(`  ${r.email}: ${r.error}`)
    );
    process.exit(1);
  }

  console.log('\nNext step: run the SQL migration in Supabase SQL Editor:');
  console.log('  supabase/migrations/20260324_finalize_all_orgs_and_hr_roles.sql');
}

main();
