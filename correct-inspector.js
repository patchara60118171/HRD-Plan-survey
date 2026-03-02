// =============================================
// Correct Supabase Connection Inspector
// =============================================

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

async function inspectSupabaseData() {
    console.log('🔍 Supabase Database Inspection - Correct URL');
    console.log('='.repeat(60));
    console.log(`URL: ${SUPABASE_URL}`);
    console.log('');
    
    try {
        // Test 1: Basic connectivity
        console.log('1. 🌐 Testing connectivity...');
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (!testResponse.ok) {
            throw new Error(`Connectivity failed: ${testResponse.status}`);
        }
        console.log('✅ Connectivity: OK');
        
        // Test 2: Get total records
        console.log('\n2. 📊 Total Records');
        console.log('-'.repeat(30));
        const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=count`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
                'Prefer': 'count=exact'
            }
        });
        
        if (countResponse.ok) {
            const count = countResponse.headers.get('content-range')?.split('/')[1] || '0';
            console.log(`Total records: ${count}`);
            
            if (count === '0') {
                console.log('\n❌ No records found - no one has submitted yet!');
                return;
            }
        } else {
            throw new Error(`Count query failed: ${countResponse.status}`);
        }
        
        // Test 3: Get latest submissions
        console.log('\n3. 📅 Latest 5 Submissions');
        console.log('-'.repeat(30));
        const latestResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=id,organization,submitted_at,total_staff,ncd_count,ncd_ratio_pct,form_version&order=submitted_at.desc&limit=5`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (latestResponse.ok) {
            const latestData = await latestResponse.json();
            
            latestData.forEach((record, i) => {
                const date = record.submitted_at ? new Date(record.submitted_at).toLocaleString('th-TH') : 'No date';
                const org = record.organization || 'Unknown Org';
                console.log(`${i+1}. ${org}`);
                console.log(`   📅 ${date}`);
                console.log(`   👥 Staff: ${record.total_staff || 'N/A'}`);
                console.log(`   🏥 NCD: ${record.ncd_count || 0} (${record.ncd_ratio_pct || 0}%)`);
                console.log(`   📋 Version: ${record.form_version || 'Unknown'}`);
                console.log('');
            });
        }
        
        // Test 4: Organization distribution
        console.log('4. 🏢 Organization Distribution');
        console.log('-'.repeat(30));
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
        
        // Test 5: JSONB fields inspection
        console.log('\n5. 🔧 JSONB Fields Inspection');
        console.log('-'.repeat(30));
        const jsonbResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=id,organization,sick_leave_data,engagement_data,strategic_priorities&submitted_at=not.is.null&limit=3`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (jsonbResponse.ok) {
            const jsonbData = await jsonbResponse.json();
            
            jsonbData.forEach(record => {
                console.log(`\n📄 ${record.organization || 'Unknown Org'} (ID: ${record.id})`);
                
                // Check sick_leave_data
                if (record.sick_leave_data) {
                    if (Array.isArray(record.sick_leave_data)) {
                        console.log(`  ✅ sick_leave_data: Array[${record.sick_leave_data.length}]`);
                        if (record.sick_leave_data.length > 0) {
                            const sample = JSON.stringify(record.sick_leave_data[0]);
                            console.log(`     Sample: ${sample.substring(0, 80)}...`);
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
                        console.log(`  ✅ engagement_data: Array[${record.engagement_data.length}]`);
                    } else {
                        console.log(`  ⚠️  engagement_data: ${typeof record.engagement_data} (Expected Array)`);
                    }
                } else {
                    console.log(`  ❌ engagement_data: NULL/Empty`);
                }
                
                // Check strategic_priorities
                if (record.strategic_priorities) {
                    if (Array.isArray(record.strategic_priorities)) {
                        console.log(`  ✅ strategic_priorities: Array[${record.strategic_priorities.length}]`);
                        if (record.strategic_priorities.length > 0) {
                            const sample = JSON.stringify(record.strategic_priorities[0]);
                            console.log(`     Sample: ${sample.substring(0, 80)}...`);
                        }
                    } else {
                        console.log(`  ⚠️  strategic_priorities: ${typeof record.strategic_priorities} (Expected Array)`);
                    }
                } else {
                    console.log(`  ❌ strategic_priorities: NULL/Empty`);
                }
            });
        }
        
        // Test 6: Data quality check
        console.log('\n6. ⚠️  Data Quality Check');
        console.log('-'.repeat(30));
        const qualityResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=id,organization,total_staff,submitted_at&or=organization.is.null,total_staff.is.null,submitted_at.is.null`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (qualityResponse.ok) {
            const qualityData = await qualityResponse.json();
            
            if (qualityData.length > 0) {
                console.log(`Found ${qualityData.length} records with issues:`);
                qualityData.forEach(record => {
                    const missing = [];
                    if (!record.organization) missing.push('organization');
                    if (!record.total_staff) missing.push('total_staff');
                    if (!record.submitted_at) missing.push('submitted_at');
                    console.log(`  ❌ Record ${record.id}: Missing ${missing.join(', ')}`);
                });
            } else {
                console.log('✅ No data quality issues found');
            }
        }
        
        // Test 7: Summary statistics
        console.log('\n7. 📈 Summary Statistics');
        console.log('-'.repeat(30));
        const statsResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=total_staff,ncd_count,turnover_rate&submitted_at=not.is.null`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            
            if (statsData.length > 0) {
                const staffCounts = statsData.map(r => r.total_staff).filter(n => n && n > 0);
                const ncdCounts = statsData.map(r => r.ncd_count).filter(n => n && n >= 0);
                const turnoverRates = statsData.map(r => r.turnover_rate).filter(n => n && n >= 0);
                
                if (staffCounts.length > 0) {
                    const avgStaff = Math.round(staffCounts.reduce((a, b) => a + b, 0) / staffCounts.length);
                    const minStaff = Math.min(...staffCounts);
                    const maxStaff = Math.max(...staffCounts);
                    console.log(`👥 Staff: Avg ${avgStaff}, Min ${minStaff}, Max ${maxStaff}`);
                }
                
                if (ncdCounts.length > 0) {
                    const avgNcd = (ncdCounts.reduce((a, b) => a + b, 0) / ncdCounts.length).toFixed(1);
                    const totalNcd = ncdCounts.reduce((a, b) => a + b, 0);
                    console.log(`🏥 NCD: Avg ${avgNcd}, Total ${totalNcd}`);
                }
                
                if (turnoverRates.length > 0) {
                    const avgTurnover = (turnoverRates.reduce((a, b) => a + b, 0) / turnoverRates.length).toFixed(1);
                    console.log(`🔄 Turnover: Avg ${avgTurnover}%`);
                }
            }
        }
        
        console.log('\n✅ Database inspection completed successfully!');
        
    } catch (error) {
        console.error('❌ Inspection failed:', error.message);
    }
}

// Run inspection
inspectSupabaseData();
