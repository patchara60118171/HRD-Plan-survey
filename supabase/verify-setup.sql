-- =============================================
-- Supabase Verification Script
-- ตรวจสอบว่า Database, Storage, และ Policies พร้อมใช้งาน
-- =============================================

-- =============================================
-- SECTION 1: ตรวจสอบ Tables
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SECTION 1: TABLE VERIFICATION';
    RAISE NOTICE '========================================';
END $$;

-- Check if hrd_ch1_responses exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'hrd_ch1_responses'
        ) THEN '✓ Table hrd_ch1_responses exists'
        ELSE '✗ Table hrd_ch1_responses NOT FOUND'
    END as table_status;

-- Check important columns
SELECT 
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'nullable' ELSE 'required' END as constraint
FROM information_schema.columns 
WHERE table_name = 'hrd_ch1_responses'
AND column_name IN (
    'id',
    'respondent_email',
    'organization',
    'total_staff',
    'strategy_file_url',
    'org_structure_file_url',
    'hrd_plan_file_url',
    'submitted_at'
)
ORDER BY ordinal_position;

-- Count existing records
SELECT 
    COUNT(*) as total_responses,
    COUNT(DISTINCT respondent_email) as unique_emails,
    COUNT(DISTINCT organization) as unique_organizations,
    COUNT(strategy_file_url) as with_strategy_file,
    COUNT(org_structure_file_url) as with_org_file,
    COUNT(hrd_plan_file_url) as with_hrd_file
FROM hrd_ch1_responses;

-- =============================================
-- SECTION 2: ตรวจสอบ Storage Bucket
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SECTION 2: STORAGE VERIFICATION';
    RAISE NOTICE '========================================';
END $$;

-- Check bucket exists
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    CASE 
        WHEN id = 'hrd-documents' THEN '✓ Correct bucket name'
        ELSE '✗ Wrong bucket name'
    END as bucket_status,
    CASE 
        WHEN public = true THEN '✓ Public access enabled'
        ELSE '⚠ Public access disabled'
    END as access_status,
    CASE 
        WHEN file_size_limit >= 5242880 THEN '✓ File size OK (5MB+)'
        ELSE '⚠ File size limit too small'
    END as size_status,
    CASE 
        WHEN 'application/pdf' = ANY(allowed_mime_types) THEN '✓ PDF allowed'
        ELSE '✗ PDF not in allowed types'
    END as mime_status
FROM storage.buckets 
WHERE id = 'hrd-documents';

-- Check if bucket exists at all
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM storage.buckets 
            WHERE id = 'hrd-documents'
        ) THEN '✓ Bucket "hrd-documents" exists'
        ELSE '✗ Bucket "hrd-documents" NOT FOUND - Run setup-database.sql!'
    END as bucket_exists;

-- Count files in storage
SELECT 
    bucket_id,
    COUNT(*) as total_files,
    SUM((metadata->>'size')::bigint) as total_size_bytes,
    ROUND(SUM((metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_size_mb
FROM storage.objects
WHERE bucket_id = 'hrd-documents'
GROUP BY bucket_id;

-- =============================================
-- SECTION 3: ตรวจสอบ RLS Policies
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SECTION 3: RLS POLICIES VERIFICATION';
    RAISE NOTICE '========================================';
END $$;

-- Check RLS is enabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✓ RLS Enabled'
        ELSE '✗ RLS Disabled - May cause security issues!'
    END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE t.schemaname = 'public' 
AND t.tablename = 'hrd_ch1_responses';

-- List all policies on hrd_ch1_responses
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN cmd = 'INSERT' THEN '✓ INSERT policy'
        WHEN cmd = 'SELECT' THEN '✓ SELECT policy'
        WHEN cmd = 'UPDATE' THEN '✓ UPDATE policy'
        WHEN cmd = 'DELETE' THEN '✓ DELETE policy'
        ELSE cmd
    END as policy_type
FROM pg_policies 
WHERE tablename = 'hrd_ch1_responses'
ORDER BY cmd;

-- Check storage policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN policyname LIKE '%upload%' OR policyname LIKE '%INSERT%' THEN '✓ Upload policy'
        WHEN policyname LIKE '%view%' OR policyname LIKE '%SELECT%' THEN '✓ View policy'
        WHEN policyname LIKE '%delete%' OR policyname LIKE '%DELETE%' THEN '✓ Delete policy'
        ELSE '? Custom policy'
    END as policy_purpose
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (policyname LIKE '%HRD%' OR policyname LIKE '%hrd%')
ORDER BY cmd;

-- Count storage policies
SELECT 
    COUNT(*) as storage_policies_count,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✓ Sufficient policies (3+)'
        ELSE '⚠ May need more policies'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (policyname LIKE '%HRD%' OR policyname LIKE '%hrd%');

-- =============================================
-- SECTION 4: ตรวจสอบ Indexes
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SECTION 4: INDEX VERIFICATION';
    RAISE NOTICE '========================================';
END $$;

-- List indexes on hrd_ch1_responses
SELECT 
    indexname,
    indexdef,
    CASE 
        WHEN indexname LIKE '%email%' THEN '✓ Email index for fast lookup'
        WHEN indexname LIKE '%org%' THEN '✓ Organization index'
        WHEN indexname LIKE '%submit%' THEN '✓ Submission date index'
        WHEN indexname LIKE '%file%' THEN '✓ File metadata index'
        WHEN indexname LIKE '%pkey%' THEN '✓ Primary key'
        ELSE '? Other index'
    END as index_purpose
FROM pg_indexes 
WHERE tablename = 'hrd_ch1_responses'
ORDER BY indexname;

-- =============================================
-- SECTION 5: ข้อมูลตัวอย่าง (Recent Data)
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SECTION 5: RECENT DATA SAMPLES';
    RAISE NOTICE '========================================';
END $$;

-- Show 5 most recent submissions
SELECT 
    id,
    respondent_email,
    organization,
    total_staff,
    CASE 
        WHEN strategy_file_url IS NOT NULL THEN '✓' 
        ELSE '✗' 
    END as has_strategy,
    CASE 
        WHEN org_structure_file_url IS NOT NULL THEN '✓' 
        ELSE '✗' 
    END as has_org_file,
    CASE 
        WHEN hrd_plan_file_url IS NOT NULL THEN '✓' 
        ELSE '✗' 
    END as has_hrd_plan,
    submitted_at
FROM hrd_ch1_responses
ORDER BY submitted_at DESC NULLS LAST
LIMIT 5;

-- =============================================
-- SECTION 6: สรุปผล (Summary)
-- =============================================

DO $$
DECLARE
    v_table_exists BOOLEAN;
    v_bucket_exists BOOLEAN;
    v_rls_enabled BOOLEAN;
    v_policies_count INTEGER;
    v_records_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SECTION 6: SUMMARY & RECOMMENDATIONS';
    RAISE NOTICE '========================================';
    
    -- Check table
    SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'hrd_ch1_responses'
    ) INTO v_table_exists;
    
    -- Check bucket
    SELECT EXISTS (
        SELECT FROM storage.buckets 
        WHERE id = 'hrd-documents'
    ) INTO v_bucket_exists;
    
    -- Check RLS
    SELECT rowsecurity 
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.schemaname = 'public' 
    AND t.tablename = 'hrd_ch1_responses'
    INTO v_rls_enabled;
    
    -- Count policies
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE tablename = 'hrd_ch1_responses'
    INTO v_policies_count;
    
    -- Count records
    SELECT COUNT(*) FROM hrd_ch1_responses INTO v_records_count;
    
    -- Print summary
    IF v_table_exists THEN
        RAISE NOTICE '✓ Table exists';
    ELSE
        RAISE NOTICE '✗ Table missing - Run migrations!';
    END IF;
    
    IF v_bucket_exists THEN
        RAISE NOTICE '✓ Storage bucket exists';
    ELSE
        RAISE NOTICE '✗ Storage bucket missing - Run setup-database.sql!';
    END IF;
    
    IF v_rls_enabled THEN
        RAISE NOTICE '✓ RLS enabled';
    ELSE
        RAISE NOTICE '⚠ RLS disabled - Security risk!';
    END IF;
    
    RAISE NOTICE 'ℹ Total policies: % - % required', v_policies_count, CASE WHEN v_policies_count >= 3 THEN '✓ OK' ELSE '⚠ Need more' END;
    RAISE NOTICE 'ℹ Total records: %', v_records_count;
    
    -- Final verdict
    IF v_table_exists AND v_bucket_exists AND v_rls_enabled AND v_policies_count >= 3 THEN
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ ALL CHECKS PASSED - System Ready!';
        RAISE NOTICE '========================================';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '1. Test file upload in ch1.html';
        RAISE NOTICE '2. Test admin dashboard';
        RAISE NOTICE '3. Monitor logs for errors';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE '⚠️  SOME CHECKS FAILED - Action Required';
        RAISE NOTICE '========================================';
        RAISE NOTICE '';
        RAISE NOTICE 'Please fix the issues above and run this script again.';
    END IF;
END $$;
