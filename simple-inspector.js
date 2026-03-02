// =============================================
// Simple Supabase Inspector (using fetch)
// =============================================

const SUPABASE_URL = 'https://fgdommhiqzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

async function inspectSupabase() {
    console.log('🔍 Inspecting Supabase Database...\n');
    
    try {
        // Test 1: Check total responses
        console.log('📊 === TOTAL RESPONSES ===');
        const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=count`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
                'Prefer': 'count=exact'
            }
        });
        
        if (!countResponse.ok) {
            throw new Error(`HTTP ${countResponse.status}: ${countResponse.statusText}`);
        }
        
        const count = countResponse.headers.get('content-range')?.split('/')[1] || 'Unknown';
        console.log(`Total responses: ${count}`);
        
        // Test 2: Get latest 5 submissions
        console.log('\n📅 === LATEST 5 SUBMISSIONS ===');
        const latestResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=id,organization,submitted_at,total_staff,ncd_count,form_version&order=submitted_at.desc&limit=5`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (!latestResponse.ok) {
            throw new Error(`HTTP ${latestResponse.status}: ${latestResponse.statusText}`);
        }
        
        const latestData = await latestResponse.json();
        
        if (latestData.length === 0) {
            console.log('❌ No submissions found yet!');
        } else {
            latestData.forEach((record, i) => {
                const date = record.submitted_at ? new Date(record.submitted_at).toLocaleString('th-TH') : 'No date';
                console.log(`${i+1}. ${record.organization || 'Unknown Org'} - ${date}`);
                console.log(`   Staff: ${record.total_staff || 'N/A'}, NCD: ${record.ncd_count || 0}, Version: ${record.form_version || 'Unknown'}`);
            });
        }
        
        // Test 3: Check form versions
        console.log('\n📋 === FORM VERSION DISTRIBUTION ===');
        const versionResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=form_version&form_version=not.is.null`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (versionResponse.ok) {
            const versionData = await versionResponse.json();
            const versionCounts = {};
            
            versionData.forEach(record => {
                const version = record.form_version || 'unknown';
                versionCounts[version] = (versionCounts[version] || 0) + 1;
            });
            
            Object.entries(versionCounts).forEach(([version, count]) => {
                console.log(`${version}: ${count} responses`);
            });
        }
        
        // Test 4: Check organizations
        console.log('\n🏢 === ORGANIZATION DISTRIBUTION ===');
        const orgResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=organization&organization=not.is.null`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            const orgCounts = {};
            
            orgData.forEach(record => {
                const org = record.organization || 'Unknown';
                orgCounts[org] = (orgCounts[org] || 0) + 1;
            });
            
            Object.entries(orgCounts)
                .sort(([,a], [,b]) => b - a)
                .forEach(([org, count]) => {
                    console.log(`${org}: ${count} responses`);
                });
        }
        
        // Test 5: Sample JSONB data (if any records exist)
        if (latestData.length > 0) {
            console.log('\n🔧 === SAMPLE JSONB FIELDS ===');
            const sampleResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=id,organization,sick_leave_data,engagement_data,strategic_priorities&submitted_at=not.is.null&limit=3`, {
                headers: {
                    'apikey': SUPABASE_SERVICE_ROLE,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
                }
            });
            
            if (sampleResponse.ok) {
                const sampleData = await sampleResponse.json();
                
                sampleData.forEach(record => {
                    console.log(`\n${record.organization || 'Unknown Org'} (ID: ${record.id}):`);
                    
                    // Check sick_leave_data
                    if (record.sick_leave_data) {
                        if (Array.isArray(record.sick_leave_data)) {
                            console.log(`  ✅ sick_leave_data: Array[${record.sick_leave_data.length}] items`);
                            if (record.sick_leave_data.length > 0) {
                                console.log(`     Sample: ${JSON.stringify(record.sick_leave_data[0]).substring(0, 100)}...`);
                            }
                        } else {
                            console.log(`  ⚠️  sick_leave_data: ${typeof record.sick_leave_data} (Expected Array)`);
                        }
                    } else {
                        console.log(`  ❌ sick_leave_data: NULL/Empty`);
                    }
                    
                    // Check engagement_data
                    if (record.engagement_data) {
                        if (Array.isArray(record.engagement_data)) {
                            console.log(`  ✅ engagement_data: Array[${record.engagement_data.length}] items`);
                        } else {
                            console.log(`  ⚠️  engagement_data: ${typeof record.engagement_data} (Expected Array)`);
                        }
                    } else {
                        console.log(`  ❌ engagement_data: NULL/Empty`);
                    }
                    
                    // Check strategic_priorities
                    if (record.strategic_priorities) {
                        if (Array.isArray(record.strategic_priorities)) {
                            console.log(`  ✅ strategic_priorities: Array[${record.strategic_priorities.length}] items`);
                        } else {
                            console.log(`  ⚠️  strategic_priorities: ${typeof record.strategic_priorities} (Expected Array)`);
                        }
                    } else {
                        console.log(`  ❌ strategic_priorities: NULL/Empty`);
                    }
                });
            }
        }
        
        console.log('\n✅ Database inspection completed!');
        
    } catch (error) {
        console.error('❌ Database inspection failed:', error.message);
        
        // Additional troubleshooting
        if (error.message.includes('fetch failed')) {
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check if Supabase URL is correct');
            console.log('2. Check if service role key is valid');
            console.log('3. Check network connection');
            console.log('4. Verify table name "hrd_ch1_responses" exists');
        }
    }
}

// Run inspection
inspectSupabase();
