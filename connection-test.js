// =============================================
// Simple Supabase Test - Basic Connection
// =============================================

const SUPABASE_URL = 'https://fgdommhiqzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Connection...\n');
    
    try {
        // Test 1: Basic connectivity test
        console.log('1. 🌐 Testing basic connectivity...');
        const testUrl = `${SUPABASE_URL}/rest/v1/`;
        const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ Basic connectivity: OK');
        
        // Test 2: List tables
        console.log('\n2. 📋 Testing table access...');
        const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (tablesResponse.ok) {
            console.log('✅ Table access: OK');
        }
        
        // Test 3: Try to access our specific table
        console.log('\n3. 📊 Testing hrd_ch1_responses table...');
        const tableResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=count`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
                'Prefer': 'count=exact'
            }
        });
        
        if (!tableResponse.ok) {
            throw new Error(`Table access failed: HTTP ${tableResponse.status}`);
        }
        
        const count = tableResponse.headers.get('content-range')?.split('/')[1] || 'Unknown';
        console.log(`✅ Table access: OK (${count} records)`);
        
        // Test 4: Get sample data if exists
        if (count !== '0' && count !== 'Unknown') {
            console.log('\n4. 📄 Getting sample data...');
            const dataResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=id,organization,submitted_at,total_staff&limit=3`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_SERVICE_ROLE,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
                }
            });
            
            if (dataResponse.ok) {
                const data = await dataResponse.json();
                console.log(`✅ Sample data: Retrieved ${data.length} records`);
                
                data.forEach((record, i) => {
                    const date = record.submitted_at ? new Date(record.submitted_at).toLocaleString('th-TH') : 'No date';
                    console.log(`   ${i+1}. ${record.organization || 'Unknown'} - ${date}`);
                    console.log(`      Staff: ${record.total_staff || 'N/A'}`);
                });
            }
        }
        
        console.log('\n✅ All tests passed!');
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        
        // Provide specific guidance
        if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
            console.log('\n🔧 Issue: DNS Resolution Failed');
            console.log('Possible solutions:');
            console.log('1. Check if Supabase URL is correct');
            console.log('2. Try using a different network');
            console.log('3. Check if firewall is blocking the connection');
        } else if (error.message.includes('HTTP 401')) {
            console.log('\n🔧 Issue: Authentication Failed');
            console.log('Possible solutions:');
            console.log('1. Check if service role key is correct');
            console.log('2. Verify the key is not expired');
        } else if (error.message.includes('HTTP 404')) {
            console.log('\n🔧 Issue: Table Not Found');
            console.log('Possible solutions:');
            console.log('1. Verify table name "hrd_ch1_responses" exists');
            console.log('2. Check if table is in the right schema');
        }
    }
}

// Run the test
testSupabaseConnection();
