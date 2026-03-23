-- =============================================
-- RLS Policies - ปรับปรุงความปลอดภัย
-- =============================================

-- ลบ policies เก่าทั้งหมด
DROP POLICY IF EXISTS "Allow public read" ON survey_responses;
DROP POLICY IF EXISTS "Allow public insert" ON survey_responses;
DROP POLICY IF EXISTS "Allow update own data" ON survey_responses;

DROP POLICY IF EXISTS "Allow public read" ON hrd_ch1_responses;
DROP POLICY IF EXISTS "Allow public insert" ON hrd_ch1_responses;
DROP POLICY IF EXISTS "Allow update own data" ON hrd_ch1_responses;

-- =============================================
-- survey_responses (แบบสอบถามบุคคล)
-- =============================================

-- 1. อ่านได้เฉพาะ authenticated users (admin)
CREATE POLICY "Admin can read all"
ON survey_responses
FOR SELECT
TO authenticated
USING (true);

-- 2. Insert ได้สำหรับทุกคน แต่จำกัดขนาดข้อมูล
CREATE POLICY "survey_insert_anon"
ON survey_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (
    email IS NOT NULL
    AND btrim(email) <> ''
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND pg_column_size(raw_responses) < 1048576
    AND NOT EXISTS (
        SELECT 1 FROM survey_responses sr
        WHERE lower(sr.email) = lower(survey_responses.email)
          AND coalesce(sr.is_draft, false) = false
          AND coalesce(sr.submitted_at, sr.timestamp) > NOW() - INTERVAL '1 hour'
    )
);

-- 3. Update ได้สำหรับ row ล่าสุด/ draft เพื่อรองรับ upsert จาก public survey
CREATE POLICY "survey_update_recent"
ON survey_responses
FOR UPDATE
TO anon, authenticated
USING (
    coalesce(is_draft, false) = true
    OR coalesce(submitted_at, timestamp) > NOW() - INTERVAL '24 hours'
)
WITH CHECK (
    email IS NOT NULL
    AND btrim(email) <> ''
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND pg_column_size(raw_responses) < 1048576
);

-- 4. Delete ได้เฉพาะ admin
CREATE POLICY "Admin can delete"
ON survey_responses
FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- hrd_ch1_responses (แบบสอบถามองค์กร)
-- =============================================

-- 1. อ่านได้เฉพาะ authenticated users (admin)
CREATE POLICY "Admin can read all hrd"
ON hrd_ch1_responses
FOR SELECT
TO authenticated
USING (true);

-- 2. Insert ได้สำหรับทุกคน แต่จำกัดขนาดข้อมูล
CREATE POLICY "Public can insert hrd with limits"
ON hrd_ch1_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (
    -- ต้องมี organization
    organization IS NOT NULL 
    AND organization != ''
    -- ต้องมี respondent_email
    AND respondent_email IS NOT NULL
    AND respondent_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    -- ไม่ให้ส่งซ้ำจากองค์กรเดียวกันภายใน 1 ชั่วโมง
    AND NOT EXISTS (
        SELECT 1 FROM hrd_ch1_responses hr
        WHERE hr.organization = hrd_ch1_responses.organization
        AND hr.submitted_at > NOW() - INTERVAL '1 hour'
    )
    -- จำกัดขนาด raw_payload ไม่เกิน 2MB
    AND pg_column_size(raw_payload) < 2097152
);

-- 3. Update ไม่อนุญาต (ต้องส่งใหม่)
-- ไม่มี UPDATE policy = ไม่สามารถแก้ไขได้

-- 4. Delete ได้เฉพาะ admin
CREATE POLICY "Admin can delete hrd"
ON hrd_ch1_responses
FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- เพิ่ม Indexes เพื่อ Performance
-- =============================================

-- Index สำหรับตรวจสอบ duplicate
CREATE INDEX IF NOT EXISTS idx_survey_email_timestamp 
ON survey_responses(email, timestamp DESC) 
WHERE is_draft = false;

CREATE INDEX IF NOT EXISTS idx_hrd_org_timestamp 
ON hrd_ch1_responses(organization, submitted_at DESC);

-- Index สำหรับ admin dashboard
CREATE INDEX IF NOT EXISTS idx_survey_submitted 
ON survey_responses(submitted_at DESC) 
WHERE is_draft = false;

CREATE INDEX IF NOT EXISTS idx_hrd_submitted 
ON hrd_ch1_responses(submitted_at DESC);

-- =============================================
-- Functions สำหรับ Monitoring
-- =============================================

-- Function: นับจำนวนการส่งจาก IP (ต้องใช้ร่วมกับ Edge Function)
CREATE OR REPLACE FUNCTION check_submission_rate(
    p_email TEXT,
    p_time_window INTERVAL DEFAULT '1 hour'::INTERVAL
)
RETURNS TABLE (
    submission_count BIGINT,
    is_allowed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as submission_count,
        (COUNT(*) < 5)::BOOLEAN as is_allowed
    FROM survey_responses
    WHERE email = p_email
    AND timestamp > NOW() - p_time_window;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Comments สำหรับ Documentation
-- =============================================

COMMENT ON POLICY "Public can insert with limits" ON survey_responses IS 
'อนุญาตให้ส่งข้อมูลได้ แต่จำกัด: 1) ต้องมี email ถูกรูปแบบ 2) ไม่ซ้ำภายใน 1 ชั่วโมง 3) ขนาดไม่เกิน 1MB';

COMMENT ON POLICY "Public can insert hrd with limits" ON hrd_ch1_responses IS 
'อนุญาตให้ส่งข้อมูลองค์กรได้ แต่จำกัด: 1) ต้องมี organization และ email 2) ไม่ซ้ำจากองค์กรเดียวกันภายใน 1 ชั่วโมง 3) ขนาดไม่เกิน 2MB';
