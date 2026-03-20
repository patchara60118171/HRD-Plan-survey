-- =============================================
-- Seed 15 Organizations — Single Source of Truth
-- ใช้เป็น master list สำหรับทุกหน้าที่มี dropdown องค์กร
-- =============================================

-- ลบข้อมูลเก่าที่อาจซ้ำ (ยกเว้น test-org)
DELETE FROM organizations 
WHERE org_code NOT IN ('test-org');

-- Insert 15 องค์กรหลัก
INSERT INTO organizations (
    org_code,
    org_name_th,
    org_name_en,
    is_test,
    created_at
) VALUES
    ('dcy', 'กรมกิจการเด็กและเยาวชน', 'Department of Children and Youth', false, NOW()),
    ('probation', 'กรมคุมประพฤติ', 'Department of Probation', false, NOW()),
    ('rid', 'กรมชลประทาน', 'Royal Irrigation Department', false, NOW()),
    ('dss', 'กรมวิทยาศาสตร์บริการ', 'Department of Science Service', false, NOW()),
    ('dcp', 'กรมส่งเสริมวัฒนธรรม', 'Department of Cultural Promotion', false, NOW()),
    ('dmh', 'กรมสุขภาพจิต', 'Department of Mental Health', false, NOW()),
    ('tmd', 'กรมอุตุนิยมวิทยา', 'Thai Meteorological Department', false, NOW()),
    ('hssd', 'กรมสนับสนุนบริการสุขภาพ', 'Department of Health Service Support', false, NOW()),
    ('ocsc', 'สำนักงาน กพร.', 'Office of the Civil Service Commission', false, NOW()),
    ('nrct', 'สำนักงานการวิจัยแห่งชาติ', 'National Research Council of Thailand', false, NOW()),
    ('onep', 'สำนักงานนโยบายและแผนทรัพยากรธรรมชาติและสิ่งแวดล้อม', 'Office of Natural Resources and Environmental Policy and Planning', false, NOW()),
    ('tpso', 'สำนักงานนโยบายและยุทธศาสตร์การค้า', 'Trade Policy and Strategy Office', false, NOW()),
    ('mots', 'สำนักงานปลัดกระทรวงการท่องเที่ยวและกีฬา', 'Office of the Permanent Secretary Ministry of Tourism and Sports', false, NOW()),
    ('acfs', 'สำนักงานมาตรฐานสินค้าเกษตรและอาหารแห่งชาติ', 'National Bureau of Agricultural Commodity and Food Standards', false, NOW()),
    ('nesdc', 'สำนักงานสภาพัฒนาการเศรษฐกิจและสังคมแห่งชาติ', 'National Economic and Social Development Council', false, NOW())
ON CONFLICT (org_code) DO UPDATE SET
    org_name_th = EXCLUDED.org_name_th,
    org_name_en = EXCLUDED.org_name_en,
    is_test = EXCLUDED.is_test;

-- ตรวจสอบผลลัพธ์
SELECT 
    org_code,
    org_name_th,
    is_test
FROM organizations
WHERE is_test = false
ORDER BY org_name_th;

-- สรุป
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Seeded 15 Organizations ✓';
    RAISE NOTICE '========================================';
END $$;
