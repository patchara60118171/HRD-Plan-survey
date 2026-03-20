
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

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await adminClient.from('organizations').select('*').eq('org_code', 'test-org').single();
  console.log(JSON.stringify(data, null, 2));
}

check();
