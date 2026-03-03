#!/usr/bin/env node

/**
 * Generate Test Data for HRD Chapter 1 Survey (Admin Dashboard)
 * Creates 12 organizations with 1-4 random respondents each
 * 
 * Usage: node generate-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const ORGANIZATIONS = [
    'สำนักงานสวัสดิการและคุ้มครองแรงงาน',
    'สำนักงานอนามัยจังหวัด',
    'โรงเรียนมัธยมศึกษา',
    'โรงพยาบาลทั่วไป',
    'สำนักงานสถิติจังหวัด',
    'สำนักงานที่ดินจังหวัด',
    'องค์การบริหารส่วนท้องถิ่น',
    'เทศบาลตำบล',
    'สำนักงานเขตการศึกษา',
    'สำนักงานประมงจังหวัด',
    'สำนักงานสรรพาคารจังหวัด',
    'สำนักงานป้องกันและปราบปรามยาเสพติด'
];

const TRAINING_RANGES = ['over40', '30_40', '20_29', '10_19', 'under10'];
const HRD_OPP = ['strategic_align', 'tna', 'eval', 'wellbeing', 'career', 'leader', 'digital'];
const SUPPORT_LEVELS = ['full', 'partial', 'none'];

// Utility functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrgRecord(orgIndex, orgName) {
    const totalStaff = randomInt(50, 300);
    const ncdCount = randomInt(5, 50);
    const ncdRatio = ((ncdCount / totalStaff) * 100).toFixed(1);
    
    return {
        organization: orgName,
        total_staff: totalStaff,
        ncd_count: ncdCount,
        ncd_ratio_pct: parseFloat(ncdRatio),
        health_issues: ['ความดันโลหิตสูง', 'เบาหวาน', 'โรคหัวใจ'].filter(() => Math.random() > 0.3),
        severity_score: randomInt(1, 5),
        
        // ส่วนที่ 1
        service_u5: randomInt(5, 20),
        service_6_10: randomInt(10, 30),
        service_over10: randomInt(5, 25),
        age_over60: randomInt(1, 15),
        
        // ส่วนที่ 2.1 - โรค
        disease_diabetes: randomInt(0, 10),
        disease_hypertension: randomInt(0, 15),
        disease_cardiovascular: randomInt(0, 5),
        disease_kidney: randomInt(0, 3),
        disease_obesity: randomInt(0, 8),
        
        // ส่วนที่ 2.2 - ลาป่วย
        sick_leave_data: {
            u3: randomInt(5, 20),
            to5: randomInt(3, 15),
            to10: randomInt(5, 25)
        },
        
        // ส่วนที่ 3.1 - จิตใจ
        mental_stress_count: randomInt(5, 30),
        mental_anxiety_count: randomInt(3, 20),
        mental_sleep_count: randomInt(5, 25),
        mental_burnout_count: randomInt(2, 15),
        
        // ส่วนที่ 3.2 - Engagement
        engagement_data: {
            high: randomInt(10, 50),
            medium: randomInt(20, 60),
            low: randomInt(5, 30)
        },
        
        // ส่วนที่ 3.3 - Turnover
        turnover_rate: parseFloat((Math.random() * 15).toFixed(2)),
        transfer_rate: parseFloat((Math.random() * 10).toFixed(2)),
        
        // ส่วนที่ 4 - HRD
        mentoring_system: randomElement(SUPPORT_LEVELS),
        job_rotation: randomElement(SUPPORT_LEVELS),
        idp_system: randomElement(SUPPORT_LEVELS),
        training_hours_range: randomElement(TRAINING_RANGES),
        career_path_system: randomElement(SUPPORT_LEVELS),
        
        // ส่วนที่ 5 - สภาพแวดล้อม
        ergonomics_status: randomElement(['ยังไม่มี', 'มีแผนแต่ยังไม่ดำเนินการ', 'อยู่ระหว่างดำเนินการ', 'ดำเนินการแล้ว']),
        digital_systems: [
            randomInt(0, 1) ? 'e_doc' : null,
            randomInt(0, 1) ? 'cloud' : null,
            randomInt(0, 1) ? 'hr_digital' : null
        ].filter(Boolean),
        
        // ส่วนที่ 6 - HRD Plan
        hrd_opportunities: [
            randomInt(0, 1) ? randomElement(HRD_OPP) : null,
            randomInt(0, 1) ? randomElement(HRD_OPP) : null,
            randomInt(0, 1) ? randomElement(HRD_OPP) : null
        ].filter(Boolean),
        
        // Metadata
        form_version: 'ch1-v2',
        submitted_at: new Date().toISOString()
    };
}


async function uploadTestData() {
    console.log('🚀 Starting test data generation for HRD Ch1 Admin Dashboard...\n');
    
    let totalCount = 0;
    const uploadResults = [];

    for (let orgIdx = 0; orgIdx < ORGANIZATIONS.length; orgIdx++) {
        const orgName = ORGANIZATIONS[orgIdx];
        const numRecords = randomInt(1, 4); // 1-4 records per org
        
        console.log(`📍 ${orgIdx + 1}. ${orgName}`);
        
        for (let i = 0; i < numRecords; i++) {
            const record = generateOrgRecord(orgIdx, orgName);
            
            const { data, error } = await supabase
                .from('hrd_ch1_responses')
                .insert([record]);
            
            if (error) {
                console.error(`   ❌ Error:`, error.message);
                uploadResults.push({ org: orgName, success: false, error: error.message });
            } else {
                console.log(`   ✅ Record ${i + 1} uploaded`);
                uploadResults.push({ org: orgName, success: true });
                totalCount++;
            }
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✨ Test data generation complete!`);
    console.log(`📊 Total records uploaded: ${totalCount}`);
    console.log(`🔗 Dashboard: https://nidawellbeing.vercel.app/ch1-admin.html`);
    console.log('='.repeat(60));
    
    return uploadResults;
}

// Run
uploadTestData().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
