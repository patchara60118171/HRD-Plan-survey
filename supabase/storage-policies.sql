-- =============================================
-- Storage Policies for PDF File Uploads
-- =============================================

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'hrd-documents', 
    'hrd-documents', 
    true, 
    5242880, -- 5MB in bytes
    ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Storage Policies
-- =============================================

-- 1. Allow anyone to upload (with file size and type restrictions enforced by bucket)
CREATE POLICY "Anyone can upload HRD documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
    bucket_id = 'hrd-documents'
    AND (storage.foldername(name))[1] = 'ch1-uploads'
    AND auth.role() IN ('anon', 'authenticated')
);

-- 2. Allow anyone to read files
CREATE POLICY "Anyone can view HRD documents"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
    bucket_id = 'hrd-documents'
    AND (storage.foldername(name))[1] = 'ch1-uploads'
);

-- 3. Allow admin to delete files
CREATE POLICY "Admin can delete HRD documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'hrd-documents'
    AND (storage.foldername(name))[1] = 'ch1-uploads'
);

-- =============================================
-- Helper Functions
-- =============================================

-- Function to generate unique file paths
CREATE OR REPLACE FUNCTION generate_file_path(
    p_email TEXT,
    p_file_type TEXT,
    p_file_name TEXT
)
RETURNS TEXT AS $$
DECLARE
    v_email_clean TEXT;
    v_timestamp TEXT;
    v_safe_filename TEXT;
BEGIN
    -- Clean email for path
    v_email_clean := REGEXP_REPLACE(p_email, '[^a-zA-Z0-9@._-]', '', 'g');
    
    -- Get timestamp
    v_timestamp := EXTRACT(EPOCH FROM NOW())::TEXT;
    
    -- Clean filename
    v_safe_filename := REGEXP_REPLACE(p_file_name, '[^a-zA-Z0-9._-]', '', 'g');
    
    -- Return path: ch1-uploads/email/timestamp-type-filename
    RETURN 'ch1-uploads/' || v_email_clean || '/' || v_timestamp || '-' || p_file_type || '-' || v_safe_filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check file size before upload
CREATE OR REPLACE FUNCTION check_file_size_limit(
    p_size BIGINT,
    p_max_size BIGINT DEFAULT 5242880 -- 5MB
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN p_size <= p_max_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Comments
-- =============================================

COMMENT ON STORAGE.bucket hrd-documents IS 'Storage bucket for HRD survey document uploads (PDFs only)';
COMMENT ON POLICY "Anyone can upload HRD documents" ON storage.objects IS 'Allow file uploads with restrictions enforced by bucket settings';
COMMENT ON POLICY "Anyone can view HRD documents" ON storage.objects IS 'Public read access for uploaded files';
COMMENT ON POLICY "Admin can delete HRD documents" ON storage.objects IS 'Admin can delete uploaded files';
COMMENT ON FUNCTION generate_file_path IS 'Generate unique file path for uploads: ch1-uploads/email/timestamp-type-filename';
COMMENT ON FUNCTION check_file_size_limit IS 'Check if file size is within limits (default 5MB)';

-- =============================================
-- Verify setup
-- =============================================

-- Check bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'hrd-documents';

-- Check policies
SELECT name, roles, cmd, qual 
FROM storage.policies 
WHERE bucket_id = 'hrd-documents';
