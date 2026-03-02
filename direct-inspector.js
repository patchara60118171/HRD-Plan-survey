// =============================================
// Direct Supabase Connection Inspector
// =============================================

const SUPABASE_URL = 'https://fgdommhiqzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

// Simple fetch-based Supabase client
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        };
    }
    
    from(table) {
        return new SupabaseQueryBuilder(this.url, table, this.headers);
    }
}

class SupabaseQueryBuilder {
    constructor(baseUrl, table, headers) {
        this.baseUrl = baseUrl;
        this.table = table;
        this.headers = headers;
        this.queryParams = new URLSearchParams();
        this.selectFields = '*';
    }
    
    select(fields = '*') {
        this.selectFields = fields;
        this.queryParams.set('select', fields);
        return this;
    }
    
    order(column, options = {}) {
        const direction = options.ascending ? 'asc' : 'desc';
        this.queryParams.set('order', `${column}.${direction}`);
        return this;
    }
    
    limit(count) {
        this.queryParams.set('limit', count.toString());
        return this;
    }
    
    eq(column, value) {
        this.queryParams.set(`${column}`, `eq.${value}`);
        return this;
    }
    
    neq(column, value) {
        this.queryParams.set(`${column}`, `neq.${value}`);
        return this;
    }
    
    is(column, value) {
        this.queryParams.set(`${column}`, `is.${value}`);
        return this;
    }
    
    not(column, operator, value) {
        this.queryParams.set(`${column}`, `${operator}.${value}`);
        return this;
    }
    
    or(conditions) {
        this.queryParams.set('or', conditions);
        return this;
    }
    
    async execute() {
        const url = `${this.baseUrl}/rest/v1/${this.table}?${this.queryParams}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error.message };
        }
    }
    
    async count() {
        const url = `${this.baseUrl}/rest/v1/${this.table}?${this.queryParams}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...this.headers,
                    'Prefer': 'count=exact'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const count = response.headers.get('content-range')?.split('/')[1] || '0';
            return { count: parseInt(count), error: null };
        } catch (error) {
            return { count: 0, error: error.message };
        }
    }
}

async function inspectSupabaseDirectly() {
    console.log('🔍 Direct Supabase Database Inspection\n');
    console.log('='.repeat(50));
    
    const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    
    try {
        // 1. Get total count
        console.log('📊 TOTAL RESPONSES');
        console.log('-'.repeat(30));
        const { count, error: countError } = await supabase.from('hrd_ch1_responses').count();
        
        if (countError) {
            throw new Error(`Count failed: ${countError}`);
        }
        
        console.log(`Total records: ${count}`);
        
        if (count === 0) {
            console.log('\n❌ No records found in hrd_ch1_responses table');
            console.log('💡 This means no one has submitted the form yet');
            return;
        }
        
        // 2. Get latest submissions
        console.log('\n📅 LATEST 5 SUBMISSIONS');
        console.log('-'.repeat(30));
        const { data: latestData, error: latestError } = await supabase
            .from('hrd_ch1_responses')
            .select('id,organization,submitted_at,total_staff,ncd_count,ncd_ratio_pct,form_version')
            .order('submitted_at', { ascending: false })
            .limit(5);
        
        if (latestError) {
            throw new Error(`Latest data failed: ${latestError}`);
        }
        
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
        
        // 3. Check form versions
        console.log('📋 FORM VERSION DISTRIBUTION');
        console.log('-'.repeat(30));
        const { data: versionData, error: versionError } = await supabase
            .from('hrd_ch1_responses')
            .select('form_version')
            .not('form_version', 'is', null);
        
        if (!versionError && versionData) {
            const versionCounts = {};
            versionData.forEach(record => {
                const version = record.form_version || 'unknown';
                versionCounts[version] = (versionCounts[version] || 0) + 1;
            });
            
            Object.entries(versionCounts).forEach(([version, count]) => {
                console.log(`${version}: ${count} responses`);
            });
        }
        
        // 4. Organization distribution
        console.log('\n🏢 ORGANIZATION DISTRIBUTION');
        console.log('-'.repeat(30));
        const { data: orgData, error: orgError } = await supabase
            .from('hrd_ch1_responses')
            .select('organization')
            .not('organization', 'is', null);
        
        if (!orgError && orgData) {
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
        
        // 5. Sample JSONB data inspection
        console.log('\n🔧 JSONB FIELDS INSPECTION');
        console.log('-'.repeat(30));
        const { data: sampleData, error: sampleError } = await supabase
            .from('hrd_ch1_responses')
            .select('id,organization,sick_leave_data,engagement_data,strategic_priorities')
            .not('submitted_at', 'is', null)
            .limit(3);
        
        if (!sampleError && sampleData) {
            sampleData.forEach(record => {
                console.log(`\n📄 ${record.organization || 'Unknown Org'} (ID: ${record.id})`);
                
                // Check sick_leave_data
                if (record.sick_leave_data) {
                    if (Array.isArray(record.sick_leave_data)) {
                        console.log(`  ✅ sick_leave_data: Array[${record.sick_leave_data.length}] items`);
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
        
        // 6. Data quality checks
        console.log('\n⚠️  DATA QUALITY CHECKS');
        console.log('-'.repeat(30));
        
        // Check for missing required fields
        const { data: qualityData, error: qualityError } = await supabase
            .from('hrd_ch1_responses')
            .select('id,organization,total_staff,submitted_at')
            .or('organization.is.null,total_staff.is.null,submitted_at.is.null');
        
        if (!qualityError && qualityData) {
            if (qualityData.length > 0) {
                console.log(`Found ${qualityData.length} records with missing required fields:`);
                qualityData.forEach(record => {
                    const missing = [];
                    if (!record.organization) missing.push('organization');
                    if (!record.total_staff) missing.push('total_staff');
                    if (!record.submitted_at) missing.push('submitted_at');
                    console.log(`  ❌ Record ${record.id}: Missing ${missing.join(', ')}`);
                });
            } else {
                console.log('✅ No records with missing required fields');
            }
        }
        
        // 7. Summary statistics
        console.log('\n📈 SUMMARY STATISTICS');
        console.log('-'.repeat(30));
        
        const { data: statsData, error: statsError } = await supabase
            .from('hrd_ch1_responses')
            .select('total_staff,ncd_count,turnover_rate')
            .not('submitted_at', 'is', null);
        
        if (!statsError && statsData && statsData.length > 0) {
            const staffCounts = statsData.map(r => r.total_staff).filter(n => n && n > 0);
            const ncdCounts = statsData.map(r => r.ncd_count).filter(n => n && n >= 0);
            const turnoverRates = statsData.map(r => r.turnover_rate).filter(n => n && n >= 0);
            
            if (staffCounts.length > 0) {
                const avgStaff = Math.round(staffCounts.reduce((a, b) => a + b, 0) / staffCounts.length);
                const minStaff = Math.min(...staffCounts);
                const maxStaff = Math.max(...staffCounts);
                console.log(`👥 Staff Count: Avg ${avgStaff}, Min ${minStaff}, Max ${maxStaff}`);
            }
            
            if (ncdCounts.length > 0) {
                const avgNcd = (ncdCounts.reduce((a, b) => a + b, 0) / ncdCounts.length).toFixed(1);
                const totalNcd = ncdCounts.reduce((a, b) => a + b, 0);
                console.log(`🏥 NCD Count: Avg ${avgNcd}, Total ${totalNcd}`);
            }
            
            if (turnoverRates.length > 0) {
                const avgTurnover = (turnoverRates.reduce((a, b) => a + b, 0) / turnoverRates.length).toFixed(1);
                console.log(`🔄 Turnover Rate: Avg ${avgTurnover}%`);
            }
        }
        
        console.log('\n✅ Database inspection completed successfully!');
        
    } catch (error) {
        console.error('❌ Database inspection failed:', error.message);
        
        if (error.message.includes('fetch')) {
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check network connection');
            console.log('2. Verify Supabase URL and credentials');
            console.log('3. Ensure table "hrd_ch1_responses" exists');
        }
    }
}

// Run the inspection
inspectSupabaseDirectly();
