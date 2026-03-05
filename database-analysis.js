// ========================================
// Database Analysis Script
// ========================================

const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function analyzeDatabase() {
    console.log('🔍 Starting database analysis...\n');

    try {
        // 1. Get total records
        const { count: totalRecords, error: countError } = await supabase
            .from('survey_responses')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error counting total records:', countError);
            return;
        }

        console.log(`📊 Total records in survey_responses: ${totalRecords || 0}\n`);

        // 2. Get submitted vs drafts breakdown
        const { data: submittedData, error: submittedError } = await supabase
            .from('survey_responses')
            .select('id, email, submitted_at, is_draft')
            .eq('is_draft', false);

        const { data: draftData, error: draftError } = await supabase
            .from('survey_responses')
            .select('id, email, submitted_at, is_draft')
            .eq('is_draft', true);

        if (submittedError || draftError) {
            console.error('❌ Error getting submitted/draft data:', submittedError || draftError);
            return;
        }

        console.log(`✅ Submitted responses: ${submittedData?.length || 0}`);
        console.log(`📝 Draft responses: ${draftData?.length || 0}\n`);

        // 3. Get unique emails
        const { data: uniqueEmails, error: emailError } = await supabase
            .from('survey_responses')
            .select('email');

        if (emailError) {
            console.error('❌ Error getting emails:', emailError);
            return;
        }

        const uniqueEmailCount = [...new Set(uniqueEmails?.map(r => r.email))].length;
        console.log(`👥 Unique users: ${uniqueEmailCount}\n`);

        // 4. Organization breakdown (if organization field exists)
        const { data: orgData, error: orgError } = await supabase
            .from('survey_responses')
            .select('organization');

        if (!orgError && orgData) {
            const orgCounts = {};
            orgData.forEach(record => {
                const org = record.organization || 'ไม่ระบุ';
                orgCounts[org] = (orgCounts[org] || 0) + 1;
            });

            console.log('🏢 Organization breakdown:');
            Object.entries(orgCounts).forEach(([org, count]) => {
                console.log(`   ${org}: ${count}`);
            });
            console.log('');
        }

        // 5. Timeline analysis
        if (submittedData && submittedData.length > 0) {
            console.log('📅 Submission timeline:');
            const submissionsByDate = {};
            
            submittedData.forEach(record => {
                if (record.submitted_at) {
                    const date = new Date(record.submitted_at).toLocaleDateString('th-TH');
                    submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
                }
            });

            Object.entries(submissionsByDate)
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .forEach(([date, count]) => {
                    console.log(`   ${date}: ${count} submissions`);
                });
            console.log('');
        }

        // 6. Recent activity (last 10 records)
        const { data: recentData, error: recentError } = await supabase
            .from('survey_responses')
            .select('email, submitted_at, is_draft')
            .order('submitted_at', { ascending: false })
            .limit(10);

        if (!recentError && recentData) {
            console.log('⏰ Recent activity (last 10):');
            recentData.forEach((record, index) => {
                const status = record.is_draft ? '📝 Draft' : '✅ Submitted';
                const date = record.submitted_at ? 
                    new Date(record.submitted_at).toLocaleString('th-TH') : 
                    'No timestamp';
                console.log(`   ${index + 1}. ${record.email} - ${status} - ${date}`);
            });
        }

        // 7. Chapter 1 specific analysis (if this is ch1.html data)
        console.log('\n📋 Chapter 1 Analysis:');
        console.log(`   Expected maximum users: 20`);
        console.log(`   Current actual users: ${uniqueEmailCount}`);
        console.log(`   Capacity utilization: ${((uniqueEmailCount / 20) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('❌ Analysis failed:', error);
    }
}

// Run analysis
analyzeDatabase().then(() => {
    console.log('\n✨ Analysis complete!');
}).catch(console.error);
