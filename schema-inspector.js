// =============================================
// Supabase Schema Inspector
// =============================================

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

async function inspectSupabaseSchema() {
    console.log('🔍 Supabase Schema Inspector');
    console.log('='.repeat(50));
    console.log(`URL: ${SUPABASE_URL}`);
    console.log('');
    
    try {
        // 1. Get table schema
        console.log('1. 📋 Table Schema - hrd_ch1_responses');
        console.log('-'.repeat(40));
        
        const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
                    SELECT 
                        column_name,
                        data_type,
                        is_nullable,
                        column_default,
                        character_maximum_length
                    FROM information_schema.columns 
                    WHERE table_name = 'hrd_ch1_responses' 
                    AND table_schema = 'public'
                    ORDER BY ordinal_position;
                `
            })
        });
        
        // Alternative approach: Use PostgreSQL system tables
        const pgSchemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_table_schema`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                table_name: 'hrd_ch1_responses'
            })
        });
        
        // If RPC doesn't work, try a simpler approach
        const sampleResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
            }
        });
        
        if (sampleResponse.ok) {
            const sampleData = await sampleResponse.json();
            
            if (sampleData.length > 0) {
                const sampleRecord = sampleData[0];
                const columns = Object.keys(sampleRecord);
                
                console.log(`Found ${columns.length} columns:`);
                console.log('');
                
                columns.forEach((column, index) => {
                    const value = sampleRecord[column];
                    const type = value === null ? 'NULL' : typeof value;
                    const isArray = Array.isArray(value);
                    const actualType = isArray ? `ARRAY[${value.length}]` : type;
                    
                    console.log(`${(index + 1).toString().padStart(2)}. ${column.padEnd(30)} | ${actualType.padEnd(15)} | ${value !== null ? (isArray ? `[${value.length} items]` : JSON.stringify(value).substring(0, 50)) : 'NULL'}`);
                });
                
                console.log('');
                console.log('📊 Column Analysis:');
                console.log('-'.repeat(40));
                
                // Analyze column types
                const textColumns = columns.filter(col => typeof sampleRecord[col] === 'string' && !Array.isArray(sampleRecord[col]));
                const numberColumns = columns.filter(col => typeof sampleRecord[col] === 'number');
                const arrayColumns = columns.filter(col => Array.isArray(sampleRecord[col]));
                const nullColumns = columns.filter(col => sampleRecord[col] === null);
                
                console.log(`📝 Text columns: ${textColumns.length}`);
                textColumns.forEach(col => console.log(`   - ${col}`));
                
                console.log(`🔢 Number columns: ${numberColumns.length}`);
                numberColumns.forEach(col => console.log(`   - ${col}`));
                
                console.log(`📚 Array/JSONB columns: ${arrayColumns.length}`);
                arrayColumns.forEach(col => {
                    const length = sampleRecord[col] ? sampleRecord[col].length : 0;
                    console.log(`   - ${col} (${length} items)`);
                });
                
                console.log(`❌ NULL columns: ${nullColumns.length}`);
                nullColumns.forEach(col => console.log(`   - ${col}`));
                
            } else {
                console.log('❌ No records found to analyze schema');
            }
        } else {
            throw new Error(`Failed to fetch sample data: ${sampleResponse.status}`);
        }
        
        // 2. Check constraints and indexes
        console.log('\n2. 🔍 Table Information');
        console.log('-'.repeat(40));
        
        const tableInfoResponse = await fetch(`${SUPABASE_URL}/rest/v1/hrd_ch1_responses?select=count`, {
            headers: {
                'apikey': SUPABASE_SERVICE_ROLE,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
                'Prefer': 'count=exact'
            }
        });
        
        if (tableInfoResponse.ok) {
            const count = tableInfoResponse.headers.get('content-range')?.split('/')[1] || '0';
            console.log(`📊 Total records: ${count}`);
        }
        
        // 3. Suggest missing columns based on common form fields
        console.log('\n3. 💡 Common Form Fields Analysis');
        console.log('-'.repeat(40));
        
        const commonFormFields = [
            'id', 'organization', 'total_staff', 'vision_mission', 'strategic_plan_summary',
            'org_chart_url', 'age_u30', 'age_31_40', 'age_41_50', 'age_51_60', 'age_over60',
            'service_u5', 'service_6_10', 'service_over10', 'retirement_risk_positions',
            'disease_diabetes', 'disease_hypertension', 'disease_cardiovascular', 'disease_kidney',
            'disease_liver', 'disease_cancer', 'disease_obesity', 'disease_other_count',
            'disease_other_detail', 'ncd_count', 'ncd_ratio_pct', 'sick_leave_data',
            'clinic_users_per_year', 'clinic_top_symptoms', 'clinic_top_medications',
            'mental_stress_count', 'mental_anxiety_count', 'mental_sleep_count',
            'mental_burnout_count', 'mental_depression_count', 'mental_other',
            'engagement_data', 'engagement_trend', 'turnover_rate', 'transfer_rate',
            'mentoring_system', 'job_rotation', 'idp_system', 'career_path_system',
            'training_hours_range', 'ergonomics_status', 'ergonomics_detail',
            'digital_systems', 'digital_other', 'hrd_plan_url', 'hrd_budget_url',
            'core_competency_url', 'functional_competency_url', 'hrd_opportunities',
            'hrd_opportunities_other', 'hr_strategy_map_url', 'strategic_priorities',
            'strategic_priorities_other', 'submitted_at', 'form_version'
        ];
        
        if (sampleData && sampleData.length > 0) {
            const existingColumns = Object.keys(sampleData[0]);
            const missingFields = commonFormFields.filter(field => !existingColumns.includes(field));
            
            if (missingFields.length > 0) {
                console.log(`⚠️  Missing common fields (${missingFields.length}):`);
                missingFields.forEach(field => console.log(`   - ${field}`));
            } else {
                console.log('✅ All common form fields are present');
            }
        }
        
        console.log('\n✅ Schema inspection completed!');
        
    } catch (error) {
        console.error('❌ Schema inspection failed:', error.message);
    }
}

// Run schema inspection
inspectSupabaseSchema();
