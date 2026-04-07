// =============================================
// Test Data Seeder for Well-being Survey v3.0
// Generates 30 random records from 12 organizations
// =============================================

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://fgdommhiqhzvsedfzyrr.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_KEY_HERE'; // Use service role key for inserts

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ORGANIZATIONS = [
    'กรมอนามัย',
    'กรมควบคุมโรค',
    'กรมการแพทย์',
    'กรมสุขภาพจิต',
    'กรมวิทยาศาสตร์การแพทย์',
    'สำนักงานคณะกรรมการอาหารและยา',
    'กรมสนับสนุนบริการสุขภาพ',
    'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
    'สถาบันการแพทย์ฉุกเฉินแห่งชาติ',
    'สำนักงานหลักประกันสุขภาพแห่งชาติ',
    'สำนักงานประกันสังคม',
    'กรมพัฒนาฝีมือแรงงาน'
];

const SUPPORT_OPTIONS = ['full', 'partial', 'none'];
const ERGONOMICS_OPTIONS = ['none', 'planned', 'in_progress', 'done'];
const DIGITAL_OPTIONS = ['e_doc', 'e_sign', 'cloud', 'hr_digital', 'health_db', 'none'];
const STRATEGY_TOPICS = ['A', 'B', 'C', 'D', 'E', 'F'];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    const num = Math.random() * (max - min) + min;
    return parseFloat(num.toFixed(decimals));
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset(arr, min, max) {
    const count = randomInt(min, max);
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateOrgData() {
    const org = randomChoice(ORGANIZATIONS);
    const totalStaff = randomInt(100, 2000);
    
    // Generate age distribution
    const ageSum = randomInt(Math.floor(totalStaff * 0.8), totalStaff);
    const age_u30 = randomInt(0, Math.floor(ageSum * 0.3));
    const age_31_40 = randomInt(0, Math.floor(ageSum * 0.4));
    const age_41_50 = randomInt(0, Math.floor(ageSum * 0.3));
    const age_51_60 = ageSum - age_u30 - age_31_40 - age_41_50;
    
    // Generate service years (8 ranges)
    const serviceDist = [];
    let remaining = totalStaff;
    for (let i = 0; i < 7; i++) {
        const val = randomInt(0, remaining);
        serviceDist.push(val);
        remaining -= val;
    }
    serviceDist.push(remaining);
    
    // Generate position distribution (must sum to totalStaff approximately)
    const posDist = [];
    remaining = totalStaff;
    for (let i = 0; i < 12; i++) {
        const val = randomInt(0, remaining);
        posDist.push(val);
        remaining -= val;
    }
    posDist.push(remaining);
    
    return {
        // Metadata
        respondent_email: `test.${randomInt(1, 999)}@${org.replace(/\s/g, '').toLowerCase()}.go.th`,
        form_version: 'ch1-v3',
        submitted_at: new Date(Date.now() - randomInt(0, 30 * 24 * 60 * 60 * 1000)).toISOString(),
        
        // Step 1: Basic info
        organization: org,
        strategic_overview: `แผนยุทธศาสตร์ ${org} ปี ${2566 + randomInt(0, 3)}-${2570 + randomInt(0, 3)} มุ่งเน้นการพัฒนาศักยภาพบุคลากร`,
        org_structure: `โครงสร้างองค์กร ${org} ประกอบด้วย ${randomInt(5, 15)} กลุ่ม/ฝ่าย`,
        total_staff: totalStaff,
        age_u30, age_31_40, age_41_50, age_51_60,
        service_u1: serviceDist[0],
        service_1_5: serviceDist[1],
        service_6_10: serviceDist[2],
        service_11_15: serviceDist[3],
        service_16_20: serviceDist[4],
        service_21_25: serviceDist[5],
        service_26_30: serviceDist[6],
        service_over30: serviceDist[7],
        pos_o1: posDist[0],
        pos_o2: posDist[1],
        pos_o3: posDist[2],
        pos_o4: posDist[3],
        pos_k1: posDist[4],
        pos_k2: posDist[5],
        pos_k3: posDist[6],
        pos_k4: posDist[7],
        pos_k5: posDist[8],
        pos_m1: posDist[9],
        pos_m2: posDist[10],
        pos_s1: posDist[11],
        pos_s2: posDist[12],
        
        // Step 2: Policies
        related_policies: `นโยบายส่งเสริมสุขภาพพนักงาน ${org} ปี ${2567 + randomInt(0, 2)}`,
        context_challenges: randomChoice([
            'การปรับตัวเข้าสู่ดิจิทัล การขาดแคลนบุคลากร',
            'การเปลี่ยนแปลงกฎหมายใหม่ การบริหารจัดการในยุคดิจิทัล',
            'ความท้าทายด้านการบริหารจัดการ การพัฒนาศักยภาพบุคลากร'
        ]),
        
        // Step 3: Health
        disease_diabetes: randomInt(0, Math.floor(totalStaff * 0.15)),
        disease_hypertension: randomInt(0, Math.floor(totalStaff * 0.2)),
        disease_cardiovascular: randomInt(0, Math.floor(totalStaff * 0.08)),
        disease_kidney: randomInt(0, Math.floor(totalStaff * 0.05)),
        disease_liver: randomInt(0, Math.floor(totalStaff * 0.06)),
        disease_cancer: randomInt(0, Math.floor(totalStaff * 0.03)),
        disease_obesity: randomInt(0, Math.floor(totalStaff * 0.25)),
        disease_other_detail: randomChoice([null, 'โรคไทรอยด์', 'โรคข้อเข่าเสื่อม', null]),
        sick_leave_data: [
            { year: 2568, total_days: randomInt(100, 1000), avg_per_person: randomFloat(1, 5, 1) },
            { year: 2567, total_days: randomInt(100, 1000), avg_per_person: randomFloat(1, 5, 1) },
            { year: 2566, total_days: randomInt(100, 1000), avg_per_person: randomFloat(1, 5, 1) }
        ],
        clinic_users_per_year: randomInt(50, Math.floor(totalStaff * 0.8)),
        clinic_top_symptoms: 'ปวดหัว ปวดกล้ามเนื้อ ความดันโลหิตสูง',
        clinic_top_medications: 'พาราเซตามอล ยาลดความดัน ยาลดน้ำตาล',
        mental_stress_count: randomInt(0, Math.floor(totalStaff * 0.3)),
        mental_anxiety_count: randomInt(0, Math.floor(totalStaff * 0.2)),
        mental_sleep_count: randomInt(0, Math.floor(totalStaff * 0.25)),
        mental_burnout_count: randomInt(0, Math.floor(totalStaff * 0.15)),
        mental_depression_count: randomInt(0, Math.floor(totalStaff * 0.1)),
        mental_other: randomChoice([null, 'โรคกลัวสังคม', null, null]),
        engagement_data: [
            { year: 2568, score: randomFloat(60, 85, 1), low_areas: 'ค่าตอบแทน ความก้าวหน้า' },
            { year: 2567, score: randomFloat(55, 80, 1), low_areas: 'สวัสดิการ การสื่อสาร' }
        ],
        other_wellbeing_surveys: randomChoice([null, 'แบบสอบถามความสุขชีวิต คะแนนเฉลี่ย 7.5/10', null]),
        
        // Step 4: Support systems
        mentoring_system: randomChoice(SUPPORT_OPTIONS),
        job_rotation: randomChoice(SUPPORT_OPTIONS),
        idp_system: randomChoice(SUPPORT_OPTIONS),
        career_path_system: randomChoice(SUPPORT_OPTIONS),
        training_hours: randomFloat(20, 60, 1),
        digital_systems: randomSubset(DIGITAL_OPTIONS, 1, 4),
        digital_other: randomChoice([null, null, 'ระบบจัดการเอกสารภายใน']),
        ergonomics_status: randomChoice(ERGONOMICS_OPTIONS),
        ergonomics_detail: randomChoice([null, 'ปรับเก้าอี้ตามหลักการยศาสตร์ 50% ของพื้นที่ทำงาน', null]),
        wellbeing_analysis: 'วิเคราะห์พบประเด็นสำคัญ: 1) ภาวะเครียดสูง 2) การลาป่วยบ่อย 3) ต้องพัฒนาสภาพแวดล้อมการทำงาน',
        
        // Step 5: Direction
        strategic_priorities: randomSubset(STRATEGY_TOPICS, 1, 3).map((id, i) => ({
            rank: i + 1,
            topic: id,
            label: { A: 'การเพิ่มประสิทธิภาพการให้บริการประชาชน', B: 'การพัฒนาศักยภาพด้านดิจิทัล', C: 'การพัฒนาผู้นำรุ่นใหม่', D: 'การลดอัตราการลาป่วย', E: 'การลดอัตราการลาออก', F: 'อื่นๆ' }[id]
        })),
        strategic_priorities_other: randomChoice([null, null, 'การพัฒนาความคิดสร้างสรรค์']),
        intervention_suggestions: randomChoice([null, 'ควรมีกิจกรรมส่งเสริมสุขภาพจิตที่หลากหลายขึ้น', null]),
        hrd_plan_url: `https://drive.google.com/drive/folders/${randomInt(100000, 999999)}`,
        hrd_plan_results: `ผลการดำเนินงานปี ${2567 + randomInt(0, 2)}: ดำเนินการตามแผน ${randomInt(70, 95)}%`
    };
}

function calculateNcdCount(data) {
    const otherCount = randomInt(0, 10);
    return data.disease_diabetes + data.disease_hypertension + 
           data.disease_cardiovascular + data.disease_kidney + 
           data.disease_liver + data.disease_cancer + 
           data.disease_obesity + otherCount;
}

async function seedData() {
    console.log('🌱 Starting data seeding...');
    
    const records = [];
    for (let i = 0; i < 30; i++) {
        const data = generateOrgData();
        data.ncd_count = calculateNcdCount(data);
        data.ncd_ratio_pct = data.total_staff ? parseFloat(((data.ncd_count / data.total_staff) * 100).toFixed(2)) : null;
        records.push({ ...data, raw_payload: data });
    }
    
    console.log(`📦 Generated ${records.length} records`);
    
    // Insert in batches of 10
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        console.log(`📝 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}...`);
        
        const { data, error } = await supabase
            .from('hrd_ch1_responses')
            .insert(batch)
            .select('id, organization, submitted_at');
        
        if (error) {
            console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
        } else {
            console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} inserted: ${data.length} records`);
        }
    }
    
    console.log('🎉 Data seeding complete!');
}

// Run the seeder
seedData().catch(err => {
    console.error('💥 Seeding failed:', err);
    process.exit(1);
});
