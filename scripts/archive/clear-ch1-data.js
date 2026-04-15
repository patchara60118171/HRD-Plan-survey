require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log('Clearing CH1 data...');

  const { count: beforeCount, error: countErr } = await supabase
    .from('hrd_ch1_responses')
    .select('*', { count: 'exact', head: true });
  if (countErr) throw countErr;
  console.log(`Records before delete: ${beforeCount}`);

  const { error: deleteErr } = await supabase
    .from('hrd_ch1_responses')
    .delete()
    .not('id', 'is', null);
  if (deleteErr) throw deleteErr;

  const { count: afterCount, error: afterErr } = await supabase
    .from('hrd_ch1_responses')
    .select('*', { count: 'exact', head: true });
  if (afterErr) throw afterErr;
  console.log(`Records after delete: ${afterCount}`);

  console.log('CH1 cleanup completed.');
}

main().catch((err) => {
  console.error('Cleanup failed (full):', err);
  console.error('Cleanup failed (message):', err?.message || '(no message)');
  process.exit(1);
});
