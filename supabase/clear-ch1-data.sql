-- =============================================
-- Clear All CH1 Data (For Testing)
-- ⚠️ WARNING: This will DELETE all data!
-- =============================================

-- Count records before deletion
SELECT 
    'Before deletion:' as status,
    COUNT(*) as total_records,
    COUNT(DISTINCT respondent_email) as unique_emails,
    COUNT(DISTINCT organization) as unique_orgs
FROM hrd_ch1_responses;

-- Delete all records
DELETE FROM hrd_ch1_responses;

-- Verify deletion
SELECT 
    'After deletion:' as status,
    COUNT(*) as total_records
FROM hrd_ch1_responses;

-- Reset sequence (optional)
-- ALTER SEQUENCE hrd_ch1_responses_id_seq RESTART WITH 1;

-- Confirm
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ All CH1 data cleared successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Ready for new test data.';
END $$;
