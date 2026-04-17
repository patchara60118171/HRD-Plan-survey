require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testRunId = process.argv[2] || null;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('Clearing CH1 test data...');

  let countQuery = supabase
    .from('hrd_ch1_responses')
    .select('*', { count: 'exact', head: true })
    .eq('is_test', true);

  let deleteQuery = supabase
    .from('hrd_ch1_responses')
    .delete()
    .eq('is_test', true);

  if (testRunId) {
    countQuery = countQuery.eq('test_run_id', testRunId);
    deleteQuery = deleteQuery.eq('test_run_id', testRunId);
  }

  const { count: beforeCount, error: countErr } = await countQuery;
  if (countErr) throw countErr;
  console.log(`Test records before delete: ${beforeCount}`);

  const { error: deleteErr } = await deleteQuery;
  if (deleteErr) throw deleteErr;

  let afterQuery = supabase
    .from('hrd_ch1_responses')
    .select('*', { count: 'exact', head: true })
    .eq('is_test', true);

  if (testRunId) {
    afterQuery = afterQuery.eq('test_run_id', testRunId);
  }

  const { count: afterCount, error: afterErr } = await afterQuery;
  if (afterErr) throw afterErr;
  console.log(`Test records after delete: ${afterCount}`);
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  console.error('Cleanup failed (message):', err?.message || '(no message)');
  process.exit(1);
});
