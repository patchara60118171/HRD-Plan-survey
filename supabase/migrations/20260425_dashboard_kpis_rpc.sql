-- Phase 1 Performance Fix: RPC Functions for Dashboard KPIs
-- Replaces client-side calculations with server-side aggregation
-- Migration: 20260425_dashboard_kpis_rpc.sql

-- Main dashboard KPIs function
create or replace function get_admin_dashboard_kpis()
returns json
language sql
stable
as $$
  select json_build_object(
    'total_orgs', (select count(*) from organizations where is_test = false),
    'ch1_submitted', (select count(*) from hrd_ch1_responses where status = 'submitted'),
    'wb_submitted', (select count(*) from survey_responses where is_draft = false),
    'wb_draft', (select count(*) from survey_responses where is_draft = true),
    'phq9_high_count', (select count(*) from survey_responses where is_draft = false and phq9_score >= 10),
    'phq9_critical_count', (select count(*) from survey_responses where is_draft = false and phq9_score >= 15),
    'burnout_avg', (select round(avg(burnout_score)::numeric, 2) from survey_responses where burnout_score is not null and is_draft = false),
    'engagement_avg', (select round(avg(engagement_score)::numeric, 2) from survey_responses where engagement_score is not null and is_draft = false),
    'last_update', (select max(submitted_at) from survey_responses where is_draft = false),
    'total_responses', (select count(*) from survey_responses),
    'completion_rate', case 
      when (select count(*) from survey_responses) > 0 
      then round(
        (select count(*)::numeric / (select count(*)::numeric from survey_responses) * 100, 2
      )
      else 0 
    end
  );
$$;

-- Well-being distribution across 4 dimensions
create or replace function get_wellbeing_distribution()
returns table (dimension text, score_range text, count bigint, percentage numeric)
language sql
stable
as $$
  with dimension_data as (
    select 
      'physical'::text as dimension,
      case 
        when physical_score >= 80 then 'Excellent'
        when physical_score >= 60 then 'Good'
        when physical_score >= 40 then 'Fair'
        else 'Poor'
      end as score_range,
      count(*) as count
    from survey_responses
    where is_draft = false and physical_score is not null
    group by score_range
    
    union all
    
    select 
      'mental'::text as dimension,
      case 
        when mental_score >= 80 then 'Excellent'
        when mental_score >= 60 then 'Good'
        when mental_score >= 40 then 'Fair'
        else 'Poor'
      end as score_range,
      count(*) as count
    from survey_responses
    where is_draft = false and mental_score is not null
    group by score_range
    
    union all
    
    select 
      'social'::text as dimension,
      case 
        when social_score >= 80 then 'Excellent'
        when social_score >= 60 then 'Good'
        when social_score >= 40 then 'Fair'
        else 'Poor'
      end as score_range,
      count(*) as count
    from survey_responses
    where is_draft = false and social_score is not null
    group by score_range
    
    union all
    
    select 
      'work'::text as dimension,
      case 
        when work_score >= 80 then 'Excellent'
        when work_score >= 60 then 'Good'
        when work_score >= 40 then 'Fair'
        else 'Poor'
      end as score_range,
      count(*) as count
    from survey_responses
    where is_draft = false and work_score is not null
    group by score_range
  )
  select 
    dimension,
    score_range,
    count,
    round(count::numeric / sum(count) over (partition by dimension) * 100, 2) as percentage
  from dimension_data
  order by dimension, 
    case score_range
      when 'Excellent' then 1
      when 'Good' then 2
      when 'Fair' then 3
      when 'Poor' then 4
    end;
$$;

-- Organization statistics for dashboard
create or replace function get_organization_stats()
returns table (org_name text, total_responses bigint, submitted_responses bigint, completion_rate numeric, avg_wellbeing numeric)
language sql
stable
as $$
  select 
    o.display_name as org_name,
    coalesce(w.total_responses, 0) as total_responses,
    coalesce(w.submitted_responses, 0) as submitted_responses,
    case 
      when w.total_responses > 0 
      then round(w.submitted_responses::numeric / w.total_responses::numeric * 100, 2)
      else 0 
    end as completion_rate,
    coalesce(w.avg_wellbeing, 0) as avg_wellbeing
  from organizations o
  left join (
    select 
      organization,
      count(*) as total_responses,
      count(*) filter (where is_draft = false) as submitted_responses,
      round(avg(tmhi_score)::numeric, 2) as avg_wellbeing
    from survey_responses
    where organization is not null
    group by organization
  ) w on o.display_name = w.organization
  where o.is_test = false
  order by submitted_responses desc nulls last;
$$;

-- Time series data for trends (last 30 days)
create or replace function get_time_series_data(p_days int default 30)
returns table (date date, new_responses bigint, cumulative_responses bigint)
language sql
stable
as $$
  with daily_counts as (
    select 
      date(submitted_at) as response_date,
      count(*) as new_responses
    from survey_responses
    where submitted_at >= current_date - interval '1 day' * p_days
      and is_draft = false
    group by date(submitted_at)
  ),
  date_range as (
    select generate_series(
      current_date - interval '1 day' * (p_days - 1),
      current_date,
      interval '1 day'
    )::date as date
  )
  select 
    dr.date,
    coalesce(dc.new_responses, 0) as new_responses,
    sum(coalesce(dc.new_responses, 0)) over (order by dr.date) as cumulative_responses
  from date_range dr
  left join daily_counts dc on dr.date = dc.response_date
  order by dr.date;
$$;

-- PHQ-9 distribution for mental health monitoring
create or replace function get_phq9_distribution()
returns table (score_range text, count bigint, percentage numeric)
language sql
stable
as $$
  with score_categories as (
    select 
      case 
        when phq9_score < 5 then 'Minimal (0-4)'
        when phq9_score < 10 then 'Mild (5-9)'
        when phq9_score < 15 then 'Moderate (10-14)'
        when phq9_score < 20 then 'Moderately Severe (15-19)'
        else 'Severe (20+)'
      end as score_range,
      count(*) as count
    from survey_responses
    where is_draft = false and phq9_score is not null
    group by score_range
  )
  select 
    score_range,
    count,
    round(count::numeric / sum(count) over () * 100, 2) as percentage
  from score_categories
  order by 
    case score_range
      when 'Minimal (0-4)' then 1
      when 'Mild (5-9)' then 2
      when 'Moderate (10-14)' then 3
      when 'Moderately Severe (15-19)' then 4
      when 'Severe (20+)' then 5
    end;
$$;

-- Grant execute permissions to authenticated users
grant execute on function get_admin_dashboard_kpis() to authenticated;
grant execute on function get_wellbeing_distribution() to authenticated;
grant execute on function get_organization_stats() to authenticated;
grant execute on function get_time_series_data(int) to authenticated;
grant execute on function get_phq9_distribution() to authenticated;

-- Add RLS policies for these functions
-- Note: These functions use existing RLS policies on the base tables
