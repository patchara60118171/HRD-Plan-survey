// =============================================
// Supabase Database Inspector for Well-being Survey
// =============================================

const SUPABASE_URL = 'https://fgdommhiqzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTMzNjYzNSwiZXhwIjoyMDg0OTEyNjM1fQ.rE8tKTwiKaUDUxgvMGpZVbw03JUS0TaU5B_DAS0rQHo';

// Create Supabase client with service role
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function inspectDatabase() {
    console.log('🔍 Starting Supabase Database Inspection...\n');
    
    try {
        // 1. Check total responses
        console.log('📊 === TOTAL RESPONSES ===');
        const { count, error: countError } = await supabase
            .from('hrd_ch1_responses')
            .select('*', { count: 'exact', head: true });
            
        if (countError) throw countError;
        console.log(`Total responses: ${count}`);
        
        // 2. Get latest responses
        console.log('\n📅 === LATEST SUBMISSIONS ===');
        const { data: latestData, error: latestError } = await supabase
            .from('hrd_ch1_responses')
            .select('id, organization, submitted_at, total_staff, ncd_count, form_version')
            .order('submitted_at', { ascending: false })
            .limit(5);
            
        if (latestError) throw latestError;
        
        latestData.forEach((record, i) => {
            console.log(`${i+1}. ${record.organization} - ${record.submitted_at ? new Date(record.submitted_at).toLocaleString('th-TH') : 'No date'} (Staff: ${record.total_staff}, NCD: ${record.ncd_count})`);
        });
        
        // 3. Check form versions
        console.log('\n📋 === FORM VERSIONS ===');
        const { data: versionData, error: versionError } = await supabase
            .from('hrd_ch1_responses')
            .select('form_version')
            .not('form_version', 'is', null);
            
        if (versionError) throw versionError;
        
        const versionCounts = {};
        versionData.forEach(record => {
            versionCounts[record.form_version] = (versionCounts[record.form_version] || 0) + 1;
        });
        
        Object.entries(versionCounts).forEach(([version, count]) => {
            console.log(`${version}: ${count} responses`);
        });
        
        // 4. Check JSONB field integrity
        console.log('\n🔧 === JSONB FIELD INTEGRITY ===');
        const { data: jsonbData, error: jsonbError } = await supabase
            .from('hrd_ch1_responses')
            .select('id, organization, sick_leave_data, engagement_data, strategic_priorities')
            .not('submitted_at', 'is', null)
            .limit(10);
            
        if (jsonbError) throw jsonbError;
        
        jsonbData.forEach(record => {
            const sickLeaveType = record.sick_leave_data ? (Array.isArray(record.sick_leave_data) ? 'Array[' + record.sick_leave_data.length + ']' : typeof record.sick_leave_data) : 'NULL';
            const engagementType = record.engagement_data ? (Array.isArray(record.engagement_data) ? 'Array[' + record.engagement_data.length + ']' : typeof record.engagement_data) : 'NULL';
            const prioritiesType = record.strategic_priorities ? (Array.isArray(record.strategic_priorities) ? 'Array[' + record.strategic_priorities.length + ']' : typeof record.strategic_priorities) : 'NULL';
            
            console.log(`${record.organization}:`);
            console.log(`  sick_leave_data: ${sickLeaveType}`);
            console.log(`  engagement_data: ${engagementType}`);
            console.log(`  strategic_priorities: ${prioritiesType}`);
        });
        
        // 5. Check data quality issues
        console.log('\n⚠️  === DATA QUALITY CHECKS ===');
        
        // Check for missing required fields
        const { data: qualityData, error: qualityError } = await supabase
            .from('hrd_ch1_responses')
            .select('id, organization, total_staff, submitted_at')
            .or('organization.is.null,total_staff.is.null,submitted_at.is.null');
            
        if (qualityError) throw qualityError;
        
        if (qualityData.length > 0) {
            console.log(`Found ${qualityData.length} records with missing required fields:`);
            qualityData.forEach(record => {
                const missing = [];
                if (!record.organization) missing.push('organization');
                if (!record.total_staff) missing.push('total_staff');
                if (!record.submitted_at) missing.push('submitted_at');
                console.log(`  Record ${record.id}: Missing ${missing.join(', ')}`);
            });
        } else {
            console.log('✅ No records with missing required fields');
        }
        
        // 6. Organization distribution
        console.log('\n🏢 === ORGANIZATION DISTRIBUTION ===');
        const { data: orgData, error: orgError } = await supabase
            .from('hrd_ch1_responses')
            .select('organization')
            .not('organization', 'is', null);
            
        if (orgError) throw orgError;
        
        const orgCounts = {};
        orgData.forEach(record => {
            orgCounts[record.organization] = (orgCounts[record.organization] || 0) + 1;
        });
        
        Object.entries(orgCounts)
            .sort(([,a], [,b]) => b - a)
            .forEach(([org, count]) => {
                console.log(`${org}: ${count} responses`);
            });
        
        console.log('\n✅ Database inspection completed successfully!');
        
    } catch (error) {
        console.error('❌ Database inspection failed:', error.message);
    }
}

// Run the inspection
inspectDatabase();
