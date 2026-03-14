-- =============================================
-- Restore constrained INSERT policy for survey_responses
-- Date: 2026-03-14
-- =============================================

drop policy if exists "Allow public insert" on public.survey_responses;
drop policy if exists "allow_insert_survey_responses" on public.survey_responses;
drop policy if exists "survey_insert_anon" on public.survey_responses;

create policy "survey_insert_anon"
on public.survey_responses
for insert
to anon, authenticated
with check (
    email is not null
    and btrim(email) <> ''
    and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    and pg_column_size(raw_responses) < 1048576
    and not exists (
        select 1
        from public.survey_responses sr
        where lower(sr.email) = lower(survey_responses.email)
          and coalesce(sr.is_draft, false) = false
          and sr.timestamp > now() - interval '1 hour'
    )
);

comment on policy "survey_insert_anon" on public.survey_responses is
'Allow public submission to survey_responses with email validation, payload size limit, and 1-hour duplicate protection for non-draft records.';