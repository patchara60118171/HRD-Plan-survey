#!/usr/bin/env node

/**
 * Generate Complete Form Data for HRD Chapter 1 (All 7 Steps)
 * Creates 12 organizations with 1-4 respondents each, completing all form steps
 * 
 * Usage: node generate-form-data.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnZG9tbWhpcWh6dnNlZGZ6eXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzY2MzUsImV4cCI6MjA4NDkxMjYzNX0.GFMOeDArhq-9lPt39OizkBOFFgK4TDpVDJrk_HRQ6Xc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Use exact ORGANIZATIONS from ch1-admin.js
const ORGANIZATIONS = [
    'กรมอนามัย', 'กรมควบคุมโรค', 'กรมการแพทย์', 'กรมสุขภาพจิต',
    'กรมวิทยาศาสตร์การแพทย์', 'สำนักงานคณะกรรมการอาหารและยา',
    'กรมสนับสนุนบริการสุขภาพ', 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
    'สถาบันการแพทย์ฉุกเฉินแห่งชาติ', 'สำนักงานหลักประกันสุขภาพแห่งชาติ',
    'สำนักงานประกันสังคม', 'กรมพัฒนาฝีมือแรงงาน',
];

const TITLES = ['นาย', 'นาง', 'นางสาว'];
const FIRST_NAMES = [
    'สมชาย', 'มณฑา', 'วิชิต', 'จิดาภา', 'สินทร์', 'อนวรรต', 'กิ่งแก้ว', 'ประเสริฐ',
    'จิตราภา', 'ชินัตถ์', 'พัฒนา', 'มานพ', 'สุจิรา', 'กมล', 'บุษกร', 'ฐานิต'
];
const LAST_NAMES = [
    'สิริวัณณ์', 'ธีระสุข', 'วิทยานนท์', 'ศรีวรรณ์', 'นาคหวาย', 'อนันต์วิทย์', 'กิจไมตรี', 'ประสิทธ์กุล',
    'ชาตินิมิต', 'พิบูลสม', 'วัฒนเจริญ', 'ศิริจันทร์', 'อุมาภา', 'ดำรงค์', 'มงคล', 'อัมพรา'
];
const GENDERS = ['ชาย', 'หญิง'];
const JOBS = ['ข้าราชการสูง', 'ข้าราชการกลาง', 'ข้าราชการต้น', 'พนักงานราชการ', 'ลูกจ้างประจำ'];
const DISEASES = ['ความดันโลหิตสูง', 'เบาหวาน', 'โรคหัวใจ', 'โรคไต', 'โรคตับ', 'ความอ้วน'];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomEmail(name, org) {
    return `${name.replace(/\s+/g, '.').toLowerCase()}@${org.replace(/\s+/g, '').substring(0, 10)}.local`;
}

function generateRespondentForm(orgName, respondentIndex) {
    const title = randomElement(TITLES);
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    
    // STEP 1: ข้อมูลพื้นฐาน
    const age = randomInt(25, 65);
    const jobDuration = randomInt(1, 35);
    
    // STEP 2: สุขภาวะกาย
    const height = randomInt(150, 180);
    const weight = randomInt(45, 95);
    const waist = randomInt(60, 100);
    const bmi = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
    let bmiCategory;
    if (bmi < 18.5) bmiCategory = 'ต่ำกว่าเกณฑ์';
    else if (bmi < 25) bmiCategory = 'ปกติ';
    else if (bmi < 30) bmiCategory = 'น้ำหนักเกิน';
    else bmiCategory = 'อ้วน';
    
    // STEP 3: สุขภาวะจิต
    const tmhiScore = randomInt(40, 150);
    let tmhiLevel;
    if (tmhiScore < 60) tmhiLevel = 'สูง';
    else if (tmhiScore < 100) tmhiLevel = 'ปานกลาง';
    else tmhiLevel = 'ต่ำ';
    
    // STEP 4: ระบบสนับสนุน
    const supportOptions = ['full', 'partial', 'none'];
    
    // STEP 5: สภาพแวดล้อม
    const ergonomicsOptions = ['ยังไม่มี', 'มีแผนแต่ยังไม่ดำเนินการ', 'อยู่ระหว่างดำเนินการ', 'ดำเนินการแล้ว'];
    
    // STEP 6: ระบบ HRD
    const digitalSystems = ['e_doc', 'e_sign', 'cloud', 'hr_digital', 'health_db'];
    
    // STEP 7: ยุทธศาสตร์
    const hrdOpps = ['strategic_align', 'tna', 'eval', 'wellbeing', 'career', 'leader', 'digital'];
    
    const rawResponses = {
        // STEP 1
        step1: {
            title,
            name: fullName,
            gender: randomElement(GENDERS),
            age,
            org_type: 'หน่วยงานราชการ',
            job: randomElement(JOBS),
            job_duration: jobDuration,
            activity_org: randomElement(['ใช่', 'ไม่ใช่']),
            activity_thaihealth: randomElement(['ใช่', 'ไม่ใช่']),
            diseases: randomInt(0, 3) > 0 ? [randomElement(DISEASES), randomElement(DISEASES)].filter((v, i, a) => a.indexOf(v) === i) : []
        },
        // STEP 2
        step2: {
            height: height.toString(),
            weight: weight.toString(),
            waist: waist.toString(),
            bmi: bmi.toString(),
            bmi_category: bmiCategory
        },
        // STEP 3
        step3: {
            tmhi_score: tmhiScore,
            tmhi_level: tmhiLevel,
            mental_stress: randomInt(0, 5),
            mental_anxiety: randomInt(0, 5),
            mental_sleep: randomInt(0, 5),
            mental_burnout: randomInt(0, 5),
            mental_depression: randomInt(0, 5)
        },
        // STEP 4
        step4: {
            mentoring_system: randomElement(supportOptions),
            job_rotation: randomElement(supportOptions),
            idp_system: randomElement(supportOptions),
            career_path_system: randomElement(supportOptions),
            training_hours: randomElement(['over40', '30_40', '20_29', '10_19', 'under10'])
        },
        // STEP 5
        step5: {
            ergonomics_status: randomElement(ergonomicsOptions),
            sick_leave_days: randomInt(0, 20),
            work_safety_level: randomElement(['ต่ำ', 'ปานกลาง', 'สูง']),
            engagement_level: randomElement(['ต่ำ', 'ปานกลาง', 'สูง'])
        },
        // STEP 6
        step6: {
            digital_systems: digitalSystems.filter(() => Math.random() > 0.4),
            hr_efficiency: randomElement(['ต่ำ', 'ปานกลาง', 'สูง'])
        },
        // STEP 7
        step7: {
            hrd_opportunities: hrdOpps.filter(() => Math.random() > 0.5),
            strategic_priority: randomElement(['A', 'B', 'C', 'D', 'E', 'F'])
        }
    };
    
    return {
        organization: orgName,
        submitted_at: new Date().toISOString()
    };
}

async function uploadFormData() {
    console.log('🚀 Starting HRD Ch1 Form Data Generation (All 7 Steps)...\n');
    
    let totalCount = 0;
    const results = [];

    for (let orgIdx = 0; orgIdx < ORGANIZATIONS.length; orgIdx++) {
        const orgName = ORGANIZATIONS[orgIdx];
        const numRespondents = randomInt(1, 4);
        
        console.log(`📍 ${orgIdx + 1}. ${orgName}`);
        
        for (let i = 0; i < numRespondents; i++) {
            const formData = generateRespondentForm(orgName, i + 1);
            
            const { data, error } = await supabase
                .from('hrd_ch1_responses')
                .insert([formData]);
            
            if (error) {
                console.error(`   ❌ Error:`, error.message);
                results.push({ org: orgName, success: false });
            } else {
                console.log(`   ✅ Respondent ${i + 1}: ${formData.name}`);
                results.push({ org: orgName, success: true });
                totalCount++;
            }
        }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`✨ Complete Form Data Generation Finished!`);
    console.log(`📊 Total respondents (all 7 steps): ${totalCount}`);
    console.log(`🔗 Admin Dashboard: https://nidawellbeing.vercel.app/ch1-admin.html`);
    console.log('='.repeat(70));
    
    return results;
}

// Run
uploadFormData().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
