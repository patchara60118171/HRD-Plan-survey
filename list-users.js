const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
// Note: We need service role key to query auth.users
// Using anon key won't have permission to list users

async function listUsers() {
  // Try with anon key first (will likely fail due to RLS)
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || '');
  
  // Try to get users from auth admin API
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error.message);
    console.log('\nNote: Requires SUPABASE_SERVICE_KEY environment variable');
    console.log('Service Role Key can be found in Supabase Dashboard > Project Settings > API');
    return;
  }
  
  console.log('Users found:', users.length);
  users.forEach(u => {
    console.log(`- ${u.email} (created: ${u.created_at}, confirmed: ${u.email_confirmed_at ? 'yes' : 'no'})`);
  });
}

listUsers();
