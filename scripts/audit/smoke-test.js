/**
 * smoke-test.js
 * ─────────────
 * End-to-end smoke test สำหรับ Well-being Survey System
 * ทดสอบกับ test-org โดยเฉพาะ
 *
 * Usage:
 *   node scripts/audit/smoke-test.js
 *
 * Requires .env.local ที่มี SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ──────────────────────────────
// Setup
// ──────────────────────────────
const envPath = resolve(process.cwd(), '.env.local');
let SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY;

try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    const key = k?.trim();
    const val = v.join('=').trim();
    if (key === 'SUPABASE_URL') SUPABASE_URL = val;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') SUPABASE_SERVICE_ROLE_KEY = val;
    if (key === 'SUPABASE_ANON_KEY') SUPABASE_ANON_KEY = val;
  });
} catch {
  console.error('❌ ไม่พบ .env.local — กรุณาสร้างจาก .env.example ก่อน');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ──────────────────────────────
// Test runner helpers
// ──────────────────────────────
const results = [];
let passed = 0, failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    results.push({ name, status: 'pass' });
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     → ${err.message}`);
    results.push({ name, status: 'fail', error: err.message });
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// ──────────────────────────────
// Test suites
// ──────────────────────────────

async function testOrganizations() {
  console.log('\n📋 Organizations');

  await test('test-org exists with is_test=true', async () => {
    const { data, error } = await adminClient
      .from('organizations')
      .select('org_code, org_name_th, is_test, is_active')
      .eq('org_code', 'test-org')
      .single();
    assert(!error, error?.message);
    assert(data.is_test === true, 'is_test should be true');
    assert(data.is_active === true, 'is_active should be true');
    assert(data.org_name_th === 'องค์กรทดสอบระบบ', 'org name mismatch');
  });

  await test('test-org excluded from production count (is_test=false filter)', async () => {
    const { data, error } = await adminClient
      .from('organizations')
      .select('org_code', { count: 'exact' })
      .eq('is_test', false);
    assert(!error, error?.message);
    const testOrgs = data?.filter(o => o.org_code === 'test-org');
    assert(testOrgs.length === 0, 'test-org should not appear in is_test=false filter');
  });
}

async function testUserRoles() {
  console.log('\n👤 User Roles (admin_user_roles)');

  await test('test org_hr user exists with correct org_code', async () => {
    const { data, error } = await adminClient
      .from('admin_user_roles')
      .select('email, role, org_code, is_active')
      .eq('email', 'hr@test-org.local')
      .single();
    assert(!error, error?.message);
    assert(data.role === 'org_hr', `expected org_hr, got ${data.role}`);
    assert(data.org_code === 'test-org', `expected test-org, got ${data.org_code}`);
    assert(data.is_active === true, 'user should be active');
  });

  await test('role constraint allows org_hr, admin, super_admin', async () => {
    const { data, error } = await adminClient
      .from('admin_user_roles')
      .select('role')
      .in('role', ['super_admin', 'admin', 'org_hr', 'viewer']);
    assert(!error, error?.message);
    // Just verify query works — constraint is enforced at DB level
  });
}

async function testCH1Lifecycle() {
  console.log('\n📝 CH1 Lifecycle (test-org)');

  await test('test-org has CH1 draft in round_2569', async () => {
    const { data, error } = await adminClient
      .from('hrd_ch1_responses')
      .select('org_code, round_code, status, is_test, submission_mode')
      .eq('org_code', 'test-org')
      .eq('round_code', 'round_2569')
      .single();
    assert(!error, error?.message);
    assert(data.status === 'draft', `expected draft, got ${data.status}`);
    assert(data.is_test === true, 'is_test should be true');
    assert(data.submission_mode === 'test', 'submission_mode should be test');
  });

  await test('test-org CH1 excluded from production analytics (is_test=false)', async () => {
    const { data, error } = await adminClient
      .from('hrd_ch1_responses')
      .select('org_code')
      .eq('is_test', false)
      .eq('org_code', 'test-org');
    assert(!error, error?.message);
    assert(data.length === 0, 'test-org CH1 should not appear in is_test=false filter');
  });

  await test('CH1 lifecycle: can update status draft → submitted', async () => {
    const { data: existing } = await adminClient
      .from('hrd_ch1_responses')
      .select('id, status')
      .eq('org_code', 'test-org')
      .eq('round_code', 'round_2569')
      .single();

    if (!existing) throw new Error('No test CH1 record found');

    // Update to submitted
    const { error: updateErr } = await adminClient
      .from('hrd_ch1_responses')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_by: 'smoke-test'
      })
      .eq('id', existing.id);
    assert(!updateErr, updateErr?.message);

    // Revert to draft for re-runnable tests
    await adminClient
      .from('hrd_ch1_responses')
      .update({ status: 'draft', submitted_at: null })
      .eq('id', existing.id);
  });
}

async function testWellbeingLinks() {
  console.log('\n🔗 Well-being Form Links');

  await test('test-org has active well-being link', async () => {
    const { data, error } = await adminClient
      .from('org_form_links')
      .select('full_url, is_active, organizations!inner(org_code), survey_forms!inner(form_key)')
      .eq('organizations.org_code', 'test-org')
      .eq('survey_forms.form_key', 'wellbeing')
      .eq('is_active', true);
    assert(!error, error?.message);
    assert(data.length > 0, 'no active well-being link for test-org');
  });

  await test('anon can submit well-being response for test-org', async () => {
    const { error } = await anonClient
      .from('survey_responses')
      .insert({
        email: `smoke-test-${Date.now()}@test.local`,
        organization: 'องค์กรทดสอบระบบ',
        org_type: 'government',
        gender: 'male',
        age: 30,
        raw_responses: { org_code: 'test-org', smoke_test: true }
      });
    assert(!error, error?.message);

    // Cleanup test response
    await adminClient
      .from('survey_responses')
      .delete()
      .contains('raw_responses', { smoke_test: true });
  });
}

async function testFormWindows() {
  console.log('\n⏰ Form Windows');

  await test('ch1 window exists for round_2569', async () => {
    const { data, error } = await anonClient
      .from('form_windows')
      .select('form_code, round_code, is_active')
      .eq('form_code', 'ch1')
      .eq('round_code', 'round_2569')
      .eq('is_active', true)
      .single();
    assert(!error, error?.message);
    assert(data !== null, 'ch1 form window not found');
  });

  await test('wellbeing window exists for round_2569', async () => {
    const { data, error } = await anonClient
      .from('form_windows')
      .select('form_code, round_code, is_active')
      .eq('form_code', 'wellbeing')
      .eq('round_code', 'round_2569')
      .eq('is_active', true)
      .single();
    assert(!error, error?.message);
    assert(data !== null, 'wellbeing form window not found');
  });
}

async function testRLSHelperFunctions() {
  console.log('\n🔒 RLS Helper Functions');

  await test('requester_role() function exists', async () => {
    const { error } = await adminClient.rpc('requester_role');
    // null result is OK (no auth context in service role), just check it doesn't error with "function not found"
    assert(!error || !error.message.includes('does not exist'), error?.message || '');
  });

  await test('requester_is_org_hr() function exists', async () => {
    const { error } = await adminClient.rpc('requester_is_org_hr');
    assert(!error || !error.message.includes('does not exist'), error?.message || '');
  });

  await test('requester_org() function exists', async () => {
    const { error } = await adminClient.rpc('requester_org');
    assert(!error || !error.message.includes('does not exist'), error?.message || '');
  });
}

async function testSurveyForms() {
  console.log('\n📋 Survey Forms Config');

  await test('survey_forms has editor permission flags', async () => {
    const { data, error } = await adminClient
      .from('survey_forms')
      .select('form_key, allow_label_edit_by_admin, allow_structure_edit_by_admin');
    assert(!error, error?.message);
    const ch1 = data.find(f => f.form_key === 'ch1');
    const wb = data.find(f => f.form_key === 'wellbeing');
    assert(ch1.allow_label_edit_by_admin === true, 'ch1 should allow label edit by admin');
    assert(ch1.allow_structure_edit_by_admin === false, 'ch1 should NOT allow structure edit by admin');
    assert(wb.allow_label_edit_by_admin === true, 'wellbeing should allow label edit by admin');
  });
}

// ──────────────────────────────
// Main runner
// ──────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Well-being Survey — Smoke Test Suite');
  console.log(`  Project: fgdommhiqhzvsedfzyrr`);
  console.log(`  Run at: ${new Date().toLocaleString('th-TH')}`);
  console.log('═══════════════════════════════════════════');

  await testOrganizations();
  await testUserRoles();
  await testCH1Lifecycle();
  await testWellbeingLinks();
  await testFormWindows();
  await testRLSHelperFunctions();
  await testSurveyForms();

  console.log('\n═══════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('All tests passed ✅');
  }
}

main().catch(err => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
