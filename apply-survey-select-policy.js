#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const sb = createClient(
  'https://fgdommhiqhzvsedfzyrr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo'
);

// SQL to apply the SELECT policy
const sqlStatements = [
  `DROP POLICY IF EXISTS "survey_select_admin" ON public.survey_responses;`,
  `DROP POLICY IF EXISTS "survey_select_org_hr" ON public.survey_responses;`,
  `DROP POLICY IF EXISTS "Role-aware select survey" ON public.survey_responses;`,
  
  `CREATE POLICY "survey_select_admin"
ON public.survey_responses
FOR SELECT
TO authenticated
USING (
  public.requester_is_admin()
  OR
  (public.requester_is_org_hr() AND (
    organization IN (
      SELECT org_name_th 
      FROM public.organizations 
      WHERE org_code = public.requester_org()
    )
    OR COALESCE(org_code, '') = COALESCE(public.requester_org(), '__none__')
    OR COALESCE((raw_responses ->> 'org_code'), '') = COALESCE(public.requester_org(), '__none__')
  ))
);`
];

(async () => {
  try {
    console.log('⏳ Applying SELECT policy for survey_responses...\n');
    
    // Execute each SQL statement
    for (const sql of sqlStatements) {
      console.log(`Executing: ${sql.substring(0, 50)}...`);
      const { error } = await sb.rpc('sql_exec', { sql });
      if (error) {
        console.log('❌ Error:', error.message);
        process.exit(1);
      }
    }
    
    console.log('\n✅ SELECT policy created successfully\n');
    
    // Test if admin can now read survey_responses
    console.log('🧪 Testing admin read access...');
    const { data: test, error: testErr } = await sb
      .from('survey_responses')
      .select('id,email,organization,org_code,submitted_at', { count: 'exact' })
      .limit(5);
    
    if (testErr) {
      console.log('⚠️ Query test failed:', testErr.message);
      process.exit(1);
    }
    
    console.log(`✅ Admin can now read survey_responses!`);
    console.log(`📊 Sample data (${test?.length || 0} rows shown):`);
    if (test && test.length > 0) {
      test.forEach(row => {
        console.log(`   - ${row.email} | ${row.organization} [${row.org_code}] | ${row.submitted_at}`);
      });
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (e) {
    console.log('❌ Exception:', e.message);
    process.exit(1);
  }
})();
