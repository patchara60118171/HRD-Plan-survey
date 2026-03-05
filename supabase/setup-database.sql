-- =============================================
-- Complete Supabase Setup for Well-being Survey System
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: Create Storage Bucket
-- =============================================

-- Create storage bucket for HRD documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hrd-documents', 
    'hrd-documents', 
    true, 
    5242880, -- 5MB in bytes
    ARRAY['application/pdf']
) ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf'];

-- =============================================
-- STEP 2: Storage Policies
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload HRD documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view HRD documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete HRD documents" ON storage.objects;

-- 1. Allow anyone to upload
CREATE POLICY "Anyone can upload HRD documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
    bucket_id = 'hrd-documents'
);

-- 2. Allow anyone to read files
CREATE POLICY "Anyone can view HRD documents"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
    bucket_id = 'hrd-documents'
);

-- 3. Allow anyone to update (for overwrite)
CREATE POLICY "Anyone can update HRD documents"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (
    bucket_id = 'hrd-documents'
);

-- 4. Allow anyone to delete their own files
CREATE POLICY "Anyone can delete HRD documents"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (
    bucket_id = 'hrd-documents'
);

-- =============================================
-- STEP 3: Verify Tables Exist
-- =============================================

-- Check if hrd_ch1_responses table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'hrd_ch1_responses'
    ) THEN
        RAISE NOTICE 'Table hrd_ch1_responses does not exist. Please run migration files first.';
    ELSE
        RAISE NOTICE 'Table hrd_ch1_responses exists. ✓';
    END IF;
END $$;

-- =============================================
-- STEP 4: Add Missing Columns (if any)
-- =============================================

-- Add PDF file fields if not exists
ALTER TABLE hrd_ch1_responses 
ADD COLUMN IF NOT EXISTS strategy_file_path TEXT,
ADD COLUMN IF NOT EXISTS strategy_file_url TEXT,
ADD COLUMN IF NOT EXISTS strategy_file_name TEXT,
ADD COLUMN IF NOT EXISTS org_structure_file_path TEXT,
ADD COLUMN IF NOT EXISTS org_structure_file_url TEXT,
ADD COLUMN IF NOT EXISTS org_structure_file_name TEXT,
ADD COLUMN IF NOT EXISTS hrd_plan_file_path TEXT,
ADD COLUMN IF NOT EXISTS hrd_plan_file_url TEXT,
ADD COLUMN IF NOT EXISTS hrd_plan_file_name TEXT;

-- =============================================
-- STEP 5: Enable RLS on Tables
-- =============================================

-- Enable RLS on hrd_ch1_responses
ALTER TABLE hrd_ch1_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable insert for anon users" ON hrd_ch1_responses;
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON hrd_ch1_responses;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON hrd_ch1_responses;

-- Allow anyone to insert (anon)
CREATE POLICY "Enable insert for anon users"
ON hrd_ch1_responses
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to read all
CREATE POLICY "Enable read access for authenticated users only"
ON hrd_ch1_responses
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update
CREATE POLICY "Enable update for authenticated users"
ON hrd_ch1_responses
FOR UPDATE
TO authenticated
USING (true);

-- =============================================
-- STEP 6: Create Indexes for Performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_hrd_email ON hrd_ch1_responses(respondent_email);
CREATE INDEX IF NOT EXISTS idx_hrd_org ON hrd_ch1_responses(organization);
CREATE INDEX IF NOT EXISTS idx_hrd_submitted ON hrd_ch1_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_hrd_files ON hrd_ch1_responses(strategy_file_url, org_structure_file_url, hrd_plan_file_url);

-- =============================================
-- STEP 7: Verify Setup
-- =============================================

-- Check bucket
SELECT 
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'hrd-documents';

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%HRD%'
ORDER BY policyname;

-- Check table columns
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'hrd_ch1_responses'
AND column_name LIKE '%file%'
ORDER BY ordinal_position;

-- Count existing responses
SELECT 
    COUNT(*) as total_responses,
    COUNT(DISTINCT respondent_email) as unique_emails,
    COUNT(DISTINCT organization) as unique_orgs
FROM hrd_ch1_responses;

-- =============================================
-- COMPLETE ✓
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Supabase Setup Complete! ✓';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Test file upload in ch1.html';
    RAISE NOTICE '2. Check admin.html can view data';
    RAISE NOTICE '3. Monitor storage usage';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
