-- =============================================
-- Database Performance Optimization - Indexes
-- สำหรับ Well-being Survey v3.1
-- รันใน Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. Indexes สำหรับ hrd_ch1_responses (ตารางหลัก)
-- =============================================

-- Index สำหรับค้นหาตามอีเมล (ใช้บ่อยที่สุด)
CREATE INDEX IF NOT EXISTS idx_hrd_ch1_responses_email 
ON hrd_ch1_responses (respondent_email);

-- Index สำหรับค้นหาตามวันที่ส่ง (ใช้ใน Admin Dashboard)
CREATE INDEX IF NOT EXISTS idx_hrd_ch1_responses_submitted_at 
ON hrd_ch1_responses (submitted_at DESC);

-- Index สำหรับค้นหาตามหน่วยงาน (ใช้ในรายงาน)
CREATE INDEX IF NOT EXISTS idx_hrd_ch1_responses_agency 
ON hrd_ch1_responses ((form_data->>'agency_name'));

-- Composite Index สำหรับค้นหาพร้อมกัน (Email + วันที่)
CREATE INDEX IF NOT EXISTS idx_hrd_ch1_responses_email_submitted 
ON hrd_ch1_responses (respondent_email, submitted_at DESC);

-- Index สำหรับ Full Text Search (ถ้ามีการค้นหาข้อความ)
CREATE INDEX IF NOT EXISTS idx_hrd_ch1_responses_search 
ON hrd_ch1_responses USING gin(to_tsvector('thai', form_data::text));

-- =============================================
-- 2. Indexes สำหรับ wellbeing_surveys (ตารางเก่า - ถ้ามี)
-- =============================================

-- Index สำหรับค้นหาตามอีเมล
CREATE INDEX IF NOT EXISTS idx_wellbeing_surveys_email 
ON wellbeing_surveys (email);

-- Index สำหรับค้นหาตามองค์กร
CREATE INDEX IF NOT EXISTS idx_wellbeing_surveys_organization 
ON wellbeing_surveys (organization);

-- Index สำหรับค้นหาตามวันที่
CREATE INDEX IF NOT EXISTS idx_wellbeing_surveys_created_at 
ON wellbeing_surveys (created_at DESC);

-- =============================================
-- 3. Indexes สำหรับ user_sessions (ถ้ามีตารางนี้)
-- =============================================

-- Index สำหรับค้นหาตาม session
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id 
ON user_sessions (session_id);

-- Index สำหรับค้นหาตามผู้ใช้
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
ON user_sessions (user_id);

-- Index สำหรับลบ session ที่หมดอายุ
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at 
ON user_sessions (expires_at);

-- =============================================
-- 4. Indexes สำหรับ audit_logs (ถ้ามีตารางนี้)
-- =============================================

-- Index สำหรับค้นหาตามตาราง
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name 
ON audit_logs (table_name);

-- Index สำหรับค้นหาตามวันที่
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON audit_logs (created_at DESC);

-- Index สำหรับค้นหาตามผู้ใช้
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON audit_logs (user_id);

-- =============================================
-- 5. Performance Monitoring Functions
-- =============================================

-- Function: ตรวจสอบ slow queries
CREATE OR REPLACE FUNCTION check_slow_queries()
RETURNS TABLE (
    query_id bigint,
    query_text text,
    mean_exec_time double precision,
    calls bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        queryid,
        query,
        mean_exec_time,
        calls
    FROM pg_stat_statements
    WHERE mean_exec_time > 100  -- มากกว่า 100ms
    ORDER BY mean_exec_time DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function: ตรวจสอบ table size
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
    table_name text,
    total_size text,
    row_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        relname::text,
        pg_size_pretty(pg_total_relation_size(c.oid)),
        c.reltuples::bigint
    FROM pg_class c
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE relkind = 'r' 
        AND nspname = 'public'
        AND relname LIKE '%hrd%'
    ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: ตรวจสอบ index usage
CREATE OR REPLACE FUNCTION get_index_stats()
RETURNS TABLE (
    index_name text,
    table_name text,
    index_size text,
    idx_scan bigint,
    idx_tup_read bigint,
    idx_tup_fetch bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        indexrelname::text,
        relname::text,
        pg_size_pretty(pg_relation_size(indexrelid)),
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
        AND relname LIKE '%hrd%'
    ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. Query Performance Monitoring View
-- =============================================

-- View สำหรับดู query statistics
CREATE OR REPLACE VIEW query_performance_stats AS
SELECT 
    queryid,
    LEFT(query, 100) as query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) as avg_time_ms,
    ROUND(total_exec_time::numeric, 2) as total_time_ms,
    rows,
    ROUND((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) as percent_total
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY total_exec_time DESC
LIMIT 50;

-- =============================================
-- 7. Maintenance Functions
-- =============================================

-- Function: Analyze table (อัปเดต statistics)
CREATE OR REPLACE FUNCTION analyze_all_tables()
RETURNS void AS $$
DECLARE
    table_rec record;
BEGIN
    FOR table_rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
            AND tablename LIKE '%hrd%'
    LOOP
        EXECUTE 'ANALYZE ' || quote_ident(table_rec.tablename);
        RAISE NOTICE 'Analyzed: %', table_rec.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Reindex table (สร้าง index ใหม่)
CREATE OR REPLACE FUNCTION reindex_all_tables()
RETURNS void AS $$
DECLARE
    table_rec record;
BEGIN
    FOR table_rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
            AND tablename LIKE '%hrd%'
    LOOP
        EXECUTE 'REINDEX TABLE ' || quote_ident(table_rec.tablename);
        RAISE NOTICE 'Reindexed: %', table_rec.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. Real-time Query Monitoring
-- =============================================

-- View สำหรับดู active queries
CREATE OR REPLACE VIEW active_queries AS
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    LEFT(query, 100) as query_preview,
    query_start,
    state_change,
    EXTRACT(EPOCH FROM (now() - query_start))::int as duration_seconds
FROM pg_stat_activity
WHERE state = 'active' 
    AND query NOT LIKE '%pg_stat_activity%'
    AND query NOT LIKE '%active_queries%'
ORDER BY query_start;

-- =============================================
-- 9. Automated Maintenance Triggers
-- =============================================

-- Function: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger สำหรับ hrd_ch1_responses
DROP TRIGGER IF EXISTS update_hrd_ch1_responses_updated_at ON hrd_ch1_responses;
CREATE TRIGGER update_hrd_ch1_responses_updated_at
    BEFORE UPDATE ON hrd_ch1_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 10. Connection Pool Monitoring
-- =============================================

-- View สำหรับดู connection pool stats
CREATE OR REPLACE VIEW connection_pool_stats AS
SELECT 
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active_connections,
    count(*) FILTER (WHERE state = 'idle') as idle_connections,
    count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
    count(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting_connections,
    max(EXTRACT(EPOCH FROM (now() - backend_start)))::int as oldest_connection_seconds
FROM pg_stat_activity
WHERE backend_type = 'client backend';

-- =============================================
-- Usage Instructions
-- =============================================
/*

1. รัน indexes:
   - รันไฟล์นี้ใน Supabase SQL Editor
   - หรือใช้ psql: \i supabase/performance-indexes.sql

2. ตรวจสอบ index usage:
   SELECT * FROM get_index_stats();

3. ตรวจสอบ table sizes:
   SELECT * FROM get_table_sizes();

4. ตรวจสอบ slow queries:
   SELECT * FROM check_slow_queries();

5. ตรวจสอบ active queries:
   SELECT * FROM active_queries;

6. Maintenance:
   SELECT analyze_all_tables();
   SELECT reindex_all_tables();

7. Monitor connections:
   SELECT * FROM connection_pool_stats;

8. Query performance:
   SELECT * FROM query_performance_stats;

*/
