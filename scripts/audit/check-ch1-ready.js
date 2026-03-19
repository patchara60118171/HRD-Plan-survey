// Check CH1 Supabase readiness by doing a real insert with all expected fields.
// - Uses service role to avoid RLS issues.
// - Inserts a single test record (is_test=true) and deletes it immediately.
// - Verifies storage bucket required by pdf-upload.js exists.

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TABLE = 'hrd_ch1_responses';
const BUCKET = 'hrd-documents';

function nowIso() {
  return new Date().toISOString();
}

function makeTestEmail() {
  const token = `ch1-ready-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  return `${token}@wellbeing.test`;
}

function buildPayload(respondentEmail) {
  // Keep values small and valid for numeric(5,2) etc.
  return {
    respondent_email: respondentEmail,
    form_version: 'ch1-v4.0',
    submitted_at: nowIso(),
    is_test: true,
    submission_mode: 'test',
    test_run_id: `script-${Date.now()}`,

    organization: 'TEST_ORG',
    strategic_overview: 'test strategic overview',
    org_structure: 'test org structure',
    total_staff: 100,

    age_u30: 10,
    age_31_40: 20,
    age_41_50: 30,
    age_51_60: 40,

    service_u1: 1,
    service_1_5: 2,
    service_6_10: 3,
    service_11_15: 4,
    service_16_20: 5,
    service_21_25: 6,
    service_26_30: 7,
    service_over30: 8,

    pos_o1: 1,
    pos_o2: 1,
    pos_o3: 1,
    pos_o4: 1,
    pos_k1: 1,
    pos_k2: 1,
    pos_k3: 1,
    pos_k4: 1,
    pos_k5: 1,
    pos_m1: 1,
    pos_m2: 1,
    pos_s1: 1,
    pos_s2: 1,

    type_official: 10,
    type_employee: 20,
    type_contract: 30,
    type_other: 40,

    turnover_count: 1,
    turnover_rate: 1.23,
    transfer_count: 2,
    transfer_rate: 2.34,

    begin_2564: 100,
    begin_2565: 100,
    begin_2566: 100,
    begin_2567: 100,
    begin_2568: 100,
    end_2564: 100,
    end_2565: 100,
    end_2566: 100,
    end_2567: 100,
    end_2568: 100,
    leave_2564: 1,
    leave_2565: 1,
    leave_2566: 1,
    leave_2567: 1,
    leave_2568: 1,
    rate_2564: 1.0,
    rate_2565: 1.0,
    rate_2566: 1.0,
    rate_2567: 1.0,
    rate_2568: 1.0,

    related_policies: 'test policies',
    context_challenges: 'test challenges',

    disease_diabetes: 1,
    disease_hypertension: 1,
    disease_cardiovascular: 1,
    disease_kidney: 1,
    disease_liver: 1,
    disease_cancer: 1,
    disease_obesity: 1,
    disease_other_count: 1,
    disease_other_detail: 'test other',
    disease_report_type: 'estimated',
    ncd_count: 8,
    ncd_ratio_pct: 8.0,

    sick_leave_days: 10,
    sick_leave_avg: 1.5,
    sick_leave_report_type: 'estimated',

    clinic_report_type: 'estimated',
    clinic_users_per_year: 10,
    clinic_top_symptoms: 'symptom1, symptom2',
    clinic_top_medications: 'med1, med2',

    mental_stress: 'test',
    mental_anxiety: 'test',
    mental_sleep: 'test',
    mental_burnout: 'test',
    mental_depression: 'test',
    mental_health_report_type: 'estimated',

    engagement_score_2568: 3.5,
    engagement_score_2567: 3.5,
    engagement_score_2566: 3.5,
    engagement_score_2565: 3.5,
    engagement_score_2564: 3.5,
    engagement_low_areas: 'area1, area2',
    other_wellbeing_surveys: 'none',

    mentoring_system: 'full',
    job_rotation: 'partial',
    idp_system: 'none',
    career_path_system: 'full',
    training_hours: 10,
    digital_systems: ['hris', 'lms'],
    ergonomics_status: 'none',
    ergonomics_detail: 'test',

    strategic_priority_rank1: 'service_efficiency',
    strategic_priority_rank2: 'digital_capability',
    strategic_priority_rank3: 'new_leaders',
    strategic_priority_other: null,
    intervention_packages_feedback: 'test feedback',
    hrd_plan_url: 'https://example.invalid/hrd-plan',
    hrd_plan_results: 'test results',

    strategy_file_path: null,
    strategy_file_url: null,
    strategy_file_name: null,
    org_structure_file_path: null,
    org_structure_file_url: null,
    org_structure_file_name: null,
    hrd_plan_file_path: null,
    hrd_plan_file_url: null,
    hrd_plan_file_name: null,
  };
}

async function main() {
  console.log('============================================================');
  console.log('CH1 readiness check (Supabase)');
  console.log('============================================================');

  // 1) Storage bucket check
  console.log(`\n[1/3] Storage bucket check: ${BUCKET}`);
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  if (bucketErr) {
    console.error('❌ Failed to list buckets:', bucketErr.message);
  } else {
    const found = (buckets || []).some((b) => b.name === BUCKET || b.id === BUCKET);
    console.log(found ? '✅ Bucket exists' : '❌ Bucket not found');
  }

  // 2) Insert with full CH1 payload to detect missing columns.
  // If PostgREST schema cache reports a missing column, collect and retry without that key
  // so we can report the full missing list in one run.
  console.log(`\n[2/3] Insert test record into ${TABLE}`);
  const email = makeTestEmail();
  const payload = buildPayload(email);
  const missingColumns = [];

  let insertedRow = null;
  // Hard cap retries to avoid infinite loops.
  // Use a generous cap because a stale schema may be missing many columns.
  for (let attempt = 1; attempt <= 200; attempt++) {
    const { data: inserted, error: insErr } = await supabase
      .from(TABLE)
      .insert([payload])
      .select('id, respondent_email');

    if (!insErr) {
      insertedRow = Array.isArray(inserted) ? inserted[0] : inserted;
      break;
    }

    const msg = insErr.message || '';
    const m = msg.match(/Could not find the '([^']+)' column/i);
    if (m && m[1]) {
      const col = m[1];
      missingColumns.push(col);
      delete payload[col];
      console.warn(`⚠️  Missing column: ${col}`);
      continue;
    }

    // Not a missing-column error; stop and report
    console.error('❌ Insert failed (schema not ready or constraint/RLS issue).');
    console.error('   Message:', insErr.message);
    if (insErr.details) console.error('   Details:', insErr.details);
    if (insErr.hint) console.error('   Hint:', insErr.hint);
    process.exit(2);
  }

  if (!insertedRow) {
    console.error('❌ Insert did not succeed after retries.');
    if (missingColumns.length) {
      console.error('Missing columns detected:', missingColumns.join(', '));
    }
    process.exit(2);
  }

  console.log('✅ Insert OK:', insertedRow);

  // 3) Cleanup
  console.log('\n[3/3] Cleanup test record');
  const { error: delErr } = await supabase.from(TABLE).delete().eq('respondent_email', email);
  if (delErr) {
    console.error('⚠️  Cleanup failed:', delErr.message);
    console.error('   Please delete manually where respondent_email =', email);
    process.exit(3);
  }
  console.log('✅ Cleanup OK');

  if (missingColumns.length) {
    console.log('\n⚠️  Note: Insert only succeeded after removing missing columns:');
    console.log('   ' + missingColumns.join(', '));
    console.log('   Add these columns in Supabase, then rerun this script to confirm full readiness.');
    process.exit(4);
  }

  console.log('\n============================================================');
  console.log('✅ CH1 Supabase schema accepts all fields in current ch1-form.js');
  console.log('============================================================');
}

main().catch((e) => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
