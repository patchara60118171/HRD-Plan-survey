// =============================================
// Add respondent_email column to Supabase
// =============================================

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

async function addRespondentEmailColumn() {
    console.log('🔧 Adding respondent_email column to hrd_ch1_responses...');
    
    try {
        // Execute SQL to add column
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sql: `ALTER TABLE public.hrd_ch1_responses ADD COLUMN IF NOT EXISTS respondent_email TEXT DEFAULT NULL;`
            })
        });
        
        if (response.ok) {
            console.log('✅ respondent_email column added successfully!');
        } else {
            // Try alternative approach via pg endpoint
            console.log('⚠️ RPC failed, trying alternative method...');
            
            // Alternative: Use raw SQL query endpoint
            const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_SERVICE_ROLE,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'params=single-object'
                },
                body: JSON.stringify({
                    query: `ALTER TABLE public.hrd_ch1_responses ADD COLUMN IF NOT EXISTS respondent_email TEXT DEFAULT NULL;`
                })
            });
            
            if (pgResponse.ok) {
                console.log('✅ respondent_email column added via alternative method!');
            } else {
                throw new Error(`Failed to add column: ${pgResponse.status} ${pgResponse.statusText}`);
            }
        }
        
        // Verify column was added
        const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=respondent_email&limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (verifyResponse.ok) {
            console.log('✅ Column verified: respondent_email exists in table');
        } else {
            console.log('⚠️ Could not verify column, but no error occurred during creation');
        }
        
    } catch (error) {
        console.error('❌ Error adding column:', error.message);
        console.log('\n🔧 Manual SQL to run in Supabase SQL Editor:');
        console.log('ALTER TABLE public.hrd_ch1_responses ADD COLUMN IF NOT EXISTS respondent_email TEXT DEFAULT NULL;');
    }
}

addRespondentEmailColumn();
