
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function generateMinimalPDF(content) {
    return `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 100 >>\nstream\nBT /F1 12 Tf 50 800 Td (${content}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000315 00000 n \ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n417\n%%EOF`;
}

async function uploadFile(content, fileName) {
    const bucket = 'hrd-documents';
    const filePath = `test/${Date.now()}-${fileName}`;
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, Buffer.from(content), { contentType: 'application/pdf' });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { path: filePath, url: urlData.publicUrl, name: fileName };
}

async function submitMock(orgName, email, focusText, orgId) {
    console.log(`\n📝 Submitting for: ${orgName}...`);
    const strategyFile = await uploadFile(generateMinimalPDF(`Strategy for ${orgName}`), `strategy-${orgId}.pdf`);
    const orgFile = await uploadFile(generateMinimalPDF(`Org structure for ${orgName}`), `org-${orgId}.pdf`);
    const hrdFile = await uploadFile(generateMinimalPDF(`HRD Plan for ${orgName}`), `hrd-${orgId}.pdf`);

    const payload = {
        respondent_email: email,
        form_version: 'ch1-v4.0-mock',
        submitted_at: new Date().toISOString(),
        is_test: true,
        submission_mode: 'test',
        test_run_id: `mock-batch-${Date.now()}`,
        organization: orgName,
        strategic_overview: `วิสัยทัศน์: เป็นองค์กรชั้นนำในการ${focusText} เพื่อสุขภาวะที่ดีของประชาชน`,
        org_structure: 'แบ่งเป็น 12 กองหลัก และ 5 กลุ่มงานสนับสนุน ตามโครงสร้างใหม่ปี 2568',
        total_staff: 450,
        age_u30: 80, age_31_40: 150, age_41_50: 120, age_51_60: 100,
        service_u1: 20, service_1_5: 80, service_6_10: 100, service_11_15: 80, service_over30: 50,
        type_official: 300, type_employee: 100, type_contract: 50,
        begin_2568: 440, end_2568: 450, leave_2568: 10, rate_2568: 2.2,
        related_policies: 'นโยบายเสริมสร้างความสุขในที่ทำงาน (Happy Workplace) และสวัสดิการยืดหยุ่น',
        context_challenges: 'การเข้าสู่สังคมสูงวัยของบุคลากรในองค์กร และการปรับตัวสู่ระบบราชการ 4.0',
        disease_diabetes: 10, disease_hypertension: 25, disease_obesity: 40,
        ncd_count: 75, ncd_ratio_pct: 16.67,
        sick_leave_days: 250, sick_leave_avg: 5.5,
        mental_stress: 'ระดับปานกลาง มีระบบให้คำปรึกษาทางจิตวิทยาออนไลน์',
        engagement_score_2568: 82.5,
        mentoring_system: 'full', job_rotation: 'partial', idp_system: 'full',
        strategic_priority_rank1: 'service_efficiency',
        strategic_priority_rank2: 'digital_capability',
        strategy_file_path: strategyFile.path, strategy_file_url: strategyFile.url, strategy_file_name: strategyFile.name,
        org_structure_file_path: orgFile.path, org_structure_file_url: orgFile.url, org_structure_file_name: orgFile.name,
        hrd_plan_file_path: hrdFile.path, hrd_plan_file_url: hrdFile.url, hrd_plan_file_name: hrdFile.name
    };

    const { data, error } = await supabase.from('hrd_ch1_responses').insert([payload]).select();
    if (error) throw error;
    console.log(`✅ Success! ID: ${data[0].id}`);
}

async function run() {
    try {
        await submitMock('กรมอนามัย', `health-mock-${Date.now()}@test.go.th`, 'ส่งเสริมสุขภาพและอนามัยสิ่งแวดล้อม', 'health');
        await submitMock('กรมควบคุมโรค', `ddc-mock-${Date.now()}@test.go.th`, 'เฝ้าระวัง ป้องกัน และควบคุมโรค', 'ddc');
        console.log('\n✨ All 2 mock submissions completed!');
    } catch (err) {
        console.error('💥 Error:', err.message);
    }
}

run();
