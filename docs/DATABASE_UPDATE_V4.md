# Database Schema Update for ch1.html v4.0

## Overview
Updated Supabase database schema to support the new 5-step well-being survey form structure with ranking system and file uploads.

## Files Created
1. `supabase/migrations/20250305_update_schema_v4.sql` - Main schema migration
2. `supabase/storage-policies.sql` - Storage bucket and policies for PDF uploads

## Key Changes

### 1. File Upload Support
- Added 9 columns for PDF file metadata (strategy, org structure, HRD plan)
- Each file tracks: path, URL, and original filename
- Storage bucket: `hrd-documents` with 5MB limit, PDF only

### 2. Ranking System (Section 17)
- `strategic_priority_rank1` - อันดับ 1 จุดเน้นการพัฒนา
- `strategic_priority_rank2` - อันดับ 2 จุดเน้นการพัฒนา  
- `strategic_priority_rank3` - อันดับ 3 จุดเน้นการพัฒนา
- `strategic_priority_other` - รายละเอียดประเด็นอื่นๆ

### 3. New Form Sections
- Section 18: `intervention_packages_feedback`
- Section 13: `support_systems` (JSON array)
- Section 16: Ergonomics detail fields (planned, in_progress, done)

### 4. Staff Distribution Fields
- Total staff and type distribution (official, employee, contract, other)
- Age distribution (4 ranges)
- Service years distribution (8 ranges)
- Position types (13 categories)

### 5. Well-being Data
- Sick leave data (total days, average)
- Clinic usage data
- Mental health survey results
- Employee engagement scores

### 6. Digital Systems
- `digital_systems` as TEXT[] array for multiple selections

## How to Apply

### 1. Run Schema Migration
```sql
-- Copy and paste the entire content of:
-- supabase/migrations/20250305_update_schema_v4.sql
-- Into Supabase SQL Editor and run
```

### 2. Set Up Storage
```sql
-- Copy and paste the entire content of:
-- supabase/storage-policies.sql
-- Into Supabase SQL Editor and run
```

## Form Field Mapping

### Section 1: ข้อมูลเบื้องต้น
- `organization` → dropdown
- `strategic_overview` → textarea
- `strategy_file_*` → PDF upload
- `org_structure` → textarea
- `org_structure_file_*` → PDF upload
- `total_staff` → number input
- `type_*` → staff type distribution
- `age_*` → age distribution
- `service_*` → service years
- `pos_*` → position types

### Section 2: ข้อมูลสุขภาพ
- `sick_leave_days`, `sick_leave_avg` → sick leave data
- `clinic_*` → clinic usage
- `mental_*` → mental health
- `engagement_*` → employee engagement
- `other_wellbeing_surveys` → other surveys

### Section 3: ระบบการบริหาร
- `support_systems` → JSON array of support systems
- `training_hours` → text input
- `digital_systems` → TEXT[] array
- `ergonomics_status` → radio selection
- `ergonomics_*_detail` → conditional text inputs

### Section 4: ทิศทางและเป้าหมาย
- `strategic_priority_rank1-3` → ranking system
- `strategic_priority_other` → other input
- `intervention_packages_feedback` → textarea

### Section 5: HRD Plan
- `hrd_plan_url` → URL input
- `hrd_plan_results` → textarea
- `hrd_plan_file_*` → PDF upload

## Storage Structure
```
hrd-documents/
└── ch1-uploads/
    └── {email}/
        ├── {timestamp}-strategy-{filename}.pdf
        ├── {timestamp}-org-{filename}.pdf
        └── {timestamp}-hrd-{filename}.pdf
```

## Security Notes
- File uploads limited to PDF, max 5MB
- Public read access for uploaded files
- Admin only can delete files
- RLS policies restrict duplicate submissions within 1 hour

## Testing
After migration, verify:
1. All new columns exist: `SELECT * FROM information_schema.columns WHERE table_name = 'hrd_ch1_responses'`
2. Storage bucket exists: `SELECT * FROM storage.buckets WHERE id = 'hrd-documents'`
3. Policies are active: `SELECT * FROM storage.policies WHERE bucket_id = 'hrd-documents'`

## Form Version
- New records will have `form_version = 'ch1-v4'`
- Existing records updated to v4 automatically
